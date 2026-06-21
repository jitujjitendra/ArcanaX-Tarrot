#!/usr/bin/env node
/**
 * ArcanaX Card Page Generator
 * Generates 78 individual SEO-optimized HTML pages for each tarot card,
 * a tarot index page, sitemap.xml, and robots.txt.
 */
const fs = require('fs');
const path = require('path');

// Load deck data
const deckPath = path.join(__dirname, '..', 'assets', 'tarot-deck.json');
const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
const allCards = [...deck.majorArcana, ...deck.minorArcana];

// Load card art generator
const cardArtGen = require(path.join(__dirname, '..', 'js', 'card-art-generator.js'));

// Ensure output directories exist
const tarotDir = path.join(__dirname, '..', 'tarot');
if (!fs.existsSync(tarotDir)) fs.mkdirSync(tarotDir, { recursive: true });

const SITE_URL = 'https://arcanax.app';

// Helper: capitalize words
function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Helper: get related cards (same element, nearby numbers)
function getRelatedCards(card) {
  const related = [];
  allCards.forEach(c => {
    if (c.id === card.id) return;
    if (c.element === card.element && related.length < 4) {
      related.push(c);
    }
  });
  // Also add sequential numbers for major arcana
  if (card.number !== undefined) {
    const prev = allCards.find(c => c.number === card.number - 1 && !c.suit === !card.suit);
    const next = allCards.find(c => c.number === card.number + 1 && !c.suit === !card.suit);
    if (prev && !related.find(r => r.id === prev.id)) related.push(prev);
    if (next && !related.find(r => r.id === next.id)) related.push(next);
  }
  return related.slice(0, 6);
}

// Helper: get element display info
function getElementInfo(element) {
  const info = {
    fire: { symbol: '🔥', color: '#ff6b35', desc: 'Passion, energy, creativity, and transformation' },
    water: { symbol: '💧', color: '#4ecdc4', desc: 'Emotions, intuition, relationships, and flow' },
    earth: { symbol: '🌍', color: '#8fce00', desc: 'Material world, stability, health, and growth' },
    air: { symbol: '💨', color: '#b8d4e3', desc: 'Intellect, communication, truth, and clarity' }
  };
  return info[element] || info.air;
}

