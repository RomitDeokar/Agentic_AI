// ============================================
// Demo Mode and Emergency Scenarios
// ============================================

let demoInterval;
let demoStep = 0;

// 60-second Automated Demo
async function startAutoDemo() {
    if (STATE.isDemo) {
        showToast('Demo already running', 'warning');
        return;
    }
    
    STATE.isDemo = true;
    demoStep = 0;
    
    showToast('Starting 60-second demo...', 'info');
    AgentLog.info('Demo', '=== STARTING AUTOMATED DEMO ===');
    
    const demoSteps = [
        { delay: 0, action: () => demoStep1() },
        { delay: 5000, action: () => demoStep2() },
        { delay: 10000, action: () => demoStep3() },
        { delay: 15000, action: () => demoStep4() },
        { delay: 25000, action: () => demoStep5() },
        { delay: 35000, action: () => demoStep6() },
        { delay: 45000, action: () => demoStep7() },
        { delay: 55000, action: () => demoStep8() },
        { delay: 60000, action: () => endDemo() }
    ];
    
    for (const step of demoSteps) {
        await Utils.sleep(step.delay);
        if (STATE.isDemo) {
            await step.action();
        }
    }
}

// Demo Step 1: Generate Base Itinerary
async function demoStep1() {
    demoStep = 1;
    AgentLog.info('Demo', 'Step 1: Generating base itinerary (Rajasthan, 3 days, ₹15,000)');
    showToast('Demo Step 1: Generating itinerary', 'info');
    
    // Set form values
    document.getElementById('destination').value = 'Rajasthan, India';
    document.getElementById('duration').value = '3';
    document.getElementById('budget').value = '15000';
    
    // Generate itinerary
    const params = {
        destination: 'Rajasthan, India',
        duration: 3,
        budget: 15000,
        preferences: ['cultural', 'adventure']
    };
    
    const itinerary = await agentSystem.generateItinerary(params);
    displayItinerary(itinerary);
    visualizeRoute(itinerary);
}

// Demo Step 2: Trigger Rainstorm
async function demoStep2() {
    demoStep = 2;
    AgentLog.warning('Demo', 'Step 2: Triggering rainstorm scenario');
    showToast('Demo Step 2: Rainstorm detected!', 'warning');
    
    await triggerRainstorm();
}

// Demo Step 3: Show Before/After Comparison
async function demoStep3() {
    demoStep = 3;
    AgentLog.info('Demo', 'Step 3: Displaying before/after comparison');
    showToast('Demo Step 3: Comparing changes', 'info');
    
    showBeforeAfterComparison();
}

// Demo Step 4: Simulate 1-star Rating
async function demoStep4() {
    demoStep = 4;
    AgentLog.warning('Demo', 'Step 4: Simulating 1★ rating for activity');
    showToast('Demo Step 4: User gave 1★ rating', 'warning');
    
    // Simulate low rating
    await simulateLowRating();
}

// Demo Step 5: Show RL Adjustment
async function demoStep5() {
    demoStep = 5;
    AgentLog.info('Demo', 'Step 5: RL system adjusting based on feedback');
    showToast('Demo Step 5: RL learning from feedback', 'info');
    
    // Train RL model with negative feedback
    if (rl) {
        await rl.runEpisode();
        updateRLChart();
    }
    
    // Show adjustment
    await agentSystem.replanItinerary('low user satisfaction');
}

// Demo Step 6: Display Bayesian Shift
async function demoStep6() {
    demoStep = 6;
    AgentLog.info('Demo', 'Step 6: Bayesian preference evolution');
    showToast('Demo Step 6: Preferences updating', 'info');
    
    // Simulate preference updates
    rateActivity('cultural', 5);
    await Utils.sleep(1000);
    rateActivity('adventure', 2);
    await Utils.sleep(1000);
    rateActivity('relaxation', 4);
}

// Demo Step 7: Show Reward Graph
async function demoStep7() {
    demoStep = 7;
    AgentLog.success('Demo', 'Step 7: RL reward trending upward');
    showToast('Demo Step 7: Reward improving!', 'success');
    
    // Switch to monitoring tab
    switchTab('monitoring');
    
    // Run more RL episodes
    if (rl) {
        for (let i = 0; i < 5; i++) {
            await rl.runEpisode();
            updateRLChart();
            await Utils.sleep(500);
        }
    }
}

// Demo Step 8: Open Monitoring Dashboard
async function demoStep8() {
    demoStep = 8;
    AgentLog.info('Demo', 'Step 8: Showing monitoring dashboard');
    showToast('Demo Step 8: System metrics', 'info');
    
    switchTab('monitoring');
    
    // Show POMDP explanation
    await Utils.sleep(2000);
    switchTab('pomdp');
    showToast('POMDP Framework: Observations → Inference → MDP → Policy → Action', 'info');
}

