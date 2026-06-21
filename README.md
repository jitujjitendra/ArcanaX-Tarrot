# ArcanaX - Cosmic Tarot Destiny

A fully client-side, privacy-first tarot reflection platform with a cinematic cosmic UI. No backend, no tracking, no accounts - just you and the cosmos.

## Features

### Core Reading Engine
- **Complete 78-Card Deck** - All 22 Major Arcana and 56 Minor Arcana (Cups, Pentacles, Swords, Wands) with rich upright and reversed interpretations
- **Multiple Spread Types** - Single Card, Three-Card (Past/Present/Future), Relationship (5 cards), and the full Celtic Cross (10 cards)
- **Daily Destiny Card** - A date-seeded daily card draw that remains consistent throughout your day
- **Rich Interpretations** - Contextual readings that consider card position, elemental energy, and cosmic themes

### Smart Oracle (AI-style Chat)
- Natural language question interface for tarot guidance
- Moon phase-aware responses that adapt to lunar cycles
- Card draws integrated into conversational answers
- Follow-up suggestion prompts for deeper exploration
- Chat history stored locally

### Reading Journal
- Save and annotate all your tarot readings
- Tag system for organization and filtering
- Personal reflection notes on each spread
- Export and review past readings over time

### Weekly Forecast
- Seven-day tarot energy forecast
- Daily card assignments with elemental themes
- Actionable guidance for each day of the week

### Birth Chart Integration
- Calculate sun, moon, and rising signs
- Map zodiac signs to corresponding Major Arcana cards
- Personal tarot card identification based on birth data
- Astrological element correlation analysis

### Premium Readings
- Enhanced spread interpretations with deeper analysis
- Elemental balance assessment across drawn cards
- Card combination meanings and interaction insights
- Personalized action plans based on reading context

### Expert Tarot Readers Directory
- Browse verified tarot practitioners
- Specialization filtering (love, career, spiritual growth)
- Session booking interface

### Learning Center
- **Tarot Basics** - Complete beginner's guide covering history, shuffling, and reading techniques
- **Major Arcana Guide** - The Fool's Journey through all 22 archetypal cards
- **Minor Arcana Suits** - Deep dive into Cups, Pentacles, Swords, and Wands
- **Spreads Guide** - Step-by-step instructions for Single Card, Three-Card, Celtic Cross, and Relationship spreads
- **Moon and Tarot** - Lunar cycle influence on tarot readings with ritual suggestions

### Card Encyclopedia (SEO Pages)
- Individual pages for all 78 tarot cards
- Card-specific SVG art generated procedurally
- Detailed upright and reversed meanings
- Keywords, elements, and zodiac correlations
- Internal linking between related cards

### Share Readings
- Create beautiful cosmic images of tarot readings
- Social media-ready visual format
- Canvas-based image generation (no external services)

### Ambient Sound System
- Programmatic cosmic drone via Web Audio API
- Layered detuned oscillators with LFO modulation
- Subtle, meditative background ambience
- Toggle control in navigation bar
- No external audio files required

### Progressive Web App (PWA)
- Offline support with Service Worker caching
- Installable on mobile and desktop
- App manifest with custom icons
- Responsive design across all screen sizes

### Navigation System
- Unified navigation bar across all standalone pages
- Mobile-responsive hamburger menu
- Active page highlighting
- Cosmic-themed footer with site-wide links
- Ambient sound toggle integrated in nav

### Additional Features
- **Moon Phase Engine** - Real-time lunar cycle calculations
- **Deck Themes** - Customizable deck visual styles
- **Card Art Generator** - Procedural SVG card illustrations
- **Privacy First** - Everything runs in your browser. Data stays in localStorage. No servers, no cookies, no tracking.
- **Cosmic UI** - Dark nebula backgrounds, orb animations, and mystical typography
- **Bilingual Support** - English and Hindi/Hinglish prompts

## Quick Start

### Option 1: Local Preview Server (Recommended)

Requires Node.js (v16+):

```bash
node local-preview-server.mjs
```

