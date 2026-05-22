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
		<p class="wol-footer__brand"><?php echo esc_html(get_bloginfo('name') ?: __('PomagaMY', 'wolontariat-landing')); ?></p>
		<p class="wol-footer__desc"><?php esc_html_e('Narzędzie do odkrywania spraw i ludzi wartych Twojego czasu.', 'wolontariat-landing'); ?></p>
		<ul class="wol-footer__links">
			<?php
			$privacy_url = function_exists('get_privacy_policy_url') ? get_privacy_policy_url() : '';
			$terms_url   = function_exists('wolontariat_landing_get_regulamin_url') ? wolontariat_landing_get_regulamin_url() : null;
			?>
			<li>
				<?php if (is_string($privacy_url) && $privacy_url !== '') : ?>
					<a href="<?php echo esc_url($privacy_url); ?>"><?php esc_html_e('Polityka prywatności', 'wolontariat-landing'); ?></a>
				<?php else : ?>
					<span class="wol-footer__link-placeholder" title="<?php esc_attr_e('Ustaw stronę polityki: Ustawienia → Prywatność', 'wolontariat-landing'); ?>"><?php esc_html_e('Polityka prywatności', 'wolontariat-landing'); ?></span>
				<?php endif; ?>
			</li>
			<li>
				<?php if ($terms_url) : ?>
					<a href="<?php echo esc_url($terms_url); ?>"><?php esc_html_e('Regulamin', 'wolontariat-landing'); ?></a>
				<?php else : ?>
					<span class="wol-footer__link-placeholder" title="<?php esc_attr_e('Utwórz stronę ze slugiem „regulamin”', 'wolontariat-landing'); ?>"><?php esc_html_e('Regulamin', 'wolontariat-landing'); ?></span>
				<?php endif; ?>
			</li>
		</ul>
		<p class="wol-footer__copy">&copy; <?php echo esc_html(gmdate('Y')); ?> <?php esc_html_e('Wszystkie prawa zastrzeżone.', 'wolontariat-landing'); ?></p>
	</div>
</footer>

<?php wp_footer(); ?>
<noscript>
<style>
.wol-reveal,.wol-reveal.is-visible{opacity:1!important;transform:none!important;transition:none!important;filter:none!important}
.wol-hero .wol-hero__content>.wol-hero__pill,.wol-hero .wol-hero__content>h1,.wol-hero .wol-hero__content>.wol-lead,.wol-hero .wol-hero__store-wrap,.wol-hero .wol-hero__splash-img{animation:none!important;opacity:1!important;transform:none!important}
.wol-store-badge:active,.wol-btn:active{filter:none!important}
</style>
</noscript>
</body>
</html>
