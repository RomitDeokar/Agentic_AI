// ============================================
// Multi-Agent Collaboration Graph
// ============================================

class AgentCollaborationGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.agents = CONFIG.AGENTS;
        this.connections = [];
        this.animationFrame = null;
        this.particles = [];
        
        this.setupCanvas();
        this.positionAgents();
        this.initializeConnections();
        this.startAnimation();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const parent = this.canvas.parentElement;
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight || 300;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    positionAgents() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) / 3;
        
        this.agents.forEach((agent, index) => {
            const angle = (index / this.agents.length) * Math.PI * 2 - Math.PI / 2;
            agent.x = centerX + Math.cos(angle) * radius;
            agent.y = centerY + Math.sin(angle) * radius;
            agent.radius = 35;
            agent.active = false;
        });
    }

    initializeConnections() {
        // Define agent communication patterns
        const patterns = [
            ['planner', 'weather'],
            ['planner', 'crowd'],
            ['planner', 'budget'],
            ['planner', 'preference'],
            ['planner', 'booking'],
            ['weather', 'crowd'],
            ['budget', 'booking'],
            ['preference', 'planner'],
            ['explainability', 'planner'],
            ['crowd', 'budget']
        ];

        patterns.forEach(([fromId, toId]) => {
            const from = this.agents.find(a => a.id === fromId);
            const to = this.agents.find(a => a.id === toId);
            
            if (from && to) {
                this.connections.push({
                    from,
                    to,
                    active: false,
                    strength: 0
                });
            }
        });
    }

    activateConnection(fromId, toId) {
        const connection = this.connections.find(c => 
            c.from.id === fromId && c.to.id === toId
        );
        
        if (connection) {
            connection.active = true;
            connection.strength = 1.0;
            
            // Create particle animation
            this.createParticle(connection.from, connection.to);
            
            setTimeout(() => {
                connection.active = false;
            }, 2000);
        }
    }

    createParticle(from, to) {
        this.particles.push({
            x: from.x,
            y: from.y,
            targetX: to.x,
            targetY: to.y,
            progress: 0,
            speed: 0.02,
            color: from.color
        });
    }

    drawAgent(agent) {
        const { x, y, radius, name, icon, color, active } = agent;
        
        // Outer glow for active agents
        if (active) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = color;
        } else {
            this.ctx.shadowBlur = 0;
        }
        
        // Draw circle background
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = active ? color : 'rgba(255, 255, 255, 0.9)';
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = active ? 4 : 2;
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        // Draw icon
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = active ? '#FFFFFF' : '#000000';
        this.ctx.fillText(icon, x, y);
        
        // Draw label
        this.ctx.font = 'bold 11px Inter';
        this.ctx.fillStyle = STATE.theme === 'dark' ? '#FFFFFF' : '#111827';
        
        const words = name.split(' ');
        words.forEach((word, i) => {
            this.ctx.fillText(word, x, y + radius + 15 + (i * 12));
        });
    }

    drawConnection(connection) {
        const { from, to, active, strength } = connection;
        
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        
        if (active) {
            this.ctx.strokeStyle = from.color;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = strength;
        } else {
            this.ctx.strokeStyle = STATE.theme === 'dark' ? 
                'rgba(255, 255, 255, 0.1)' : 
                'rgba(0, 0, 0, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.globalAlpha = 0.3;
        }
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
        
        // Fade out strength
        if (active && strength > 0) {
            connection.strength -= 0.02;
            if (connection.strength <= 0) {
                connection.active = false;
            }
        }
    }

    drawParticle(particle) {
        particle.progress += particle.speed;
        
        if (particle.progress >= 1.0) {
            return false; // Remove particle
        }
        
        const x = particle.x + (particle.targetX - particle.x) * particle.progress;
        const y = particle.y + (particle.targetY - particle.y) * particle.progress;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
        
        // Glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        return true; // Keep particle
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = STATE.theme === 'dark' ? 
            'rgba(17, 24, 39, 0.5)' : 
            'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.connections.forEach(conn => this.drawConnection(conn));
        
        // Draw particles
        this.particles = this.particles.filter(p => this.drawParticle(p));
        
        // Draw agents
        this.agents.forEach(agent => this.drawAgent(agent));
    }

    startAnimation() {
        const animate = () => {
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    setAgentActive(agentId, active = true) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            agent.active = active;
        }
    }

    simulateCollaboration() {
        // Simulate agent collaboration sequence
        const sequence = [
            { from: 'planner', to: 'weather', delay: 0 },
            { from: 'weather', to: 'planner', delay: 500 },
            { from: 'planner', to: 'crowd', delay: 1000 },
            { from: 'crowd', to: 'planner', delay: 1500 },
            { from: 'planner', to: 'budget', delay: 2000 },
            { from: 'budget', to: 'booking', delay: 2500 },
            { from: 'planner', to: 'preference', delay: 3000 },
            { from: 'preference', to: 'planner', delay: 3500 },
            { from: 'planner', to: 'explainability', delay: 4000 }
        ];

        sequence.forEach(step => {
            setTimeout(() => {
                this.setAgentActive(step.from, true);
                this.activateConnection(step.from, step.to);
                
                setTimeout(() => {
                    this.setAgentActive(step.from, false);
                }, 1000);
            }, step.delay);
        });
    }
}

// Initialize collaboration graph
let collaborationGraph = null;

function initCollaborationGraph() {
    collaborationGraph = new AgentCollaborationGraph('communicationGraph');
    
    // Add button to trigger simulation
    const commTab = document.querySelector('[data-tab="communication"]');
    if (commTab && !document.getElementById('simulateBtn')) {
        const button = document.createElement('button');
        button.id = 'simulateBtn';
        button.className = 'mdp-control-btn';
        button.innerHTML = '<i class="fas fa-play"></i> Simulate Collaboration';
        button.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 10;';
        button.onclick = () => {
            if (collaborationGraph) {
                collaborationGraph.simulateCollaboration();
            }
        };
        
        const parent = document.getElementById('communication');
        if (parent) {
            parent.style.position = 'relative';
            parent.appendChild(button);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for tab content to be visible
    setTimeout(initCollaborationGraph, 100);
});

// Re-initialize when tab is switched to communication
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-tab="communication"]')) {
        setTimeout(() => {
            if (!collaborationGraph) {
                initCollaborationGraph();
            }
        }, 100);
    }
});
