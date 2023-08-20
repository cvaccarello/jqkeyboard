
$.fn.caret = function (start, end) {
	var $el = this,
		el = $el[0],
		ss = 'selectionStart' in el;

	if (!/(email|number)/i.test(el.type)) {
		if (ss) {
			el.selectionStart = start;
			el.selectionEnd = end || start;
		}
	}

	setTimeout(() => { $el.focus(); }, 1);

	return this;
}


// NOTE:  the following can be added to inputs in order to lightly control keyboard
//			'.no-keyboard' - keyboard won't be opened when interacting with an input of this class

class Keyboard {
	constructor(configuration) {
		// configuration for this keyboard is saved here
		this.configuration = $.extend({}, {
			title: 'Virtual Keyboard',

			disabled: false,

			draggable: true,

			fixed_position: {
				left: undefined,
				top: undefined
			},

			// how long to lock a key from being touch again, in milliseconds
			key_delay: 100,

			key_map: {
				placeholder: {
					name: '&nbsp;'
				},
				shift: {
					name: 'Shift'
				},
				meta1: {
					name: '&123'
				},
				meta2: {
					name: '#+='
				},
				normal: {
					name: 'ABC'
				},
				tab: {
					name: 'Tab',
					onKeyPressed: this.keyPressedTab
				},
				accept: {
					name: 'Accept',
					onKeyPressed: this.keyPressedAccept
				},
				ok: {
					name: 'ok',
					onKeyPressed: this.keyPressedAccept
				},
				enter: {
					name: 'Enter',
					onKeyPressed: this.keyPressedEnter
				},
				bksp: {
					name: '&#8678;',
					onKeyPressed: this.keyPressedDelete
				},
				space: {
					name: '&nbsp;',
					onKeyPressed: this.keyPressedSpace
				},
				done: {
					name: 'Done',
					onKeyPressed: this.keyPressedDone
				},
				clear: {
					name: 'Clear',
					onKeyPressed: this.keyPressedClear
				}
			},

			layout: {
				default: {
					normal: [
						'q w e r t y u i o p {bksp}',
						'{tab} a s d f g h j k l {placeholder}',
						'{shift} z x c v b n m , . {shift}',
						'{meta1} {space} {done}'
					],
					shift: [
						'Q W E R T Y U I O P {bksp}',
						'{tab} A S D F G H J K L {placeholder}',
						'{shift} Z X C V B N M ! ? {shift}',
						'{meta1} {space} {done}'
					],
					meta1: [
						'1 2 3 4 5 6 7 8 9 0 {bksp}',
						'{tab} - / : ; ( ) $ & @ {placeholder}',
						'{meta2} . , ? ! \' " {meta2}',
						'{normal} {space} {done}'
					],
					meta2: [
						'[ ] { } # % ^ * + = {bksp}',
						'{tab} _ \\ | ~ < > &euro; &pound; &yen; {placeholder}',
						'{meta1} . , ? ! \' " {meta1}',
						'{normal} {space} {done}'
					]
				},
				textarea: {
					normal: [
						'q w e r t y u i o p {bksp}',
						'{tab} a s d f g h j k l {enter}',
						'{shift} z x c v b n m , . {shift}',
						'{meta1} {space} {done}'
					],
					shift: [
						'Q W E R T Y U I O P {bksp}',
						'{tab} A S D F G H J K L {enter}',
						'{shift} Z X C V B N M ! ? {shift}',
						'{meta1} {space} {done}'
					],
					meta1: [
						'1 2 3 4 5 6 7 8 9 0 {bksp}',
						'{tab} - / : ; ( ) $ & @ {enter}',
						'{meta2} . , ? ! \' " {meta2}',
						'{normal} {space} {done}'
					],
					meta2: [
						'[ ] { } # % ^ * + = {bksp}',
						'{tab} _ \\ | ~ < > &euro; &pound; &yen; {enter}',
						'{meta1} . , ? ! \' " {meta1}',
						'{normal} {space} {done}'
					]
				},
				email: {
					// allowed symbols....
					// '` ~ # $ % ^ & * + _ - = |',
					// '{ } \\ / ? ! \'',
					normal: [
						'q w e r t y u i o p {bksp}',
						'{tab} a s d f g h j k l {placeholder}',
						'{shift} z x c v b n m @ . {shift}',
						'{meta1} _ - {space} .com {done}'
					],
					shift: [
						'Q W E R T Y U I O P {bksp}',
						'{tab} A S D F G H J K L {placeholder}',
						'{shift} Z X C V B N M @ . {shift}',
						'{meta1} _ - {space} .com {done}'
					],
					meta1: [
						'1 2 3 4 5 6 7 8 9 0 {bksp}',
						'{tab} | { } % ^ * / \\ \' {placeholder}',
						'` $ & ~ # = + @ .',
						'{normal} ! ? {space} .com {done}'
					]
				},
				number: {
					normal: [
						'7 8 9 {bksp}',
						'4 5 6 {tab}',
						'1 2 3',
						'0 . {accept}'
					]
				},
				tel: {
					normal: [
						'7 8 9 {bksp}',
						'4 5 6 {tab}',
						'1 2 3',
						'0 - {accept}'
					]
				}
			},

			classes: {
				keyboard_class: 'virtual-keyboard',
				key_class: 'virtual-key'
			},

			selectors: {
				keyboard_class: '.virtual-keyboard',
				key_class: '.virtual-key'
			}
		}, configuration);

		this.ignore_types = '[type="checkbox"], ' +
							'[type="radio"], ' + 
							'[type="submit"], ' + 
							'[type="reset"], ' + 
							'[type="button"], ' + 
							'[type="color"], ' + 
							'[type="range"], ' + 
							'[type="date"], ' + 
							'[type="month"], ' + 
							'[type="week"], ' + 
							'[type="time"], ' + 
							'[type="datetime-local"], ' + 
							'.no-keyboard, ' + 
							'.disabled, ' + 
							'.is-disabled, ' + 
							'[disabled]';

		// hold reference to body & html elements
		this.$body = $('body');
		this.$html = $('html');

		// hidden element to convert special html characters with
		this.$hidden = $('<span>');

		// will hold the keyboard dom object
		this.$keyboards = this._createKeyboards();

		// remember which keyboard is active
		this.$keyboard = null;

		// remember which input is active
		this.$input = null;

		// DEPRECATED: store initial input for "cancel" button
		this.original_input_text = null;

		// type of keyboard being displayed (mostly for optimization purposes)
		this.current_keyboard_layout = '';
		this.current_keyboard_type = '';

		// reference to interval loop to be cleared on mouseup and set on mousedown
		this.repeaterTimeout = null;
		this.repeaterInterval = null;
		this.disable_key_repeat = false;

		// user-controlled moving keyboard
		this.moving = false;
		this.mouse_position = { x: 0, y: 0 };
		this.keyboard_transform_position = { x: 0, y: 0 };
		this.keyboard_start_transform_position = { x: 0, y: 0 };
		this.keyboard_dimensions = { width: 0, height: 0 };

		// screen dimensions used for containing the $keyboard element
		//	(using the HTML element to ignore scrollbar width, however this won't work with height, nothing will work I guess? ... )
		this.screen_width = this.$html.outerWidth();
		this.screen_height = window.innerHeight;

		// body margin can effect $keyboard if position isn't static, so we need to get this information
		this.body_position = this.$body.css('position');
		this.body_margin = { left: 0, top: 0 };
		if (this.body_position !== 'static') {
			this.body_margin.left += parseInt(this.$body.css('margin-left'));
			this.body_margin.top += parseInt(this.$body.css('margin-top'));
		}

		// remember last key pressed in order to provide a brief delay before key can be pressed again
		this.last_key_down = {
			time: Date.now(),
			value: ''
		};
	}

