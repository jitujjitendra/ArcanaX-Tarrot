/**
 * ArcanaX Navigation Component
 * Injects a cosmic-themed top navigation bar and footer into standalone pages.
 * Auto-detects current page and highlights active link.
 * Mobile-responsive with hamburger menu.
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcanaXNav = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  var NAV_ITEMS = [
    { label: 'Home', href: '/index.html', icon: '\u2302' },
    { label: 'Oracle', href: '/oracle.html', icon: '\u2728' },
    { label: 'Journal', href: '/journal.html', icon: '\uD83D\uDCD6' },
    { label: 'Learn', href: '/learn/', icon: '\uD83C\uDF93' },
    { label: 'Cards', href: '/tarot/', icon: '\uD83C\uDCCF' },
    { label: 'Premium', href: '/premium.html', icon: '\u2B50' },
    { label: 'Birth Chart', href: '/birthchart.html', icon: '\u2609' },
    { label: 'Expert', href: '/expert.html', icon: '\uD83D\uDD2E' }
  ];

  var FOOTER_LINKS = [
    { label: 'Share', href: '/share.html' },
    { label: 'About', href: '/index.html#about' },
    { label: 'Privacy', href: '/index.html#privacy' },
    { label: 'Terms', href: '/index.html#terms' }
  ];

  function getCurrentPath() {
    var path = window.location.pathname;
    // Normalize trailing slashes and index.html
    if (path.endsWith('/index.html')) {
      path = path.replace(/index\.html$/, '');
    }
    return path;
  }

  function isActive(href) {
    var current = getCurrentPath();
    if (href === '/index.html' && (current === '/' || current === '/index.html')) {
      return true;
    }
    if (href.endsWith('/')) {
      return current.startsWith(href);
    }
    return current === href;
  }

  function injectStyles() {
    if (document.getElementById('ax-nav-styles')) return;
    var style = document.createElement('style');
    style.id = 'ax-nav-styles';
    style.textContent = [
      '.ax-nav { position: sticky; top: 0; z-index: 9999; background: rgba(10,10,26,0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(176,132,255,0.2); padding: 0; }',
      '.ax-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1.25rem; }',
      '.ax-nav-brand { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.25rem; color: #e8e8ff; text-decoration: none; background: linear-gradient(135deg, #b084ff, #80e1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 600; }',
      '.ax-nav-links { display: flex; align-items: center; gap: 0.25rem; list-style: none; margin: 0; padding: 0; }',
      '.ax-nav-links a { display: flex; align-items: center; gap: 0.3rem; padding: 0.4rem 0.65rem; border-radius: 0.5rem; color: #a0a0c0; text-decoration: none; font-size: 0.8rem; transition: all 0.2s; white-space: nowrap; }',
      '.ax-nav-links a:hover { color: #e8e8ff; background: rgba(176,132,255,0.1); }',
      '.ax-nav-links a.active { color: #b084ff; background: rgba(176,132,255,0.15); border: 1px solid rgba(176,132,255,0.3); }',
      '.ax-nav-hamburger { display: none; background: none; border: none; color: #e8e8ff; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: background 0.2s; }',
      '.ax-nav-hamburger:hover { background: rgba(176,132,255,0.1); }',
      '.ax-nav-sound-btn { background: none; border: 1px solid rgba(176,132,255,0.3); color: #a0a0c0; border-radius: 0.5rem; padding: 0.35rem 0.5rem; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; margin-left: 0.5rem; }',
      '.ax-nav-sound-btn:hover, .ax-nav-sound-btn.active { color: #b084ff; border-color: #b084ff; background: rgba(176,132,255,0.1); }',
      '@media (max-width: 768px) {',
      '  .ax-nav-hamburger { display: block; }',
      '  .ax-nav-links { display: none; position: absolute; top: 100%; left: 0; right: 0; flex-direction: column; background: rgba(10,10,26,0.98); border-bottom: 1px solid rgba(176,132,255,0.2); padding: 0.5rem; gap: 0.25rem; }',
      '  .ax-nav-links.open { display: flex; }',
      '  .ax-nav-links a { padding: 0.6rem 1rem; font-size: 0.9rem; }',
      '}',
      '.ax-footer { background: rgba(10,10,26,0.95); border-top: 1px solid rgba(176,132,255,0.15); padding: 1.5rem 1.25rem; margin-top: 2rem; text-align: center; }',
      '.ax-footer-inner { max-width: 1200px; margin: 0 auto; }',
      '.ax-footer-links { display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem; list-style: none; padding: 0; }',
      '.ax-footer-links a { color: #a0a0c0; text-decoration: none; font-size: 0.8rem; transition: color 0.2s; }',
      '.ax-footer-links a:hover { color: #b084ff; }',
      '.ax-footer-copy { color: #606080; font-size: 0.7rem; margin: 0; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function createNav() {
    var nav = document.createElement('nav');
    nav.className = 'ax-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    var inner = document.createElement('div');
    inner.className = 'ax-nav-inner';

    // Brand
    var brand = document.createElement('a');
    brand.className = 'ax-nav-brand';
    brand.href = '/index.html';
    brand.textContent = 'ArcanaX';
    inner.appendChild(brand);

    // Nav links
    var ul = document.createElement('ul');
    ul.className = 'ax-nav-links';
    ul.id = 'ax-nav-links';

    for (var i = 0; i < NAV_ITEMS.length; i++) {
      var item = NAV_ITEMS[i];
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      if (isActive(item.href)) {
        a.className = 'active';
        a.setAttribute('aria-current', 'page');
      }
      li.appendChild(a);
      ul.appendChild(li);
    }

    inner.appendChild(ul);

    // Sound toggle button
    var soundBtn = document.createElement('button');
    soundBtn.className = 'ax-nav-sound-btn';
    soundBtn.id = 'ax-sound-toggle';
    soundBtn.title = 'Toggle ambient sound';
    soundBtn.setAttribute('aria-label', 'Toggle ambient sound');
    soundBtn.innerHTML = '&#x1F50A;';
    soundBtn.onclick = function() {
      if (typeof ArcanaXAmbient !== 'undefined') {
        ArcanaXAmbient.toggleAmbient();
        soundBtn.classList.toggle('active');
      }
    };
    inner.appendChild(soundBtn);

    // Hamburger
    var hamburger = document.createElement('button');
    hamburger.className = 'ax-nav-hamburger';
    hamburger.setAttribute('aria-label', 'Toggle menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '&#9776;';
    hamburger.onclick = function() {
      var links = document.getElementById('ax-nav-links');
      var isOpen = links.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburger.innerHTML = isOpen ? '&#10005;' : '&#9776;';
    };
    inner.appendChild(hamburger);

    nav.appendChild(inner);
    return nav;
  }

  function createFooter() {
    var footer = document.createElement('footer');
    footer.className = 'ax-footer';

    var inner = document.createElement('div');
    inner.className = 'ax-footer-inner';

    var ul = document.createElement('ul');
    ul.className = 'ax-footer-links';

    for (var i = 0; i < FOOTER_LINKS.length; i++) {
      var link = FOOTER_LINKS[i];
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.label;
      li.appendChild(a);
      ul.appendChild(li);
    }

    inner.appendChild(ul);

    var copy = document.createElement('p');
    copy.className = 'ax-footer-copy';
    copy.textContent = '\u00A9 ' + new Date().getFullYear() + ' ArcanaX Cosmic Destiny. All rights reserved.';
    inner.appendChild(copy);

    footer.appendChild(inner);
    return footer;
  }

  function init() {
    injectStyles();

    // Insert nav at the beginning of body
    var body = document.body;
    var nav = createNav();
    body.insertBefore(nav, body.firstChild);

    // Append footer at the end of body
    var footer = createFooter();
    body.appendChild(footer);
  }

  // Auto-initialize when DOM is ready (browser only)
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    init: init,
    NAV_ITEMS: NAV_ITEMS,
    FOOTER_LINKS: FOOTER_LINKS
  };
}));