// End Demo
function endDemo() {
    STATE.isDemo = false;
    demoStep = 0;
    
    AgentLog.success('Demo', '=== DEMO COMPLETE ===');
    showToast('🎉 Demo complete! Explore the system yourself.', 'success');
    
    // Switch back to communication tab
    switchTab('communication');
}

// Emergency Scenario: Rainstorm
async function triggerRainstorm() {
    AgentLog.warning('Weather Risk Agent', 'Rainstorm detected! Probability: 95%');
    showToast('⚠️ Rainstorm alert! Replanning outdoor activities...', 'warning');
    
    // Update weather state
    STATE.mdpState.weatherProbability = 0.15;
    
    // Update weather cards
    const weatherCards = document.getElementById('weatherCards');
    if (weatherCards) {
        weatherCards.children[0].innerHTML = `
            <div class="weather-info">
                <h4>Today</h4>
                <p>Rainy - 22°C</p>
                <p style="font-size: 11px; color: #EF4444; margin-top: 4px;">
                    ⚠️ High rain probability
                </p>
            </div>
            <div class="weather-icon">🌧️</div>
        `;
    }
    
    // Trigger replanning
    await agentSystem.replanItinerary('adverse weather conditions - rainstorm detected');
    
    showToast('✅ Itinerary adapted for indoor activities', 'success');
}

// Emergency Scenario: Budget Exceeded
async function triggerBudgetChange() {
    AgentLog.warning('Budget Optimizer Agent', 'Budget threshold exceeded!');
    showToast('⚠️ Budget exceeded! Optimizing expenses...', 'warning');
    
    // Update budget
    STATE.budget.used = STATE.budget.total * 1.15;
    updateBudgetDisplay(STATE.budget.used);
    
    // Trigger budget optimization
    await agentSystem.executeTask('budget', { reoptimize: true });
    
    // Replan with budget constraints
    await agentSystem.replanItinerary('budget exceeded - need cost reduction');
    
    // Update budget after optimization
    STATE.budget.used = STATE.budget.total * 0.85;
    updateBudgetDisplay(STATE.budget.used);
    
    showToast('✅ Budget optimized and saved ₹2,250', 'success');
}

// Emergency Scenario: Crowd Surge
async function triggerCrowdSurge() {
    AgentLog.warning('Crowd Analyzer Agent', 'Crowd surge detected at popular venues');
    showToast('⚠️ High crowd density! Rescheduling visits...', 'warning');
    
    // Update crowd state
    STATE.mdpState.crowdLevel = 95;
    
    // Update crowd heatmap
    const crowdHeatmap = document.getElementById('crowdHeatmap');
    if (crowdHeatmap && crowdHeatmap.children[0]) {
        crowdHeatmap.children[0].querySelector('.crowd-level').className = 'crowd-level high';
        crowdHeatmap.children[0].querySelector('.crowd-level').textContent = 'CRITICAL';
    }
    
    // Enable heatmap visualization
    if (!heatmapVisible) {
        toggleHeatmap();
    }
    
    // Trigger replanning
    await agentSystem.replanItinerary('high crowd density at venues');
    
    showToast('✅ Visits rescheduled to off-peak hours', 'success');
}

// Emergency Scenario: Venue Closed
async function triggerClosedVenue() {
    AgentLog.error('Planner Agent', 'Primary venue unexpectedly closed');
    showToast('⚠️ Venue closed! Finding alternatives...', 'error');
    
    // Trigger replanning
    await agentSystem.executeTask('planner', { findAlternatives: true });
    await agentSystem.replanItinerary('venue closure - need alternative');
    
    showToast('✅ Alternative venues found and booked', 'success');
}

// Simulate Low Rating
async function simulateLowRating() {
    const category = 'adventure';
    const rating = 1;
    
    // Show rating animation
    showToast('User rated activity: ⭐ (1/5)', 'warning');
    
    // Update preferences
    rateActivity(category, rating);
    
    // Trigger RL learning
    if (rl) {
        STATE.mdpState.userSatisfaction = 2.0;
        await rl.runEpisode();
        updateRLChart();
    }
    
    AgentLog.info('RL System', 'Learning from negative feedback. Adjusting policy...');
}