	activate() {
		$(document).on('click touchend', 'input, textarea', (e) => {
			var $target = $(e.currentTarget);

			// don't open a keyboard for these input types
			if ($target.is(this.ignore_types)) { return; }

			// also don't re-open keyboard for the same input (messes up cancel button, DEPRECATED)
			if ($target.is(this.$input)) { return; }

			// close keyboard if opened
			if (this.isOpened) { this.closeKeyboard(); }

			// if keyboard is enabled, show keyboard
			if (!this.configuration.disabled) {
				this.openKeyboard($target);
			}
		});

		$(document).on('mousedown touchstart', (e) => {
			var keyboard_selector = this.configuration.selectors.keyboard_class;
			var $target = $(e.target);

			// don't close keyboard for the same input or on special multi-touch overlay from the electron-touch-framework
			if ($target.is(this.$input) || $target.is('.etf-blocker')) { return; }

			// close keyboard if it's already open, and not if the event happens within the keyboard itself
			if (this.isOpened && !$target.closest(keyboard_selector).length) {
				this.closeKeyboard();
			}
		});


		$(document).on('mousedown touchstart', '.virtual-keyboard-title', (e) => {
			// turn movement flag on, so that global events can be used (don't want them to always be firing off a bunch of code)
			this.moving = true;

			this.mouse_position = this._getMousePosition(e);

			if (this.configuration.draggable) {
				this.keyboard_start_transform_position = this.keyboard_transform_position;
			}

			// try to prevent highlighting of text while dragging....
			this.$body.addClass('is-dragging-virtual-keyboard');

			// set indicator on keyboard
			this.$keyboard.addClass('is-dragging');
		});

		$(document).on('mousemove touchmove', (e) => {
			if (this.moving) {
				// this prevent default is important, we don't want the screen to move when trying to move the keyboard
				e.preventDefault();

				// get the current mouse position, then translate coordinates into x,y transform coordinates
				var {x, y} = this._getMousePosition(e);
				var x = this.keyboard_start_transform_position.x + (x - this.mouse_position.x);
				var y = this.keyboard_start_transform_position.y + (y - this.mouse_position.y);
				var left = parseInt(this.$keyboard.css('left'));
				var top = parseInt(this.$keyboard.css('top'));

				// add transform coords + normal left/top coords
				var offset = this._containWithinScreen({
					x: left + x,
					y: top + y,
					width: this.keyboard_dimensions.width,
					height: this.keyboard_dimensions.height
				});

				// contain coordinate within the screen space available
				x += offset.x;
				y += offset.y;

				// remember offset for later if/when this keyboard closes
				this.keyboard_transform_position = { x, y };

				this.$keyboard.css({
					'transform': 'translate(' + x + 'px, ' + y + 'px)'
				});
			}
		});

		$(document).on('mouseup touchend', (e) => {
			// if there was a key being repeated, end repeating
			//	NOTE:  Must be at a global level instead of on a specific button b/c of how buttons can be hidden when toggling between keyboards
			this.removeKeyRepeater();

			// if keyboard was/is moving, finalize movement end
			if (this.moving) {
				this.moving = false;
				this.$body.removeClass('is-dragging-virtual-keyboard');
				this.$keyboard.removeClass('is-dragging');
			}

			// put focus back on input element
			if (this.isOpened && this.$input) { this.$input.focus(); }
		});
	}

