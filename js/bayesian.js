// ============================================
// Bayesian Inference Implementation
// ============================================

class BayesianInference {
    constructor() {
        this.priors = Utils.deepClone(CONFIG.BAYESIAN.PRIORS);
        this.posteriors = Utils.deepClone(CONFIG.BAYESIAN.PRIORS);
        this.observations = [];
    }
    
    // Beta distribution mean
    betaMean(alpha, beta) {
        return alpha / (alpha + beta);
    }
    
    // Update Beta distribution with new observation
    updateBeta(category, success) {
        const posterior = this.posteriors[category];
        
        if (success) {
            posterior.alpha += 1;
        } else {
            posterior.beta += 1;
        }
        
        return this.betaMean(posterior.alpha, posterior.beta);
    }
    
    // Update preferences based on user rating
    updatePreference(category, rating) {
        // Rating is 1-5, convert to success probability
        const success = rating >= 4;
        const probability = this.updateBeta(category, success);
        
        this.observations.push({
            category,
            rating,
            probability,
            timestamp: Date.now()
        });
        
        STATE.preferences[category] = probability;
        
        return probability;
    }
    
    // Naive Bayes for weather classification
    naiveBayesWeather(features) {
        // Features: temperature, humidity, pressure, cloud_cover
        // Classes: sunny, cloudy, rainy
        
        const priors = {
            sunny: 0.5,
            cloudy: 0.3,
            rainy: 0.2
        };
        
        // Simple likelihood model (in real system, this would be learned)
        const likelihoods = {
            sunny: {
                temp: features.temp > 25 ? 0.7 : 0.3,
                humidity: features.humidity < 60 ? 0.8 : 0.2,
                pressure: features.pressure > 1013 ? 0.7 : 0.3,
                clouds: features.clouds < 30 ? 0.9 : 0.1
            },
            cloudy: {
                temp: features.temp > 20 ? 0.6 : 0.4,
                humidity: features.humidity > 50 ? 0.7 : 0.3,
                pressure: features.pressure > 1010 ? 0.6 : 0.4,
                clouds: features.clouds > 40 && features.clouds < 80 ? 0.8 : 0.2
            },
            rainy: {
                temp: features.temp < 25 ? 0.6 : 0.4,
                humidity: features.humidity > 70 ? 0.9 : 0.1,
                pressure: features.pressure < 1010 ? 0.8 : 0.2,
                clouds: features.clouds > 70 ? 0.9 : 0.1
            }
        };
        
        // Calculate posterior probabilities
        const posteriors = {};
        let total = 0;
        
        for (const weather in priors) {
            let prob = priors[weather];
            for (const feature in features) {
                if (likelihoods[weather][feature]) {
                    prob *= likelihoods[weather][feature];
                }
            }
            posteriors[weather] = prob;
            total += prob;
        }
        
        // Normalize
        for (const weather in posteriors) {
            posteriors[weather] /= total;
        }
        
        return posteriors;
    }
    
    // Dirichlet distribution for multi-category preferences
    dirichletUpdate(counts) {
        const alpha = Object.values(CONFIG.BAYESIAN.PRIORS).map(p => p.alpha);
        const total = alpha.reduce((a, b) => a + b, 0) + Object.values(counts).reduce((a, b) => a + b, 0);
        
        const probabilities = {};
        let idx = 0;
        for (const category in counts) {
            probabilities[category] = (alpha[idx] + counts[category]) / total;
            idx++;
        }
        
        return probabilities;
    }
    
    // Calculate confidence interval
    confidenceInterval(alpha, beta, confidence = 0.95) {
        // Simplified approximation using normal distribution
        const mean = this.betaMean(alpha, beta);
        const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
        const stdDev = Math.sqrt(variance);
        const z = 1.96; // 95% confidence
        
        return {
            lower: Math.max(0, mean - z * stdDev),
            upper: Math.min(1, mean + z * stdDev),
            mean
        };
    }
    
    // Get preference probabilities
    getPreferenceProbabilities() {
        const probs = {};
        
        for (const category in this.posteriors) {
            const { alpha, beta } = this.posteriors[category];
            probs[category] = {
                probability: this.betaMean(alpha, beta),
                confidence: this.confidenceInterval(alpha, beta),
                samples: alpha + beta - 2 // Number of observations
            };
        }
        
        return probs;
    }
}

// Animation for preference bars
function updatePreferenceBars() {
    const preferences = STATE.preferences;
    
    Object.keys(preferences).forEach(category => {
        const prob = preferences[category];
        const percentage = Math.round(prob * 100);
        
        const prefItem = Array.from(document.querySelectorAll('.preference-item'))
            .find(item => {
                const label = item.querySelector('.pref-label span');
                return label && label.textContent.toLowerCase().includes(category);
            });
        
        if (prefItem) {
            const probSpan = prefItem.querySelector('.pref-prob');
            const fillBar = prefItem.querySelector('.pref-fill');
            
            if (probSpan && fillBar) {
                // Animate the change
                animateValue(probSpan, parseInt(probSpan.textContent), percentage, 500, '%');
                
                fillBar.style.width = percentage + '%';
                
                // Add pulse animation
                fillBar.classList.remove('bayesian-animated');
                setTimeout(() => fillBar.classList.add('bayesian-animated'), 10);
            }
        }
    });
}

// Animate number changes
function animateValue(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = Math.round(current) + suffix;
    }, 16);
}

// Simulate rating and update
function rateActivity(category, rating) {
    if (!bayesianInference) {
        bayesianInference = new BayesianInference();
    }
    
    const oldProb = STATE.preferences[category];
    const newProb = bayesianInference.updatePreference(category, rating);
    
    AgentLog.info('Preference Agent', 
        `Updated ${category}: ${(oldProb * 100).toFixed(0)}% → ${(newProb * 100).toFixed(0)}%`
    );
    
    updatePreferenceBars();
    
    // Show toast
    const change = ((newProb - oldProb) * 100).toFixed(0);
    const changeText = change > 0 ? `+${change}%` : `${change}%`;
    showToast(`${category} preference updated: ${changeText}`, 'info');
}

// Weather prediction using Bayesian inference
function predictWeather(location, date) {
    if (!bayesianInference) {
        bayesianInference = new BayesianInference();
    }
    
    // Simulate weather features
    const features = {
        temp: Utils.random(20, 35),
        humidity: Utils.random(40, 80),
        pressure: Utils.random(1005, 1020),
        clouds: Utils.random(10, 90)
    };
    
    const predictions = bayesianInference.naiveBayesWeather(features);
    
    return {
        predictions,
        mostLikely: Object.keys(predictions).reduce((a, b) => 
            predictions[a] > predictions[b] ? a : b
        ),
        features
    };
}

// Visualize Bayesian evolution
function visualizeBayesianEvolution() {
    if (!bayesianInference) return;
    
    const observations = bayesianInference.observations.slice(-20);
    
    // Group by category
    const byCategory = {};
    observations.forEach(obs => {
        if (!byCategory[obs.category]) {
            byCategory[obs.category] = [];
        }
        byCategory[obs.category].push(obs);
    });
    
    // Create visualization (could use Chart.js for this)
    console.log('Bayesian Evolution:', byCategory);
}

// Initialize Bayesian system
let bayesianInference;

document.addEventListener('DOMContentLoaded', () => {
    bayesianInference = new BayesianInference();
    updatePreferenceBars();
});
