<?php
/**
 * Szablon strony głównej — landing page PomagaMY
 */

if (! defined('ABSPATH')) {
	exit;
}

get_header();
?>

<div class="wol-bg-orbs" aria-hidden="true">
	<span class="wol-bg-orbs__orb wol-bg-orbs__orb--1"></span>
	<span class="wol-bg-orbs__orb wol-bg-orbs__orb--2"></span>
	<span class="wol-bg-orbs__orb wol-bg-orbs__orb--3"></span>
</div>

<section class="wol-hero" aria-labelledby="wol-hero-heading">
	<div class="wol-hero__grid">
		<div class="wol-hero__content">
			<p class="wol-hero__eyebrow">Witamy w PomagaMY</p>
			<h1 id="wol-hero-heading">
				Platforma, która łączy dobre serca z potrzebującymi
			</h1>
			<p class="wol-lead wol-lead--hero">
				Narzędzie dla organizacji i aktywnych wolontariuszy, którzy wzmacniają swoje społeczności. Wszystkie potrzeby wolontariatu — w jednym miejscu.
			</p>
			<div class="wol-hero__actions" id="dolacz">
				<a href="#jak-dziala" class="wol-btn wol-btn--primary">Jak to działa</a>
				<a href="#o-nas" class="wol-btn wol-btn--secondary">O platformie</a>
			</div>
		</div>
		<div class="wol-hero__visual">
			<ul class="wol-hero__float-tags" aria-hidden="true">
				<li class="wol-hero__float-tag wol-hero__float-tag--1">Zwierzęta</li>
				<li class="wol-hero__float-tag wol-hero__float-tag--2">Edukacja</li>
				<li class="wol-hero__float-tag wol-hero__float-tag--3">Społeczność</li>
			</ul>
			<figure class="wol-hero__splash wol-tilt" data-tilt-intensity="8">
				<div class="wol-hero__splash-glow" aria-hidden="true"></div>
				<img
					class="wol-hero__splash-img"
					src="<?php echo esc_url(wolontariat_landing_hero_splash_uri()); ?>"
					alt="Fragment aplikacji PomagaMY — ekran powitalny"
					loading="eager"
					decoding="async"
				/>
			</figure>
		</div>
	</div>
</section>

<section id="o-nas" class="wol-mission wol-reveal" aria-labelledby="wol-mission-heading">
	<div class="wol-section-inner">
		<h2 id="wol-mission-heading" class="wol-mission__title">Nasza misja</h2>
		<div class="wol-mission__grid">
			<article class="wol-mission-card" data-stagger="0">
				<span class="wol-mission-card__icon" aria-hidden="true">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/><circle cx="12" cy="10" r="3"/></svg>
				</span>
				<h3>Łączymy ludzi ze sprawami</h3>
				<p>PomagaMY łączy organizacje z osobami gotowymi pomagać — i lokalnych wolontariuszy z inicjatywami, które mają dla nich sens.</p>
			</article>
			<article class="wol-mission-card" data-stagger="1">
				<span class="wol-mission-card__icon" aria-hidden="true">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
				</span>
				<h3>Oszczędzamy czas i zasoby</h3>
				<p>Upraszczamy każdy krok rekrutacji i zarządzania wolontariatem, żeby organizacje mogły skupić się na tym, co najważniejsze — swojej misji.</p>
			</article>
			<article class="wol-mission-card" data-stagger="2">
				<span class="wol-mission-card__icon" aria-hidden="true">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
				</span>
				<h3>Budujemy społeczność</h3>
				<p>Razem tworzymy lepszy świat — przejrzyście, bezpiecznie i z szacunkiem do czasu każdej strony.</p>
			</article>
		</div>
	</div>
</section>

<section class="wol-stats wol-reveal" aria-label="Platforma w liczbach">
	<div class="wol-section-inner">
		<ul class="wol-stats__list">
			<li class="wol-stat">
				<span class="wol-stat__num" data-count="15" data-suffix="+">0</span>
				<span class="wol-stat__label">kategorii zainteresowań</span>
			</li>
			<li class="wol-stat">
				<span class="wol-stat__num" data-count="3" data-suffix="">0</span>
				<span class="wol-stat__label">proste kroki do startu</span>
			</li>
			<li class="wol-stat">
				<span class="wol-stat__num" data-count="1" data-suffix="">0</span>
				<span class="wol-stat__label">platforma — wolontariusze i organizacje</span>
			</li>
		</ul>
	</div>
</section>

