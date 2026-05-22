<?php
/**
 * Pojedynczy wpis na blogu
 *
 * @package Wolontariat_Landing
 */

if (! defined('ABSPATH')) {
	exit;
}

get_header();
?>

<article class="wol-blog-single wol-section-inner">
	<?php
	while (have_posts()) {
		the_post();
		?>
		<header class="wol-blog-single__header">
			<h1><?php the_title(); ?></h1>
			<p class="wol-blog-single__meta">
				<time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
				<?php
				if (function_exists('wolontariat_landing_get_posts_page_url')) {
					$blog_home = wolontariat_landing_get_posts_page_url();
					if ($blog_home) {
						echo ' · ';
						echo '<a href="' . esc_url($blog_home) . '">' . esc_html__('Wszystkie wpisy', 'wolontariat-landing') . '</a>';
					}
				}
				?>
			</p>
		</header>
		<div class="wol-simple__entry wol-blog-single__entry">
			<?php the_content(); ?>
		</div>
		<?php
	}
	?>
</article>

<?php
get_footer();