// Generate individual card page HTML
function generateCardPageHTML(card) {
  const svg = cardArtGen.generateCardSVG(card.id, 300, 450);
  const related = getRelatedCards(card);
  const elemInfo = getElementInfo(card.element);
  const isMajor = !card.suit;
  const arcanaType = isMajor ? 'Major Arcana' : `Minor Arcana - ${titleCase(card.suit)}`;
  const pageTitle = `${card.name} Tarot Card Meaning - Upright & Reversed | ArcanaX`;
  const metaDesc = card.essence;
  const canonicalUrl = `${SITE_URL}/tarot/${card.id}.html`;
  const zodiacDisplay = card.zodiac || '';

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${card.name} Tarot Card Meaning`,
    "description": card.essence,
    "author": { "@type": "Organization", "name": "ArcanaX" },
    "publisher": { "@type": "Organization", "name": "ArcanaX" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "keywords": card.keywords.join(', '),
    "articleSection": arcanaType
  }, null, 2);

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Tarot Cards", "item": `${SITE_URL}/tarot/` },
      { "@type": "ListItem", "position": 3, "name": card.name, "item": canonicalUrl }
    ]
  }, null, 2);

  const relatedCardsHTML = related.map(r => `
        <a href="${r.id}.html" class="ax-related-card ax-glass-sm">
          <span class="ax-related-card-name">${r.name}</span>
          <span class="ax-text-muted">${titleCase(r.element)}</span>
        </a>`).join('');

  const keywordsHTML = card.keywords.map(k => `<span class="ax-keyword-tag">${k}</span>`).join('\n            ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">
  <meta name="keywords" content="${card.keywords.join(', ')}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:title" content="${card.name} Tarot Card Meaning | ArcanaX">
  <meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ArcanaX">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${card.name} Tarot Card Meaning">
  <meta name="twitter:description" content="${metaDesc.replace(/"/g, '&quot;')}">

  <link rel="stylesheet" href="../css/arcanax-pages.css">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
${jsonLd}
  </script>
  <script type="application/ld+json">
${breadcrumbLd}
  </script>

  <style>
    .card-page-hero { display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem 0; }
    @media (min-width: 768px) { .card-page-hero { flex-direction: row; align-items: flex-start; } }
    .card-art-wrapper { flex-shrink: 0; max-width: 300px; width: 100%; }
    .card-art-wrapper svg { width: 100%; height: auto; border-radius: var(--ax-radius); box-shadow: var(--ax-shadow-glow); }
    .card-info-section { flex: 1; min-width: 0; }
    .meaning-block { padding: 1.5rem; margin-bottom: 1.5rem; }
    .meaning-block h3 { margin-bottom: 0.75rem; }
    .ax-keyword-tag { display: inline-block; padding: 0.35rem 0.85rem; margin: 0.25rem; border-radius: 2rem; background: var(--ax-accent-soft); color: var(--ax-accent); font-size: 0.85rem; border: 1px solid var(--ax-border-accent); }
    .element-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 2rem; background: var(--ax-gold-soft); border: 1px solid rgba(255, 215, 0, 0.3); color: var(--ax-gold); font-size: 0.9rem; }
    .ax-related-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .ax-related-card { display: flex; flex-direction: column; padding: 1rem; text-decoration: none; color: var(--ax-text); transition: transform 0.2s, box-shadow 0.2s; }
    .ax-related-card:hover { transform: translateY(-3px); box-shadow: var(--ax-shadow-glow); }
    .ax-related-card-name { font-weight: 500; margin-bottom: 0.25rem; }
    .breadcrumb { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 1rem 0; font-size: 0.85rem; }
    .breadcrumb a { color: var(--ax-accent); text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb span { color: var(--ax-text-muted); }
    .card-meta-row { display: flex; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; align-items: center; }
    .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--ax-accent); text-decoration: none; margin-top: 2rem; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
  </style>
</head>
<body class="ax-page">
  <div class="ax-container" style="padding-top: 1.5rem; padding-bottom: 3rem;">

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../index.html">Home</a> <span>/</span>
      <a href="index.html">Tarot Cards</a> <span>/</span>
      <span>${card.name}</span>
    </nav>

    <!-- Hero Section -->
    <article class="card-page-hero">
      <div class="card-art-wrapper ax-animate-rise">
        ${svg}
      </div>

      <div class="card-info-section">
        <p class="ax-eyebrow">${arcanaType}${card.number !== undefined ? ` &bull; Card ${card.number}` : ''}</p>
        <h1 class="ax-heading ax-heading-xl ax-text-gradient" style="margin: 0.5rem 0;">${card.name}</h1>

        <div class="card-meta-row">
          <span class="element-badge">${elemInfo.symbol} ${titleCase(card.element)}</span>
          ${zodiacDisplay ? `<span class="element-badge">&#9734; ${zodiacDisplay}</span>` : ''}
        </div>

        <p class="ax-text-muted" style="font-style: italic; font-size: 1.1rem; margin: 1rem 0;">${card.essence}</p>
      </div>
    </article>

    <!-- Upright Meaning -->
    <section class="meaning-block ax-glass" id="upright">
      <h3 class="ax-heading ax-heading-sm" style="color: var(--ax-gold);">&#9650; Upright Meaning</h3>
      <p style="line-height: 1.8;">${card.upright}</p>
    </section>

    <!-- Reversed Meaning -->
    <section class="meaning-block ax-glass" id="reversed">
      <h3 class="ax-heading ax-heading-sm" style="color: var(--ax-accent);">&#9660; Reversed Meaning</h3>
      <p style="line-height: 1.8;">${card.reversed}</p>
    </section>

    <!-- Keywords -->
    <section style="margin: 2rem 0;">
      <h2 class="ax-heading ax-heading-md">Keywords</h2>
      <div style="margin-top: 1rem;">
        ${keywordsHTML}
      </div>
    </section>

    <!-- Element Info -->
    <section class="ax-glass" style="padding: 1.5rem; margin: 2rem 0;">
      <h2 class="ax-heading ax-heading-sm">Element: ${titleCase(card.element)}</h2>
      <p class="ax-text-muted" style="margin-top: 0.5rem;">${elemInfo.desc}</p>
      ${zodiacDisplay ? `<p style="margin-top: 0.75rem;"><strong style="color: var(--ax-gold);">Zodiac/Planet:</strong> ${zodiacDisplay}</p>` : ''}
    </section>

    <!-- Related Cards -->
    ${related.length > 0 ? `
    <section style="margin: 2rem 0;">
      <h2 class="ax-heading ax-heading-md">Related Cards</h2>
      <div class="ax-related-cards-grid">
        ${relatedCardsHTML}
      </div>
    </section>` : ''}

    <!-- Navigation Links -->
    <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--ax-border);">
      <a href="index.html" class="back-link">&#8592; All Tarot Cards</a>
      <a href="../index.html" class="back-link" style="margin-left: 2rem;">&#8962; ArcanaX Home</a>
    </div>
  </div>
