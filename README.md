# ArcanaX - Cosmic Tarot Destiny

A fully client-side, privacy-first tarot reflection platform with a cinematic cosmic UI. No backend, no tracking, no accounts - just you and the cosmos.

## Features

- **Complete 78-Card Deck** - All 22 Major Arcana and 56 Minor Arcana (Cups, Pentacles, Swords, Wands) with rich upright and reversed interpretations
- **Multiple Spread Types** - Single Card, Three-Card (Past/Present/Future), Relationship (5 cards), and the full Celtic Cross (10 cards)
- **Daily Destiny Card** - A date-seeded daily card draw that remains consistent throughout your day
- **Rich Interpretations** - Contextual readings that consider card position, elemental energy, and cosmic themes
- **Privacy First** - Everything runs in your browser. Data stays in localStorage. No servers, no cookies, no tracking.
- **Cosmic UI** - Dark nebula backgrounds, orb animations, and mystical typography create an immersive experience
- **Bilingual Support** - English and Hindi/Hinglish prompts for an inclusive experience

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
├── index.html                 # Main application (bundled React SPA)
├── assets/
│   ├── tarot-deck.json        # Complete 78-card deck data with meanings
│   ├── tarot-engine.js        # Standalone tarot reading engine
│   ├── styles-USFaJe2v.css    # Application styles (Tailwind-based)
│   ├── nebula-bg-9WbBa6bI.jpg # Cosmic background image
│   └── orb-BUfHst6F.png      # Mystical orb graphic
├── local-preview-server.mjs   # Node.js static file server
├── START_ARCANAX_LOCAL.bat    # Windows launcher script
├── LICENSE                    # MIT License
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

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
- **Vite** build system (production output)
- **Vanilla JS** tarot engine (zero dependencies)
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
