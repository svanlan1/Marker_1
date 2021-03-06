/************************************************************************
*	Create the context menu that gets created anytime a pin is dropped
************************************************************************/
function createContextMenu(el, e, val, prev, prevObj, bool) {
	//Determine context menu ID and positioning
	if(bool) {
		var id = 'marker_context_menu' + $(el).attr('data-annotate-count'),
			top = $(el).css('top'),
			winWidth = $(window).width(),
			left;
		if($('#' + id).length === 0) {
			if(e) {
				if((e.pageX + 427) > winWidth) {
					left = winWidth - 450 + 'px';
				} else {
					left = e.pageX + 35 + 'px';
				}
			} else {
				left = $(el).css('left');
			}
			if(prev) {
				count = prevObj.count;
			} else {
				count = mCount;
			}
			//Create the shell and give it the proper associated ID, make it draggable
			var menu = $('<div />').addClass('marker_context_menu').css({
				'left': left,
				'top': top
			}).attr('role', 'dialog').attr('id', id).attr('data-annotate-dialog-count', $(el).attr('data-annotate-count')).draggable({
	      		stop: function() {
	      		}
		    }).css('position', 'absolute').appendTo('body');

			//Add close button to the context menu
			var close = $('<a />').attr({
				'class': 'marker_context_close',
				'href': 'javascript:void(0)'
			}).html('<span class="screen-reader-only">Close context menu for number' + $(el).attr('data-annotate-count') + '</span><img src="'+chrome.extension.getURL('images/close.png')+'" alt="" />').click(function(e) {
				hideMenu('marker_context_menu' + $(el).attr('data-annotate-count'));
			}).appendTo(menu);

			//Create the context menu heading
			$('<h2 />').addClass('annotate marker_drag').attr('tabindex', '-1').text('Add notes').appendTo(menu);

			//Create the context menu container and iframe
			var iframediv = $('<div />').addClass('annotate-context-menu-iframe-container').appendTo(menu);
			var iframe = $('<iframe />').css('display', 'none').addClass('annotate-context-iframe').attr('id', 'annotate-context-menu-' + $(el).attr('data-annotate-count')).appendTo(iframediv);
			var iframeStuff = $('#annotate-context-menu-' + $(el).attr('data-annotate-count'))[0].contentWindow.document;
			var ifBody = $(iframeStuff).find('body');

			//Add the CSS files to the results panel
			append_scripts_to_head('', $(iframeStuff).find('head'));

			//Draw the context menu content		
			var infoDiv = $('<div />').addClass('annotate marker_info').appendTo(ifBody);
			if(localStorage.getItem('set') === 'a11y' || localStorage.getItem('set') === 'html' || localStorage.getItem('set') === "custom") {
				$('<label />').attr('for', 'marker_select_box_' + count).addClass('marker_required marker_label').text('Type of element?').appendTo(infoDiv);
				add_marker_select_options(infoDiv, el, val, prev, prevObj);
				$('<label />').attr('for', 'marker_textarea_' + count).addClass('marker_required marker_label').text('Notes').appendTo(infoDiv);
				$('<textarea />').addClass('marker_textarea_notes').attr('id', 'marker_textarea_' + count).appendTo(infoDiv);
				$('.annotate-context-menu-iframe-container:visible').css('height', '390px');			
			} else {
				$('<label />').attr('for', 'marker_textarea_' + count).addClass('marker_required marker_label').text('Notes').appendTo(infoDiv);
				$('<textarea />').addClass('marker_textarea_notes').attr('id', 'marker_textarea_' + count).appendTo(infoDiv);
				var h = $(infoDiv).height();
				var he = h + 85;
				$('.annotate-context-menu-iframe-container:visible').css('height', '305px');
				$('.marker_context_menu:visible').css('height', '335px');				
			}
					
			$('<button />').addClass('annotate marker_fun_btn marker_save_note_btn').attr('value', 'Save Note').text('Save').click(function(e) {
				hideMenu('marker_context_menu' + $(el).attr('data-annotate-count'));
			}).appendTo(ifBody);
			$('<button />').addClass('annotate marker_fun_btn').attr('value', 'Delete').text('Delete this flag').click(function(e) {
				$(el).remove();
				$(mifBody).find('.marker_side_text_selection').eq($(mifBody).find('.marker_side_text_selection').length-1).remove();
				$(menu).remove();
				mCount--;
			}).appendTo(ifBody);
			$('#' + id).find('iframe').ready(function() {
				$('#' + id).find('iframe').fadeIn('fast');
			});
		} else {
			showMenu(id, val);
		}
		if(prev) {
			var x = $('#annotate-context-menu-' + prevObj.count)[0].contentWindow.document;
			var xBody = $(x).find('body');
			console.log($(xBody).height());
			$(x).find('#marker_textarea_'+prevObj.count).text(unescape(prevObj['notes']));
			$(x).find('#marker_select_box_'+prevObj.count).val(prevObj['qRec']);

			/*var h = $(infoDiv).height();
			var he = h + 95;
			$('.annotate-context-menu-iframe-container:visible').css('height', he + 'px');
			$('.marker_context_menu:visible').css('height', he + 'px');	*/

			$('#' + id).hide();
		}
	}
}