	reconfigure(configuration) {
		// set new configuration
		this.configuration = $.extend(true, {}, this.configuration, configuration);

		// close previous keyboard
		this.closeKeyboard();

		// need to recreate keyboards based on new configurations
		this.$keyboards = this._createKeyboards();
	}

	get isOpened() {
		return (!!this.$keyboard && !!this.$keyboard.parent().length);
	}

	get isFixed() {
		return (!isNaN(this.configuration.fixed_position.left) && !isNaN(this.configuration.fixed_position.top));
	}

	openKeyboard($element) {
		// remember what input the keyboard is currently open on
		this.$input = $element.addClass('is-focus-virtual-input').focus();
		this.original_input_text = this.$input.val();

		// get keyboard type / layout
		this.current_keyboard_type = this._getType(this.$input);
		this.current_keyboard_layout = Object.keys(this.configuration.layout[this.current_keyboard_type])[0];

		// get a single keyboard out of the $keyboards jquery list
		this.$keyboard = this.$keyboards.filter('[data-keyboard-type="' + this.current_keyboard_type + '"]');

		// make sure keyboard is reset to the first layout in that keyboard type
		this.$keyboard
			.children()
			.hide()
			.filter('[data-layout-type="' + this.current_keyboard_layout + '"]')
			.show();


		// only position keyboard to element if position flag is set
		if (!this.isFixed) {
			this._appendPositionedKeyboard();
		} else {
			this.$keyboard.appendTo(this.$body).css({
				position: 'fixed',
				top: this.configuration.fixed_position.top + 'px',
				left: this.configuration.fixed_position.left + 'px'
			});

			// save dimensions of the current keyboard for dragging purposes
			this.keyboard_dimensions = { width: this.$keyboard.outerWidth(), height: this.$keyboard.outerHeight() };
		}

		// only mess with transform if draggable flag is true
		if (this.configuration.draggable) {
			if (!this.isFixed) {
				// make sure the transform is reset (in case the keyboard was moved)
				this.$keyboard.css({
					'transform': 'translate(0)'
				});
			} else {
				// if keyboard is draggable, re-apply any transform
				this.$keyboard.css({
					'transform': 'translate(' + this.keyboard_transform_position.x + 'px, ' + this.keyboard_transform_position.y + 'px)'
				});
			}
		}
	}

