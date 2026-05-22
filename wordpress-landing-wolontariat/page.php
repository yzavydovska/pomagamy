<?php
/**
 * Szablon pojedynczej strony
 */

if (! defined('ABSPATH')) {
	exit;
}

get_header();
?>
<article class="wol-simple wol-section-inner">
	<?php
	while (have_posts()) {
		the_post();
		?>
		<h1><?php the_title(); ?></h1>
		<div class="wol-simple__entry">
			<?php the_content(); ?>
		</div>
		<?php
	}
	?>
</article>
<?php
get_footer();
