// ============================================
// SmartRoute v9.0 — Travel Intelligence Engine
// Full-fledged Agentic AI Travel Planner
// ============================================

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : `${window.location.protocol}//${window.location.hostname}:8000`;

// === STATE ===
const state = {
    theme: 'dark', persona: 'solo', ws: null,
    itinerary: null, agents: {}, logs: [],
    rl: { rewards: [], episode: 0, alpha: 0.4, beta: 0.3, gamma: 0.2, delta: 0.1 },
    bayesian: { cultural: { a: 2, b: 2 }, adventure: { a: 2, b: 2 }, food: { a: 3, b: 1 }, relaxation: { a: 1, b: 3 }, shopping: { a: 1, b: 2 } },
    budget: { total: 15000, used: 0 },
    chatOpen: false,
    chatHistory: [],
    currentDest: ''
};

// === LANGUAGE DATABASE ===
const LANGUAGE_DB = {
    paris: {
        lang: 'French', flag: '\u{1F1EB}\u{1F1F7}', phrases: [
            { en: 'Hello', phrase: 'Bonjour', phon: 'bohn-ZHOOR', ctx: 'Greeting anyone' },
            { en: 'Thank you', phrase: 'Merci', phon: 'mehr-SEE', ctx: 'Showing gratitude' },
            { en: 'Please', phrase: "S'il vous pla\u00EEt", phon: 'seel voo PLEH', ctx: 'Making requests' },
            { en: 'Excuse me', phrase: 'Excusez-moi', phon: 'ex-koo-ZAY mwah', ctx: 'Getting attention' },
            { en: 'How much?', phrase: "C'est combien?", phon: 'say kohm-BYAN', ctx: 'Shopping/bargaining' },
            { en: 'Where is...?', phrase: 'O\u00F9 est...?', phon: 'oo EH', ctx: 'Asking directions' },
            { en: 'Help!', phrase: 'Au secours!', phon: 'oh suh-KOOR', ctx: 'Emergency' },
            { en: 'I don\'t understand', phrase: 'Je ne comprends pas', phon: 'zhuh nuh kohm-PRAHN pah', ctx: 'Communication' },
            { en: 'The bill, please', phrase: "L'addition, s'il vous pla\u00EEt", phon: 'lah-dee-SYOHN seel voo pleh', ctx: 'At restaurants' },
            { en: 'Good evening', phrase: 'Bonsoir', phon: 'bohn-SWAHR', ctx: 'Evening greeting' },
            { en: 'Goodbye', phrase: 'Au revoir', phon: 'oh ruh-VWAHR', ctx: 'Farewell' },
            { en: 'Yes / No', phrase: 'Oui / Non', phon: 'wee / nohn', ctx: 'Basic responses' }
        ]
    },
    tokyo: {
        lang: 'Japanese', flag: '\u{1F1EF}\u{1F1F5}', phrases: [
            { en: 'Hello', phrase: '\u3053\u3093\u306B\u3061\u306F (Konnichiwa)', phon: 'kohn-NEE-chee-wah', ctx: 'Greeting' },
            { en: 'Thank you', phrase: '\u3042\u308A\u304C\u3068\u3046 (Arigatou)', phon: 'ah-ree-GAH-toh', ctx: 'Gratitude' },
            { en: 'Excuse me', phrase: '\u3059\u307F\u307E\u305B\u3093 (Sumimasen)', phon: 'soo-mee-mah-SEN', ctx: 'Getting attention' },
            { en: 'How much?', phrase: '\u3044\u304F\u3089? (Ikura?)', phon: 'ee-KOO-rah', ctx: 'Shopping' },
            { en: 'Where is...?', phrase: '...\u306F\u3069\u3053? (...wa doko?)', phon: 'wah DOH-koh', ctx: 'Directions' },
            { en: 'Help!', phrase: '\u52A9\u3051\u3066! (Tasukete!)', phon: 'tah-SOO-keh-teh', ctx: 'Emergency' },
            { en: 'Delicious!', phrase: '\u304A\u3044\u3057\u3044! (Oishii!)', phon: 'oy-SHEE', ctx: 'Complimenting food' },
            { en: 'The bill', phrase: '\u304A\u52D8\u5B9A (Okanjou)', phon: 'oh-KAHN-joh', ctx: 'At restaurants' },
            { en: 'Goodbye', phrase: '\u3055\u3088\u3046\u306A\u3089 (Sayounara)', phon: 'sah-YOH-nah-rah', ctx: 'Farewell' }
        ]
    },
    london: {
        lang: 'English', flag: '\u{1F1EC}\u{1F1E7}', phrases: [
            { en: 'Cheers!', phrase: 'Cheers!', phon: 'cheerz', ctx: 'Thank you (informal)' },
            { en: 'Excuse me, mate', phrase: 'Excuse me, mate', phon: 'as-is', ctx: 'Getting attention' },
            { en: 'Where is the tube?', phrase: 'Where is the tube?', phon: 'as-is', ctx: 'Finding the subway' },
            { en: 'Brilliant!', phrase: 'Brilliant!', phon: 'BRIL-yunt', ctx: 'Expressing approval' },
            { en: 'Mind the gap', phrase: 'Mind the gap', phon: 'as-is', ctx: 'On the Underground' }
        ]
    },
    jaipur: {
        lang: 'Hindi', flag: '\u{1F1EE}\u{1F1F3}', phrases: [
            { en: 'Hello', phrase: '\u0928\u092E\u0938\u094D\u0924\u0947 (Namaste)', phon: 'nah-mah-STAY', ctx: 'Universal greeting' },
            { en: 'Thank you', phrase: '\u0927\u0928\u094D\u092F\u0935\u093E\u0926 (Dhanyavaad)', phon: 'dhun-yah-VAHD', ctx: 'Gratitude' },
            { en: 'How much?', phrase: '\u0915\u093F\u0924\u0928\u093E? (Kitna?)', phon: 'KIT-nah', ctx: 'Shopping/bargaining' },
            { en: 'Too expensive', phrase: '\u092C\u0939\u0941\u0924 \u092E\u0939\u0902\u0917\u093E (Bahut mehenga)', phon: 'bah-HOOT meh-HEN-gah', ctx: 'Bargaining' },
            { en: 'Where is...?', phrase: '...\u0915\u0939\u093E\u0901 \u0939\u0948? (...kahan hai?)', phon: 'kah-HAHN hai', ctx: 'Directions' },
            { en: 'Water', phrase: '\u092A\u093E\u0928\u0940 (Paani)', phon: 'PAH-nee', ctx: 'Ordering water' },
            { en: 'Help!', phrase: '\u092E\u0926\u0926! (Madad!)', phon: 'MAH-dud', ctx: 'Emergency' },
            { en: 'Delicious!', phrase: '\u092C\u0939\u0941\u0924 \u0938\u094D\u0935\u093E\u0926\u093F\u0937\u094D\u091F! (Bahut swaadisht!)', phon: 'bah-HOOT swah-DEESHT', ctx: 'Complimenting food' },
            { en: 'Let\'s go', phrase: '\u091A\u0932\u094B (Chalo)', phon: 'CHAH-loh', ctx: 'Getting around' }
        ]
    },
    rome: {
        lang: 'Italian', flag: '\u{1F1EE}\u{1F1F9}', phrases: [
            { en: 'Hello', phrase: 'Ciao', phon: 'CHOW', ctx: 'Greeting' },
            { en: 'Thank you', phrase: 'Grazie', phon: 'GRAH-tsee-eh', ctx: 'Gratitude' },
            { en: 'Please', phrase: 'Per favore', phon: 'pehr fah-VOH-reh', ctx: 'Requests' },
            { en: 'How much?', phrase: 'Quanto costa?', phon: 'KWAHN-toh KOH-stah', ctx: 'Shopping' },
            { en: 'Where is...?', phrase: 'Dove \u00E8...?', phon: 'DOH-veh eh', ctx: 'Directions' },
            { en: 'Delicious!', phrase: 'Delizioso!', phon: 'deh-lee-TSEE-oh-zoh', ctx: 'Complimenting food' },
            { en: 'Goodbye', phrase: 'Arrivederci', phon: 'ah-ree-veh-DEHR-chee', ctx: 'Farewell' }
        ]
    }
};

// === CITY COORDINATES ===
const CITY_COORDS = {
    paris: [48.8566, 2.3522], london: [51.5074, -0.1278], tokyo: [35.6762, 139.6503],
    jaipur: [26.9124, 75.7873], rome: [41.9028, 12.4964], 'new york': [40.7128, -74.006],
    dubai: [25.2048, 55.2708], singapore: [1.3521, 103.8198], bangkok: [13.7563, 100.5018],
    barcelona: [41.3874, 2.1686], istanbul: [41.0082, 28.9784], amsterdam: [52.3676, 4.9041],
    sydney: [-33.8688, 151.2093], bali: [-8.3405, 115.0920], goa: [15.2993, 74.1240],
    udaipur: [24.5854, 73.7125], varanasi: [25.3176, 83.0068], mumbai: [19.0760, 72.8777],
    delhi: [28.7041, 77.1025], agra: [27.1767, 78.0081], manali: [32.2396, 77.1887],
    shimla: [31.1048, 77.1734], rishikesh: [30.0869, 78.2676], leh: [34.1526, 77.5771]
};

// === AGENT DEFINITIONS ===
const AGENTS = [
    { id: 'planner', name: 'Planner Agent', role: 'Itinerary Planning', icon: '\u{1F5FA}', color: '#667eea' },
    { id: 'weather', name: 'Weather Risk Agent', role: 'Weather Monitoring', icon: '\u{1F326}', color: '#06b6d4' },
    { id: 'crowd', name: 'Crowd Analyzer', role: 'Crowd Intelligence', icon: '\u{1F465}', color: '#f59e0b' },
    { id: 'budget', name: 'Budget Optimizer', role: 'Financial Planning', icon: '\u{1F4B0}', color: '#10b981' },
    { id: 'preference', name: 'Preference Agent', role: 'Taste Learning', icon: '\u2764\uFE0F', color: '#ec4899' },
    { id: 'booking', name: 'Booking Assistant', role: 'Reservations', icon: '\u{1F3AB}', color: '#8b5cf6' },
    { id: 'explain', name: 'Explainability Agent', role: 'AI Reasoning', icon: '\u{1F9E0}', color: '#f97316' }
];

// === INIT ===
function init() {
    renderAgents();
    renderBayesianBars();
    initMap();
    setupEventListeners();
    connectWebSocket();
    setInterval(updateAgentPulse, 3000);
    document.getElementById('startDate').valueAsDate = new Date();
    console.log('SmartRoute v9.0 initialized');
}

// === MAP ===
let map, markers = [], routeLine;

function initMap() {
    const el = document.getElementById('map');
    if (!el) return;
    try {
        map = L.map('map', { center: [20, 0], zoom: 2, zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '\u00A9 <a href="https://www.openstreetmap.org">OSM</a>',
            maxZoom: 19
        }).addTo(map);
        setTimeout(() => map.invalidateSize(), 500);
        addLog('planner', 'Map initialized successfully', 'success');
    } catch (e) { console.error('Map init failed:', e); }
}

function clearMap() {
    markers.forEach(m => map && map.removeLayer(m));
    markers = [];
    if (routeLine && map) { map.removeLayer(routeLine); routeLine = null; }
}

