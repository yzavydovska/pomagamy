<?php
/**
 * Szablon strony głównej — gotowa landing page
 */

if (! defined('ABSPATH')) {
	exit;
}

get_header();
?>

<section class="wol-hero" aria-labelledby="wol-hero-heading">
	<div class="wol-hero__grid">
		<div class="wol-hero__content">
			<p class="wol-hero__pill"><?php esc_html_e('Aplikacja mobilna dla wolontariuszy i organizacji', 'wolontariat-landing'); ?></p>
			<h1 id="wol-hero-heading"><?php esc_html_e('Pomaganie jest prostsze, niż myślisz', 'wolontariat-landing'); ?></h1>
			<p class="wol-lead"><?php esc_html_e('Znajdź sprawy zbliżone do Twoich wartości, zapisz się na wolontariat i komunikuj się z organizacjami w jednym miejscu.', 'wolontariat-landing'); ?></p>
			<div class="wol-hero__store-wrap" id="dolacz">
				<?php
				get_template_part(
					'template-parts/store-badges',
					null,
					array(
						'variant'   => 'default',
						'play_url'  => '#',
						'apple_url' => '#',
					)
				);
				?>
			</div>
		</div>
		<div class="wol-hero__visual">
			<figure class="wol-hero__splash">
				<img
					class="wol-hero__splash-img"
					src="<?php echo esc_url(wolontariat_landing_hero_splash_uri()); ?>"
					alt="<?php esc_attr_e('Fragment aplikacji PomagaMY — ekran powitalny', 'wolontariat-landing'); ?>"
					loading="eager"
					decoding="async"
				/>
			</figure>
		</div>
	</div>
</section>

<section id="jak-dziala" class="wol-section wol-reveal" aria-labelledby="wol-steps-heading">
	<div class="wol-section-inner">
		<h2 id="wol-steps-heading"><?php esc_html_e('Jak to działa', 'wolontariat-landing'); ?></h2>
		<p class="wol-section__intro"><?php esc_html_e('Kilkanaście minut dzieli Cię od pierwszego dobrego kroku.', 'wolontariat-landing'); ?></p>
		<ol class="wol-steps">
			<li>
				<span class="wol-step__num">1</span>
				<h3><?php esc_html_e('Załóż konto i uzupełnij profil', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Wygodny formularz w aplikacji. Możesz wrócić do edycji w dowolnym momencie.', 'wolontariat-landing'); ?></p>
			</li>
			<li>
				<span class="wol-step__num">2</span>
				<h3><?php esc_html_e('Szukaj odpowiednich dla Ciebie aktywności', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Filtruj wg kategorii, lokalizacji i czasu, który możesz poświęcić.', 'wolontariat-landing'); ?></p>
			</li>
			<li>
				<span class="wol-step__num">3</span>
				<h3><?php esc_html_e('Zapisz się i rozmawiaj z organizacją', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Wszystko w aplikacji: informacje, terminy i przypomnienia.', 'wolontariat-landing'); ?></p>
			</li>
		</ol>
	</div>
</section>

<section class="wol-section wol-section--alt wol-reveal" aria-labelledby="wol-features-heading">
	<div class="wol-section-inner">
		<h2 id="wol-features-heading"><?php esc_html_e('Dlaczego warto', 'wolontariat-landing'); ?></h2>
		<div class="wol-features">
			<article class="wol-feature">
				<div class="wol-feature__icon" aria-hidden="true">✓</div>
				<h3><?php esc_html_e('Przejrzyste zgłoszenia', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Wiesz, czego oczekuje organizacja i co możesz realnie zaoferować.', 'wolontariat-landing'); ?></p>
			</article>
			<article class="wol-feature">
				<div class="wol-feature__icon" aria-hidden="true">◎</div>
				<h3><?php esc_html_e('Bezpieczna komunikacja', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Kontakt w ramach platformy — mniej chaosu w skrzynce i na czacie.', 'wolontariat-landing'); ?></p>
			</article>
			<article class="wol-feature">
				<div class="wol-feature__icon" aria-hidden="true">♥</div>
				<h3><?php esc_html_e('Śledzenie wpływu', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Zobacz, ile godzin i akcji realnie wniosłeś do społeczności.', 'wolontariat-landing'); ?></p>
			</article>
		</div>
	</div>
</section>

<section id="dla-kogo" class="wol-section wol-reveal" aria-labelledby="wol-audience-heading">
	<div class="wol-section-inner">
		<h2 id="wol-audience-heading"><?php esc_html_e('Dla kogo jest aplikacja', 'wolontariat-landing'); ?></h2>
		<div class="wol-audience">
			<article class="wol-audience-card">
				<h3><?php esc_html_e('Wolontariusze', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Szukasz sensownych aktywności, elastycznych terminów i jasnych zasad? Zacznij od profilu i odkrywaj organizacje w swoim tempie.', 'wolontariat-landing'); ?></p>
			</article>
			<article class="wol-audience-card wol-audience-card--accent">
				<h3><?php esc_html_e('Organizacje', 'wolontariat-landing'); ?></h3>
				<p><?php esc_html_e('Publikuj potrzeby, weryfikuj zgłoszenia i utrzymuj kontakt z osobami, które chcą realnie pomagać — z poziomu panelu administratora.', 'wolontariat-landing'); ?></p>
			</article>
		</div>
	</div>
</section>

<section class="wol-cta wol-reveal" aria-labelledby="wol-cta-heading">
	<div class="wol-cta__inner">
		<h2 id="wol-cta-heading"><?php esc_html_e('Gotowy, by dołączyć?', 'wolontariat-landing'); ?></h2>
		<p><?php esc_html_e('Zainstaluj aplikację i ustaw swoje pierwsze preferencje w kilku krokach.', 'wolontariat-landing'); ?></p>
		<div class="wol-cta__stores">
			<?php
			get_template_part(
				'template-parts/store-badges',
				null,
				array(
					'variant'   => 'cta',
					'play_url'  => '#',
					'apple_url' => '#',
				)
			);
			?>
		</div>
	</div>
</section>

<?php
get_footer();