	// whole point of all this madness is so that we can shift removal/closing of keyboard to the touchend event when fired from touchstart keyboard keys
	// w/o this, the keyboard is detached and no touchend event gets fired, thus locking things open b/c they expect a touchend event to fire
	touchendDelayedCloseKeyboard() {
		var finalize = () => {
			this.closeKeyboard();
			$(document).off('touchend', finalize);
		};

		$(document).on('touchend', finalize);
	}

	closeKeyboard() {
		if (this.$keyboard) { this.$keyboard.detach(); }
		if (this.$input) { this.$input.removeClass('is-focus-virtual-input'); }
		this.resetKeyboard();
	}

	resetKeyboard() {
		this.$input = null;
		this.original_input_text = null;

		// reset everything involved with moving around the keyboard
		this.keyboard_dimensions = { width: 0, height: 0 };
		if (this.configuration.draggable && !this.isFixed) {
			this.keyboard_transform_position = { x: 0, y: 0 };
			this.keyboard_start_transform_position = { x: 0, y: 0 };
		}
	}

	switchLayout(e) {
		var $key = $(e.currentTarget);
		var key_selector = this.configuration.selectors.key_class;
		var key = $key.attr('data-value');
		var layout = $key.attr('data-layout-type');

		// if already on the current layout, toggle back to the first layout option
		if (layout == this.current_keyboard_layout) {
			layout = Object.keys(this.configuration.layout[this.current_keyboard_type])[0];
		}

		// switch between which layout is visible, and add select state to appropriate button
		this.$keyboard
			.children('[data-layout-type="' + this.current_keyboard_layout + '"]')
			.hide()
			.find('.is-selected').removeClass('is-selected');
		this.$keyboard
			.children('[data-layout-type="' + layout + '"]')
			.show()
			.find(key_selector + '[data-layout-type="' + layout + '"]').addClass('is-selected');

		// set new layout
		this.current_keyboard_layout = layout;
	}

	setKeyPressedClass(e) {
		var $button = $(e.currentTarget);
		$button.addClass('was-clicked');
		setTimeout(() => { $button.removeClass('was-clicked'); }, 50);
	}

	setKeyRepeater(keyPressedFunction) {
		// enable key repeater
		this.disable_key_repeat = false;

		// call the function required to make this key work (at this time the key repeater can be disabled)
		keyPressedFunction.call(this);

		// clear previous repeater calls, if any exist
		this.removeKeyRepeater();

		// if key repeater is not disabled, repeat key after a short delay
		if (!this.disable_key_repeat) {
			this.repeaterTimeout = setTimeout(() => {
				this.repeaterInterval = setInterval(() => {
					keyPressedFunction.call(this);
				}, 100);
			}, 800);
		}
	}

	removeKeyRepeater(keyPressedFunction) {
		clearTimeout(this.repeaterTimeout);
		clearInterval(this.repeaterInterval);
	}