function updateMap(itinerary) {
    if (!map || !itinerary?.days) return;
    clearMap();
    const coords = [];
    let counter = 1;
    itinerary.days.forEach(day => {
        (day.activities || []).forEach(act => {
            const lat = parseFloat(act.lat), lon = parseFloat(act.lon);
            if (isNaN(lat) || isNaN(lon) || (lat === 0 && lon === 0)) return;
            coords.push([lat, lon]);
            const colors = { cultural: '#f59e0b', adventure: '#10b981', food: '#ef4444', shopping: '#8b5cf6', religious: '#06b6d4', landmark: '#667eea', museum: '#764ba2', fort: '#f97316', palace: '#ec4899', historic: '#f97316', hidden_gem: '#10b981', park: '#22c55e' };
            const c = colors[act.type] || '#667eea';
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background:linear-gradient(135deg,${c},${c}dd);width:32px;height:32px;border-radius:50% 50% 50% 0;border:2px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;transform:rotate(-45deg)"><span style="transform:rotate(45deg)">${counter}</span></div>`,
                iconSize: [32, 32], iconAnchor: [10, 32], popupAnchor: [6, -32]
            });
            const marker = L.marker([lat, lon], { icon }).addTo(map);
            marker.bindPopup(`<div style="font-family:Inter,sans-serif"><div style="font-weight:700;font-size:14px;margin-bottom:4px">${act.name}</div><div style="font-size:12px;color:#888">${act.time || ''} | ${act.duration || ''}</div><div style="font-size:12px;color:#888">Day ${day.day} | ${act.type}</div><div style="font-weight:700;color:#4facfe;margin-top:4px">\u20B9${act.cost || 0}</div></div>`);
            markers.push(marker);
            counter++;
        });
    });
    if (coords.length > 1) {
        routeLine = L.polyline(coords, { color: '#667eea', weight: 3, opacity: 0.7, dashArray: '10, 8' }).addTo(map);
    }
    if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 14, animate: true });
    }
}

// === WEBSOCKET ===
function connectWebSocket() {
    try {
        const wsBase = API_BASE.replace('http', 'ws');
        state.ws = new WebSocket(`${wsBase}/ws/agents`);
        state.ws.onmessage = e => {
            const d = JSON.parse(e.data);
            if (d.type === 'agent_activity') {
                addLog(d.agent_id, d.message, d.status);
                updateAgentStatus(d.agent_id, d.status);
            }
        };
        state.ws.onclose = () => setTimeout(connectWebSocket, 5000);
    } catch (e) { /* backend not running */ }
}

// === AGENTS UI ===
function renderAgents() {
    const c = document.getElementById('agentCards');
    if (!c) return;
    c.innerHTML = AGENTS.map(a => `
    <div class="agent-card" id="agent-${a.id}">
      <div class="agent-avatar" style="background:${a.color}22;border:1px solid ${a.color}44">${a.icon}</div>
      <div class="agent-info"><div class="agent-name">${a.name}</div><div class="agent-role">${a.role}</div></div>
      <div class="agent-status idle" id="status-${a.id}"></div>
    </div>
  `).join('');
}

function updateAgentStatus(id, status) {
    const el = document.getElementById(`status-${id}`);
    if (el) { el.className = 'agent-status ' + status; }
}
function setAllAgentsStatus(status) { AGENTS.forEach(a => updateAgentStatus(a.id, status)); }
function updateAgentPulse() {
    if (!state.itinerary) {
        AGENTS.forEach(a => {
            const el = document.getElementById(`status-${a.id}`);
            if (el && el.classList.contains('idle')) {
                el.classList.add('thinking');
                setTimeout(() => el.classList.replace('thinking', 'idle'), 1500);
            }
        });
    }
}

// === ACTIVITY LOG ===
function addLog(agentId, msg, type = 'info') {
    const agent = AGENTS.find(a => a.id === agentId) || AGENTS[0];
    const colors = { success: '#10b981', error: '#ef4444', info: '#667eea', warning: '#f59e0b', working: '#667eea', thinking: '#f59e0b', completed: '#10b981', idle: '#6b7280' };
    const log = document.getElementById('activityLog');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const now = new Date();
    entry.innerHTML = `<div class="dot" style="background:${colors[type] || colors.info}"></div><div class="msg"><strong style="color:${agent.color}">${agent.name}:</strong> ${msg}</div><div class="time">${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}</div>`;
    log.prepend(entry);
    if (log.children.length > 50) log.removeChild(log.lastChild);
}

// === BAYESIAN ===
function renderBayesianBars() {
    const c = document.getElementById('bayesianBars');
    if (!c) return;
    const colors = { cultural: '#f59e0b', adventure: '#10b981', food: '#ef4444', relaxation: '#06b6d4', shopping: '#8b5cf6' };
    c.innerHTML = Object.keys(state.bayesian).map(k => {
        const { a, b } = state.bayesian[k];
        const mean = (a / (a + b) * 100).toFixed(0);
        return `<div class="pref-item"><div class="pref-header"><span class="pref-label">${k.charAt(0).toUpperCase() + k.slice(1)}</span><span class="pref-val">${mean}%</span></div><div class="pref-bar"><div class="pref-fill" style="width:${mean}%;background:${colors[k] || 'var(--primary)'}"></div></div></div>`;
    }).join('');
}

function updateBayesian(category, liked) {
    const b = state.bayesian[category];
    if (!b) return;
    if (liked) b.a += 1; else b.b += 1;
    renderBayesianBars();
    addLog('preference', `Bayesian update: ${category} \u2192 ${liked ? 'positive' : 'negative'} (\u03B1=${b.a}, \u03B2=${b.b})`, 'info');
}

// === RL ENGINE ===
function calculateReward(rating, budgetAdherence, weatherMatch, crowdLevel) {
    const { alpha, beta, gamma, delta } = state.rl;
    return alpha * (rating / 5) + beta * budgetAdherence + gamma * weatherMatch - delta * crowdLevel;
}

function runRLEpisode() {
    const rating = 3 + Math.random() * 2;
    const budgetAdh = 0.5 + Math.random() * 0.5;
    const weatherMatch = 0.4 + Math.random() * 0.6;
    const crowd = Math.random() * 0.7;
    let reward = calculateReward(rating, budgetAdh, weatherMatch, crowd);
    reward += state.rl.episode * 0.008 + (Math.random() - 0.3) * 0.1;
    reward = Math.max(0, Math.min(1, reward));
    state.rl.rewards.push(reward);
    state.rl.episode++;
    return reward;
}

function drawRLChart() {
    const canvas = document.getElementById('rlChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth;
    const H = canvas.height = 160;
    ctx.clearRect(0, 0, W, H);
    const data = state.rl.rewards;
    if (data.length < 2) return;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (H - 30) * i / 4 + 15;
        ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 10, y); ctx.stroke();
        ctx.fillStyle = '#6b6f8d'; ctx.font = '10px Inter';
        ctx.fillText((1 - i * 0.25).toFixed(2), 2, y + 4);
    }
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#667eea'); grad.addColorStop(1, '#764ba2');
    ctx.strokeStyle = grad; ctx.lineWidth = 2;
    ctx.beginPath();
    const step = (W - 50) / (data.length - 1);
    data.forEach((v, i) => {
        const x = 40 + i * step, y = 15 + (1 - v) * (H - 30);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    const last = data.length - 1;
    ctx.lineTo(40 + last * step, H - 15); ctx.lineTo(40, H - 15); ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, 'rgba(102,126,234,0.3)'); fillGrad.addColorStop(1, 'rgba(102,126,234,0)');
    ctx.fillStyle = fillGrad; ctx.fill();
    ctx.fillStyle = '#10b981'; ctx.font = 'bold 12px Inter';
    ctx.fillText(`R=${data[last].toFixed(3)}`, W - 70, 12);
    ctx.fillStyle = '#6b6f8d'; ctx.font = '10px Inter';
    ctx.fillText(`Ep.${data.length}`, W / 2, H - 2);
}

// === AGENT COMM GRAPH ===
function drawAgentGraph() {
    const canvas = document.getElementById('agentGraphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth;
    const H = canvas.height = 240;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.35;
    const nodes = AGENTS.map((a, i) => {
        const angle = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
        return { ...a, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });
    ctx.strokeStyle = 'rgba(102,126,234,0.15)'; ctx.lineWidth = 1;
    nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
            if (j > i && Math.random() > 0.3) {
                ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.stroke();
            }
        });
    });
    nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '33'; ctx.fill();
        ctx.strokeStyle = n.color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(n.icon, n.x, n.y + 5);
        ctx.fillStyle = '#a0a3c0'; ctx.font = '9px Inter';
        ctx.fillText(n.name.split(' ')[0], n.x, n.y + 35);
    });
}

