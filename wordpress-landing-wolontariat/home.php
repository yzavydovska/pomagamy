<?php
/**
 * Lista wpisów bloga (Wyświetlana gdy w Ustawienia → Czytanie wybrano „Stronę z wpisami”).
 *
 * @package Wolontariat_Landing
 */

if (! defined('ABSPATH')) {
	exit;
}

get_header();

$posts_page_id = (int) get_option('page_for_posts');
$archive_title = $posts_page_id ? get_the_title($posts_page_id) : __('Blog', 'wolontariat-landing');
?>

<section class="wol-section wol-blog-archive" aria-labelledby="wol-blog-heading">
	<div class="wol-section-inner wol-blog-archive__inner">
		<h1 id="wol-blog-heading"><?php echo esc_html($archive_title); ?></h1>
		<p class="wol-blog-archive__intro">
			<?php esc_html_e('Aktualności i informacje o aplikacji PomagaMY oraz wolontariacie.', 'wolontariat-landing'); ?>
		</p>

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
								<?php
								$cats = get_the_category();
								if (! empty($cats)) {
									echo ' · ';
									echo esc_html($cats[0]->name);
								}
								?>
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
			<p class="wol-blog-empty"><?php esc_html_e('Brak opublikowanych wpisów. Dodaj pierwszy wpis w panelu „Wpisy → Dodaj nowy”.', 'wolontariat-landing'); ?></p>
		<?php endif; ?>
	</div>
</section>

<?php
get_footer();