</body>
</html>`;
}

// Generate tarot index page
function generateIndexPageHTML() {
  const majorCards = deck.majorArcana;
  const suits = { cups: [], pentacles: [], swords: [], wands: [] };
  deck.minorArcana.forEach(c => { suits[c.suit].push(c); });

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Complete Tarot Card Meanings Guide - All 78 Cards",
    "description": "Explore the meanings of all 78 tarot cards including the 22 Major Arcana and 56 Minor Arcana cards with upright and reversed interpretations.",
    "url": `${SITE_URL}/tarot/`,
    "publisher": { "@type": "Organization", "name": "ArcanaX" },
    "numberOfItems": 78,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": 78,
      "itemListElement": allCards.map((c, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": c.name,
        "url": `${SITE_URL}/tarot/${c.id}.html`
      }))
    }
  }, null, 2);

  function cardGridItem(c) {
    return `
          <a href="${c.id}.html" class="ax-index-card ax-glass-sm">
            <span class="ax-index-card-number">${c.number !== undefined ? c.number : ''}</span>
            <span class="ax-index-card-name">${c.name}</span>
            <span class="ax-text-muted ax-index-card-element">${titleCase(c.element)}</span>
          </a>`;
  }

  function suitSection(suitName, cards) {
    return `
      <section class="ax-suit-section" data-suit="${suitName}">
        <h3 class="ax-heading ax-heading-sm" style="margin: 2rem 0 1rem; color: var(--ax-gold);">${titleCase(suitName)} (${cards.length} cards)</h3>
        <div class="ax-index-grid">
          ${cards.map(cardGridItem).join('')}
        </div>
      </section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tarot Card Meanings - All 78 Cards Guide | ArcanaX</title>
  <meta name="description" content="Explore the meanings of all 78 tarot cards including the 22 Major Arcana and 56 Minor Arcana cards with upright and reversed cosmic interpretations.">
  <meta name="keywords" content="tarot card meanings, major arcana, minor arcana, tarot guide, tarot interpretations">
  <link rel="canonical" href="${SITE_URL}/tarot/">

  <!-- Open Graph -->
  <meta property="og:title" content="Complete Tarot Card Meanings Guide | ArcanaX">
  <meta property="og:description" content="Explore all 78 tarot card meanings with cosmic interpretations.">
  <meta property="og:url" content="${SITE_URL}/tarot/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ArcanaX">

  <link rel="stylesheet" href="../css/arcanax-pages.css">

  <script type="application/ld+json">