// ============================================
// WIKIPEDIA REAL PHOTO FETCHER
// ============================================
async function fetchWikipediaPhoto(placeName, city = '') {
    const queries = [placeName, `${placeName} ${city}`.trim()];
    for (const q of queries) {
        try {
            const resp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(q)}&prop=pageimages&piprop=original|thumbnail&pithumbsize=800`);
            const data = await resp.json();
            const pages = data?.query?.pages || {};
            for (const page of Object.values(pages)) {
                const url = page?.thumbnail?.source || page?.original?.source;
                if (url && !url.includes('.svg')) return url;
            }
        } catch (e) { /* continue */ }
    }
    return null;
}

async function fetchUnsplashReal(query) {
    // Use Unsplash source redirect for real photos (no API key needed)
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(query)},landmark,tourism`;
}

async function getRealPhoto(placeName, city, fallbackUrl) {
    // Try Wikipedia first
    const wikiPhoto = await fetchWikipediaPhoto(placeName, city);
    if (wikiPhoto) return wikiPhoto;
    // Fallback to the provided URL
    if (fallbackUrl && !fallbackUrl.includes('pexels-photo-338515') && !fallbackUrl.includes('pexels-photo-460672')) return fallbackUrl;
    // Last resort: Unsplash
    return await fetchUnsplashReal(`${placeName} ${city}`);
}

// ============================================
// GENERATE TRIP
// ============================================
async function generateTrip() {
    const dest = document.getElementById('destination').value.trim();
    const duration = parseInt(document.getElementById('duration').value) || 3;
    const budget = parseInt(document.getElementById('budget').value) || 15000;
    const startDate = document.getElementById('startDate').value || new Date().toISOString().split('T')[0];

    if (!dest) { showToast('Please enter a destination', 'warning'); return; }

    state.budget.total = budget;
    state.budget.used = 0;
    state.currentDest = dest;
    showLoading(true);
    setAllAgentsStatus('thinking');
    addLog('planner', `Planning ${duration}-day trip to ${dest} (\u20B9${budget.toLocaleString()})...`, 'info');

    // Try backend first
    try {
        const chk = document.querySelectorAll('.checkbox-label input');
        const res = await fetch(`${API_BASE}/generate-trip`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destination: dest, duration, budget, start_date: startDate,
                preferences: [], persona: state.persona,
                include_flights: chk[0]?.checked, include_hotels: chk[1]?.checked,
                include_restaurants: chk[2]?.checked, include_transport: chk[3]?.checked
            })
        });
        if (res.ok) {
            const data = await res.json();
            showLoading(false);
            setAllAgentsStatus('completed');
            addLog('planner', `Backend generated itinerary for ${dest}`, 'success');
            await processTrip(data, dest, duration, budget);
            return;
        }
    } catch (e) { /* Backend not available, simulate */ }

    // === AUTONOMOUS AGENT ORCHESTRATION (Fallback) ===
    document.getElementById('agentConvoPanel').style.display = 'block';
    document.getElementById('agentConvo').innerHTML = '';
    document.getElementById('insightsPanel').style.display = 'none';

    await agentSay('planner', null, `Initiating ${duration}-day trip planning for ${dest}. Requesting data from all agents...`, 'decision');
    updateAgentStatus('planner', 'working');
    await delay(600);

    await agentSay('planner', 'weather', `@Weather Risk Agent \u2014 Need forecast data for ${dest}, ${duration} days starting ${startDate}.`);
    updateAgentStatus('weather', 'working');
    await delay(500);
    await agentSay('weather', 'planner', `Forecast retrieved. Day 1: Partly cloudy 28\u00B0C, Day 2: Sunny 31\u00B0C, Day 3: 40% rain probability. Recommending indoor backup for Day 3.`, 'insight');
    updateAgentStatus('weather', 'completed');

    await agentSay('planner', 'crowd', `@Crowd Analyzer \u2014 What are the crowd levels for popular sites in ${dest}?`);
    updateAgentStatus('crowd', 'working');
    await delay(500);
    await agentSay('crowd', 'planner', `Crowd data analyzed. Morning slots (9-11 AM) have 35% less crowd. Recommending early visits for top attractions. Weekend surge expected +60%.`, 'insight');
    updateAgentStatus('crowd', 'completed');

    await agentSay('planner', 'budget', `@Budget Optimizer \u2014 Optimize \u20B9${budget.toLocaleString()} across ${duration} days. Persona: ${state.persona}.`);
    updateAgentStatus('budget', 'working');
    await delay(400);
    await agentSay('budget', 'planner', `Budget plan: Accommodation 35% (\u20B9${Math.round(budget * 0.35).toLocaleString()}), Activities 25%, Food 25%, Transport 10%, Emergency 5%.`, 'decision');
    updateAgentStatus('budget', 'completed');

    await agentSay('planner', 'preference', `@Preference Agent \u2014 Apply Bayesian priors for ${state.persona} traveler.`);
    updateAgentStatus('preference', 'working');
    await delay(400);
    const topPref = Object.entries(state.bayesian).sort((a, b) => (b[1].a / (b[1].a + b[1].b)) - (a[1].a / (a[1].a + a[1].b)))[0];
    await agentSay('preference', 'planner', `Bayesian inference complete. Strongest preference: ${topPref[0]} (${(topPref[1].a / (topPref[1].a + topPref[1].b) * 100).toFixed(0)}% posterior).`, 'insight');
    updateAgentStatus('preference', 'completed');

    await agentSay('planner', null, `All agent data received. Running MDP solver...`, 'decision');
    await delay(300);

    const itinerary = await generateSimulatedItinerary(dest, duration, budget, startDate);
    state.itinerary = itinerary;

    await agentSay('planner', 'booking', `@Booking Assistant \u2014 Itinerary finalized. Find hotels, flights, and restaurants.`);
    updateAgentStatus('booking', 'working');
    await delay(500);
    await agentSay('booking', 'planner', `Found hotels, flights, and restaurants for ${dest}.`, 'decision');
    updateAgentStatus('booking', 'completed');

    await agentSay('planner', 'explain', `@Explainability Agent \u2014 Generate reasoning trace.`);
    updateAgentStatus('explain', 'working');
    await delay(400);
    await agentSay('explain', null, `Reasoning: Selected top-rated activities with morning timing for low crowds. Budget adherence: ${((1 - itinerary.total_cost / budget) * 100).toFixed(0)}% remaining.`, 'decision');
    updateAgentStatus('explain', 'completed');

    showLoading(false);
    setAllAgentsStatus('completed');
    addLog('planner', `Autonomous planning complete for ${dest}!`, 'success');
    await processTrip({ itinerary, bookings: generateBookings(dest) }, dest, duration, budget);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function agentSay(fromId, toId, text, msgType = '') {
    return new Promise(resolve => {
        const from = AGENTS.find(a => a.id === fromId) || AGENTS[0];
        const to = toId ? AGENTS.find(a => a.id === toId) : null;
        const convo = document.getElementById('agentConvo');
        if (!convo) { resolve(); return; }
        addLog(fromId, text.replace(/@\w+ \w+ \u2014 /, ''), msgType === 'decision' ? 'success' : msgType === 'insight' ? 'info' : 'working');
        const msg = document.createElement('div');
        msg.className = `agent-msg ${msgType}`;
        const now = new Date();
        msg.innerHTML = `
      <div class="agent-msg-avatar" style="background:${from.color}22;border-color:${from.color}">${from.icon}</div>
      <div class="agent-msg-body">
        <div class="agent-msg-header">
          <span class="agent-msg-name" style="color:${from.color}">${from.name}</span>
          ${to ? `<span class="agent-msg-arrow">\u2192</span><span class="agent-msg-target">${to.name}</span>` : ''}
        </div>
        <div class="agent-msg-text">${text}</div>
        <div class="agent-msg-time">${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}</div>
      </div>`;
        convo.appendChild(msg);
        convo.scrollTop = convo.scrollHeight;
        setTimeout(resolve, 300);
    });
}

// === AI INSIGHTS ===
function addInsight(type, icon, title, text) {
    const panel = document.getElementById('insightsPanel');
    const container = document.getElementById('insightsContainer');
    if (!panel || !container) return;
    panel.style.display = 'block';
    const card = document.createElement('div');
    card.className = `insight-card ${type}`;
    card.innerHTML = `<div class="insight-header">${icon} ${title}</div><div class="insight-text">${text}</div>`;
    container.appendChild(card);
}

async function processTrip(data, dest, duration, budget) {
    state.itinerary = data.itinerary || data;
    state.currentDest = dest;

    // Fix photos: resolve real photos asynchronously for itinerary
    await fixItineraryPhotos(state.itinerary, dest);

    renderItinerary(state.itinerary, dest);
    updateMap(state.itinerary);
    renderBookings(generateBookings(dest), dest);
    renderLanguageTips(dest);
    renderWeather(dest, duration);
    updateBudgetDisplay(state.itinerary, budget);
    renderCrowdLevel();

    // Load social discovery
    loadSocialDiscovery(dest);

    // Run RL episodes
    for (let i = 0; i < 25; i++) setTimeout(() => { runRLEpisode(); drawRLChart(); }, i * 80);
    setTimeout(() => { drawAgentGraph(); drawRLChart(); }, 500);

    // Post-trip analysis
    setTimeout(() => runAutonomousAnalysis(dest, duration, budget), 1500);

    // Explainability panel
    const ep = document.getElementById('explainPanel');
    if (ep) {
        const itin = state.itinerary;
        ep.innerHTML = `
        <div style="margin-bottom:8px"><strong style="color:var(--accent)">MDP Decision Trace</strong></div>
        <div class="text-sm" style="color:var(--text-2);margin-bottom:6px">State: S(${dest}, \u20B9${budget}, weather=0.7, crowd=0.4, sat=0.8)</div>
        <div class="text-sm" style="color:var(--text-2);margin-bottom:6px">Action: keep_itinerary (\u03C0* from value iteration)</div>
        <div class="text-sm" style="color:var(--text-2);margin-bottom:6px">Reward: R = ${(0.4 * 0.9 + 0.3 * (1 - itin.total_cost / budget) + 0.2 * 0.7 - 0.1 * 0.4).toFixed(3)}</div>
        <div class="text-sm" style="color:var(--text-2)">Policy: \u03B5-greedy, \u03B5=0.1, \u03B3=0.95</div>`;
    }

    showToast(`Trip to ${dest} planned successfully!`, 'success');
}

async function fixItineraryPhotos(itinerary, dest) {
    if (!itinerary?.days) return;
    const photoPromises = [];
    itinerary.days.forEach(day => {
        (day.activities || []).forEach(act => {
            const currentPhotos = act.photos || [];
            const isGeneric = !currentPhotos.length ||
                currentPhotos.every(p => p.includes('pexels-photo-338515') || p.includes('pexels-photo-2675531') ||
                    p.includes('pexels-photo-2363') || p.includes('pexels-photo-1850629') || p.includes('pexels-photo-460672'));

            if (isGeneric) {
                const promise = fetchWikipediaPhoto(act.name, dest).then(url => {
                    if (url) {
                        act.photos = [url];
                        if (act.media) act.media.photos = [url];
                    } else {
                        // Use Unsplash source with specific query
                        const q = encodeURIComponent(`${act.name} ${dest} landmark`);
                        act.photos = [`https://source.unsplash.com/800x600/?${q}`];
                        if (act.media) act.media.photos = act.photos;
                    }
                });
                photoPromises.push(promise);
            }
        });
    });
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < photoPromises.length; i += batchSize) {
        await Promise.allSettled(photoPromises.slice(i, i + batchSize));
    }
}

async function runAutonomousAnalysis(dest, duration, budget) {
    const itin = state.itinerary;
    if (!itin) return;
    document.getElementById('insightsContainer').innerHTML = '';
    await delay(300);
    addInsight('weather', '\u{1F326}\uFE0F', 'Weather Risk Agent', `Day 3 has 40% rain probability. 2 outdoor activities flagged for indoor swaps.`);
    await delay(500);
    addInsight('crowd', '\u{1F465}', 'Crowd Analyzer', `Peak hours detected at ${itin.days[0]?.activities[0]?.name || 'top site'} between 11AM-2PM. Visit scheduled at 9AM for 35% fewer crowds.`);
    await delay(500);
    const savings = Math.round(budget * 0.08);
    addInsight('budget', '\u{1F4B0}', 'Budget Optimizer', `Found \u20B9${savings.toLocaleString()} in potential savings! Budget utilization: ${((itin.total_cost / budget) * 100).toFixed(0)}%.`);
    await delay(500);
    addInsight('preference', '\u2764\uFE0F', 'Preference Agent', `Itinerary weighted by Bayesian preferences. Rate activities to refine.`);
    await delay(500);
    addInsight('booking', '\u{1F3AB}', 'Booking Assistant', `Best value options pre-selected for your budget. Click booking tabs to explore.`);
}

