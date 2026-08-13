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
<a class="wol-skip-link" href="#main">Przejdź do treści</a>

<header class="wol-site-header" role="banner">
	<div class="wol-header-inner">
		<a href="<?php echo esc_url(home_url('/')); ?>" class="wol-brand" aria-label="PomagaMY — strona główna">
			<img
				class="wol-brand__logo wol-brand__logo--header-icon"
				src="<?php echo esc_url($logo_url); ?>"
				alt="PomagaMY — ikona aplikacji"
				decoding="async"
			/>
			<span class="wol-brand__tag">łączy ludzi i organizacje</span>
		</a>
		<button type="button" class="wol-nav-toggle" aria-expanded="false" aria-controls="wol-site-nav">
			<span class="wol-nav-toggle__bars" aria-hidden="true"></span>
			<span class="sr-only">Menu</span>
		</button>
		<nav class="wol-site-nav" id="wol-site-nav" aria-label="Nawigacja strony">
			<?php
			/** Kotwice na landing — na podstronach prowadzą na stronę główną z sekcją. */
			$home_hash = trailingslashit(home_url('/'));
			?>
			<a href="<?php echo esc_url($home_hash); ?>#o-nas">O platformie</a>
			<a href="<?php echo esc_url($home_hash); ?>#jak-dziala">Jak to działa</a>
			<a href="<?php echo esc_url($home_hash); ?>#dla-kogo">Dla kogo</a>
			<a href="<?php echo esc_url($home_hash); ?>#kontakt">Kontakt</a>
			<?php
			$blog_url = function_exists('wolontariat_landing_get_posts_page_url') ? wolontariat_landing_get_posts_page_url() : null;
			if ($blog_url) :
				?>
			<a href="<?php echo esc_url($blog_url); ?>">Blog</a>
				<?php
			endif;
			?>
		</nav>
	</div>
</header>

<main id="main" class="wol-main" tabindex="-1">
