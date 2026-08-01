document.addEventListener('DOMContentLoaded', function () {

  // ---------- Mobile navigation toggle ----------
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close the menu after tapping a link, and on Escape. Without this the
    // open menu stayed over the page after navigating within the same tab.
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ---------- Nav elevation on scroll ----------
  // The sticky bar gets a hairline shadow once the page moves, so it separates
  // from the content instead of floating ambiguously over it.
  var nav = document.querySelector('.nav');

  if (nav) {
    var setNavState = function () {
      if (window.scrollY > 8) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    setNavState();
    window.addEventListener('scroll', setNavState, { passive: true });
  }

  // Skip all motion effects if the user has animations turned off in their OS
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // ---------- Scroll reveal ----------
  // Cards, steps, and timeline entries fade up the first time they scroll
  // into view. Deliberately understated: a short travel and a quick stagger.
  var revealEls = document.querySelectorAll('.card, .team-card, .step, .timeline-item');

  revealEls.forEach(function (el, i) {
    el.classList.add('reveal');
    // stagger neighbours slightly so rows cascade instead of popping at once
    el.style.transitionDelay = (i % 3) * 60 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        observer.unobserve(el);
        // Clear the entry delay once revealed so hover states respond
        // immediately rather than inheriting the stagger.
        el.addEventListener('transitionend', function handler() {
          el.classList.add('settled');
          el.style.transitionDelay = '0ms';
          el.removeEventListener('transitionend', handler);
        });
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // very old browser: just show everything
    revealEls.forEach(function (el) {
      el.classList.add('in', 'settled');
    });
  }

  // ---------- Cinematic hero: scroll-driven contract ----------
  // Sets --p (0 at top, 1 when the runway is scrolled through) on .cinema.
  // CSS reads --p to scale the stage down into a framed panel, drift the
  // photo, and fade the type — the AUREN effect from the reference clip.
  var cinema = document.getElementById('cinema');

  if (cinema) {
    var ticking = false;

    var updateCinema = function () {
      var rect = cinema.getBoundingClientRect();
      var runway = cinema.offsetHeight - window.innerHeight;
      var p = runway > 0 ? (-rect.top) / runway : 0;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      cinema.style.setProperty('--p', p.toFixed(4));
      ticking = false;
    };

    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateCinema);
      }
    };

    updateCinema();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  // ---------- 3D tilt on cards ----------
  // The card leans toward the cursor, like it's floating on a pivot.
  // Mouse-only: no tilt on phones/tablets.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tiltEls = document.querySelectorAll('.card, .team-card, .step');

    tiltEls.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;

        el.style.transform =
          'perspective(700px)' +
          ' rotateX(' + (y * -6).toFixed(2) + 'deg)' +
          ' rotateY(' + (x * 8).toFixed(2) + 'deg)' +
          ' translateY(-3px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

});