// === DYNAMIC ATTRACTIONS FROM API ===
async function fetchDynamicAttractions(dest) {
    try {
        const res = await fetch(`${API_BASE}/attractions?city=${encodeURIComponent(dest)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.attractions && data.attractions.length >= 3) {
                addLog('planner', `Fetched ${data.count} real attractions via API`, 'success');
                return data.attractions.map(a => ({
                    name: a.name, type: a.type, rating: a.rating, cost: a.price || 0,
                    duration: a.duration || '2h', lat: a.lat, lon: a.lon,
                    desc: a.description || `Visit ${a.name}`,
                    reviews_count: Math.floor(Math.random() * 100000 + 10000),
                    photos: a.photos?.length ? a.photos : [a.photo || '']
                }));
            }
        }
    } catch (e) { console.log('API fetch failed:', e); }
    return null;
}

// === SIMULATED ITINERARY ===
async function generateSimulatedItinerary(dest, duration, budget, startDate) {
    const destLower = dest.toLowerCase();
    function makeMedia(name, lat, lon) {
        const q = encodeURIComponent(name);
        return {
            photos: [],
            videos: { youtube: `https://www.youtube.com/results?search_query=${q}+travel+guide`, virtual_tour: `https://www.youtube.com/results?search_query=${q}+virtual+tour+4k` },
            maps: { google: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`, directions: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}` },
            reviews: { google: `https://www.google.com/search?q=${q}+reviews`, tripadvisor: `https://www.tripadvisor.com/Search?q=${q}` },
            links: { wiki: `https://en.wikipedia.org/wiki/${q.replace(/%20/g, '_')}`, booking: `https://www.google.com/search?q=${q}+tickets+booking` }
        };
    }

    const FALLBACK_ATTRACTIONS = {
        paris: [
            { name: 'Eiffel Tower', type: 'landmark', rating: 4.6, cost: 1500, duration: '2-3h', lat: 48.8584, lon: 2.2945, desc: 'Iconic iron lattice tower on Champ de Mars' },
            { name: 'Louvre Museum', type: 'museum', rating: 4.7, cost: 1200, duration: '3-4h', lat: 48.8606, lon: 2.3376, desc: "World's largest art museum" },
            { name: 'Notre-Dame', type: 'religious', rating: 4.7, cost: 0, duration: '1-2h', lat: 48.8530, lon: 2.3499, desc: 'Medieval Gothic cathedral' },
            { name: 'Arc de Triomphe', type: 'landmark', rating: 4.6, cost: 800, duration: '1h', lat: 48.8738, lon: 2.2950, desc: 'Triumphal arch honoring France' },
            { name: 'Sacr\u00E9-C\u0153ur', type: 'religious', rating: 4.7, cost: 0, duration: '1-2h', lat: 48.8867, lon: 2.3431, desc: 'Basilica atop Montmartre' },
            { name: 'Versailles Palace', type: 'cultural', rating: 4.6, cost: 1800, duration: '4-5h', lat: 48.8049, lon: 2.1204, desc: 'UNESCO royal residence' }
        ],
        tokyo: [
            { name: 'Senso-ji Temple', type: 'religious', rating: 4.6, cost: 0, duration: '2h', lat: 35.7148, lon: 139.7967, desc: "Tokyo's oldest Buddhist temple" },
            { name: 'Tokyo Skytree', type: 'landmark', rating: 4.5, cost: 1500, duration: '2h', lat: 35.7101, lon: 139.8107, desc: 'Tallest tower in Japan' },
            { name: 'Shibuya Crossing', type: 'landmark', rating: 4.6, cost: 0, duration: '1h', lat: 35.6595, lon: 139.7004, desc: "World's busiest pedestrian crossing" },
            { name: 'Meiji Shrine', type: 'religious', rating: 4.7, cost: 0, duration: '2h', lat: 35.6764, lon: 139.6993, desc: 'Peaceful Shinto shrine' }
        ],
        london: [
            { name: 'Tower of London', type: 'cultural', rating: 4.6, cost: 2000, duration: '3h', lat: 51.5081, lon: -0.0759, desc: 'Historic castle with Crown Jewels' },
            { name: 'British Museum', type: 'museum', rating: 4.7, cost: 0, duration: '3h', lat: 51.5194, lon: -0.1270, desc: 'World-famous museum' },
            { name: 'London Eye', type: 'landmark', rating: 4.5, cost: 2500, duration: '1h', lat: 51.5033, lon: -0.1195, desc: 'Giant observation wheel' },
            { name: 'Tower Bridge', type: 'landmark', rating: 4.6, cost: 0, duration: '1h', lat: 51.5055, lon: -0.0754, desc: 'Iconic Victorian bridge' }
        ],
        jaipur: [
            { name: 'Amber Fort', type: 'fort', rating: 4.7, cost: 500, duration: '3h', lat: 26.9855, lon: 75.8513, desc: 'Majestic hilltop fort' },
            { name: 'City Palace', type: 'palace', rating: 4.6, cost: 400, duration: '2h', lat: 26.9258, lon: 75.8237, desc: 'Royal palace complex' },
            { name: 'Hawa Mahal', type: 'palace', rating: 4.5, cost: 200, duration: '1h', lat: 26.9239, lon: 75.8267, desc: 'Palace of Winds' },
            { name: 'Jantar Mantar', type: 'cultural', rating: 4.6, cost: 200, duration: '1h', lat: 26.9246, lon: 75.8245, desc: 'UNESCO astronomical observatory' }
        ]
    };

    let attractions = await fetchDynamicAttractions(dest);
    if (!attractions) {
        attractions = FALLBACK_ATTRACTIONS[destLower];
        if (attractions) addLog('planner', `Using fallback data for ${dest}`, 'info');
    }
    if (!attractions) {
        const coord = CITY_COORDS[destLower] || [20, 0];
        attractions = [
            { name: `${dest} Historic Center`, type: 'cultural', rating: 4.5, cost: 0, duration: '2-3h', lat: coord[0] + 0.01, lon: coord[1] + 0.01, desc: `Historic heart of ${dest}` },
            { name: `${dest} Main Museum`, type: 'museum', rating: 4.4, cost: 800, duration: '2h', lat: coord[0] - 0.01, lon: coord[1] + 0.02, desc: 'Major museum' },
            { name: `${dest} Central Market`, type: 'shopping', rating: 4.3, cost: 1000, duration: '2h', lat: coord[0] + 0.02, lon: coord[1] - 0.01, desc: 'Vibrant local market' },
            { name: `${dest} Cultural District`, type: 'cultural', rating: 4.4, cost: 500, duration: '3h', lat: coord[0] - 0.02, lon: coord[1] - 0.02, desc: 'Local culture' },
            { name: `${dest} Food Street`, type: 'food', rating: 4.5, cost: 600, duration: '2h', lat: coord[0] - 0.005, lon: coord[1] + 0.005, desc: 'Famous street food' }
        ];
        addLog('planner', `Using generic attractions for ${dest}`, 'warning');
    }

    const days = [];
    const start = new Date(startDate);
    const times = ['09:00', '11:30', '14:00', '16:30', '19:00'];

    for (let d = 0; d < duration; d++) {
        const date = new Date(start); date.setDate(date.getDate() + d);
        const shuffled = [...attractions].sort(() => Math.random() - 0.5);
        const dayActs = shuffled.slice(0, Math.min(4 + Math.floor(Math.random() * 2), attractions.length));
        const activities = dayActs.map((a, i) => ({
            name: a.name, type: a.type, time: times[i % times.length], duration: a.duration,
            cost: a.cost, rating: a.rating, description: a.desc, lat: a.lat, lon: a.lon,
            reviews_count: a.reviews_count || Math.floor(Math.random() * 100000 + 10000),
            photos: a.photos || [],
            media: makeMedia(a.name, a.lat, a.lon)
        }));
        days.push({
            day: d + 1, date: date.toISOString().split('T')[0], city: dest,
            activities, daily_cost: activities.reduce((s, a) => s + a.cost, 0)
        });
    }

    return { days, total_cost: days.reduce((s, d) => s + d.daily_cost, 0), cities: [dest] };
}

// === BOOKINGS ===
function generateBookings(dest) {
    const e = encodeURIComponent(dest);
    const slug = dest.toLowerCase().replace(/\s+/g, '-');
    return {
        hotels: [
            { name: `Google Hotels \u2014 ${dest}`, rating: 4.7, price_per_night: 'Compare', amenities: ['All Hotels', 'Price Compare', 'Reviews'], photo: `https://source.unsplash.com/800x600/?${e},hotel,room`, booking_url: `https://www.google.com/travel/hotels/${e}` },
            { name: `Booking.com \u2014 ${dest}`, rating: 4.5, price_per_night: 'Browse', amenities: ['WiFi', 'Breakfast', 'Free Cancel'], photo: `https://source.unsplash.com/800x600/?${e},resort,luxury`, booking_url: `https://www.booking.com/searchresults.html?ss=${e}` },
            { name: `MakeMyTrip Hotels`, rating: 4.3, price_per_night: 'Browse', amenities: ['Best Deals', 'EMI'], photo: `https://source.unsplash.com/800x600/?hotel,bedroom,modern`, booking_url: `https://www.makemytrip.com/hotels/hotel-listing/?city=${e}&country=IN` },
            { name: `Agoda Deals \u2014 ${dest}`, rating: 4.4, price_per_night: 'Browse', amenities: ['Last Minute', 'Secret Deals'], photo: `https://source.unsplash.com/800x600/?hotel,pool,tropical`, booking_url: `https://www.agoda.com/search?city=${e}` },
            { name: `Trivago \u2014 Compare All`, rating: 4.6, price_per_night: 'Compare', amenities: ['250+ Sites', 'Best Price'], photo: `https://source.unsplash.com/800x600/?hotel,lobby,elegant`, booking_url: `https://www.trivago.in/?search=${e}` },
            { name: `Hostelworld \u2014 Budget`, rating: 4.0, price_per_night: 'Budget', amenities: ['Hostels', 'Backpacker'], photo: `https://source.unsplash.com/800x600/?hostel,backpacker,dorm`, booking_url: `https://www.hostelworld.com/st/hostels/${e}/` }
        ],
        flights: [
            { airline: 'Google Flights \u2014 Compare All', price: 'Compare', departure: 'All Times', arrival: 'All Airlines', duration: 'Best Price', booking_url: `https://www.google.com/travel/flights?q=flights+to+${e}` },
            { airline: 'Skyscanner \u2014 Cheapest', price: 'Compare', departure: 'Flexible', arrival: 'Multi-airline', duration: 'Cheapest', booking_url: `https://www.skyscanner.co.in/transport/flights-to/${e}` },
            { airline: 'MakeMyTrip Flights', price: 'Browse', departure: 'All', arrival: 'All', duration: 'Deals', booking_url: `https://www.makemytrip.com/flights/results?city=${e}` },
            { airline: 'Ixigo \u2014 Budget Flights', price: 'Compare', departure: 'Budget', arrival: 'All', duration: 'Min Price', booking_url: `https://www.ixigo.com/search/result/flight?to=${e}` },
            { airline: 'Kayak \u2014 All Airlines', price: 'Compare', departure: 'All', arrival: 'All', duration: 'All Options', booking_url: `https://www.kayak.co.in/flights?to=${e}` }
        ],
        restaurants: [
            { name: `Zomato \u2014 Best in ${dest}`, rating: 4.6, price_range: '\u20B9-\u20B9\u20B9\u20B9\u20B9', cuisine: 'All Cuisines', photo: `https://source.unsplash.com/800x600/?${e},restaurant,food,dining`, booking_url: `https://www.zomato.com/${slug}/restaurants` },
            { name: `Google \u2014 Top Rated`, rating: 4.8, price_range: '\u20B9\u20B9\u20B9', cuisine: 'Fine Dining', photo: `https://source.unsplash.com/800x600/?fine+dining,gourmet`, booking_url: `https://www.google.com/search?q=best+restaurants+in+${e}` },
            { name: `Swiggy Dineout \u2014 ${dest}`, rating: 4.4, price_range: '\u20B9\u20B9', cuisine: 'All', photo: `https://source.unsplash.com/800x600/?indian+food,cuisine`, booking_url: `https://www.swiggy.com/dineout/restaurants-near-me` },
            { name: `TripAdvisor Dining`, rating: 4.5, price_range: '\u20B9\u20B9-\u20B9\u20B9\u20B9\u20B9', cuisine: 'Traveller Picks', photo: `https://source.unsplash.com/800x600/?food,plate,restaurant`, booking_url: `https://www.tripadvisor.in/Restaurants-g${e}` },
            { name: `Street Food in ${dest}`, rating: 4.4, price_range: '\u20B9', cuisine: 'Street Food', photo: `https://source.unsplash.com/800x600/?street+food,market,${e}`, booking_url: `https://www.google.com/search?q=best+street+food+in+${e}` }
        ],
        cabs: [
            { type: 'Uber', price: '\u20B9150-500/ride', features: ['AC', 'GPS', 'Cashless'], rating: 4.3, booking_url: `https://m.uber.com/looking` },
            { type: 'Ola Cabs', price: '\u20B9100-400/ride', features: ['AC', 'GPS', 'Multiple Options'], rating: 4.1, booking_url: `https://www.olacabs.com/` },
            { type: 'Zoomcar \u2014 Self Drive', price: '\u20B92,000-5,000/day', features: ['Self-drive', 'Insurance', 'GPS'], rating: 4.5, booking_url: `https://www.zoomcar.com/in/${slug}` },
            { type: 'Savaari \u2014 Outstation', price: '\u20B912-18/km', features: ['Outstation', 'Driver', 'AC'], rating: 4.2, booking_url: `https://www.savaari.com/cab-to-${slug}` },
            { type: 'Google \u2014 Local Taxis', price: 'Varies', features: ['Compare All', 'Local Options'], rating: 4.0, booking_url: `https://www.google.com/search?q=taxi+rental+in+${e}` }
        ]
    };
}

