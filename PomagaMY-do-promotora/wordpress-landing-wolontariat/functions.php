<?php
/**
 * Wolontariat Landing — funkcje motywu
 */

if (! defined('ABSPATH')) {
	exit;
}

define('WOLONTARIAT_LANDING_VERSION', '1.6.0');

/**
 * Adres kontaktowy w stopce.
 */
function wolontariat_landing_contact_email(): string {
	return apply_filters('wolontariat_landing_contact_email', 'yzavydovska@gmail.com');
}

/**
 * Usuń domyślny slogan hostingu CloudAccess z ustawień WordPress.
 */
function wolontariat_landing_is_hosting_promo_text($value): bool {
	if (! is_string($value) || $value === '') {
		return false;
	}
	return (bool) preg_match('/cloudaccess\.net|site hosted with|your wordpress!/i', $value);
}

function wolontariat_landing_sanitize_hosting_tagline($value) {
	return wolontariat_landing_is_hosting_promo_text($value) ? '' : $value;
}
add_filter('option_blogdescription', 'wolontariat_landing_sanitize_hosting_tagline');

function wolontariat_landing_filter_bloginfo($output, $show) {
	if ($show === 'description' && wolontariat_landing_is_hosting_promo_text($output)) {
		return '';
	}
	return $output;
}
add_filter('bloginfo', 'wolontariat_landing_filter_bloginfo', 10, 2);

/**
 * Skrypt uruchamiany na końcu wp_footer — usuwa promocję wstrzykniętą przez hosting.
 */
function wolontariat_landing_remove_hosting_promo_script(): void {
	if (is_admin()) {
		return;
	}
	?>
	<script id="wol-strip-cloudaccess">
	(function () {
		var re = /cloudaccess\.net|site hosted with|your wordpress!/i;
		function keepFooterEl(el) {
			if (!el || !el.classList) return false;
			if (/^wol-footer__/.test(el.className)) return true;
			if (el.classList.contains('wol-footer__links') || el.closest('.wol-footer__links')) return true;
			return false;
		}
		document.querySelectorAll('a[href*="cloudaccess.net"]').forEach(function (a) {
			var blk = a.closest('p, div, span, center');
			if (blk && re.test(blk.textContent || '')) blk.remove();
			else a.remove();
		});
		document.querySelectorAll('.wol-footer-inner > *, body > p, body > div, body > center').forEach(function (el) {
			if (keepFooterEl(el)) return;
			var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
			if (re.test(t) && t.length < 500) el.remove();
		});
	})();
	</script>
	<?php
}
add_action('wp_footer', 'wolontariat_landing_remove_hosting_promo_script', 99999);

/**
 * Logo w nagłówku — ikona wolontariatu (okrągła)
 */
function wolontariat_landing_header_logo_uri(): string {
	return get_template_directory_uri() . '/assets/images/header-logo-volunteer-icon.png';
}

/**
 * Ścieżka do logo PomagaMY (Group 283) — stopka i miejsca z pełnym logotypem
 *
 * @return string URL bez esc_url – użyj w szablonach z esc_url().
 */
function wolontariat_landing_logo_uri(): string {
	return get_template_directory_uri() . '/assets/images/group-283.png';
}

/**
 * Ekran powitalny aplikacji (hero)
 */
function wolontariat_landing_hero_splash_uri(): string {
	return get_template_directory_uri() . '/assets/images/ekran-powitalny.png';
}

/**
 * Tło sekcji CTA — społeczność / pomocna dłoń
 */
function wolontariat_landing_cta_bg_uri(): string {
	return get_template_directory_uri() . '/assets/images/cta-hands-community.png';
}

/**
 * Konfiguracja motywu
 */
function wolontariat_landing_setup(): void {
	add_theme_support('title-tag');
	add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
	add_theme_support('wp-block-styles');
}
add_action('after_setup_theme', 'wolontariat_landing_setup');

/**
 * Publiczny URL strony z listą wpisów (po ustawieniu „Strona z wpisami” w Ustawienia → Czytanie).
 */
function wolontariat_landing_get_posts_page_url(): ?string {
	$id = (int) get_option('page_for_posts');
	if ($id <= 0) {
		return null;
	}
	$url = get_permalink($id);
	return is_string($url) && $url !== '' ? $url : null;
}

/**
 * Link do strony „Regulamin” — utwórz stronę ze slugiem `regulamin` (adres /regulamin/).
 */
function wolontariat_landing_get_regulamin_url(): ?string {
	$page = get_page_by_path('regulamin', OBJECT, 'page');
	if ($page instanceof WP_Post) {
		$url = get_permalink($page);
		return is_string($url) && $url !== '' ? $url : null;
	}
	return null;
}

/**
 * Przypomnienie w panelu: bez „Strony z wpisami” link „Blog” w nagłówku się nie pokaże.
 */
function wolontariat_landing_admin_notice_reading(): void {
	if (! current_user_can('manage_options')) {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (! $screen || ! in_array($screen->id, array('dashboard', 'options-reading'), true)) {
		return;
	}
	if ((int) get_option('page_for_posts') > 0) {
		return;
	}
	echo '<div class="notice notice-info is-dismissible"><p>';
	echo esc_html('Motyw PomagaMY: aby w menu pojawił się link „Blog” i działała lista wpisów, w Ustawienia → Czytanie wybierz statyczną stronę główną oraz osobną stronę „Strona z wpisami” (np. strona o tytule „Blog”).');
	echo '</p></div>';
}
add_action('admin_notices', 'wolontariat_landing_admin_notice_reading');

/**
 * Style i fonty
 */
function wolontariat_landing_scripts(): void {
	wp_enqueue_style(
		'wolontariat-landing-fonts',
		'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
		array(),
		null
	);
	wp_enqueue_style(
		'wolontariat-landing',
		get_template_directory_uri() . '/assets/css/landing.css',
		array('wolontariat-landing-fonts'),
		WOLONTARIAT_LANDING_VERSION
	);
	wp_enqueue_script(
		'wolontariat-landing',
		get_template_directory_uri() . '/assets/js/landing.js',
		array(),
		WOLONTARIAT_LANDING_VERSION,
		true
	);
}
add_action('wp_enqueue_scripts', 'wolontariat_landing_scripts');