	keyPressed(e) {
		if (!this.$input) { return; }
		var $target = $(e.currentTarget);
		var key = $target.attr('data-value');
		var cpt = this._getCursorPositionAndText();
		var val = cpt.start.val + key + cpt.end.val;

		var max = this.$input.attr('maxlength');

		// don't go over the maxlength of the 'input' field
		if (max && val.length > max) {
			return;
		}

		this.$input.val(val);
		this.$input.caret(cpt.start.pos + key.length);
	}

	keyPressedDelete(e) {
		var cpt = this._getCursorPositionAndText();
		var val = '';

		// either remove the character to the left of the cursor, or just delete a chunk of highlighed text
		if (cpt.start.pos === cpt.end.pos) {
			cpt.start.pos -= 1;
			val = cpt.start.val.substr(0, cpt.start.pos) + cpt.end.val;
		} else {
			val = cpt.start.val + cpt.end.val;
		}

		this.$input.val(val);
		this.$input.caret(cpt.start.pos);
	}

	keyPressedSpace(e) {
		var cpt = this._getCursorPositionAndText();
		var val = cpt.start.val + ' ' + cpt.end.val;
		var max = this.$input.attr('maxlength');

		// don't go over the maxlength of the 'input' field
		if (max && val.length > max) {
			return;
		}

		this.$input.val(val);
		this.$input.caret(cpt.start.pos + 1);
	}

	keyPressedCancel(e) {
		// don't repeat this key
		this.disable_key_repeat = true;
		this.$input.val(this.original_input_text);
		this.touchendDelayedCloseKeyboard();
	}

	keyPressedDone(e) {
		// don't repeat this key
		this.disable_key_repeat = true;
		this.touchendDelayedCloseKeyboard();
	}

	keyPressedClear(e) {
		// don't repeat this key
		this.disable_key_repeat = true;
		this.$input.val('');
		// this.touchendDelayedCloseKeyboard();
	}

	keyPressedAccept(e) {
		// don't repeat this key
		this.disable_key_repeat = true;
		this.touchendDelayedCloseKeyboard();
	}

	keyPressedEnter(e) {
		var cpt = this._getCursorPositionAndText();
		var val = cpt.start.val + '\n' + cpt.end.val;
		var max = this.$input.attr('maxlength');

		// don't go over the maxlength of the 'input' field
		if (max && val.length > max) {
			return;
		}

		this.$input.val(val);
		this.$input.caret(cpt.start.pos + 1);
	}

	keyPressedTab(e) {
		var $inputs = $('input, textarea');

		// don't repeat this key
		this.disable_key_repeat = true;

		// get the next "input" after the current one
		var $next_input = $($inputs.get($inputs.index(this.$input) + 1));
		if ($next_input && $next_input.length) {
			this.closeKeyboard();

			// for some reason, need a short delay before focus can be given? not sure why...
			setTimeout(() => { $next_input.focus(); }, 1);

			if (!$next_input.is(this.ignore_types)) {
				// if keyboard is enabled, show keyboard
				if (!this.configuration.disabled) {
					this.openKeyboard($next_input);
				}
			}
		}


		// special hack b/c the original element will have been removed per the closeKeyboard call above, and thus no touchend is fired and thus blocker is never removed
		var finalize = () => {
			$('.etf-blocker').hide();
			$(document).off('touchstart', finalize);
		};

		$(document).on('touchstart', finalize);
	}







	/*****************************************************/
	/******            Private Functions            ******/
	/*****************************************************/

	/**
	* Given an element, return what type of keyboard is/should be connected to it
	* @params {$input} - element connected to keyboard
	* @returns {String} - type of keyboard to use based on $input
	**/
	_getType($input) {
		var type = this.$input.attr('data-keyboard-type') || this.$input.attr('type') || this.$input.prop('tagName').toLowerCase();

		// if keyboard type is not in configuration, set default
		return (this.configuration.layout[type] && !(type in this.configuration.layout[type]))? type: 'default';
	}