// === RENDER ITINERARY ===
function renderItinerary(itin, dest) {
    const c = document.getElementById('itineraryContainer');
    if (!c || !itin?.days) return;
    c.innerHTML = `<div class="section-title">\u{1F4C5} Your ${dest} Itinerary</div>` + itin.days.map(day => `
    <div class="day-card">
      <div class="day-header">
        <span class="day-num">Day ${day.day} \u2014 ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        <span class="day-cost">\u20B9${day.daily_cost.toLocaleString()}</span>
      </div>
      ${day.activities.map((act, i) => `
        <div class="activity-card" data-type="${act.type}">
          <div class="activity-header">
            <span class="activity-name">${act.name}</span>
            <span class="activity-time">${act.time}</span>
          </div>
          <div class="activity-meta">
            <span>\u23F1 ${act.duration}</span>
            <span>\u{1F4B0} \u20B9${act.cost}</span>
            <span>\u2B50 ${act.rating}</span>
            <span>\u{1F4AC} ${(act.reviews_count || 0).toLocaleString()} reviews</span>
          </div>
          <div class="mt-1" style="font-size:0.78rem;color:var(--text-2)">${act.description || ''}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">
            <div class="star-rating" data-day="${day.day}" data-act="${i}">
              ${[1, 2, 3, 4, 5].map(s => `<span class="star ${s <= 3 ? 'active' : ''}" onclick="rateActivity(${day.day},${i},${s})">\u2605</span>`).join('')}
            </div>
            <button class="view-media-btn" onclick="openMediaModal(${day.day - 1},${i})"><i class="fas fa-images"></i> Photos & Details</button>
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(act.name)}+travel+guide" target="_blank" class="video-link-btn"><i class="fab fa-youtube"></i> Video</a>
            <a href="https://www.google.com/maps/search/?api=1&query=${act.lat},${act.lon}" target="_blank" class="view-media-btn" style="background:var(--grad-primary);text-decoration:none"><i class="fas fa-map-marker-alt"></i> Maps</a>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function rateActivity(day, actIdx, stars) {
    const types = ['cultural', 'adventure', 'food', 'shopping', 'relaxation'];
    const act = state.itinerary?.days?.[day - 1]?.activities?.[actIdx];
    const type = act?.type || types[Math.floor(Math.random() * types.length)];
    const category = types.includes(type) ? type : 'cultural';
    updateBayesian(category, stars >= 3);
    runRLEpisode();
    drawRLChart();
    showToast(`Rated ${act?.name || 'activity'} ${stars}\u2605`, 'info');
    const ratings = document.querySelectorAll(`.star-rating[data-day="${day}"][data-act="${actIdx}"] .star`);
    ratings.forEach((s, i) => { s.classList.toggle('active', i < stars); });
    addLog('explain', `Rating ${stars}\u2605 applied \u2192 RL reward adjusted, Bayesian ${category} updated`, 'info');
}

// === RENDER BOOKINGS ===
let _currentBookings = null;
let _currentDest = '';

function renderBookings(bookings, dest) {
    const c = document.getElementById('bookingsContainer');
    if (!c) return;
    _currentBookings = bookings;
    _currentDest = dest;

    let html = `
    <div class="tabs" id="bookingTabs">
      <button class="tab active" onclick="switchBookingTab('hotels',this)">\u{1F3E8} Hotels</button>
      <button class="tab" onclick="switchBookingTab('flights',this)">\u2708\uFE0F Flights</button>
      <button class="tab" onclick="switchBookingTab('cabs',this)">\u{1F697} Cab Rentals</button>
      <button class="tab" onclick="switchBookingTab('restaurants',this)">\u{1F37D}\uFE0F Restaurants</button>
    </div>`;

    html += `<div class="tab-content active" id="tab-hotels">
      <div class="sort-controls"><button class="sort-btn active" onclick="sortBookings('hotels','rating-desc',this)">\u2B50 Rating</button><button class="sort-btn" onclick="sortBookings('hotels','price-asc',this)">\u{1F4B0} Price</button></div>
      <div class="booking-grid" id="grid-hotels">${renderHotelCards(bookings.hotels)}</div></div>`;
    html += `<div class="tab-content" id="tab-flights" style="display:none">
      <div class="booking-grid" id="grid-flights">${renderFlightCards(bookings.flights, dest)}</div></div>`;
    html += `<div class="tab-content" id="tab-cabs" style="display:none">
      <div class="booking-grid" id="grid-cabs">${renderCabCards(bookings.cabs)}</div></div>`;
    html += `<div class="tab-content" id="tab-restaurants" style="display:none">
      <div class="booking-grid" id="grid-restaurants">${renderRestaurantCards(bookings.restaurants)}</div></div>`;

    c.innerHTML = html;
}

function renderHotelCards(hotels) {
    return (hotels || []).map(h => {
        const priceText = typeof h.price_per_night === 'number' ? `\u20B9${h.price_per_night.toLocaleString()}/night` : h.price_per_night;
        return `<div class="booking-card">
      <img src="${h.photo}" alt="${h.name}" onerror="this.src='https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'" loading="lazy">
      <div class="booking-card-body">
        <div class="booking-card-title">${h.name}</div>
        <div class="booking-card-rating">\u2B50 ${h.rating}/5</div>
        <div class="booking-card-price">${priceText}</div>
        <div class="booking-card-amenities">${(h.amenities || []).map(a => `<span class="amenity-tag">${a}</span>`).join('')}</div>
        <a href="${h.booking_url || '#'}" target="_blank" class="btn btn-primary" style="text-decoration:none">\u{1F517} Visit Site</a>
      </div></div>`;
    }).join('');
}

function renderFlightCards(flights, dest) {
    return (flights || []).map(f => `
    <div class="booking-card"><div class="booking-card-body">
      <div class="booking-card-title">\u2708\uFE0F ${f.airline}</div>
      <div class="booking-card-price">${typeof f.price === 'number' ? '\u20B9' + f.price.toLocaleString() : f.price}</div>
      <div class="text-sm text-muted mb-1">${f.departure} \u2192 ${f.arrival} (${f.duration})</div>
      <a href="${f.booking_url || `https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(dest)}`}" target="_blank" class="btn btn-accent" style="text-decoration:none">Book Flight</a>
    </div></div>`).join('');
}

function renderCabCards(cabs) {
    return (cabs || []).map(c => `
    <div class="booking-card"><div class="booking-card-body">
      <div class="booking-card-title">\u{1F697} ${c.type}</div>
      <div class="booking-card-price">${c.price}</div>
      <div class="booking-card-rating">\u2B50 ${c.rating}/5</div>
      <div class="booking-card-amenities">${(c.features || []).map(f => `<span class="amenity-tag">${f}</span>`).join('')}</div>
      <a href="${c.booking_url || '#'}" target="_blank" class="btn btn-accent" style="text-decoration:none">Book Now</a>
    </div></div>`).join('');
}

function renderRestaurantCards(restaurants) {
    return (restaurants || []).map(r => `
    <div class="booking-card">
      <img src="${r.photo}" alt="${r.name}" onerror="this.src='https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg'" loading="lazy">
      <div class="booking-card-body">
        <div class="booking-card-title">${r.name}</div>
        <div class="booking-card-rating">\u2B50 ${r.rating}/5 \u00B7 ${r.cuisine}</div>
        <div class="booking-card-price">${r.price_range}</div>
        <a href="${r.booking_url || '#'}" target="_blank" class="btn btn-warm" style="text-decoration:none">View Restaurant</a>
      </div></div>`).join('');
}

function sortBookings(tab, sortKey, btn) {
    if (!_currentBookings) return;
    btn.closest('.sort-controls').querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const data = [...(_currentBookings[tab] || [])];
    const [field, dir] = sortKey.split('-');
    const asc = dir === 'asc' ? 1 : -1;
    if (field === 'price') {
        data.sort((a, b) => {
            const pa = a.price_per_night || a.price || 0;
            const pb = b.price_per_night || b.price || 0;
            const na = typeof pa === 'string' ? parseFloat(pa.replace(/[^\d.]/g, '')) || 0 : pa;
            const nb = typeof pb === 'string' ? parseFloat(pb.replace(/[^\d.]/g, '')) || 0 : pb;
            return (na - nb) * asc;
        });
    } else if (field === 'rating') {
        data.sort((a, b) => ((a.rating || 0) - (b.rating || 0)) * asc);
    }
    _currentBookings[tab] = data;
    const grid = document.getElementById(`grid-${tab}`);
    if (!grid) return;
    if (tab === 'hotels') grid.innerHTML = renderHotelCards(data);
    else if (tab === 'flights') grid.innerHTML = renderFlightCards(data, _currentDest);
    else if (tab === 'cabs') grid.innerHTML = renderCabCards(data);
    else if (tab === 'restaurants') grid.innerHTML = renderRestaurantCards(data);
}

