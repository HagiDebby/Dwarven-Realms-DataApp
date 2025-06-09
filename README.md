# Game Leaderboard Dashboard

A real-time web dashboard for viewing and analyzing game player statistics, built with vanilla HTML, CSS, and JavaScript.

## 🎮 Features

### Players Tab
- **Real-time player data** from live game API
- **Advanced filtering** by username, hardcore mode, fellowship status, and stance
- **Detailed player profiles** with expandable information including:
  - Primary/Secondary attacks with formatted names
  - Complete equipment modifications
  - Dungeon completion statistics
  - Player stats (deaths, hardcore status, fellowship, current zone, online status)
- **Search functionality** for quick player lookup
- **Reset filters** button to clear all filters instantly

### Data Tab
- **Comprehensive statistics** presented in clean card layouts:
  - Player distribution (hardcore vs non-hardcore, fellowship members)
  - Death statistics and averages
  - Highest rupture levels by player category
  - Stance usage analytics with percentages
  - Dungeon completion leaderboards
  - Fellowship information and member counts

### UI/UX Features
- **Dark theme** with light blue accents
- **Responsive design** that works on desktop, tablet, and mobile
- **Back to top button** that appears when scrolling
- **Smooth animations** and hover effects
- **Real-time data refresh** functionality

## 🚀 Live Demo

[View Live Dashboard](https://yourusername.github.io/game-leaderboard)

## 📁 Project Structure

```
game-leaderboard/
├── index.html
├── styles.css
├── package.json
├── netlify/
│   └── functions/
│       └── api-proxy.js
├── js/                     # ← New modular structure
│   ├── main.js
│   ├── config.js
│   ├── api.js
│   ├── utils.js
│   ├── filters.js
│   ├── players.js
│   ├── statistics.js
│   └── ui.js
└── README.md
```

## 🔧 Configuration

### API Configuration
The dashboard fetches data from:
```javascript
const API_URL = 'http://loadbalancer-prod-1ac6c83-453346156.us-east-1.elb.amazonaws.com/leaderboards/scores/';
```


### CORS Considerations
If you encounter CORS issues when hosting:
- Add CORS headers to your API server
- Use a CORS proxy service (temporary solution)
- Consider creating a backend proxy

## 📊 Data Format

The dashboard expects JSON data in this format:
```json
{
  "seasonId": "string",
  "leaderboards": [
    {
      "id": "string",
      "name": "Username (InGameName)",
      "level": "number",
      "deaths": "number",
      "raptureLevel": "number",
      "isHardcore": boolean,
      "isOnline": boolean,
      "zone": "string",
      "tag": "fellowship_name",
      "build": {
        "stance": "string",
        "attacks": {
          "primary": "Stance_AttackName",
          "secondary": "Stance_AttackName"
        },
        "equipmentMods": {
          "slot_name": "description"
        }
      },
      "dungeons": {
        "dungeon_name": count
      }
    }
  ]
}
```

## 🎨 Customization

### Theme Colors
Main colors defined in `styles.css`:
- Background: `#1a1a1a` (dark)
- Secondary: `#2a2a2a` (medium dark)
- Accent: `#87ceeb` (light blue)
- Text: `white`

### Adding New Filters
To add new filter options:
1. Add HTML select element in `index.html`
2. Add event listener in `setupEventListeners()`
3. Update `filterPlayers()` function logic

### Modifying Statistics
Statistics are generated in `generateDataStatistics()` function. Add new calculations and update the HTML rendering section.

## 🐛 Troubleshooting

### Common Issues

**API not loading:**
- Check browser console for CORS errors
- Verify API URL is accessible
- Ensure API returns valid JSON

**Filters not working:**
- Check if data structure matches expected format
- Verify filter field names in JavaScript

**Mobile display issues:**
- CSS media queries handle responsive design
- Test on different screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add some feature'`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔮 Future Enhancements

- [ ] Implement player comparison features
- [ ] Add more visualization charts
- [ ] Add player profile pages
- [ ] Create mobile app version

## 🙏 Acknowledgments

- Game API provided by the game development team
- Built with vanilla web technologies for maximum compatibility
- Responsive design inspired by modern dashboard interfaces

---

**Made with ❤️ for the gaming community**