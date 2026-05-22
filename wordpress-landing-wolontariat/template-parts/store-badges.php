<?php
/**
 * Przyciski sklepów — czytelne etykiety (wysoki kontrast)
 *
 * Zmienne z get_template_part (WordPress 5.5+): $variant, $play_url, $apple_url
 */

if (! defined('ABSPATH')) {
	exit;
}

$variant   = $variant ?? 'default';
$play_url  = $play_url ?? '#';
$apple_url = $apple_url ?? '#';

$classes = 'wol-store-row';
if ($variant !== 'default') {
	$classes .= ' wol-store-row--' . sanitize_html_class($variant);
}

$play_url  = esc_url($play_url);
$apple_url = esc_url($apple_url);
$gid = 'gp-' . preg_replace('/[^a-z0-9-]/i', '', function_exists('wp_unique_id') ? wp_unique_id('gp') : uniqid('gp', false));
?>
<div class="<?php echo esc_attr($classes); ?>">
	<a class="wol-store-badge wol-store-badge--google" href="<?php echo $play_url; ?>" rel="noopener noreferrer">
		<span class="wol-store-badge__icon" aria-hidden="true">
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" focusable="false">
				<path d="M4.3 3.1c-.1.2-.2.5-.2.9v19.8c0 .4.1.7.2.9l.1.1 10.7-10.7v-.2L4.3 3.1l-.1-.1z" fill="url(#<?php echo esc_attr($gid); ?>-a)"/>
				<path d="M15.2 15.1l3.5-3.5L8.3 4.2c-.3-.2-.6-.3-.9-.3-.4 0-.8.2-1.1.5l-.1.1 8.9 9.5.1.1z" fill="url(#<?php echo esc_attr($gid); ?>-b)"/>
				<path d="M15.2 12.9L6.2 3.4c.3-.3.7-.5 1.1-.5.3 0 .6.1.9.3l10.5 7.4-3.5 3.3z" fill="url(#<?php echo esc_attr($gid); ?>-c)"/>
				<path d="M15.2 15.1l-8.9 9.5c.3.3.7.5 1.1.5.3 0 .6-.1.9-.3l10.5-7.4-3.5-3.3z" fill="url(#<?php echo esc_attr($gid); ?>-d)"/>
				<defs>
					<linearGradient id="<?php echo esc_attr($gid); ?>-a" x1="15.2" y1="4.2" x2="4.3" y2="14" gradientUnits="userSpaceOnUse">
						<stop stop-color="#00D4FF"/><stop offset="1" stop-color="#00F076"/>
					</linearGradient>
					<linearGradient id="<?php echo esc_attr($gid); ?>-b" x1="10.2" y1="4.2" x2="18.7" y2="11.6" gradientUnits="userSpaceOnUse">
						<stop stop-color="#FFCE00"/><stop offset="1" stop-color="#FF3A44"/>
					</linearGradient>
					<linearGradient id="<?php echo esc_attr($gid); ?>-c" x1="5.3" y1="3.4" x2="18.7" y2="11.6" gradientUnits="userSpaceOnUse">
						<stop stop-color="#00F076"/><stop offset="1" stop-color="#00A0FF"/>
					</linearGradient>
					<linearGradient id="<?php echo esc_attr($gid); ?>-d" x1="6.2" y1="24.6" x2="18.7" y2="11.6" gradientUnits="userSpaceOnUse">
						<stop stop-color="#FF3A44"/><stop offset="1" stop-color="#C31162"/>
					</linearGradient>
				</defs>
			</svg>
		</span>
		<span class="wol-store-badge__text">
			<span class="wol-store-badge__label"><?php esc_html_e('Pobierz w', 'wolontariat-landing'); ?></span>
			<span class="wol-store-badge__name">Google Play</span>
		</span>
	</a>
	<a class="wol-store-badge wol-store-badge--apple" href="<?php echo $apple_url; ?>" rel="noopener noreferrer">
		<span class="wol-store-badge__icon" aria-hidden="true">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28" fill="currentColor" focusable="false">
				<path d="M19.3 14.8c0-3.5 2.9-5.2 3-5.3-1.6-2.4-4.2-2.7-5.1-2.8-2.2-.2-4.3 1.3-5.4 1.3s-2.8-1.3-4.6-1.2c-2.4.1-4.6 1.4-5.8 3.5-2.5 4.3-.6 10.7 1.8 14.2 1.2 1.7 2.6 3.7 4.5 3.6 1.8-.1 2.5-1.2 4.7-1.2s2.8 1.2 4.7 1.1c2-.1 3.2-1.8 4.4-3.5 1.4-2 1.9-4 2-4.1-.1 0-3.8-1.5-3.9-5.8zM16.2 4.7c1-1.2 1.7-2.9 1.5-4.6-1.4.1-3.1 1-4.1 2.1-.9 1-1.7 2.9-1.5 4.5 1.6.1 3.2-.9 4.1-2z"/>
			</svg>
		</span>
		<span class="wol-store-badge__text">
			<span class="wol-store-badge__label"><?php esc_html_e('Pobierz w', 'wolontariat-landing'); ?></span>
			<span class="wol-store-badge__name">App Store</span>
		</span>
	</a>
</div>
