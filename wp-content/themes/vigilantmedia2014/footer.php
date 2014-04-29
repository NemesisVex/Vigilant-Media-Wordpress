<?php
/**
 * The template for displaying the footer
 *
 * Contains footer content and the closing of the #main and #page div elements.
 *
 * @package WordPress
 * @subpackage VigilantMedia2014
 * @subpackage VigilantMedia2014 1.0
 */
?>

		</div><!-- #main -->

		<footer id="colophon" class="site-footer container" role="contentinfo">

			<?php get_sidebar( 'footer' ); ?>

			<div class="site-info">
				<?php do_action( 'vigilantmedia2014_credits' ); ?>
				<a href="<?php echo esc_url( __( 'http://wordpress.org/', 'musicwhore2014' ) ); ?>"><?php printf( __( 'Proudly powered by %s', 'musicwhore2014' ), 'WordPress' ); ?></a>
			</div><!-- .site-info -->
		</footer><!-- #colophon -->
	</div><!-- #page -->

	<?php wp_footer(); ?>
</body>
</html>