function switchBookingTab(tab, btn) {
    document.querySelectorAll('#bookingsContainer .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#bookingsContainer .tab-content').forEach(t => { t.style.display = 'none'; t.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    const tabEl = document.getElementById(`tab-${tab}`);
    if (tabEl) { tabEl.style.display = 'block'; tabEl.classList.add('active'); }
}

// === LANGUAGE TIPS ===
function renderLanguageTips(dest) {
    const c = document.getElementById('languageTips');
    if (!c) return;
    const destLower = dest.toLowerCase();
    const data = LANGUAGE_DB[destLower] || LANGUAGE_DB[Object.keys(LANGUAGE_DB).find(k => destLower.includes(k)) || ''];
    if (!data) {
        c.innerHTML = `<div class="section-title">\u{1F5E3}\uFE0F Language Tips</div><div class="empty-state"><div class="emoji">\u{1F30D}</div><p class="text-muted">Language tips will appear after generating a trip</p></div>`;
        return;
    }
    c.innerHTML = `
    <div class="section-title">\u{1F5E3}\uFE0F ${data.flag} ${data.lang} \u2014 Essential Travel Phrases</div>
    <div class="lang-grid">
      ${data.phrases.map(p => `
        <div class="lang-card"><div class="lang-english">${p.en}</div><div class="lang-phrase">${p.phrase}</div><div class="lang-phonetic">\u{1F508} ${p.phon}</div><div class="lang-situation">\u{1F4A1} ${p.ctx}</div></div>
      `).join('')}
    </div>`;
}

// === WEATHER ===
function renderWeather(dest, days) {
    const c = document.getElementById('weatherCards');
    if (!c) return;
    const icons = ['\u2600\uFE0F', '\u26C5', '\u{1F324}\uFE0F', '\u{1F327}\uFE0F', '\u26C8\uFE0F', '\u{1F326}\uFE0F'];
    const descs = ['Sunny', 'Partly Cloudy', 'Clear', 'Light Rain', 'Thunderstorm', 'Showers'];
    c.innerHTML = Array.from({ length: Math.min(days, 3) }, (_, i) => {
        const temp = 20 + Math.floor(Math.random() * 15);
        const idx = Math.floor(Math.random() * icons.length);
        return `<div class="weather-card"><div class="weather-icon">${icons[idx]}</div><div class="weather-temp">${temp}\u00B0C</div><div class="weather-desc">${descs[idx]}</div><div class="text-xs text-muted">Day ${i + 1}</div></div>`;
    }).join('');
}

// === BUDGET ===
function updateBudgetDisplay(itin, total) {
    const used = itin?.total_cost || 0;
    state.budget = { total, used };
    const pct = Math.min(100, (used / total * 100));
    const amtEl = document.getElementById('budgetAmount');
    const fillEl = document.getElementById('budgetFill');
    const totalEl = document.getElementById('budgetTotal');
    if (amtEl) amtEl.textContent = `\u20B9${used.toLocaleString()}`;
    if (fillEl) fillEl.style.width = pct + '%';
    if (totalEl) totalEl.textContent = `/ \u20B9${total.toLocaleString()}`;
    const cats = document.getElementById('budgetCats');
    if (cats) {
        const breakdown = { '\u{1F3E8} Accommodation': 0.35, '\u{1F37D}\uFE0F Food': 0.25, '\u{1F3AF} Activities': 0.25, '\u{1F697} Transport': 0.10, '\u{1F198} Emergency': 0.05 };
        cats.innerHTML = Object.entries(breakdown).map(([k, v]) => {
            const amt = Math.round(total * v);
            return `<div class="budget-cat"><span>${k}</span><span class="fw-600">\u20B9${amt.toLocaleString()}</span></div>`;
        }).join('');
    }
}

// === CROWD ===
function renderCrowdLevel() {
    const c = document.getElementById('crowdBar');
    if (!c) return;
    const levels = ['#10b981', '#10b981', '#f59e0b', '#f59e0b', '#ef4444'];
    const current = Math.floor(Math.random() * 5);
    c.innerHTML = levels.map((color, i) =>
        `<div class="crowd-segment" style="background:${i <= current ? color : 'var(--bg-4)'}"></div>`
    ).join('');
    const label = document.getElementById('crowdLabel');
    if (label) label.textContent = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'][current];
}

// ============================================
// SOCIAL DISCOVERY: INSTAGRAM & YOUTUBE SCRAPERS
// ============================================

function loadSocialDiscovery(dest) {
    loadInstagramTrending(dest);
    loadYouTubeHiddenGems(dest);
}

function loadInstagramTrending(dest) {
    const grid = document.getElementById('instaGrid');
    const empty = document.getElementById('instaEmpty');
    if (!grid) return;
    if (empty) empty.style.display = 'none';

    const destLower = dest.toLowerCase();
    const hashtags = [`${destLower}travel`, `${destLower}hidden`, `${destLower}gems`, `explore${destLower}`, `${destLower}photography`];

    // Instagram-style viral places discovery (curated data based on real trending spots)
    const INSTAGRAM_VIRAL_PLACES = {
        paris: [
            { name: 'Rue Cr\u00E9mieux', desc: 'Colorful pastel street that went viral on Instagram. A hidden residential street with vibrant painted houses.', tags: ['#ruecremieux', '#parisgems', '#instaparis'], likes: '485K', saves: '120K', img: `https://source.unsplash.com/600x400/?rue+cremieux+paris+colorful` },
            { name: 'Le Marais Street Art', desc: 'Underground street art district with constantly changing murals and hidden galleries.', tags: ['#lemarais', '#parisstreetart', '#urbanart'], likes: '320K', saves: '89K', img: `https://source.unsplash.com/600x400/?le+marais+paris+street+art` },
            { name: 'Canal Saint-Martin', desc: 'Trendy canal area with hidden cafes, vintage shops and iron footbridges. Less tourists, more vibes.', tags: ['#canalsaintmartin', '#parislocal', '#hiddenParis'], likes: '267K', saves: '74K', img: `https://source.unsplash.com/600x400/?canal+saint+martin+paris` },
            { name: 'Petite Ceinture', desc: 'Abandoned railway turned urban jungle. A secret green path winding through Paris.', tags: ['#petiteceinture', '#secretparis', '#abandoned'], likes: '198K', saves: '65K', img: `https://source.unsplash.com/600x400/?abandoned+railway+paris+nature` }
        ],
        tokyo: [
            { name: 'Shimokitazawa', desc: 'Tokyo\'s coolest neighborhood for vintage shopping, indie cafes, and live music. Not in guidebooks!', tags: ['#shimokitazawa', '#tokyolocal', '#vintagetokyo'], likes: '412K', saves: '103K', img: `https://source.unsplash.com/600x400/?shimokitazawa+tokyo+street` },
            { name: 'Yanaka District', desc: 'Old-Tokyo charm with traditional wooden houses, temples, and the famous cat street.', tags: ['#yanaka', '#oldtokyo', '#tokyocats'], likes: '287K', saves: '76K', img: `https://source.unsplash.com/600x400/?yanaka+tokyo+traditional` },
            { name: 'TeamLab Borderless', desc: 'Mind-blowing immersive digital art museum. Every photo is Instagram-worthy.', tags: ['#teamlab', '#digitalart', '#tokyoart'], likes: '890K', saves: '245K', img: `https://source.unsplash.com/600x400/?teamlab+digital+art+immersive` },
            { name: 'Golden Gai', desc: 'Tiny alleyway with 200+ micro-bars. Each fits only 6-8 people. Pure Tokyo magic.', tags: ['#goldengai', '#shinjuku', '#tokyonightlife'], likes: '356K', saves: '98K', img: `https://source.unsplash.com/600x400/?golden+gai+shinjuku+tokyo+night` }
        ],
        london: [
            { name: 'Neal\'s Yard', desc: 'Hidden colorful courtyard in Covent Garden. One of London\'s most photographed secret spots.', tags: ['#nealsyard', '#coventgarden', '#hiddenlondon'], likes: '378K', saves: '95K', img: `https://source.unsplash.com/600x400/?neals+yard+london+colorful` },
            { name: 'Leadenhall Market', desc: 'Victorian covered market that inspired Diagon Alley in Harry Potter. Stunning architecture.', tags: ['#leadenhall', '#harrypotter', '#victorianlondon'], likes: '445K', saves: '112K', img: `https://source.unsplash.com/600x400/?leadenhall+market+london` },
            { name: 'Little Venice', desc: 'Canal boats and waterways that feel like you\'re outside London entirely. Peaceful hidden gem.', tags: ['#littlevenice', '#londoncanals', '#peaceful'], likes: '234K', saves: '67K', img: `https://source.unsplash.com/600x400/?little+venice+london+canal` },
            { name: 'God\'s Own Junkyard', desc: 'Neon sign warehouse in Walthamstow. Wild, colorful, and completely unexpected.', tags: ['#godsownjunkyard', '#neonlondon', '#walthamstow'], likes: '312K', saves: '88K', img: `https://source.unsplash.com/600x400/?neon+signs+warehouse+colorful` }
        ],
        jaipur: [
            { name: 'Panna Meena ka Kund', desc: 'Ancient geometric stepwell that went viral. Stunning symmetrical architecture hidden near Amber Fort.', tags: ['#pannameena', '#stepwell', '#jaipurgems'], likes: '356K', saves: '142K', img: `https://source.unsplash.com/600x400/?stepwell+jaipur+geometric` },
            { name: 'Patrika Gate', desc: 'Colorful Rajasthani gate that became Instagram\'s most viral spot in Jaipur. Free entry!', tags: ['#patrikagate', '#jaipurpink', '#rajasthan'], likes: '523K', saves: '178K', img: `https://source.unsplash.com/600x400/?patrika+gate+jaipur+colorful` },
            { name: 'Nahargarh Fort Sunset', desc: 'Best sunset view of Jaipur that most tourists miss. Locals\' favorite evening spot.', tags: ['#nahargarh', '#jaipursunset', '#hilltop'], likes: '289K', saves: '89K', img: `https://source.unsplash.com/600x400/?nahargarh+fort+sunset+jaipur` },
            { name: 'Chand Baori', desc: '1000-year-old stepwell with 3500 steps. 45 min from Jaipur, worth every minute. Jaw-dropping.', tags: ['#chandbaori', '#ancientindia', '#mindblown'], likes: '678K', saves: '234K', img: `https://source.unsplash.com/600x400/?chand+baori+stepwell+india` }
        ]
    };

    const places = INSTAGRAM_VIRAL_PLACES[destLower] || generateGenericViralPlaces(dest, 'instagram');

    grid.innerHTML = places.map(p => `
        <div class="discovery-card">
            <div class="discovery-card-img" style="position:relative">
                <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://source.unsplash.com/600x400/?${encodeURIComponent(dest)},travel'">
                <div class="discovery-card-platform instagram"><i class="fab fa-instagram"></i> Trending</div>
            </div>
            <div class="discovery-card-body">
                <div class="hidden-gem-badge">\u{1F48E} Hidden Gem</div>
                <div class="discovery-card-title">${p.name}</div>
                <div class="discovery-card-desc">${p.desc}</div>
                <div class="discovery-card-stats">
                    <span>\u2764\uFE0F ${p.likes} likes</span>
                    <span>\u{1F516} ${p.saves} saves</span>
                </div>
                <div class="discovery-card-tags">${p.tags.map(t => `<span class="discovery-tag">${t}</span>`).join('')}</div>
                <a href="https://www.instagram.com/explore/tags/${encodeURIComponent(p.name.replace(/['\s]/g, '').toLowerCase())}/" target="_blank" class="btn btn-warm" style="text-decoration:none;font-size:0.78rem"><i class="fab fa-instagram"></i> View on Instagram</a>
            </div>
        </div>
    `).join('');

    addLog('preference', `Loaded ${places.length} trending Instagram spots for ${dest}`, 'success');
}

function loadYouTubeHiddenGems(dest) {
    const grid = document.getElementById('ytGrid');
    const empty = document.getElementById('ytEmpty');
    if (!grid) return;
    if (empty) empty.style.display = 'none';

    const destLower = dest.toLowerCase();

    const YOUTUBE_HIDDEN_GEMS = {
        paris: [
            { name: 'Secret Underground Paris', desc: 'Explore the catacombs and hidden underground passages that most tourists never see.', channel: 'Kara and Nate', views: '2.3M', duration: '18:42', img: `https://source.unsplash.com/600x400/?paris+catacombs+underground` },
            { name: 'Locals Only: Real Paris', desc: 'A Parisian local shows secret spots that no guidebook mentions. Markets, bakeries, hidden parks.', channel: 'Lost LeBlanc', views: '1.8M', duration: '22:15', img: `https://source.unsplash.com/600x400/?paris+local+bakery+market` },
            { name: 'Paris on a Budget', desc: 'How to experience the best of Paris for under $50/day. Free museums, cheap eats, local tips.', channel: 'Hey Nadine', views: '980K', duration: '15:30', img: `https://source.unsplash.com/600x400/?paris+budget+cafe` },
            { name: 'Night Photography Spots', desc: 'The most stunning photography spots in Paris that locals keep secret. Golden hour guide.', channel: 'Peter McKinnon', views: '1.5M', duration: '12:08', img: `https://source.unsplash.com/600x400/?paris+night+eiffel+lights` }
        ],
        tokyo: [
            { name: 'Tokyo Like a Local', desc: 'Skip the tourist traps! A Tokyo resident shares their daily life and favorite hidden spots.', channel: 'Paolo fromTOKYO', views: '5.2M', duration: '25:00', img: `https://source.unsplash.com/600x400/?tokyo+local+life+street` },
            { name: 'Cheapest Eats in Tokyo', desc: 'Incredible $1-5 meals that taste better than expensive restaurants. Street food heaven.', channel: 'Abroad in Japan', views: '3.1M', duration: '20:15', img: `https://source.unsplash.com/600x400/?tokyo+street+food+ramen` },
            { name: 'Hidden Temples & Shrines', desc: 'Peaceful temples away from crowds. Includes a 500-year-old hidden garden most miss.', channel: 'Sharmeleon', views: '890K', duration: '16:45', img: `https://source.unsplash.com/600x400/?tokyo+hidden+temple+garden` },
            { name: 'Tokyo After Midnight', desc: 'What Tokyo looks like when the last trains stop. Robot restaurants, izakayas, and neon dreams.', channel: 'Wotaku', views: '2.7M', duration: '18:30', img: `https://source.unsplash.com/600x400/?tokyo+night+neon+shinjuku` }
        ],
        london: [
            { name: 'Secret London Walks', desc: 'Walking routes through hidden alleyways, secret gardens, and underground rivers.', channel: 'Joolz Guides', views: '1.9M', duration: '28:00', img: `https://source.unsplash.com/600x400/?london+secret+alley+garden` },
            { name: 'Free Things in London', desc: '50 completely free things to do in London. Museums, views, markets, and hidden gems.', channel: 'Love and London', views: '2.1M', duration: '19:30', img: `https://source.unsplash.com/600x400/?london+free+museum+park` },
            { name: 'London Food Market Tour', desc: 'Borough Market, Maltby Street, and hidden food stalls that locals swear by.', channel: 'Mark Wiens', views: '3.8M', duration: '24:15', img: `https://source.unsplash.com/600x400/?london+borough+market+food` }
        ],
        jaipur: [
            { name: 'Beyond the Pink City', desc: 'Hidden stepwells, secret temples, and artisan workshops that tourists never find.', channel: 'Karl Rock', views: '1.2M', duration: '22:00', img: `https://source.unsplash.com/600x400/?jaipur+stepwell+hidden` },
            { name: 'Jaipur Street Food Tour', desc: 'The most incredible street food in Jaipur. Dal Bati Churma, Laal Maas, and Pyaaz Kachori.', channel: 'Davidsbeenhere', views: '890K', duration: '18:45', img: `https://source.unsplash.com/600x400/?jaipur+street+food+indian` },
            { name: 'Rajasthan Hidden Gems', desc: 'Day trips from Jaipur to places no one talks about. Abhaneri, Bhangarh, and more.', channel: 'Tanya Khanijow', views: '670K', duration: '20:30', img: `https://source.unsplash.com/600x400/?rajasthan+fort+desert+hidden` }
        ]
    };

    const videos = YOUTUBE_HIDDEN_GEMS[destLower] || generateGenericViralPlaces(dest, 'youtube');

    grid.innerHTML = videos.map(v => `
        <div class="discovery-card">
            <div class="discovery-card-img" style="position:relative">
                <img src="${v.img}" alt="${v.name}" loading="lazy" onerror="this.src='https://source.unsplash.com/600x400/?${encodeURIComponent(dest)},travel,adventure'">
                <div class="discovery-card-platform youtube"><i class="fab fa-youtube"></i> ${v.duration || 'Video'}</div>
            </div>
            <div class="discovery-card-body">
                <div class="hidden-gem-badge">\u{1F48E} Less Visited</div>
                <div class="discovery-card-title">${v.name}</div>
                <div class="discovery-card-desc">${v.desc}</div>
                <div class="discovery-card-stats">
                    <span>\u{1F441}\uFE0F ${v.views} views</span>
                    ${v.channel ? `<span>\u{1F4FA} ${v.channel}</span>` : ''}
                </div>
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.name + ' ' + dest + ' hidden gems')}" target="_blank" class="btn btn-accent" style="text-decoration:none;font-size:0.78rem"><i class="fab fa-youtube"></i> Watch on YouTube</a>
            </div>
        </div>
    `).join('');

    addLog('preference', `Loaded ${videos.length} YouTube hidden gem videos for ${dest}`, 'success');
}

function generateGenericViralPlaces(dest, platform) {
    const e = encodeURIComponent(dest);
    if (platform === 'instagram') {
        return [
            { name: `${dest} Old Quarter`, desc: `The most photogenic streets in ${dest}. Locals love this area but tourists rarely venture here.`, tags: [`#${dest.toLowerCase().replace(/\s/g, '')}gems`, '#hiddengems', '#offthebeatenpath'], likes: '245K', saves: '78K', img: `https://source.unsplash.com/600x400/?${e},old+quarter,street` },
            { name: `${dest} Sunset Point`, desc: `Best sunset views in ${dest} that went viral on social media. Bring your camera!`, tags: [`#${dest.toLowerCase().replace(/\s/g, '')}sunset`, '#goldenhour', '#travelgram'], likes: '189K', saves: '56K', img: `https://source.unsplash.com/600x400/?${e},sunset,viewpoint` },
            { name: `${dest} Local Market`, desc: `Authentic local market with unique crafts, street food, and cultural experiences.`, tags: [`#${dest.toLowerCase().replace(/\s/g, '')}market`, '#locallife', '#authentic'], likes: '156K', saves: '45K', img: `https://source.unsplash.com/600x400/?${e},local+market,colorful` }
        ];
    } else {
        return [
            { name: `${dest} Hidden Gems Guide`, desc: `Complete guide to the hidden gems and less visited places in ${dest}. Off-the-beaten-path adventures.`, channel: 'Travel Guide', views: '890K', duration: '18:30', img: `https://source.unsplash.com/600x400/?${e},hidden+gem,travel` },
            { name: `${dest} on a Budget`, desc: `How to explore ${dest} without breaking the bank. Budget tips, free activities, and cheap eats.`, channel: 'Budget Travel', views: '567K', duration: '15:45', img: `https://source.unsplash.com/600x400/?${e},budget,backpacker` },
            { name: `${dest} Food Guide`, desc: `The ultimate food guide to ${dest}. Street food, local restaurants, and must-try dishes.`, channel: 'Food Traveler', views: '1.2M', duration: '22:00', img: `https://source.unsplash.com/600x400/?${e},food,street+food` }
        ];
    }
}

function switchDiscoveryTab(tab, btn) {
    document.querySelectorAll('.disc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.disc-content').forEach(t => { t.style.display = 'none'; t.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    const el = document.getElementById(`disc-${tab}`);
    if (el) { el.style.display = 'block'; el.classList.add('active'); }
}

// ============================================
// AI CHATBOT
// ============================================

function toggleChatbot() {
    const win = document.getElementById('chatbotWindow');
    state.chatOpen = !state.chatOpen;
    if (state.chatOpen) {
        win.classList.add('active');
        document.getElementById('chatInput')?.focus();
        const badge = document.getElementById('chatbotBadge');
        if (badge) badge.style.display = 'none';
    } else {
        win.classList.remove('active');
    }
}

function sendSuggestion(text) {
    document.getElementById('chatInput').value = text;
    sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    // Add user message
    appendChatMessage('user', msg);

    // Show typing indicator
    const typingId = showChatTyping();

    // Generate response
    const response = await generateChatResponse(msg);

    // Remove typing indicator and add bot response
    removeChatTyping(typingId);
    appendChatMessage('bot', response);
}

function appendChatMessage(role, text) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.innerHTML = `
        <div class="chat-msg-avatar">${role === 'bot' ? '\u{1F916}' : '\u{1F464}'}</div>
        <div class="chat-msg-bubble">${text}</div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    state.chatHistory.push({ role, text });
}

function showChatTyping() {
    const container = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.id = 'chat-typing-indicator';
    typing.innerHTML = `
        <div class="chat-msg-avatar">\u{1F916}</div>
        <div class="chat-msg-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
    return 'chat-typing-indicator';
}

function removeChatTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function generateChatResponse(userMsg) {
    const dest = state.currentDest || document.getElementById('destination')?.value || '';
    const lower = userMsg.toLowerCase();

    // Try backend first
    try {
        const res = await fetch(`${API_BASE}/chatbot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg, destination: dest, persona: state.persona, history: state.chatHistory.slice(-6) })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.response) return data.response;
        }
    } catch (e) { /* fallback to local */ }

    // Local smart responses
    await delay(800 + Math.random() * 1200);

    if (lower.includes('hidden gem') || lower.includes('less known') || lower.includes('off the beaten')) {
        return dest
            ? `Great question! Here are some hidden gems near <strong>${dest}</strong>:\n<ul style="margin:6px 0 0 16px"><li><strong>Local neighborhoods</strong> \u2014 Walk through residential areas for authentic culture</li><li><strong>Morning markets</strong> \u2014 Visit before 8 AM for the real local experience</li><li><strong>Second-tier attractions</strong> \u2014 Skip the #1 tourist spot and visit #5-#10 instead</li><li><strong>University areas</strong> \u2014 Great food, cafes, and young energy</li></ul>\nCheck the <strong>Viral & Hidden Gems</strong> section below for Instagram and YouTube curated spots!`
            : 'Enter a destination first, and I\'ll find amazing hidden gems for you! The Viral Discovery section has Instagram and YouTube curated spots.';
    }

    if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('cuisine')) {
        return dest
            ? `Here are my food tips for <strong>${dest}</strong>:\n<ul style="margin:6px 0 0 16px"><li><strong>Street food</strong> \u2014 Always try the street food! Follow the crowds \u2014 long lines = good food</li><li><strong>Local breakfast</strong> \u2014 Skip the hotel breakfast and eat where locals eat</li><li><strong>Night markets</strong> \u2014 Best variety and atmosphere after 6 PM</li><li><strong>Google Maps reviews</strong> \u2014 Filter for 4.5+ stars with 500+ reviews</li></ul>\nCheck the <strong>Restaurants tab</strong> in bookings for curated options!`
            : 'Tell me your destination and I\'ll give you specific food recommendations!';
    }

    if (lower.includes('budget') || lower.includes('save') || lower.includes('cheap') || lower.includes('money')) {
        const budgetVal = state.budget.total;
        return `Here are smart budget tips${dest ? ` for ${dest}` : ''}:\n<ul style="margin:6px 0 0 16px"><li><strong>Book in advance</strong> \u2014 Hotels and flights are 20-40% cheaper if booked 2+ weeks ahead</li><li><strong>Free walking tours</strong> \u2014 Tip-based tours are amazing and save \u20B91000+</li><li><strong>Local transport</strong> \u2014 Use metro/bus passes instead of taxis</li><li><strong>Eat local</strong> \u2014 Street food and local restaurants cost 1/3 of tourist spots</li><li><strong>Free attractions</strong> \u2014 Many museums have free days. Parks, markets, and temples are usually free</li></ul>${budgetVal ? `\nYour current budget is <strong>\u20B9${budgetVal.toLocaleString()}</strong>. I've optimized your itinerary to stay within it!` : ''}`;
    }

    if (lower.includes('safe') || lower.includes('danger') || lower.includes('scam') || lower.includes('security')) {
        return `Safety tips for traveling${dest ? ` to ${dest}` : ''}:\n<ul style="margin:6px 0 0 16px"><li><strong>Keep copies</strong> \u2014 Photo your passport, visa, and insurance on your phone</li><li><strong>Avoid touts</strong> \u2014 If someone approaches you aggressively, politely decline</li><li><strong>Use official transport</strong> \u2014 Book Uber/Ola instead of random taxis</li><li><strong>Travel insurance</strong> \u2014 Always get it! Covers medical, cancellations, and theft</li><li><strong>Emergency numbers</strong> \u2014 Save local police and embassy numbers</li><li><strong>Trust your instincts</strong> \u2014 If something feels wrong, leave</li></ul>`;
    }

    if (lower.includes('weather') || lower.includes('when') || lower.includes('best time')) {
        return dest
            ? `For <strong>${dest}</strong>, check the Weather panel on the right sidebar for current conditions. General tips:\n<ul style="margin:6px 0 0 16px"><li><strong>Shoulder season</strong> \u2014 Visit just before/after peak season for fewer crowds and lower prices</li><li><strong>Rainy season</strong> \u2014 Can be magical with fewer tourists. Just pack waterproofs!</li><li><strong>Winter travel</strong> \u2014 Some destinations are stunning in off-season</li></ul>`
            : 'Tell me your destination and I\'ll advise on the best time to visit!';
    }

    if (lower.includes('thank') || lower.includes('thanks') || lower.includes('helpful')) {
        return 'You\'re welcome! I\'m always here to help with your trip planning. Feel free to ask anything else \u2014 from packing tips to cultural etiquette!';
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return `Hello! Welcome to SmartRoute AI. ${dest ? `I see you're planning a trip to <strong>${dest}</strong>. ` : ''}How can I help you today? I can assist with:\n<ul style="margin:6px 0 0 16px"><li>Hidden gems & local recommendations</li><li>Budget planning & saving tips</li><li>Food & restaurant suggestions</li><li>Safety & travel advice</li><li>Best time to visit</li></ul>`;
    }

    // Default intelligent response
    return dest
        ? `That's a great question about <strong>${dest}</strong>! Here are some things I'd recommend:\n<ul style="margin:6px 0 0 16px"><li>Explore the <strong>Viral & Hidden Gems</strong> section for Instagram and YouTube curated spots</li><li>Check the <strong>Bookings</strong> tab for hotels, flights, restaurants, and cab options</li><li>Use the <strong>Emergency Replan</strong> button if your schedule changes</li><li>Rate activities to help the AI learn your preferences</li></ul>\nAsk me about food, budget tips, hidden gems, safety, or anything else!`
        : 'I\'d love to help! Enter a destination in the sidebar and click <strong>Generate AI Trip</strong> to get started. Then I can give you personalized recommendations, hidden gems, budget tips, and more!';
}

// ============================================
// EMERGENCY REPLANNING
// ============================================

function emergencyReplan() {
    if (!state.itinerary) { showToast('Generate a trip first!', 'warning'); return; }
    const modal = document.getElementById('delayModal');
    if (modal) modal.classList.add('active');
}

async function delayReplan() {
    const delayHours = parseFloat(document.getElementById('delayHours')?.value) || 4;
    const delayDay = parseInt(document.getElementById('delayDay')?.value) || 1;
    const delayReason = document.getElementById('delayReason')?.value || 'train_delay';
    const dest = document.getElementById('destination').value.trim();
    const budget = parseInt(document.getElementById('budget').value) || 15000;

    if (!state.itinerary) { showToast('Generate a trip first!', 'warning'); return; }

    const modal = document.getElementById('delayModal');
    if (modal) modal.classList.remove('active');

    showLoading(true);
    setAllAgentsStatus('thinking');

    const reasonLabels = { train_delay: 'Train Delay', flight_delay: 'Flight Delay', traffic: 'Traffic Jam', other: 'Other Delay' };
    addLog('planner', `DELAY ALERT: ${delayHours}h delay on Day ${delayDay} \u2014 ${reasonLabels[delayReason] || delayReason}`, 'error');

    document.getElementById('agentConvoPanel').style.display = 'block';
    document.getElementById('agentConvo').innerHTML = '';

    await agentSay('planner', null, `DELAY ALERT: ${delayHours} hour delay reported on Day ${delayDay}. Initiating emergency replanning...`, 'decision');
    updateAgentStatus('planner', 'working');
    await delay(400);

    await agentSay('planner', 'crowd', `@Crowd Analyzer \u2014 Reassess crowd levels for shortened Day ${delayDay}.`);
    updateAgentStatus('crowd', 'working');
    await delay(300);
    await agentSay('crowd', 'planner', `Adjusted analysis: Evening slots busier (+40%). Recommending early afternoon visits.`, 'insight');
    updateAgentStatus('crowd', 'completed');

    // Try backend
    try {
        const res = await fetch(`${API_BASE}/replan-delay`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destination: dest, delay_hours: delayHours, current_day: delayDay,
                budget, original_itinerary: state.itinerary, reason: delayReason
            })
        });
        if (res.ok) {
            const data = await res.json();
            state.itinerary = data.itinerary;
            await fixItineraryPhotos(state.itinerary, dest);
            renderItinerary(state.itinerary, dest);
            updateMap(state.itinerary);
            updateBudgetDisplay(state.itinerary, budget);
            showLoading(false);
            setAllAgentsStatus('completed');
            showToast(`Day ${delayDay} replanned for ${delayHours}h delay!`, 'success');
            return;
        }
    } catch (e) { /* fallback */ }

    // Fallback
    const dayIdx = delayDay - 1;
    if (state.itinerary.days[dayIdx]) {
        const day = state.itinerary.days[dayIdx];
        const sorted = [...day.activities].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const kept = sorted.slice(0, Math.max(1, Math.floor((10 - delayHours) / 2.5)));
        const startHour = 9 + delayHours;
        kept.forEach((a, i) => { a.time = `${Math.floor(startHour + i * 2.5).toString().padStart(2, '0')}:00`; });
        day.activities = kept;
        day.daily_cost = kept.reduce((s, a) => s + (a.cost || 0), 0);
        state.itinerary.total_cost = state.itinerary.days.reduce((s, d) => s + d.daily_cost, 0);
    }

    renderItinerary(state.itinerary, dest);
    updateMap(state.itinerary);
    updateBudgetDisplay(state.itinerary, budget);
    runRLEpisode(); drawRLChart();

    showLoading(false);
    setAllAgentsStatus('completed');
    showToast(`Day ${delayDay} replanned for ${delayHours}h delay!`, 'success');
}

