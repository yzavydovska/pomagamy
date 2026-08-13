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

		nav.querySelectorAll('a').forEach(function (link) {
			link.addEventListener('click', function () {
				nav.classList.remove('is-open');
				btn.setAttribute('aria-expanded', 'false');
			});
		});
	}

	function initTabs() {
		var root = document.querySelector('[data-wol-tabs]');
		if (!root) {
			return;
		}

		var nav = root.querySelector('.wol-tabs__nav');
		var indicator = root.querySelector('.wol-tabs__indicator');
		var buttons = root.querySelectorAll('.wol-tabs__btn');
		var panels = root.querySelectorAll('.wol-tabs__panel');

		function moveIndicator(btn) {
			if (!indicator || !btn || !nav) {
				return;
			}
			var navRect = nav.getBoundingClientRect();
			var btnRect = btn.getBoundingClientRect();
			indicator.style.width = btnRect.width + 'px';
			indicator.style.transform = 'translateX(' + (btnRect.left - navRect.left) + 'px)';
		}

		function activateTab(tabId) {
			buttons.forEach(function (btn) {
				var active = btn.getAttribute('data-tab') === tabId;
				btn.classList.toggle('is-active', active);
				btn.setAttribute('aria-selected', active ? 'true' : 'false');
				if (active) {
					moveIndicator(btn);
				}
			});

			panels.forEach(function (panel) {
				var active = panel.getAttribute('data-panel') === tabId;
				panel.classList.toggle('is-active', active);
				if (active) {
					panel.removeAttribute('hidden');
					initStepCards(panel);
				} else {
					panel.setAttribute('hidden', '');
				}
			});
		}

		buttons.forEach(function (btn) {
			btn.addEventListener('click', function () {
				activateTab(btn.getAttribute('data-tab'));
			});
		});

		var activeBtn = root.querySelector('.wol-tabs__btn.is-active');
		if (activeBtn) {
			requestAnimationFrame(function () {
				moveIndicator(activeBtn);
			});
		}

		window.addEventListener('load', function () {
			var current = root.querySelector('.wol-tabs__btn.is-active');
			moveIndicator(current);
		});

		window.addEventListener('resize', function () {
			var current = root.querySelector('.wol-tabs__btn.is-active');
			moveIndicator(current);
		});
	}

	function initStepCards(scope) {
		var container = scope || document;
		container.querySelectorAll('.wol-tabs__panel').forEach(function (panel) {
			if (panel.hasAttribute('hidden') && !scope) {
				return;
			}

			var cards = panel.querySelectorAll('.wol-step-card');
			var previews = panel.querySelectorAll('.wol-step-preview__card');
			if (!cards.length || panel.dataset.stepsBound === '1') {
				return;
			}
			panel.dataset.stepsBound = '1';

			function selectStep(index) {
				cards.forEach(function (card, i) {
					card.classList.toggle('is-active', i === index);
				});
				previews.forEach(function (preview, i) {
					preview.classList.toggle('is-visible', i === index);
				});
			}

			cards.forEach(function (card, index) {
				card.addEventListener('click', function () {
					selectStep(index);
				});
				card.addEventListener('keydown', function (e) {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						selectStep(index);
					}
				});
				card.setAttribute('tabindex', '0');
				card.setAttribute('role', 'button');
			});
		});
	}

	function initAudienceCards() {
		document.querySelectorAll('.wol-audience-card--expandable').forEach(function (card) {
			var toggle = card.querySelector('.wol-audience-card__toggle');
			if (!toggle) {
				return;
			}

			function setExpanded(expanded) {
				card.classList.toggle('is-expanded', expanded);
				toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
			}

			toggle.addEventListener('click', function () {
				var willExpand = !card.classList.contains('is-expanded');
				document.querySelectorAll('.wol-audience-card--expandable.is-expanded').forEach(function (other) {
					if (other !== card) {
						other.classList.remove('is-expanded');
						var otherToggle = other.querySelector('.wol-audience-card__toggle');
						if (otherToggle) {
							otherToggle.setAttribute('aria-expanded', 'false');
						}
					}
				});
				setExpanded(willExpand);
			});
		});
	}

	function initCounters() {
		if (reducedMotion.matches) {
			document.querySelectorAll('[data-count]').forEach(function (el) {
				var target = parseInt(el.getAttribute('data-count'), 10);
				var suffix = el.getAttribute('data-suffix') || '';
				el.textContent = target + suffix;
			});
			return;
		}

		var stats = document.querySelector('.wol-stats');
		if (!stats || !('IntersectionObserver' in window)) {
			return;
		}

		var started = false;

		var io = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting || started) {
						return;
					}
					started = true;
					stats.querySelectorAll('[data-count]').forEach(function (el) {
						animateCounter(el);
					});
					io.disconnect();
				});
			},
			{ threshold: 0.4 }
		);

		io.observe(stats);
	}

	function animateCounter(el) {
		var target = parseInt(el.getAttribute('data-count'), 10);
		var suffix = el.getAttribute('data-suffix') || '';
		var duration = 1400;
		var start = performance.now();

		function tick(now) {
			var progress = Math.min((now - start) / duration, 1);
			var eased = 1 - Math.pow(1 - progress, 3);
			var value = Math.round(target * eased);
			el.textContent = value + suffix;
			if (progress < 1) {
				requestAnimationFrame(tick);
			}
		}

		requestAnimationFrame(tick);
	}

	function initTilt() {
		if (reducedMotion.matches || !window.matchMedia('(pointer: fine)').matches) {
			return;
		}

		document.querySelectorAll('.wol-tilt').forEach(function (el) {
			var intensity = parseFloat(el.getAttribute('data-tilt-intensity')) || 6;

			el.addEventListener('mousemove', function (e) {
				var rect = el.getBoundingClientRect();
				var x = (e.clientX - rect.left) / rect.width - 0.5;
				var y = (e.clientY - rect.top) / rect.height - 0.5;
				el.style.transform =
					'perspective(900px) rotateY(' + x * intensity + 'deg) rotateX(' + -y * intensity + 'deg)';
			});

			el.addEventListener('mouseleave', function () {
				el.style.transform = '';
			});
		});
	}

	function initParallaxOrbs() {
		if (reducedMotion.matches) {
			return;
		}

		var orbs = document.querySelector('.wol-bg-orbs');
		if (!orbs) {
			return;
		}

		window.addEventListener(
			'scroll',
			function () {
				var y = window.scrollY * 0.08;
				orbs.style.transform = 'translateY(' + y + 'px)';
			},
			{ passive: true }
		);
	}

	function stripCloudaccessPromo() {
		var promoPattern = /cloudaccess\.net|site hosted with|your wordpress!/i;

		function keepFooterEl(el) {
			if (!el || !el.classList) {
				return false;
			}
			if (/^wol-footer__/.test(el.className)) {
				return true;
			}
			if (el.classList.contains('wol-footer__links') || el.closest('.wol-footer__links')) {
				return true;
			}
			return false;
		}

		document.querySelectorAll('a[href*="cloudaccess.net"]').forEach(function (a) {
			var blk = a.closest('p, div, center, span, li');
			if (blk && promoPattern.test(blk.textContent || '')) {
				blk.remove();
				return;
			}
			a.remove();
		});

		document.querySelectorAll('.wol-footer-inner > *, body > p, body > div, body > center, body > span').forEach(function (el) {
			if (keepFooterEl(el)) {
				return;
			}
			var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
			if (promoPattern.test(t) && t.length < 500) {
				el.remove();
			}
		});
	}

	function watchCloudaccessPromo() {
		stripCloudaccessPromo();
		if (!('MutationObserver' in window) || !document.body) {
			return;
		}
		var observer = new MutationObserver(function (mutations) {
			var found = false;
			mutations.forEach(function (mutation) {
				mutation.addedNodes.forEach(function (node) {
					if (node.nodeType !== 1) {
						return;
					}
					var text = node.textContent || '';
					if (/cloudaccess\.net|site hosted with|your wordpress!/i.test(text)) {
						found = true;
					}
				});
			});
			if (found) {
				observer.disconnect();
				stripCloudaccessPromo();
			}
		});
		observer.observe(document.body, { childList: true, subtree: false });
	}

	function init() {
		initReveal();
		initHeaderScrolled();
		initNavToggle();
		initTabs();
		initStepCards();
		initAudienceCards();
		initCounters();
		initTilt();
		initParallaxOrbs();
		watchCloudaccessPromo();
		[400, 1200, 2500, 5000].forEach(function (delay) {
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
