(function () {
	'use strict';

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	function revealAll() {
		document.querySelectorAll('.wol-reveal').forEach(function (el) {
			el.classList.add('is-visible');
		});
	}

	function initReveal() {
		if (reducedMotion.matches) {
			revealAll();
			return;
		}

		var els = document.querySelectorAll('.wol-reveal');
		if (!('IntersectionObserver' in window) || !els.length) {
			revealAll();
			return;
		}

		var io = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						io.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
		);

		els.forEach(function (el) {
			io.observe(el);
		});
	}

	function initHeaderScrolled() {
		var header = document.querySelector('.wol-site-header');
		if (!header) {
			return;
		}

		function update() {
			header.classList.toggle('is-scrolled', window.scrollY > 12);
		}

		update();
		window.addEventListener('scroll', update, { passive: true });
	}

	function initNavToggle() {
		var btn = document.querySelector('.wol-nav-toggle');
		var nav = document.getElementById('wol-site-nav');
		if (!btn || !nav) {
			return;
		}
		btn.addEventListener('click', function () {
			var isOpen = nav.classList.toggle('is-open');
			btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
		});
	}

	/** Usuń linię promocyjną CloudAccess.net (często wstrzykiwaną przez hosting po wp_footer). */
	function stripCloudaccessPromo() {
		document.querySelectorAll('a[href*="cloudaccess.net"]').forEach(function (a) {
			var blk = a.closest('p, div, section');
			if (blk && /cloudaccess/i.test(blk.textContent || '') && /hosted|wordpress/i.test(blk.textContent || '')) {
				blk.remove();
				return;
			}
		});
		document.querySelectorAll('body > p, body > div').forEach(function (el) {
			var t = (el.textContent || '').replace(/\s+/g, ' ');
			if (/cloudaccess\.net/i.test(t) && /hosted/i.test(t) && t.length < 420) {
				el.remove();
			}
		});
	}

	function init() {
		initReveal();
		initHeaderScrolled();
		initNavToggle();
		stripCloudaccessPromo();
		[400, 1200, 2500].forEach(function (delay) {
			window.setTimeout(stripCloudaccessPromo, delay);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	if (typeof reducedMotion.addEventListener === 'function') {
		reducedMotion.addEventListener('change', function () {
			if (reducedMotion.matches) {
				revealAll();
			}
		});
	}
})();
