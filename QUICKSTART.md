# 🚀 SmartRoute Quick Start Guide

Get up and running with SmartRoute in 5 minutes!

## ⚡ Fast Setup

### 1. Get Gemini API Key (FREE)
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```bash
echo "GEMINI_API_KEY=paste_your_key_here" > .env
```

### 3. Start Server
```bash
python smartroute_server.py
```

Expected output:
```
============================================================
🚀 SmartRoute Backend Starting...
============================================================
Gemini API: ✓ Configured
Server: http://localhost:8000
WebSocket: ws://localhost:8000/ws
============================================================
```

### 4. Open Frontend
Open `index.html` in your browser or:
```bash
python -m http.server 8080
```
Then visit: http://localhost:8080

## 🎮 First Steps

### Try Demo Mode
1. Click **"Start Demo Mode"** button (top right)
2. Watch the 60-second automated demonstration
3. See all 7 agents collaborate in real-time

### Create Your First Trip
1. **Select Persona**: Choose from dropdown (e.g., "Solo Backpacker")
2. **Enter Details**:
   - Destination: "Rajasthan, India"
   - Duration: 3 days
   - Budget: ₹15,000
   - Start Date: Tomorrow
3. **Choose Preferences**: Click tags (Cultural, Adventure, etc.)
4. **Generate**: Click "Generate Intelligent Itinerary"

### Explore Features

#### Agent Collaboration
1. Click bottom panel → "Agent Communication" tab
2. Click "Simulate Collaboration" button
3. Watch animated agent message passing

#### MDP Visualization
1. Click bottom panel → "MDP Visualization" tab
2. Click "Settings" to customize display
3. Adjust node size, animation speed, etc.

#### Emergency Replanning
Click any emergency button:
- 🌧️ **Trigger Rainstorm**
- 💰 **Budget Exceeded**
- 👥 **Crowd Surge**
- ❌ **Venue Closed**

Watch the system adapt in real-time!

## 🎨 UI Tips

### Minimize Bottom Panel
- Click the circular button above the panel (⌄ icon)
- Gives more screen space for the map and itinerary

### Switch Themes
- Click moon/sun icon (top right)
- Seamless dark/light mode transition

### Voice Commands
- Click microphone button (left sidebar)
- Speak your travel requirements

## 🔧 Common Issues

### "WebSocket connection failed"
**Solution**: Make sure backend is running on port 8000

### "Gemini API error"
**Solution**: 
1. Check `.env` file has correct API key
2. Verify API key is active on Google AI Studio
3. System will use mock data if API unavailable

### Port 8000 already in use
**Solution**: Change port in `backend/smartroute_server.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Change 8000 to 8001
```

Also update `js/config.js`:
```javascript
API_BASE_URL: 'http://localhost:8001',
WS_URL: 'ws://localhost:8001/ws',
```

## 📱 Browser Compatibility

✅ **Recommended**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Not Supported**:
- Internet Explorer
- Very old mobile browsers

## 🎯 What to Try Next

1. **Rate Activities**: Click stars on itinerary items, watch preference bars update
2. **Export Itinerary**: Click "Export PDF" button
3. **Share Trip**: Click "Share" button for shareable link
4. **Monitor System**: Check "Monitoring Dashboard" tab
5. **View Logs**: See real-time agent communication in "Real-Time Logs" tab

## 💡 Pro Tips

- **Multiple Personas**: Switch personas to see different itinerary styles
- **Preference Learning**: Rate more activities to improve recommendations
- **Budget Optimization**: Set tight budget to see optimizer in action
- **Weather Adaptation**: Try different seasons/destinations
- **Collaboration Graph**: Watch it during "Generate Itinerary" for live updates

## 📊 Understanding the UI

### Color Coding
- 🔵 **Blue**: Planner Agent
- 🟦 **Light Blue**: Weather Agent
- 🟣 **Purple**: Crowd Analyzer
- 🟢 **Green**: Budget Optimizer
- 💗 **Pink**: Preference Agent
- 🟠 **Orange**: Booking Assistant
- 🔷 **Indigo**: Explainability Agent

### Agent Status
- ⚪ **Idle**: Waiting
- 🔵 **Thinking**: Processing
- 🟣 **Working**: Executing
- 🟢 **Complete**: Done

### Log Messages
Each log entry shows:
- ⏰ **Time**: When message occurred
- 🤖 **Agent**: Which agent sent it
- 💬 **Message**: What happened

## 🚀 Advanced Features

### Custom Destinations
Edit `js/config.js` to add your destinations:
```javascript
DESTINATIONS: {
    'Your City': {
        center: [longitude, latitude],
        cities: [
            { name: 'Place 1', coords: [long, lat] },
            { name: 'Place 2', coords: [long, lat] }
        ]
    }
}
```

### Adjust RL Parameters
Edit reward function in `js/config.js`:
```javascript
REWARD_PARAMS: {
    alpha: 0.5,  // Increase user rating importance
    beta: 0.2,   // Decrease budget importance
    gamma: 0.2,  // Weather importance
    delta: 0.1   // Crowd penalty
}
```

## 📞 Need Help?

1. **Check README.md**: Full documentation
2. **Browser Console**: Press F12 for error messages
3. **Backend Logs**: Check terminal output
4. **API Status**: Visit http://localhost:8000/ to verify backend

## 🎓 Learning Resources

The system demonstrates:
- **Multi-Agent Systems**: See agents collaborate
- **Reinforcement Learning**: Watch reward chart update
- **Bayesian Inference**: Observe preference learning
- **Real-time Systems**: WebSocket communication
- **Modern UI/UX**: Glassmorphism design

---

**Happy Planning! ✈️**

*SmartRoute makes travel intelligent and adaptive.*
