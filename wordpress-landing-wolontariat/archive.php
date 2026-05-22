<?php
/**
 * Archiwum (kategoria, tag, autor, data)
 *
 * @package Wolontariat_Landing
 */

if (! defined('ABSPATH')) {
	exit;
}

get_header();
?>

<section class="wol-section wol-blog-archive" aria-labelledby="wol-archive-heading">
	<div class="wol-section-inner wol-blog-archive__inner">
		<h1 id="wol-archive-heading"><?php the_archive_title(); ?></h1>
		<?php the_archive_description('<div class="wol-blog-archive__intro wol-archive-desc">', '</div>'); ?>

		<?php if (have_posts()) : ?>
			<ul class="wol-blog-list" role="list">
				<?php
				while (have_posts()) {
					the_post();
					?>
					<li>
						<article <?php post_class('wol-blog-card'); ?>>
							<h2 class="wol-blog-card__title">
								<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
							</h2>
							<p class="wol-blog-card__meta">
								<time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
							</p>
							<div class="wol-blog-card__excerpt">
								<?php the_excerpt(); ?>
							</div>
							<a class="wol-blog-card__more" href="<?php the_permalink(); ?>"><?php esc_html_e('Czytaj dalej', 'wolontariat-landing'); ?></a>
						</article>
					</li>
					<?php
				}
				?>
			</ul>
			<div class="wol-blog-pagination">
				<?php
				the_posts_pagination(
					array(
						'mid_size'  => 2,
						'prev_text' => __('Poprzednia', 'wolontariat-landing'),
						'next_text' => __('Następna', 'wolontariat-landing'),
					)
				);
				?>
			</div>
		<?php else : ?>
			<p class="wol-blog-empty"><?php esc_html_e('Brak wpisów w tym archiwum.', 'wolontariat-landing'); ?></p>
		<?php endif; ?>
	</div>
</section>

<?php
get_footer();
