<?php
/**
 * Stopka landing page
 */

if (! defined('ABSPATH')) {
	exit;
}

$logo_url = function_exists('wolontariat_landing_logo_uri') ? wolontariat_landing_logo_uri() : '';
?>

</main>

<footer id="kontakt" class="wol-footer" role="contentinfo">
	<div class="wol-footer-inner">
		<?php if ($logo_url !== '') : ?>
			<img
				class="wol-footer__logo"
				src="<?php echo esc_url($logo_url); ?>"
				alt=""
				aria-hidden="true"
				decoding="async"
			/>
		<?php endif; ?>
		<p class="wol-footer__brand">PomagaMY</p>
		<p class="wol-footer__desc">Platforma łącząca wolontariuszy z organizacjami — od rekrutacji po zarządzanie w jednym miejscu.</p>
		<?php
		$contact_email = function_exists('wolontariat_landing_contact_email') ? wolontariat_landing_contact_email() : '';
		if ($contact_email !== '') :
			?>
		<p class="wol-footer__contact">
			<a href="<?php echo esc_url('mailto:' . $contact_email); ?>"><?php echo esc_html($contact_email); ?></a>
		</p>
			<?php
		endif;
		?>
		<ul class="wol-footer__links">
			<?php
			$privacy_url = function_exists('get_privacy_policy_url') ? get_privacy_policy_url() : '';
			$terms_url   = function_exists('wolontariat_landing_get_regulamin_url') ? wolontariat_landing_get_regulamin_url() : null;
			?>
			<li>
				<?php if (is_string($privacy_url) && $privacy_url !== '') : ?>
					<a href="<?php echo esc_url($privacy_url); ?>">Polityka prywatności</a>
				<?php else : ?>
					<span class="wol-footer__link-placeholder" title="Ustaw stronę polityki: Ustawienia → Prywatność">Polityka prywatności</span>
				<?php endif; ?>
			</li>
			<li>
				<?php if ($terms_url) : ?>
					<a href="<?php echo esc_url($terms_url); ?>">Regulamin</a>
				<?php else : ?>
					<span class="wol-footer__link-placeholder" title="Utwórz stronę ze slugiem „regulamin”">Regulamin</span>
				<?php endif; ?>
			</li>
		</ul>
		<p class="wol-footer__copy">&copy; <?php echo esc_html(gmdate('Y')); ?> Wszystkie prawa zastrzeżone.</p>
	</div>
</footer>

<?php wp_footer(); ?>
<style id="wol-hide-cloudaccess">
.wol-footer-inner > p:not([class]),
.wol-footer-inner > div:not([class]),
.wol-footer :is(p, div, span, center):has(a[href*="cloudaccess.net"]),
body > p:has(a[href*="cloudaccess.net"]),
body > div:has(a[href*="cloudaccess.net"]),
body > center:has(a[href*="cloudaccess.net"]),
a[href*="cloudaccess.net"] { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; }
</style>
<noscript>
<style>
.wol-reveal,.wol-reveal.is-visible{opacity:1!important;transform:none!important;transition:none!important;filter:none!important}
.wol-hero .wol-hero__content>.wol-hero__pill,.wol-hero .wol-hero__content>h1,.wol-hero .wol-hero__content>.wol-lead,.wol-hero .wol-hero__content>.wol-hero__eyebrow,.wol-hero .wol-hero__content>.wol-hero__actions,.wol-hero .wol-hero__visual,.wol-hero .wol-hero__splash-img{animation:none!important;opacity:1!important;transform:none!important}
.wol-store-badge:active,.wol-btn:active{filter:none!important}
</style>
</noscript>
</body>
</html>