<section id="jak-dziala" class="wol-section wol-section--steps wol-reveal" aria-labelledby="wol-steps-heading">
	<div class="wol-section-inner">
		<h2 id="wol-steps-heading">Jak to działa</h2>
		<p class="wol-section__intro">Zapisy na wolontariat nie muszą być uciążliwe — zobacz, jak PomagaMY ułatwia proces wolontariuszom i organizacjom.</p>

		<div class="wol-tabs" data-wol-tabs>
			<div class="wol-tabs__nav" role="tablist" aria-label="Wybierz perspektywę">
				<button type="button" class="wol-tabs__btn is-active" role="tab" aria-selected="true" aria-controls="wol-panel-volunteer" id="wol-tab-volunteer" data-tab="volunteer">
					Wolontariusz
				</button>
				<button type="button" class="wol-tabs__btn" role="tab" aria-selected="false" aria-controls="wol-panel-org" id="wol-tab-org" data-tab="org">
					Organizacja
				</button>
				<span class="wol-tabs__indicator" aria-hidden="true"></span>
			</div>

			<div class="wol-tabs__panels">
				<div class="wol-tabs__panel is-active" role="tabpanel" id="wol-panel-volunteer" aria-labelledby="wol-tab-volunteer" data-panel="volunteer">
					<ol class="wol-steps wol-steps--interactive">
						<li class="wol-step-card is-active" data-step="0">
							<span class="wol-step__num">1</span>
							<h3>Załóż konto i uzupełnij profil</h3>
							<p>Wybierz zainteresowania — od zwierząt po edukację — i określ, ile czasu możesz poświęcić.</p>
						</li>
						<li class="wol-step-card" data-step="1">
							<span class="wol-step__num">2</span>
							<h3>Szukaj aktywności dla siebie</h3>
							<p>Filtruj ogłoszenia wg kategorii, lokalizacji i terminu. Przeglądaj bez konta lub zaloguj się, by się zapisać.</p>
						</li>
						<li class="wol-step-card" data-step="2">
							<span class="wol-step__num">3</span>
							<h3>Zapisz się i pomagaj</h3>
							<p>Komunikuj się z organizacją w ramach platformy — jasne zasady, mniej chaosu, więcej realnego wpływu.</p>
						</li>
					</ol>
					<div class="wol-step-preview" aria-live="polite">
						<div class="wol-step-preview__card is-visible" data-preview="0">
							<strong>Profil dopasowany do Ciebie</strong>
							<p>15 kategorii zainteresowań — edycja profilu w dowolnym momencie.</p>
						</div>
						<div class="wol-step-preview__card" data-preview="1">
							<strong>Inteligentne wyszukiwanie</strong>
							<p>Filtry lokalizacji, kategorii i czasu — znajdź sprawy bliskie Twoim wartościom.</p>
						</div>
						<div class="wol-step-preview__card" data-preview="2">
							<strong>Bezpieczny kontakt</strong>
							<p>Wszystko w aplikacji: informacje, terminy i status zgłoszenia.</p>
						</div>
					</div>
				</div>

				<div class="wol-tabs__panel" role="tabpanel" id="wol-panel-org" aria-labelledby="wol-tab-org" data-panel="org" hidden>
					<ol class="wol-steps wol-steps--interactive">
						<li class="wol-step-card is-active" data-step="0">
							<span class="wol-step__num">1</span>
							<h3>Zarejestruj organizację</h3>
							<p>Utwórz profil organizacji i przejdź weryfikację — buduj zaufanie wolontariuszy od pierwszego kontaktu.</p>
						</li>
						<li class="wol-step-card" data-step="1">
							<span class="wol-step__num">2</span>
							<h3>Publikuj ogłoszenia</h3>
							<p>Opisz potrzeby, terminy i wymagania — przejrzyście, żeby wolontariusze wiedzieli, czego oczekujesz.</p>
						</li>
						<li class="wol-step-card" data-step="2">
							<span class="wol-step__num">3</span>
							<h3>Zarządzaj zgłoszeniami</h3>
							<p>Akceptuj wolontariuszy, utrzymuj kontakt i korzystaj z panelu administratora — wszystko w jednym miejscu.</p>
						</li>
					</ol>
					<div class="wol-step-preview" aria-live="polite">
						<div class="wol-step-preview__card is-visible" data-preview="0">
							<strong>Weryfikacja organizacji</strong>
							<p>Panel admina dba o jakość i bezpieczeństwo społeczności.</p>
						</div>
						<div class="wol-step-preview__card" data-preview="1">
							<strong>Jasne ogłoszenia</strong>
							<p>Kategorie, lokalizacja, terminy — wolontariusze wiedzą, na co się zapisują.</p>
						</div>
						<div class="wol-step-preview__card" data-preview="2">
							<strong>Panel organizacji</strong>
							<p>Zgłoszenia, komunikacja i moderacja — bez rozproszenia między narzędziami.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="wol-section wol-section--alt wol-reveal" aria-labelledby="wol-features-heading">
	<div class="wol-section-inner">
		<h2 id="wol-features-heading">Dlaczego PomagaMY</h2>
		<p class="wol-section__intro">Pierwsza kompleksowa platforma rekrutacji i zarządzania wolontariatem — zaprojektowana od podstaw dla polskich organizacji i wolontariuszy.</p>
		<div class="wol-features wol-features--tilt">
			<article class="wol-feature wol-tilt" data-tilt-intensity="6">
				<div class="wol-feature__icon" aria-hidden="true">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
				</div>
				<h3>Przejrzyste zgłoszenia</h3>
				<p>Wiesz, czego oczekuje organizacja i co możesz realnie zaoferować — bez niespodzianek.</p>
			</article>
			<article class="wol-feature wol-tilt" data-tilt-intensity="6">
				<div class="wol-feature__icon" aria-hidden="true">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
				</div>
				<h3>Bezpieczna komunikacja</h3>
				<p>Kontakt w ramach platformy — mniej chaosu w skrzynce i na czacie.</p>
			</article>
			<article class="wol-feature wol-tilt" data-tilt-intensity="6">
				<div class="wol-feature__icon" aria-hidden="true">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
				</div>
				<h3>Śledzenie wpływu</h3>
				<p>Zobacz, ile godzin i akcji realnie wniosłeś do społeczności.</p>
			</article>
		</div>
	</div>