	// create all the keyboards possible given the configuration,
	//		however only a few of them will be used
	_createKeyboards() {
		var keyboard_class = this.configuration.classes.keyboard_class;
		var key_class = this.configuration.classes.key_class;

		var $keyboards = $();

		for (let keyboard_type_key in this.configuration.layout) {
			let keyboard_type = this.configuration.layout[keyboard_type_key];
			var $keyboard = $('<div>');

			$keyboard
				.attr('data-keyboard-type', keyboard_type_key)
				.addClass(keyboard_class);

			if (!!this.configuration.draggable) {
				$keyboard.addClass('is-draggable');
			}

			for (let layout_key in keyboard_type) {
				let layout_type = keyboard_type[layout_key];
				var $layout = $('<div>');

				$layout.attr('data-layout-type', layout_key);

				// add a title to keyboard (will be used as something to click on to move the keyboard)
				if (!!this.configuration.draggable) {
					$layout.append('<div class="virtual-keyboard-title">' + this.configuration.title + '</div>');
				}

				// create rows of keys
				for (let row_key in layout_type) {
					let row = layout_type[row_key];
					var $row = $('<div>');

					for (let key of row.split(' ')) {
						var $button = $('<button>');
						var key_name = key;

						// key functionality
						if (key[0] === '{' && key.length > 1) {
							// special case key functionality
							var layout = key = key.substr(1, key.length - 2);
							var custom = false;

							// check for custom mappings of key names and special functions that may be available to use
							if (key in this.configuration.key_map) {
								if (this.configuration.key_map[key].name) {
									key_name = this.configuration.key_map[key].name;
								}

								if (this.configuration.key_map[key].onKeyPressed) {
									custom = true;
									$button.data('customFunction', this.configuration.key_map[key].onKeyPressed);
								}
							}

							if (custom) {
								$button
									.attr('data-layout-type', layout)
									.on('mousedown touchstart', (e) => {
										var value = $(e.currentTarget).attr('data-value');

										// need to prevent default so that only 1 event is fired (not both mouse and touch)
										// e.preventDefault();

										// prevents key actions from occuring based on key_delay
										if (this.last_key_down.value == value && Date.now() - this.last_key_down.time < this.configuration.key_delay) {
											return;
										}

										// remember the current time & value of button press
										this.last_key_down = {
											time: Date.now(),
											value
										};

										this.setKeyRepeater(() => {
											// get and call a custom function with the context of 'this' class
											var customFunction = $(e.currentTarget).data('customFunction');
											customFunction.call(this, e);
											this.setKeyPressedClass(e);
										});
									});
							} else {
								$button
									.attr('data-layout-type', layout)
									.on('mousedown touchstart', (e) => {
										var value = $(e.currentTarget).attr('data-value');

										// need to prevent default so that only 1 event is fired (not both mouse and touch)
										e.preventDefault();

										// prevents key actions from occuring based on key_delay
										if (this.last_key_down.value == value && Date.now() - this.last_key_down.time < this.configuration.key_delay) {
											return;
										}

										// remember the current time & value of button press
										this.last_key_down = {
											time: Date.now(),
											value
										};

										this.setKeyRepeater(() => {
											this.switchLayout(e);
											this.setKeyPressedClass(e);
										});
									});
							}
						} else {
							// normal key functionality
							$button
								.on('mousedown touchstart', (e) => {
										var value = $(e.currentTarget).attr('data-value');

										// need to prevent default so that only 1 event is fired (not both mouse and touch)
										e.preventDefault();

										// prevents key actions from occuring based on key_delay
										if (this.last_key_down.value == value && Date.now() - this.last_key_down.time < this.configuration.key_delay) {
											return;
										}

										// remember the current time & value of button press
										this.last_key_down = {
											time: Date.now(),
											value
										};

									this.setKeyRepeater(() => {
										this.keyPressed(e);
										this.setKeyPressedClass(e);
									});
								});
						}

						// setup button with some generalized stuff
						$button
							.addClass(key_class)
							.html(key_name)
							.attr('data-value', this.$hidden.html(key).text())
							.appendTo($row);
					}

					$row.appendTo($layout);
				}

				$layout.appendTo($keyboard);
			}

			$keyboards = $keyboards.add($keyboard);
		}

		return $keyboards;
	}