This starts a local server at `http://127.0.0.1:4173` and opens your browser automatically.

### Option 2: Windows Launcher

Double-click `START_ARCANAX_LOCAL.bat` to launch the local preview server.

### Option 3: Direct File Access

Open `index.html` directly in a modern browser. Note: Some features may be limited without a proper HTTP server due to browser security policies.

## Project Structure

```
ArcanaX-Tarrot/
├── index.html                      # Main application (bundled React SPA)
├── oracle.html                     # Smart Oracle chat interface
├── journal.html                    # Reading Journal page
├── share.html                      # Share Reading as Image
├── expert.html                     # Expert Tarot Readers directory
├── birthchart.html                 # Birth Chart + Tarot integration
├── premium.html                    # Premium Readings page
├── manifest.json                   # PWA manifest
├── sw.js                           # Service Worker for offline support
├── sitemap.xml                     # Complete XML sitemap
├── robots.txt                      # Search engine directives
├── local-preview-server.mjs        # Node.js static file server
├── START_ARCANAX_LOCAL.bat         # Windows launcher script
│
├── assets/
│   ├── tarot-deck.json             # Complete 78-card deck data
│   ├── tarot-engine.js             # Standalone tarot reading engine (UMD)
│   ├── styles-USFaJe2v.css         # Application styles (Tailwind-based)
│   ├── nebula-bg-9WbBa6bI.jpg     # Cosmic background image
│   └── orb-BUfHst6F.png           # Mystical orb graphic
│
├── js/
│   ├── navigation.js               # Unified navigation bar component
│   ├── ambient-sound.js            # Web Audio API cosmic ambient sound
│   ├── smart-oracle.js             # Smart Oracle response engine
│   ├── moon-phase.js               # Moon phase calculation engine
│   ├── reading-journal.js          # Reading journal logic
│   ├── weekly-forecast.js          # Weekly forecast generator
│   ├── share-reading.js            # Share reading as image (Canvas)
│   ├── card-art-generator.js       # Procedural SVG card art
│   ├── premium-engine.js           # Premium reading enhancements
│   ├── birth-chart.js              # Birth chart calculations
│   └── deck-themes.js              # Deck theme customization
│
├── css/
│   └── arcanax-pages.css           # Shared cosmic dark theme for pages
│
├── learn/
│   ├── index.html                  # Learning center hub
│   ├── tarot-basics.html           # Beginner's guide
│   ├── major-arcana-guide.html     # Major Arcana deep dive
│   ├── suits-guide.html            # Minor Arcana suits guide
│   ├── spreads-guide.html          # Spread instructions
│   └── moon-tarot-guide.html       # Moon phases and tarot
│
├── tarot/
│   ├── index.html                  # Card encyclopedia index
│   ├── the-fool.html               # Individual card pages (78 total)
│   ├── the-magician.html
│   ├── ace-of-cups.html
│   └── ... (78 cards total)
│
├── icons/
│   ├── icon-192.svg                # PWA icon (192x192)
│   └── icon-512.svg                # PWA icon (512x512)
│
└── scripts/
    └── generate-card-pages.js      # Build script for card SEO pages
```

## Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| Home | `/index.html` | Main SPA with card draws and readings |
| Oracle | `/oracle.html` | AI-style chat interface for tarot guidance |
| Journal | `/journal.html` | Personal reading journal |
| Share | `/share.html` | Create shareable reading images |
| Expert | `/expert.html` | Expert readers directory |
| Birth Chart | `/birthchart.html` | Zodiac and tarot correlation |
| Premium | `/premium.html` | Enhanced reading features |
| Learn Hub | `/learn/` | Learning center index |
| Tarot Basics | `/learn/tarot-basics.html` | Beginner's guide |
| Major Arcana | `/learn/major-arcana-guide.html` | 22 Major Arcana cards |
| Suits Guide | `/learn/suits-guide.html` | Minor Arcana suits |
| Spreads | `/learn/spreads-guide.html` | How to use spreads |
| Moon Guide | `/learn/moon-tarot-guide.html` | Lunar tarot practice |
| Card Index | `/tarot/` | All 78 card pages |

