/* Mimipec Enterprise — interactions */
(function () {
  // Sticky header shadow on scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Contact form -> open WhatsApp with a prefilled order/enquiry message
  var form = document.getElementById('enquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = function (n) {
        var el = form.elements[n];
        return el ? el.value.trim() : '';
      };
      var msg =
        'Hello Mimipec Enterprise! 👋%0A%0A' +
        '*Name:* ' + (f('name') || '-') + '%0A' +
        '*Phone:* ' + (f('phone') || '-') + '%0A' +
        '*Interested in:* ' + (f('interest') || '-') + '%0A%0A' +
        '*Message:*%0A' + (f('message') || '-');
      var url = 'https://wa.me/2348064446474?text=' + msg;
      window.open(url, '_blank');
    });
  }

  // Year in footer
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Respect reduced-motion preference
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal — fade/slide elements in as they enter the viewport
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });

      // Safety net: never leave anything stuck hidden. Anything at or above
      // the fold (e.g. after an in-page anchor jump) is shown right away.
      var safety = function () {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        revealEls.forEach(function (el) {
          if (el.classList.contains('in')) return;
          if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add('in');
        });
      };
      window.addEventListener('load', safety);
      setTimeout(safety, 1200);
    }
  }

  // Floating contact button — expands to reveal social/contact icons
  var fab = document.querySelector('.fab');
  if (fab) {
    var fabToggle = fab.querySelector('.fab__toggle');
    var fabMenu = fab.querySelector('.fab__menu');
    var setFab = function (open) {
      fab.classList.toggle('open', open);
      fabToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (fabMenu) fabMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    };
    fabToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setFab(!fab.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (fab.classList.contains('open') && !fab.contains(e.target)) setFab(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setFab(false);
    });
  }

  // Page-hero slideshow — auto-playing, crossfade + Ken Burns
  document.querySelectorAll('.page-hero--slider').forEach(function (hero) {
    var slides = [].slice.call(hero.querySelectorAll('.phs__slide'));
    var dots = [].slice.call(hero.querySelectorAll('.phs__dot'));
    var cap = hero.querySelector('.phs__cap');
    if (slides.length < 2) return;
    var i = 0, timer = null, DUR = 5000;
    var reduceM = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(n) {
      slides[i].classList.remove('is-active');
      if (dots[i]) dots[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      if (dots[i]) dots[i].classList.add('is-active');
      if (cap) {
        var c = slides[i].getAttribute('data-cap');
        if (c) cap.textContent = c;
      }
      // play the active slide's video, pause the rest
      slides.forEach(function (s, si) {
        var v = s.querySelector('video');
        if (!v) return;
        if (si === i) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else { v.pause(); }
      });
    }
    function start() { if (reduceM) return; stop(); timer = setInterval(function () { show(i + 1); }, DUR); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { show(idx); start(); });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    show(0);
    start();
  });

  // Gentle tilt on the hero visual (pointer-driven, desktop only).
  var heroVisual = document.querySelector('.hero__visual');
  if (heroVisual && heroVisual.querySelector('.hero-photo') &&
      !reduce && window.matchMedia('(pointer:fine)').matches) {
    heroVisual.style.transition = 'transform .25s ease-out';
    heroVisual.style.transformStyle = 'preserve-3d';
    var hvFrame = null;
    heroVisual.addEventListener('mousemove', function (e) {
      if (hvFrame) return;
      hvFrame = requestAnimationFrame(function () {
        var r = heroVisual.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        var dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        heroVisual.style.transform =
          'perspective(1000px) rotateY(' + (dx * 2.4).toFixed(2) + 'deg) rotateX(' +
          (-dy * 2.4).toFixed(2) + 'deg)';
        hvFrame = null;
      });
    });
    heroVisual.addEventListener('mouseleave', function () {
      heroVisual.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
    });
  }

  // Values panel — auto-cycling spotlight across the cards, hover to focus
  document.querySelectorAll('.values').forEach(function (group) {
    var cards = [].slice.call(group.querySelectorAll('.value'));
    if (cards.length < 2) return;
    var idx = 0, timer = null, DUR = 2600;
    var reduceV = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function setActive(n) {
      cards.forEach(function (c) { c.classList.remove('is-active'); });
      idx = (n + cards.length) % cards.length;
      cards[idx].classList.add('is-active');
    }
    function start() { if (reduceV) return; stop(); timer = setInterval(function () { setActive(idx + 1); }, DUR); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    cards.forEach(function (c, i) {
      c.addEventListener('mouseenter', function () { stop(); setActive(i); });
      c.addEventListener('mouseleave', function () { start(); });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { if (!reduceV) { setActive(idx); start(); } }
          else { stop(); }
        });
      }, { threshold: 0.25 });
      io.observe(group);
    } else if (!reduceV) { setActive(0); start(); }
  });
})();