${jsonLd}
  </script>

  <style>
    .ax-index-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
    @media (min-width: 768px) { .ax-index-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); } }
    .ax-index-card { display: flex; flex-direction: column; padding: 1rem; text-decoration: none; color: var(--ax-text); transition: transform 0.2s, box-shadow 0.2s; }
    .ax-index-card:hover { transform: translateY(-3px); box-shadow: var(--ax-shadow-glow); }
    .ax-index-card-number { font-size: 0.75rem; color: var(--ax-gold); font-weight: 600; }
    .ax-index-card-name { font-weight: 500; margin: 0.25rem 0; }
    .ax-index-card-element { font-size: 0.8rem; }
    .ax-search-box { width: 100%; padding: 0.85rem 1.25rem; border-radius: 2rem; border: 1px solid var(--ax-border-accent); background: var(--ax-bg-surface); color: var(--ax-text); font-size: 1rem; outline: none; transition: border-color 0.2s; }
    .ax-search-box:focus { border-color: var(--ax-accent); }
    .ax-search-box::placeholder { color: var(--ax-text-muted); }
    .ax-filter-btns { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
    .ax-filter-btn { padding: 0.45rem 1rem; border-radius: 2rem; border: 1px solid var(--ax-border); background: transparent; color: var(--ax-text-muted); cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .ax-filter-btn:hover, .ax-filter-btn.active { background: var(--ax-accent-soft); color: var(--ax-accent); border-color: var(--ax-border-accent); }
    .ax-index-header { text-align: center; padding: 3rem 0 2rem; }
    .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--ax-accent); text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
  </style>
</head>
<body class="ax-page">
  <div class="ax-container" style="padding-bottom: 3rem;">

    <nav style="padding: 1rem 0;">
      <a href="../index.html" class="back-link">&#8962; ArcanaX Home</a>
    </nav>

    <header class="ax-index-header">
      <h1 class="ax-heading ax-heading-xl ax-text-gradient">Tarot Card Meanings</h1>
      <p class="ax-text-muted" style="margin-top: 1rem; font-size: 1.1rem;">Explore all 78 cards of the cosmic tarot with upright and reversed interpretations</p>
    </header>

    <!-- Search and Filter -->
    <div style="max-width: 500px; margin: 0 auto 2rem;">
      <input type="text" id="cardSearch" class="ax-search-box" placeholder="Search cards by name, keyword, or element..." aria-label="Search tarot cards">
    </div>

    <div class="ax-filter-btns" id="filterBtns">
      <button class="ax-filter-btn active" data-filter="all">All (78)</button>
      <button class="ax-filter-btn" data-filter="major">Major Arcana (22)</button>
      <button class="ax-filter-btn" data-filter="cups">Cups (14)</button>
      <button class="ax-filter-btn" data-filter="pentacles">Pentacles (14)</button>
      <button class="ax-filter-btn" data-filter="swords">Swords (14)</button>
      <button class="ax-filter-btn" data-filter="wands">Wands (14)</button>
    </div>

    <!-- Major Arcana -->
    <section class="ax-suit-section" data-suit="major">
      <h2 class="ax-heading ax-heading-md" style="margin: 2rem 0 1rem;">Major Arcana (22 cards)</h2>
      <div class="ax-index-grid">
        ${majorCards.map(cardGridItem).join('')}
      </div>
    </section>

    <!-- Minor Arcana by Suit -->
    <h2 class="ax-heading ax-heading-md" style="margin: 3rem 0 0;">Minor Arcana (56 cards)</h2>
    ${suitSection('cups', suits.cups)}
    ${suitSection('pentacles', suits.pentacles)}
    ${suitSection('swords', suits.swords)}
    ${suitSection('wands', suits.wands)}

    <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--ax-border); text-align: center;">
      <a href="../index.html" class="back-link">&#8962; ArcanaX Home</a>
    </div>
  </div>

  <!-- Search/Filter Script -->
  <script>
  (function() {
    var searchInput = document.getElementById('cardSearch');
    var filterBtns = document.querySelectorAll('.ax-filter-btn');
    var allCardEls = document.querySelectorAll('.ax-index-card');
    var sections = document.querySelectorAll('.ax-suit-section');
    var currentFilter = 'all';

    function applyFilters() {
      var query = searchInput.value.toLowerCase().trim();
      allCardEls.forEach(function(el) {
        var name = (el.querySelector('.ax-index-card-name') || {}).textContent || '';
        var element = (el.querySelector('.ax-index-card-element') || {}).textContent || '';
        var matchesSearch = !query || name.toLowerCase().includes(query) || element.toLowerCase().includes(query);
        var section = el.closest('.ax-suit-section');
        var suit = section ? section.getAttribute('data-suit') : '';
        var matchesFilter = currentFilter === 'all' || suit === currentFilter;
        el.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
      });
      // Show/hide sections
      sections.forEach(function(sec) {
        var suit = sec.getAttribute('data-suit');
        var visible = currentFilter === 'all' || suit === currentFilter;
        sec.style.display = visible ? '' : 'none';
      });
    }

    searchInput.addEventListener('input', applyFilters);

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        applyFilters();
      });
    });
  })();
  </script>
</body>
</html>`;
}

// Generate sitemap.xml
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  let urls = '';
  urls += `  <url><loc>${SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority><lastmod>${today}</lastmod></url>\n`;
  urls += `  <url><loc>${SITE_URL}/tarot/</loc><changefreq>weekly</changefreq><priority>0.9</priority><lastmod>${today}</lastmod></url>\n`;
  allCards.forEach(c => {
    urls += `  <url><loc>${SITE_URL}/tarot/${c.id}.html</loc><changefreq>monthly</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>\n`;
  });
  urls += `  <url><loc>${SITE_URL}/learn/</loc><changefreq>weekly</changefreq><priority>0.7</priority><lastmod>${today}</lastmod></url>\n`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;
}

// Generate robots.txt
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// Main generation
function main() {
  console.log('ArcanaX Card Page Generator');
  console.log('==========================');

  // Generate individual card pages
  let count = 0;
  allCards.forEach(card => {
    const html = generateCardPageHTML(card);
    const filePath = path.join(tarotDir, `${card.id}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
  });
  console.log(`Generated ${count} individual card pages in tarot/`);

  // Generate index page
  const indexHTML = generateIndexPageHTML();
  fs.writeFileSync(path.join(tarotDir, 'index.html'), indexHTML, 'utf8');
  console.log('Generated tarot/index.html');

  // Generate sitemap.xml
  const sitemap = generateSitemap();
  fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), sitemap, 'utf8');
  console.log('Generated sitemap.xml');

  // Generate robots.txt
  const robots = generateRobotsTxt();
  fs.writeFileSync(path.join(__dirname, '..', 'robots.txt'), robots, 'utf8');
  console.log('Generated robots.txt');

  console.log('\nDone! All files generated successfully.');
}

main();