	// position and append keyboard to the body of the page
	_appendPositionedKeyboard() {
		var input_offset = this.$input.offset();
		var input_width = this.$input.outerWidth();
		var input_height = this.$input.outerHeight();

		// ghost keyboard to get dimensions, so that it can be pushed into the viewable screen
		this.$keyboard.css('visibility', 'hidden').appendTo(this.$body);

		// save dimensions of the current keyboard for dragging purposes
		this.keyboard_dimensions = { width: this.$keyboard.outerWidth(), height: this.$keyboard.outerHeight() };

		var scroll_offset = this.$body.scrollTop();
		var offset = this._containWithinScreen({
			x: input_offset.left,
			y: input_offset.top + input_height,
			width: this.keyboard_dimensions.width,
			height: this.keyboard_dimensions.height
		});

		// shift keyboard over if out of bounds (if not out of bounds the value is 0 and won't matter)
		input_offset.left += offset.x;

		// keyboard is out of bounds on the bottom of the page, flip up so that it can be seen
		if (offset.y < 0) {
			// need to handle label so that keyboard doesn't cover it
			var $label = this.$input.parent().closest('label');
			if (!$label.length) { $label = $('label[for="' + this.$input.attr('id') + '"]'); }

			if ($label.length) {
				var label_offset = $label.offset();
				input_offset.top -= (input_offset.top - label_offset.top);
			}

			input_offset.top -= input_height + this.keyboard_dimensions.height;
		}

		this.$keyboard.css({
			visibility: 'visible',
			top: input_offset.top + input_height - this.body_margin.top + 'px',
			left: input_offset.left - this.body_margin.left + 'px'
		});
	}

	// not a typical "get" as it does a lot of other stuff, so you really want to "get" once and remember for later
	_getCursorPositionAndText() {
		var val = '';

		if (this.$input) {
			val = this.$input.val();
		}

		// Input type "email" and "number" don't support selectionStart & selectionEnd
		try {
			var start_pos = this.$input[0].selectionStart;
			var end_pos = this.$input[0].selectionEnd;
		} catch (error) {
			var start_pos = val.length;
			var end_pos = val.length;
		}

		// need to splice value in half, and insert key input between the given selection
		var start_val = val.substr(0, start_pos);
		var end_val = val.substr(end_pos, val.length);

		return {
			start: {
				pos: start_pos,
				val: start_val
			},
			end: {
				pos: end_pos,
				val: end_val
			}
		}
	}

	// the mouse coordinates are different depending on a standard event or a special touch event
	_getMousePosition(e) {
		var pageX = e.pageX, pageY = e.pageY;
		if (isNaN(pageX) || isNaN(pageY)) {
			pageX = e.touches[0].pageX;
			pageY = e.touches[0].pageY;
		}
		return { x: pageX, y: pageY };
	}

	// object can be either a simple point (x, y) or a box (x, y, width, height)
	//		NOTE:  Currently not handling horizontal scrolling as an optimization
	_containWithinScreen(obj) {
		var scroll_offset = this.$body.scrollTop();
		var x = 0, y = 0;

		// make sure obj has a width / height value
		obj.width = (obj.width)? obj.width: 0;
		obj.height = (obj.height)? obj.height: 0;

		// account for any offset on the body element (I suppose if the keyboard isn't being added to the body, this wouldn't be wise or necessary...)
		obj.x += this.body_margin.left;
		obj.y += this.body_margin.top;

		if (obj.x < 0) {
			x = -obj.x;
		} else if (obj.x + obj.width > this.screen_width) {
			x = this.screen_width - (obj.x + obj.width);
		}

		if (obj.y < 0 + scroll_offset) {
			y = scroll_offset - obj.y;
		} else if (obj.y + obj.height > this.screen_height + scroll_offset) {
			y = (this.screen_height + scroll_offset) - (obj.y + obj.height);
		}

		return { x, y }
	}
}




// save global reference to keyboard in case someone needs to access functions or change something
var VirtualKeyboard;

(() => {
	// // load in CSS file
	// $('head').append('<link href="../src/keyboard.css" rel="stylesheet">');

	VirtualKeyboard = new Keyboard();
	VirtualKeyboard.activate();
})();