## Tarot Engine API

The standalone `assets/tarot-engine.js` can be used independently in any project:

```html
<script src="assets/tarot-engine.js"></script>
<script>
  // Load the deck
  ArcanaXEngine.loadDeck('assets/tarot-deck.json').then(function() {
    
    // Perform a Celtic Cross reading
    var reading = ArcanaXEngine.performReading('celtic-cross');
    console.log(reading.summary);
    
    // Get today's destiny card
    var daily = ArcanaXEngine.dailyDestiny();
    console.log(daily.message);
    
    // Draw 3 random cards
    var cards = ArcanaXEngine.drawCards(3);
    cards.forEach(function(card) {
      console.log(card.name, card.reversed ? '(Reversed)' : '(Upright)');
    });
  });
</script>
```

### Available Spreads

| Spread | Cards | Description |
|--------|-------|-------------|
| `single` | 1 | Quick guidance on present energy |
| `three-card` | 3 | Past, Present, Future timeline |
| `relationship` | 5 | Dynamics between two people |
| `celtic-cross` | 10 | Full life-situation analysis |

### Engine Methods

| Method | Description |
|--------|-------------|
| `loadDeck(source)` | Load deck from JSON object or URL (returns Promise) |
| `getDeck()` | Get all 78 cards as an array |
| `getCardById(id)` | Find a specific card by its ID |
| `drawCards(count, options)` | Draw random cards with reversed probability |
| `drawDailyCard(date)` | Get a deterministic daily card |
| `performReading(spreadType)` | Perform a complete spread reading |
| `dailyDestiny(date)` | Generate a full daily destiny reading |

## Ambient Sound API

The `js/ambient-sound.js` module provides programmatic cosmic ambience:

```html
<script src="js/ambient-sound.js"></script>
<script>
  // Toggle ambient sound on/off
  ArcanaXAmbient.toggleAmbient();
  
  // Set volume (0.0 to 1.0, recommended 0.02-0.15)
  ArcanaXAmbient.setVolume(0.1);
  
  // Get current state
  var state = ArcanaXAmbient.getState();
  console.log(state.isPlaying, state.volume);
</script>
```

## Navigation Component

The `js/navigation.js` auto-injects a navigation bar and footer:

```html
<!-- For root-level pages -->
<script src="js/navigation.js"></script>

<!-- For subdirectory pages (learn/, tarot/) -->
<script src="../js/navigation.js"></script>
```

The navigation component:
- Automatically detects and highlights the current page
- Provides a mobile hamburger menu for small screens
- Includes an ambient sound toggle button
- Adds a footer with site links and copyright

## Deck Data Format

Each card in `assets/tarot-deck.json` includes:

```json
{
  "id": "the-fool",
  "name": "The Fool",
  "number": 0,
  "element": "air",
  "zodiac": "Uranus",
  "keywords": ["beginnings", "innocence", "leap of faith", "spontaneity", "freedom"],
  "upright": "A new chapter unfolds before you...",
  "reversed": "Recklessness clouds your judgment...",
  "essence": "The eternal wanderer at the cliff of infinite possibility..."
}
```

Minor Arcana cards additionally include a `suit` field (`cups`, `pentacles`, `swords`, or `wands`).

## Tech Stack

- **React 19** with TanStack Router (bundled in index.html)
- **Tailwind CSS** for styling
- **Vanilla JS** modules for all standalone features (zero dependencies)
- **Web Audio API** for ambient sound generation
- **Canvas API** for share image generation
- **Service Worker** for offline PWA support
- **Node.js** local preview server (zero dependencies)

## Browser Support

Modern browsers with ES6+ support:
- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

## Contributing

Contributions are welcome! This project uses a production-build-first approach. The tarot deck data and engine are standalone files that can be modified independently of the bundled application.

To add or modify card interpretations, edit `assets/tarot-deck.json` directly.

## License

MIT License - see [LICENSE](LICENSE) for details.