/************************************************************************
*	Add the select box to the context menu and populate it
************************************************************************/
function add_marker_select_options(divItem, el, selVal, prev, prevObj) {
	//Call getOptions() to get the proper array of list option values
	var options = getOptions();

	if(prev) {
		count = prevObj.count;
	} else {
		count = mCount;
	}

	//Draw the select box 
	var sel = $('<select />').attr('id', 'marker_select_box_' + count).attr('aria-required', 'true').appendTo(divItem);
	var d = $('<div />').addClass('annotate marker_recommendation').attr('id', 'marker_select_text_div_' + count).appendTo(divItem);
	var a = $('<a />').addClass('annotate-a11y-rec-a marker_anchor').attr('aria-expanded', 'true').click(function(e) {
		if($(this).attr('aria-expanded') === 'false') {
			$(this).parent().find('.marker_recommendation_div').show();
			$(this).attr('aria-expanded', 'true');
		} else {
			$(this).parent().find('.marker_recommendation_div').hide();
			$(this).find('.annotate-a11y-rec-note').text('[ collapsed ]');
			$(this).attr('aria-expanded', 'false');
		}
		
	}).appendTo(d);
	var strong = $('<strong />').addClass('recommendations').text('Recommendation').css('display', 'none').appendTo(a);
	var span = $('<span />').addClass('annotate-a11y-rec-note').appendTo(strong);
	$('<option />').attr('value', '').text('').appendTo(sel);
	$(options).each(function(i,v) {
		if(localStorage.getItem('set') === "custom") {
			$('<option />').attr('value', v.name).attr('data-annotate-rec', v.rec).attr('data-annotate-example', v.ex).text(v.name).appendTo(sel);
		} else {
			$('<option />').attr('value', v.Value).attr('data-annotate-rec', v.Recommendation).attr('data-annotate-example', v.Example).text(v.QuickName).appendTo(sel);
		}
		
	});

	$(sel).change(function() {
		var val = $(this).val();
		if(val === "") {
			$(divItem).find('.annotate-a11y-rec-a, .annotate-rec-ex, .marker_recommendation_div').hide();
		} else {
			$(this).find('option').each(function(i,v) {
				if(val === $(v).attr('value')) {
					var recDiv = $('<div />').addClass('annotate marker_recommendation_div').html($(v).attr('data-annotate-rec'));
					var exDiv = $('<div />').addClass('annotate marker_recommendation_div').text($(v).attr('data-annotate-example'));
					$(strong).show();
					$(example_strong).show();
					$(this).parent(0).parent().parent().find('.marker_ele_type').text($(v).text());
					$(this).parent().parent().find('.marker_recommendation_div, .annotate-rec-ex').remove();
					$(this).parent().parent().find('.marker_recommendation').append(recDiv);
					var example_strong = $('<strong />').addClass('recommendations annotate-rec-ex').text('Example');
					$(this).parent().parent().find('.marker_recommendation').append(example_strong);
					$(this).parent().parent().find('.marker_recommendation').append(exDiv);
					$(a).show();
					return false;
				}
			});			
		}

		var h = $(divItem).height();
		var he = h + 95;
		$('.annotate-context-menu-iframe-container:visible').css('height', he + 'px');
		$('.marker_context_menu:visible').css('height', he + 'px');		
	});
	var type = el.nodeName;
	var text = $(el).text();
	if(selVal) {
		$(sel).val(selVal);
		$(sel).change();
	}
}