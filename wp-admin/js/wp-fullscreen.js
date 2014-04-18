/* global deleteUserSetting, setUserSetting, switchEditors, tinymce, tinyMCEPreInit */
/**
 * PubSub
 *
 * A lightweight publish/subscribe implementation.
 * Private use only!
 */
( function( $, window ) {
	var api, ps, s, toggleUI, uiTimer, PubSub,
		uiScrollTop = 0,
		transitionend = 'transitionend webkitTransitionEnd',
		$body = $( document.body ),
		$document = $( document );

PubSub = function() {
	this.topics = {};
};

PubSub.prototype.subscribe = function( topic, callback ) {
	if ( ! this.topics[ topic ] )
		this.topics[ topic ] = [];

	this.topics[ topic ].push( callback );
	return callback;
};

PubSub.prototype.unsubscribe = function( topic, callback ) {
	var i, l,
		topics = this.topics[ topic ];

	if ( ! topics )
		return callback || [];

	// Clear matching callbacks
	if ( callback ) {
		for ( i = 0, l = topics.length; i < l; i++ ) {
			if ( callback == topics[i] )
				topics.splice( i, 1 );
		}
		return callback;

	// Clear all callbacks
	} else {
		this.topics[ topic ] = [];
		return topics;
	}
};

PubSub.prototype.publish = function( topic, args ) {
	var i, l, broken,
		topics = this.topics[ topic ];

	if ( ! topics )
		return;

	args = args || [];

	for ( i = 0, l = topics.length; i < l; i++ ) {
		broken = ( topics[i].apply( null, args ) === false || broken );
	}
	return ! broken;
};

/**
 * Distraction Free Writing
 * (wp-fullscreen)
 *
 * Access the API globally using the fullscreen variable.
 */

(function($){
	var api, ps, bounder, s, timer, block, set_title_hint;

	// Initialize the fullscreen/api object
	fullscreen = api = {};

	// Create the PubSub (publish/subscribe) interface.
	ps = api.pubsub = new PubSub();
	timer = 0;
	block = false;

	s = api.settings = { // Settings
		visible : false,
		mode : 'tinymce',
		editor_id : 'content',
		title_id : '',
		timer : 0,
		toolbar_shown : false
	};

	function _hideUI() {
		$body.removeClass('wp-dfw-show-ui');
	}

	/**
	 * Bounder
	 *
	 * Creates a function that publishes start/stop topics.
	 * Used to throttle events.
	 */
	toggleUI = api.toggleUI = function( show ) {
		clearTimeout( uiTimer );

		if ( ! $body.hasClass('wp-dfw-show-ui') || show === 'show' ) {
			$body.addClass('wp-dfw-show-ui');
		} else if ( show !== 'autohide' ) {
			$body.removeClass('wp-dfw-show-ui');
		}

		if ( show === 'autohide' ) {
			uiTimer = setTimeout( _hideUI, 2000 );
		}

		if ( block )
			return;

		block = true;

		setTimeout( function() {
			block = false;
		}, 400 );

		if ( s.timer )
			clearTimeout( s.timer );
		else
			ps.publish( start );

		function timed() {
			ps.publish( stop );
			s.timer = 0;
		}

		s.timer = setTimeout( timed, delay );
	};

	/**
	 * on()
	 *
	 * Turns fullscreen on.
	 *
	 * @param string mode Optional. Switch to the given mode before opening.
	 */
	api.on = function() {
		var id, $dfwWrap, titleId;

		if ( s.visible ) {
			return;

		// Settings can be added or changed by defining "wp_fullscreen_settings" JS object.
		if ( typeof(wp_fullscreen_settings) == 'object' )
			$.extend( s, wp_fullscreen_settings );

		s.editor_id = wpActiveEditor || 'content';

		if ( $('input#title').length && s.editor_id == 'content' )
			s.title_id = 'title';
		else if ( $('input#' + s.editor_id + '-title').length ) // the title input field should have [editor_id]-title HTML ID to be auto detected
			s.title_id = s.editor_id + '-title';
		else
			$('#wp-fullscreen-title, #wp-fullscreen-title-prompt-text').hide();

		s.mode = $('#' + s.editor_id).is(':hidden') ? 'tinymce' : 'html';
		s.qt_canvas = $('#' + s.editor_id).get(0);

		if ( ! s.element )
			api.ui.init();

		s.is_mce_on = s.has_tinymce && typeof( tinymce.get(s.editor_id) ) != 'undefined';

		api.ui.fade( 'show', 'showing', 'shown' );
	};

	/**
	 * off()
	 *
	 * Turns fullscreen off.
	 */
	api.off = function() {
		if ( ! s.visible )
			return;

		api.ui.fade( 'hide', 'hiding', 'hidden' );
	};

	/**
	 * switchmode()
	 *
	 * @return string - The current mode.
	 *
	 * @param string to - The fullscreen mode to switch to.
	 * @event switchMode
	 * @eventparam string to   - The new mode.
	 * @eventparam string from - The old mode.
	 */
	api.switchmode = function( to ) {
		var from = s.mode;

		if ( ! to || ! s.visible || ! s.has_tinymce )
			return from;

		// Don't switch if the mode is the same.
		if ( from == to )
			return from;

		ps.publish( 'switchMode', [ from, to ] );
		s.mode = to;
		ps.publish( 'switchedMode', [ from, to ] );

		return to;
	};

	/**
	 * General
	 */

	api.save = function() {
		var $hidden = $('#hiddenaction'),
			oldVal = $hidden.val(),
			$spinner = $('#wp-fullscreen-save .spinner'),
			$saveMessage = $('#wp-fullscreen-save .wp-fullscreen-saved-message'),
			$errorMessage = $('#wp-fullscreen-save .wp-fullscreen-error-message');

		$spinner.show();
		$errorMessage.hide();
		$saveMessage.hide();
		$hidden.val('wp-fullscreen-save-post');

		if ( s.editor && ! s.editor.isHidden() ) {
			s.editor.save();
		}

		spinner.show();
		api.savecontent();

		hidden.val('wp-fullscreen-save-post');

		$.post( ajaxurl, $('form#post').serialize(), function(r){
			spinner.hide();
			message.show();

			setTimeout( function(){
				message.fadeOut(1000);
			}, 3000 );

			if ( r.last_edited )
				$('#wp-fullscreen-save input').attr( 'title',  r.last_edited );

		}, 'json');

		if ( pixels && pixels.toString().indexOf('%') !== -1 ) {
			s.$editorContainer.css( 'width', pixels );
			s.$statusbar.css( 'width', pixels );

			if ( s.$dfwTitle ) {
				s.$dfwTitle.css( 'width', pixels );
			}
			return;
		}

		if ( ! pixels ) {
			// Reset to theme width
			width = $('#wp-fullscreen-body').data('theme-width') || 800;
			s.$editorContainer.width( width );
			s.$statusbar.width( width );

	api.savecontent = function() {
		var ed, content;

		if ( s.title_id )
			$('#' + s.title_id).val( $('#wp-fullscreen-title').val() );

		if ( s.mode === 'tinymce' && (ed = tinymce.get('wp_mce_fullscreen')) ) {
			content = ed.save();
		} else {
			content = $('#wp_mce_fullscreen').val();
		}

		$('#' + s.editor_id).val( content );
		$(document).triggerHandler('wpcountwords', [ content ]);
	};

	set_title_hint = function( title ) {
		if ( ! title.val().length )
			title.siblings('label').css( 'visibility', '' );
		else
			title.siblings('label').css( 'visibility', 'hidden' );
	};

	api.dfw_width = function(n) {
		var el = $('#wp-fullscreen-wrap'), w = el.width();

		if ( !n ) { // reset to theme width
			el.width( $('#wp-fullscreen-central-toolbar').width() );
			deleteUserSetting('dfw_width');
			return;
		}

		s.$editorContainer.width( width );
		s.$statusbar.width( width );

		if ( w < 200 || w > 1200 ) // sanity check
			return;

		el.width( w );
		setUserSetting('dfw_width', w);
	};

	ps.subscribe( 'showToolbar', function() {
		s.toolbars.removeClass('fade-1000').addClass('fade-300');
		api.fade.In( s.toolbars, 300, function(){ ps.publish('toolbarShown'); }, true );
		$('#wp-fullscreen-body').addClass('wp-fullscreen-focus');
		s.toolbar_shown = true;
	});

	ps.subscribe( 'hideToolbar', function() {
		s.toolbars.removeClass('fade-300').addClass('fade-1000');
		api.fade.Out( s.toolbars, 1000, function(){ ps.publish('toolbarHidden'); }, true );
		$('#wp-fullscreen-body').removeClass('wp-fullscreen-focus');
	});

	ps.subscribe( 'toolbarShown', function() {
		s.toolbars.removeClass('fade-300');
	});

	// This event occurs while the overlay blocks the UI.
	ps.subscribe( 'showing', function() {
		$body.addClass( 'wp-fullscreen-active' );
		s.$dfwWrap.addClass( 'wp-fullscreen-wrap' );

		if ( s.title_id ) {
			title = $('#wp-fullscreen-title').val( $('#' + s.title_id).val() );
			set_title_hint( title );
		}

		$('#wp-fullscreen-save input').attr( 'title',  $('#last-edit').text() );

		// Show the UI for 2 sec. when opening
		toggleUI('autohide');

		if ( s.has_tinymce && s.mode === 'tinymce' )
			tinymce.execCommand('wpFullScreenInit');

		s.orig_y = $(window).scrollTop();
	});

	ps.subscribe( 'showing', function() { // This event occurs while the DFW overlay blocks the UI.
		$( document.body ).addClass( 'fullscreen-active' );
		api.refresh_buttons();

		if ( 'ontouchstart' in window ) {
			api.dfwWidth( '90%' );
		} else {
			api.dfwWidth( $( '#wp-fullscreen-body' ).data('dfw-width') || 800, true );
		}

		// scroll to top so the user is not disoriented
		scrollTo(0, 0);

		// needed it for IE7 and compat mode
		$('#wpadminbar').hide();
	});

	ps.subscribe( 'shown', function() { // This event occurs after the DFW overlay is shown
		var interim_init;

		s.visible = true;

		// init the standard TinyMCE instance if missing
		if ( s.has_tinymce && ! s.is_mce_on ) {

			interim_init = function(mce, ed) {
				var el = ed.getElement(), old_val = el.value, settings = tinyMCEPreInit.mceInit[s.editor_id];

				if ( settings && settings.wpautop && typeof(switchEditors) != 'undefined' )
					el.value = switchEditors.wpautop( el.value );

				ed.onInit.add(function(ed) {
					ed.hide();
					ed.getElement().value = old_val;
					tinymce.onAddEditor.remove(interim_init);
				});
			};

			tinymce.onAddEditor.add(interim_init);
			tinymce.init(tinyMCEPreInit.mceInit[s.editor_id]);

			s.is_mce_on = true;
		}

		wpActiveEditor = 'wp_mce_fullscreen';
	});

	ps.subscribe( 'hide', function() { // This event occurs before the overlay blocks DFW.
		var htmled_is_hidden = $('#' + s.editor_id).is(':hidden');
		// Make sure the correct editor is displaying.
		if ( s.has_tinymce && s.mode === 'tinymce' && !htmled_is_hidden ) {
			switchEditors.go(s.editor_id, 'tmce');
		} else if ( s.mode === 'html' && htmled_is_hidden ) {
			switchEditors.go(s.editor_id, 'html');
		}

	ps.subscribe( 'hiding', function() { // This event occurs while the overlay blocks the DFW UI.
		$body.removeClass( 'wp-fullscreen-active' );

		$( document ).unbind( '.fullscreen' );
		$(s.textarea_obj).unbind('.grow');

		s.$dfwWrap.removeClass( 'wp-fullscreen-wrap' );
		s.$editorContainer.css( 'width', '' );
		s.$dfwTextarea.add( '#' + s.id + '_ifr' ).height( s.origHeight );

		if ( s.title_id )
			set_title_hint( $('#' + s.title_id) );

		s.qt_canvas.value = s.textarea_obj.value;
	});

	ps.subscribe( 'hiding', function() { // This event occurs while the overlay blocks the DFW UI.

		$( document.body ).removeClass( 'fullscreen-active' );
		scrollTo(0, s.orig_y);
		$('#wpadminbar').show();
	});

	ps.subscribe( 'hidden', function() { // This event occurs after DFW is removed.
		s.visible = false;
		$('#wp_mce_fullscreen, #wp-fullscreen-title').removeAttr('style');

		if ( s.has_tinymce && s.is_mce_on )
			tinymce.execCommand('wpFullScreenClose');

		s.textarea_obj.value = '';
		api.oldheight = 0;
		wpActiveEditor = s.editor_id;
	});

	ps.subscribe( 'switchMode', function( from, to ) {
		var ed;

		if ( !s.has_tinymce || !s.is_mce_on )
			return;

		ed = tinymce.get('wp_mce_fullscreen');

		if ( from === 'html' && to === 'tinymce' ) {

			if ( tinymce.get(s.editor_id).getParam('wpautop') && typeof(switchEditors) != 'undefined' )
				s.textarea_obj.value = switchEditors.wpautop( s.textarea_obj.value );

			if ( 'undefined' == typeof(ed) )
				tinymce.execCommand('wpFullScreenInit');
			else
				ed.show();

		} else if ( from === 'tinymce' && to === 'html' ) {
			if ( ed )
				ed.hide();
		}
	});

	ps.subscribe( 'switchedMode', function( from, to ) {
		api.refresh_buttons(true);

		if ( to === 'html' )
			setTimeout( api.resize_textarea, 200 );
	});

	/**
	 * Buttons
	 */
	api.b = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('Bold');
	};

	api.i = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('Italic');
	};

	api.ul = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('InsertUnorderedList');
	};

	api.ol = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('InsertOrderedList');
	};

	api.link = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('WP_Link');
		else
			wpLink.open();
	};

	api.unlink = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('unlink');
	};

	api.atd = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('mceWritingImprovementTool');
	};

	api.help = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('WP_Help');
	};

	api.blockquote = function() {
		if ( s.has_tinymce && 'tinymce' === s.mode )
			tinymce.execCommand('mceBlockQuote');
	};

	api.medialib = function() {
		if ( typeof wp !== 'undefined' && wp.media && wp.media.editor )
			wp.media.editor.open(s.editor_id);
	};

	api.refresh_buttons = function( fade ) {
		fade = fade || false;

		if ( s.mode === 'html' ) {
			$('#wp-fullscreen-mode-bar').removeClass('wp-tmce-mode').addClass('wp-html-mode')
				.find('a').removeClass( 'active' ).filter('.wp-fullscreen-mode-html').addClass( 'active' );

			if ( fade )
				$('#wp-fullscreen-button-bar').fadeOut( 150, function(){
					$(this).addClass('wp-html-mode').fadeIn( 150 );
				});
			else
				$('#wp-fullscreen-button-bar').addClass('wp-html-mode');

		} else if ( s.mode === 'tinymce' ) {
			$('#wp-fullscreen-mode-bar').removeClass('wp-html-mode').addClass('wp-tmce-mode')
				.find('a').removeClass( 'active' ).filter('.wp-fullscreen-mode-tinymce').addClass( 'active' );

			if ( fade )
				$('#wp-fullscreen-button-bar').fadeOut( 150, function(){
					$(this).removeClass('wp-html-mode').fadeIn( 150 );
				});
			else
				$('#wp-fullscreen-button-bar').removeClass('wp-html-mode');
		}
	};

	/**
	 * UI Elements
	 *
	 * Used for transitioning between states.
	 */
	api.ui = {
		init: function() {
			var toolbar;

			s.toolbar = toolbar = $('#fullscreen-topbar');
			s.$fullscreenFader = $('#fullscreen-fader');
			s.$statusbar = $('#wp-fullscreen-status');
			s.hasTinymce = typeof tinymce !== 'undefined';

			if ( !s.has_tinymce )
				$('#wp-fullscreen-mode-bar').hide();

			$document.keyup( function(e) {
				var c = e.keyCode || e.charCode, modKey;

				if ( !fullscreen.settings.visible )
					return true;

				if ( navigator.platform && navigator.platform.indexOf('Mac') !== -1 ) {
					modKey = e.ctrlKey; // Ctrl key for Mac
				} else {
					modKey = e.altKey; // Alt key for Win & Linux
				}

				if ( modKey && ( 61 === c || 107 === c || 187 === c ) ) { // +
					api.dfwWidth( 25 );
					e.preventDefault();
				}

				if ( modKey && ( 45 === c || 109 === c || 189 === c ) ) { // -
					api.dfwWidth( -25 );
					e.preventDefault();
				}

				if ( modKey && 48 === c ) { // 0
					api.dfwWidth( 0 );
					e.preventDefault();
				}
			});

			$document.on( 'keydown.wp-fullscreen', function( event ) {
				if ( 27 === event.which && s.visible ) { // Esc
					api.off();
					event.stopImmediatePropagation();
				}
			});

			if ( 'ontouchstart' in window ) {
				$body.addClass('wp-dfw-touch');
			}

			toolbar.on( 'mouseenter', function() {
				toggleUI('show');
			}).on( 'mouseleave', function() {
				toggleUI('autohide');
			});

			// Bind buttons
			$('#wp-fullscreen-buttons').on( 'click.wp-fullscreen', 'button', function( event ) {
				var command = event.currentTarget.id ? event.currentTarget.id.substr(6) : null;

				if ( s.editor && 'tinymce' === s.mode ) {
					switch( command ) {
						case 'bold':
							s.editor.execCommand('Bold');
							break;
						case 'italic':
							s.editor.execCommand('Italic');
							break;
						case 'bullist':
							s.editor.execCommand('InsertUnorderedList');
							break;
						case 'numlist':
							s.editor.execCommand('InsertOrderedList');
							break;
						case 'link':
							s.editor.execCommand('WP_Link');
							break;
						case 'unlink':
							s.editor.execCommand('unlink');
							break;
						case 'help':
							s.editor.execCommand('WP_Help');
							break;
						case 'blockquote':
							s.editor.execCommand('mceBlockQuote');
							break;
					}
				} else if ( command === 'link' && window.wpLink ) {
					window.wpLink.open();
				}

					if ( k == last )
						return true;

					if ( 13 == k || 8 == last || 46 == last )
						$(document).triggerHandler('wpcountwords', [ txtarea.val() ]);

					last = k;
					return true;
				});
			}

			topbar.mouseenter(function(){
				s.toolbars.addClass('fullscreen-make-sticky');
				$( document ).unbind( '.fullscreen' );
				clearTimeout( s.timer );
				s.timer = 0;
			}).mouseleave(function(){
				s.toolbars.removeClass('fullscreen-make-sticky');

				if ( s.visible )
					$( document ).bind( 'mousemove.fullscreen', function(e) { bounder( 'showToolbar', 'hideToolbar', 2000, e ); } );
			});
		},

		fade: function( before, during, after ) {
			if ( ! s.element )
				api.ui.init();

			// If any callback bound to before returns false, bail.
			if ( before && ! ps.publish( before ) )
				return;

			api.fade.In( s.element, 600, function() {
				if ( during )
					ps.publish( during );

				api.fade.Out( s.element, 600, function() {
					if ( after )
						ps.publish( after );
				});
			});
		}
	};

	api.fade = {
		transitionend: 'transitionend webkitTransitionEnd oTransitionEnd',

		// Sensitivity to allow browsers to render the blank element before animating.
		sensitivity: 100,

		In: function( element, speed, callback, stop ) {

			callback = callback || $.noop;
			speed = speed || 400;
			stop = stop || false;

			if ( api.fade.transitions ) {
				if ( element.is(':visible') ) {
					element.addClass( 'fade-trigger' );
					return element;
				}

				element.show();
				element.first().one( this.transitionend, function() {
					callback();
				});
				setTimeout( function() { element.addClass( 'fade-trigger' ); }, this.sensitivity );
			} else {
				if ( stop )
					element.stop();

				element.css( 'opacity', 1 );
				element.first().fadeIn( speed, callback );

				if ( element.length > 1 )
					element.not(':first').fadeIn( speed );
			}

			return element;
		},

		Out: function( element, speed, callback, stop ) {

			callback = callback || $.noop;
			speed = speed || 400;
			stop = stop || false;

			if ( ! element.is(':visible') )
				return element;

			if ( api.fade.transitions ) {
				element.first().one( api.fade.transitionend, function() {
					if ( element.hasClass('fade-trigger') )
						return;

					element.hide();
					callback();
				});
				setTimeout( function() { element.removeClass( 'fade-trigger' ); }, this.sensitivity );
			} else {
				if ( stop )
					element.stop();

				element.first().fadeOut( speed, callback );

				if ( element.length > 1 )
					element.not(':first').fadeOut( speed );
			}

			return element;
		},

		transitions: (function() { // Check if the browser supports CSS 3.0 transitions
			var s = document.documentElement.style;

			return ( typeof ( s.WebkitTransition ) == 'string' ||
				typeof ( s.MozTransition ) == 'string' ||
				typeof ( s.OTransition ) == 'string' ||
				typeof ( s.transition ) == 'string' );
		})()
	};

	/**
	 * Resize API
	 *
	 * Automatically updates textarea height.
	 */

	api.bind_resize = function() {
		s.$dfwTextarea.on( 'keydown.wp-dfw-resize click.wp-dfw-resize paste.wp-dfw-resize', function() {
			api.resizeTextarea();
		});
	};

	api.resizeTextarea = function() {
		var node = s.$dfwTextarea[0];

		newheight = txt.scrollHeight > 300 ? txt.scrollHeight : 300;

		if ( newheight != api.oldheight ) {
			txt.style.height = newheight + 'px';
			api.oldheight = newheight;
		}
	};

})(jQuery);
