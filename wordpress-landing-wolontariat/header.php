<?php
/**
 * Nagłówek — pasek nawigacji landing page
 */

if (! defined('ABSPATH')) {
	exit;
}

$logo_url = wolontariat_landing_header_logo_uri();
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class('wol-landing-body'); ?> itemscope itemtype="https://schema.org/WebSite">
<a class="wol-skip-link" href="#main"><?php esc_html_e('Przejdź do treści', 'wolontariat-landing'); ?></a>

<header class="wol-site-header" role="banner">
	<div class="wol-header-inner">
		<a href="<?php echo esc_url(home_url('/')); ?>" class="wol-brand" aria-label="<?php esc_attr_e('PomagaMY — strona główna', 'wolontariat-landing'); ?>">
			<img
				class="wol-brand__logo wol-brand__logo--header-icon"
				src="<?php echo esc_url($logo_url); ?>"
				alt="<?php esc_attr_e('PomagaMY — ikona aplikacji', 'wolontariat-landing'); ?>"
				decoding="async"
			/>
			<span class="wol-brand__tag"><?php esc_html_e('łączy ludzi i organizacje', 'wolontariat-landing'); ?></span>
		</a>
		<button type="button" class="wol-nav-toggle" aria-expanded="false" aria-controls="wol-site-nav">
			<span class="wol-nav-toggle__bars" aria-hidden="true"></span>
			<span class="sr-only"><?php esc_html_e('Menu', 'wolontariat-landing'); ?></span>
		</button>
		<nav class="wol-site-nav" id="wol-site-nav" aria-label="<?php esc_attr_e('Nawigacja strony', 'wolontariat-landing'); ?>">
			<?php
			/** Kotwice na landing — na podstronach prowadzą na stronę główną z sekcją. */
			$home_hash = trailingslashit(home_url('/'));
			?>
			<a href="<?php echo esc_url($home_hash); ?>#jak-dziala"><?php esc_html_e('Jak to działa', 'wolontariat-landing'); ?></a>
			<a href="<?php echo esc_url($home_hash); ?>#dla-kogo"><?php esc_html_e('Dla kogo', 'wolontariat-landing'); ?></a>
			<a href="<?php echo esc_url($home_hash); ?>#kontakt"><?php esc_html_e('Kontakt', 'wolontariat-landing'); ?></a>
			<?php
			$blog_url = function_exists('wolontariat_landing_get_posts_page_url') ? wolontariat_landing_get_posts_page_url() : null;
			if ($blog_url) :
				?>
			<a href="<?php echo esc_url($blog_url); ?>"><?php esc_html_e('Blog', 'wolontariat-landing'); ?></a>
				<?php
			endif;
			?>
			<a href="<?php echo esc_url($home_hash); ?>#dolacz" class="wol-btn wol-btn--primary wol-btn--compact"><?php esc_html_e('Pobierz aplikację', 'wolontariat-landing'); ?></a>
		</nav>
	</div>
</header>

<main id="main" class="wol-main" tabindex="-1">