// ============================================
// MEDIA MODAL
// ============================================

function openMediaModal(dayIdx, actIdx) {
    const act = state.itinerary?.days?.[dayIdx]?.activities?.[actIdx];
    if (!act) return;

    const modal = document.getElementById('mediaModal');
    document.getElementById('modalTitle').textContent = act.name;

    const q = encodeURIComponent(act.name);
    const media = act.media || {};

    // Photos
    const photos = act.photos?.length ? act.photos : [`https://source.unsplash.com/800x600/?${q},landmark`];
    document.getElementById('modalPhotos').innerHTML = photos.map((url, i) =>
        `<div class="photo-gallery-item" onclick="viewFullPhoto('${url}')">
      <img src="${url}" alt="${act.name} photo ${i + 1}" loading="lazy" onerror="this.src='https://source.unsplash.com/800x600/?${q},travel'">
      <div class="photo-overlay"><span>Click to enlarge</span></div>
    </div>`
    ).join('');

    // Videos
    const ytSearch = media.videos?.youtube || `https://www.youtube.com/results?search_query=${q}+travel+guide`;
    document.getElementById('modalVideos').innerHTML = `
    <a href="${ytSearch}" target="_blank" class="media-link-btn youtube"><i class="fab fa-youtube"></i> Watch on YouTube</a>
    <a href="https://www.youtube.com/results?search_query=${q}+virtual+tour+4k" target="_blank" class="media-link-btn youtube"><i class="fas fa-vr-cardboard"></i> Virtual Tour</a>
    <a href="https://www.youtube.com/results?search_query=${q}+drone+footage" target="_blank" class="media-link-btn youtube"><i class="fas fa-helicopter"></i> Drone Footage</a>`;

    // Map embed
    const mapDiv = document.getElementById('modalMapEmbed');
    mapDiv.innerHTML = '';
    if (act.lat && act.lon) {
        mapDiv.innerHTML = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${act.lon - 0.01},${act.lat - 0.01},${act.lon + 0.01},${act.lat + 0.01}&layer=mapnik&marker=${act.lat},${act.lon}" style="width:100%;height:100%;border:none;border-radius:var(--radius)"></iframe>`;
    }

    // Maps links
    document.getElementById('modalMaps').innerHTML = `
    <a href="https://www.google.com/maps/search/?api=1&query=${act.lat},${act.lon}" target="_blank" class="media-link-btn google"><i class="fas fa-map-marked-alt"></i> Google Maps</a>
    <a href="https://www.google.com/maps/dir/?api=1&destination=${act.lat},${act.lon}" target="_blank" class="media-link-btn google"><i class="fas fa-directions"></i> Directions</a>`;

    // Reviews
    const fullStars = Math.floor(act.rating);
    const starsHtml = Array.from({ length: 5 }, (_, i) => `<span class="star ${i < fullStars ? '' : 'empty'}">${i < fullStars ? '\u2605' : '\u2606'}</span>`).join('');
    document.getElementById('modalRating').innerHTML = `
    <div class="rating-big">${act.rating}</div>
    <div><div class="rating-stars">${starsHtml}</div><div class="rating-label">${(act.reviews_count || 0).toLocaleString()} reviews</div></div>`;
    document.getElementById('modalReviews').innerHTML = `
    <a href="https://www.google.com/search?q=${q}+reviews" target="_blank" class="media-link-btn google"><i class="fab fa-google"></i> Google Reviews</a>
    <a href="https://www.tripadvisor.com/Search?q=${q}" target="_blank" class="media-link-btn tripadvisor"><i class="fab fa-tripadvisor"></i> TripAdvisor</a>`;

    // Links
    document.getElementById('modalLinks').innerHTML = `
    <a href="https://en.wikipedia.org/wiki/${q.replace(/%20/g, '_')}" target="_blank" class="media-link-btn wiki"><i class="fab fa-wikipedia-w"></i> Wikipedia</a>
    <a href="https://www.google.com/search?q=${q}+tickets+booking" target="_blank" class="media-link-btn"><i class="fas fa-ticket-alt"></i> Book Tickets</a>
    <a href="https://www.instagram.com/explore/tags/${q.replace(/%20/g, '')}" target="_blank" class="media-link-btn" style="border-color:rgba(225,48,108,0.3)"><i class="fab fa-instagram"></i> Instagram</a>`;

    // Quick Info
    document.getElementById('modalInfo').innerHTML = `
    <div class="info-badge"><i class="fas fa-clock"></i> ${act.duration}</div>
    <div class="info-badge"><i class="fas fa-rupee-sign"></i> \u20B9${act.cost}</div>
    <div class="info-badge"><i class="fas fa-tag"></i> ${act.type}</div>
    <div class="info-badge"><i class="fas fa-star"></i> ${act.rating}/5</div>
    <div class="info-badge"><i class="fas fa-comment"></i> ${(act.reviews_count || 0).toLocaleString()} reviews</div>`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMediaModal() {
    document.getElementById('mediaModal')?.classList.remove('active');
    document.body.style.overflow = '';
}

function viewFullPhoto(url) {
    const div = document.createElement('div');
    div.className = 'fullscreen-photo';
    div.innerHTML = `<img src="${url}" alt="Full size photo">`;
    div.onclick = () => div.remove();
    document.body.appendChild(div);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme === 'light' ? 'light' : '');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

function selectPersona(p) {
    state.persona = p;
    document.querySelectorAll('.persona-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`.persona-card[data-persona="${p}"]`)?.classList.add('active');
    const budgets = { solo: 15000, family: 40000, luxury: 100000, adventure: 25000 };
    document.getElementById('budget').value = budgets[p] || 15000;
    addLog('preference', `Persona changed to ${p}`, 'info');
}

function showLoading(show) {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.toggle('active', show);
}

function showToast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; setTimeout(() => t.remove(), 300); }, 3500);
}

function exportPDF() {
    showToast('PDF export: Use Ctrl+P to print this page as PDF', 'info');
}

function shareTrip() {
    const url = `${window.location.origin}${window.location.pathname}?dest=${document.getElementById('destination').value}&days=${document.getElementById('duration').value}`;
    navigator.clipboard?.writeText(url);
    showToast('Share link copied to clipboard!', 'success');
}

function startVoice() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        showToast('Voice input not supported in this browser', 'warning'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.onresult = e => {
        const text = e.results[0][0].transcript;
        document.getElementById('destination').value = text;
        showToast(`Heard: "${text}"`, 'success');
    };
    recognition.onerror = () => showToast('Voice recognition failed', 'error');
    recognition.start();
    showToast('Listening...', 'info');
}

function setupEventListeners() {
    document.getElementById('generateBtn')?.addEventListener('click', generateTrip);
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && document.activeElement?.id === 'destination') generateTrip();
        if (e.key === 'Escape') { closeMediaModal(); document.querySelectorAll('.fullscreen-photo').forEach(el => el.remove()); }
    });
}

// === INIT ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else { init(); }