// Show Before/After Comparison
function showBeforeAfterComparison() {
    const beforeItinerary = {
        days: [
            {
                day: 1,
                activities: [
                    { name: 'Amber Fort', time: '9:00', type: 'cultural', weather: 'outdoor' },
                    { name: 'Jaigarh Fort', time: '14:00', type: 'adventure', weather: 'outdoor' }
                ]
            }
        ]
    };
    
    const afterItinerary = {
        days: [
            {
                day: 1,
                activities: [
                    { name: 'City Palace Museum', time: '9:00', type: 'cultural', weather: 'indoor' },
                    { name: 'Albert Hall Museum', time: '14:00', type: 'cultural', weather: 'indoor' }
                ]
            }
        ]
    };
    
    const beforeContainer = document.getElementById('beforeItinerary');
    const afterContainer = document.getElementById('afterItinerary');
    
    if (beforeContainer) {
        beforeContainer.innerHTML = `
            <h4>Day 1 - Original Plan</h4>
            ${beforeItinerary.days[0].activities.map(a => `
                <div class="comparison-activity" style="padding: 12px; margin: 8px 0; background: var(--bg-tertiary); border-radius: 8px;">
                    <div style="font-weight: 600;">${a.time} - ${a.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                        ${a.type} • ${a.weather} ⛅
                    </div>
                </div>
            `).join('')}
            <div style="margin-top: 12px; padding: 12px; background: #FEE2E2; border-radius: 8px; color: #991B1B;">
                ⚠️ Outdoor activities during rainstorm
            </div>
        `;
    }
    
    if (afterContainer) {
        afterContainer.innerHTML = `
            <h4>Day 1 - Optimized Plan</h4>
            ${afterItinerary.days[0].activities.map(a => `
                <div class="comparison-activity" style="padding: 12px; margin: 8px 0; background: var(--bg-tertiary); border-radius: 8px;">
                    <div style="font-weight: 600;">${a.time} - ${a.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                        ${a.type} • ${a.weather} 🏛️
                    </div>
                </div>
            `).join('')}
            <div style="margin-top: 12px; padding: 12px; background: #D1FAE5; border-radius: 8px; color: #065F46;">
                ✅ Indoor alternatives selected
            </div>
        `;
    }
    
    showModal('comparisonModal');
}

// Voice Input (simulated)
function startVoiceInput() {
    const transcript = document.getElementById('voiceTranscript');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            transcript.textContent = 'Listening...';
            transcript.style.fontStyle = 'italic';
        };
        
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            transcript.textContent = `"${text}"`;
            transcript.style.fontStyle = 'normal';
            
            AgentLog.info('Voice Input', `Recognized: ${text}`);
            showToast('Voice command received', 'success');
            
            // Process command (simple simulation)
            processVoiceCommand(text);
        };
        
        recognition.onerror = (event) => {
            transcript.textContent = 'Error: ' + event.error;
            showToast('Voice recognition error', 'error');
        };
        
        recognition.start();
    } else {
        // Fallback simulation
        const commands = [
            'Show me cultural sites in Jaipur',
            'Change my budget to 20000 rupees',
            'I prefer more relaxation activities',
            'Replan my itinerary for tomorrow'
        ];
        
        const command = commands[Math.floor(Math.random() * commands.length)];
        transcript.textContent = `"${command}"`;
        transcript.style.fontStyle = 'normal';
        
        AgentLog.info('Voice Input', `Simulated: ${command}`);
        showToast('Voice command processed', 'success');
        
        processVoiceCommand(command);
    }
}

function processVoiceCommand(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('cultural') || lower.includes('museum')) {
        rateActivity('cultural', 5);
    } else if (lower.includes('budget') && lower.includes('20000')) {
        document.getElementById('budget').value = '20000';
        STATE.budget.total = 20000;
    } else if (lower.includes('relaxation')) {
        rateActivity('relaxation', 5);
    } else if (lower.includes('replan')) {
        regenerateItinerary();
    }
}

// Export to PDF
async function exportPDF() {
    showToast('Preparing PDF export...', 'info');
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('Your Intelligent Travel Itinerary', 20, 20);
        
        // Generated by
        doc.setFontSize(10);
        doc.text('Generated by TravelAI RL System', 20, 30);
        
        // Itinerary details
        if (STATE.currentItinerary) {
            doc.setFontSize(12);
            let y = 45;
            
            STATE.currentItinerary.days.forEach(day => {
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(`Day ${day.day}: ${day.city}`, 20, y);
                y += 10;
                
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                day.activities.forEach(activity => {
                    doc.text(`${activity.time} - ${activity.name}`, 30, y);
                    y += 7;
                });
                
                y += 5;
            });
            
            // Budget
            y += 10;
            doc.setFontSize(12);
            doc.text(`Total Budget: ${Utils.formatCurrency(STATE.budget.total)}`, 20, y);
            y += 7;
            doc.text(`Total Cost: ${Utils.formatCurrency(STATE.currentItinerary.totalCost)}`, 20, y);
        }
        
        // Save
        doc.save('travel-itinerary.pdf');
        showToast('PDF exported successfully!', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('PDF export failed', 'error');
    }
}

// Share Itinerary
function shareItinerary() {
    const shareData = {
        title: 'My Travel Itinerary',
        text: 'Check out my intelligent travel itinerary!',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showToast('Shared successfully!', 'success'))
            .catch(() => showToast('Share cancelled', 'info'));
    } else {
        // Fallback: Copy to clipboard
        const shareUrl = window.location.href + '?itinerary=' + btoa(JSON.stringify(STATE.currentItinerary));
        navigator.clipboard.writeText(shareUrl)
            .then(() => showToast('Link copied to clipboard!', 'success'))
            .catch(() => showToast('Could not copy link', 'error'));
    }
}