</section>

<section id="dla-kogo" class="wol-section wol-reveal" aria-labelledby="wol-audience-heading">
	<div class="wol-section-inner">
		<h2 id="wol-audience-heading">Dla kogo jest PomagaMY</h2>
		<div class="wol-audience wol-audience--interactive">
			<article class="wol-audience-card wol-audience-card--expandable is-expanded" tabindex="0">
				<button type="button" class="wol-audience-card__toggle" aria-expanded="true">
					<span class="wol-audience-card__badge">Wolontariusze</span>
					<h3>Szukasz sensownych aktywności?</h3>
					<span class="wol-audience-card__chevron" aria-hidden="true"></span>
				</button>
				<div class="wol-audience-card__body">
					<p>Elastyczne terminy, jasne zasady i sprawy zbliżone do Twoich wartości. Zacznij od profilu i odkrywaj organizacje we własnym tempie — możesz też przeglądać ogłoszenia bez konta.</p>
					<ul class="wol-audience-card__tags">
						<li>Profil zainteresowań</li>
						<li>Filtry lokalizacji</li>
						<li>Przegląd bez logowania</li>
					</ul>
				</div>
			</article>
			<article class="wol-audience-card wol-audience-card--accent wol-audience-card--expandable" tabindex="0">
				<button type="button" class="wol-audience-card__toggle" aria-expanded="false">
					<span class="wol-audience-card__badge">Organizacje</span>
					<h3>Potrzebujesz wolontariuszy?</h3>
					<span class="wol-audience-card__chevron" aria-hidden="true"></span>
				</button>
				<div class="wol-audience-card__body">
					<p>Publikuj potrzeby, weryfikuj zgłoszenia i utrzymuj kontakt z osobami, które chcą realnie pomagać — z poziomu panelu administratora i moderacji.</p>
					<ul class="wol-audience-card__tags">
						<li>Ogłoszenia wolontariatu</li>
						<li>Weryfikacja organizacji</li>
						<li>Panel administratora</li>
					</ul>
				</div>
			</article>
		</div>
	</div>
</section>

<section class="wol-trust wol-reveal" aria-labelledby="wol-trust-heading">
	<div class="wol-section-inner">
		<h2 id="wol-trust-heading" class="sr-only">Bezpieczeństwo i zgodność</h2>
		<ul class="wol-trust__badges">
			<li class="wol-trust__badge">
				<span class="wol-trust__badge-icon" aria-hidden="true">
					<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
				</span>
				<span class="wol-trust__badge-text">Zgodność z RODO</span>
			</li>
			<li class="wol-trust__badge">
				<span class="wol-trust__badge-icon" aria-hidden="true">
					<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
				</span>
				<span class="wol-trust__badge-text">Bezpieczne dane użytkowników</span>
			</li>
			<li class="wol-trust__badge">
				<span class="wol-trust__badge-icon" aria-hidden="true">
					<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
				</span>
				<span class="wol-trust__badge-text">Moderacja i weryfikacja</span>
			</li>
		</ul>
	</div>
</section>

<section
	class="wol-cta wol-reveal"
	aria-labelledby="wol-cta-heading"
	style="--wol-cta-bg: url('<?php echo esc_url(wolontariat_landing_cta_bg_uri()); ?>')"
>
	<div class="wol-cta__bg" aria-hidden="true"></div>
	<div class="wol-cta__inner">
		<h2 id="wol-cta-heading">Pomaganie jest prostsze, niż myślisz</h2>
		<p>Poznaj platformę, która łączy wolontariuszy z organizacjami — przejrzyście, bezpiecznie i z myślą o polskim wolontariacie.</p>
		<div class="wol-cta__actions">
			<a href="#jak-dziala" class="wol-btn wol-btn--primary">Zobacz, jak to działa</a>
			<a href="#kontakt" class="wol-btn wol-btn--secondary">Skontaktuj się</a>
		</div>
	</div>
</section>

<?php
get_footer();
