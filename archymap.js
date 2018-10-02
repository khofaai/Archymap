/*!
 * archymap v1.0.0
 * Author : Anas EL ALAMI<anaselalamikh@gmail.com>
 * github : khofaai
 */
(function($) {
	$.archymap = function(element, options) {
		'use strict';
		var win = $(window);
		var doc = $(document);
		var defaultOptions = {
			map:{name: "Init map",core: []},
			colors:{background:[],text:[]},
			icons:{
				plus:'zmdi zmdi-plus',
				minus:'zmdi zmdi-minus',
				zoomOut:'zmdi zmdi-time-restore-setting'
			}
		};

		var $target = $(element);
		var Archy = this;
		var $Archy = $(this);
		var settings = {};
		var original_name = '';
		var cardColors = {};

		Archy.init = function() 
		{
			settings = $.extend({}, defaultOptions, options);
			if(typeof options !== 'undefined' && (!$.isEmptyObject(options)) && !$.isEmptyObject(settings.map.core) ) {
				Archy.build(settings.map);
			} else {
				console.error('someting went wrong')
			}
		}

		Archy.destroy = function() {

		}

		Archy.build = function(map, new_site = false) 
		{
			var content = Archy.getContent(map.core,'',new_site);
			var hide = '';
			var empty = false;

			if(map.core === null){ 
				hide = ' hide';
				empty = true;
			}

			$target.append( Archy.generator.getMapContainer(hide, map.name, content) );
			$(Archy.generator.getMapExporters()).insertBefore($target.parent());

			if(new_site){
				$(".new-span").focus();
			}
		}

		Archy.getContent = function(core, first = '', new_site = false)  
		{
			var html =''
			if(typeof core === 'object') {
				$(core).each(function(el, elem) {
					if(typeof elem.core === 'object'  && elem.core !== null) {
						elem.parent = 0;
						elem.order = el;
						var span = Archy.generator.getMapSpan({element:elem,bottom:false},1);
						html += '<div class="archymap-view-child'+(core.length == 1? ' alone-child alone-parent' : '')+'">'
									+'<div class="archymap-view">'
										+'<div class="archymap-view-parent">'+span+'</div>'
										+'<div class="archymap-view-children">'+Archy.getCore(elem.core,elem.name)+'</div>'
									+'</div>'
								+'</div>'
					} else {
						elem.order = el;
						var span = Archy.generator.getMapSpan({element:elem,bottom:true,isNew:new_site},1);
						html += '<div class="archymap-view-child'+(new_site || core.length == 1? ' alone-child alone-parent' : '')+'">'
									+'<div class="archymap-view" data-parentid="0">'
										+'<div class="archymap-view-parent span-parent">'+span+'</div>'
									+'</div>'
								+'</div>'
					}
				});
			} 
			return html;
		}

		Archy.getCore = function(core, elem, lvl = 2) 
		{
			var _html = ''
			$(core).each(function(c,chld){
				var bottom = true
				if(typeof chld.core === 'object' && chld.core !== null){bottom = false;}
				var _span = Archy.generator.getMapSpan({element:chld,bottom:bottom},lvl);
				if(typeof chld.core === 'object' && chld.core !== null){
					var _noafter = '';
					if(core.length == 1){_noafter = 'alone-child'}
					_html += '<div class="archymap-view-child '+_noafter+'">'
								+'<div class="archymap-view">'
									+'<div class="archymap-view-parent">'+_span+'</div>'
									+'<div class="archymap-view-children">'+Archy.getCore(chld.core,chld.name,(lvl+1))+'</div>'
								+'</div>'
							+'</div>'
				} else {
					_html += '<div class="archymap-view-child '+(core.length == 1 ? 'alone-child' : '')+'"><div class="archymap-view-parent span-parent">'+_span+'</div></div>'
				}
			});
			return _html;
		}

		Archy.actionsOff = function () {
			$target.off('click','.archymap-add-element.left');
			$target.off('click','.archymap-add-element.right');
			$target.off('click','.archymap-add-element.bottom');
			$target.off('click','.delete_element');
		}

		Archy.SelectText = function (element) {

		    var range, selection;

		    if (doc.body.createTextRange) {
		    
		        range = doc.body.createTextRange();
		        range.moveToElementText(element);
		        range.select();
		    } else if (win.getSelection) {

		        selection = win.getSelection();
		        range = doc.createRange();

		        range.selectNodeContents(doc.getElementById(element.attr('id')));
		        selection.removeAllRanges();
		        selection.addRange(range);
		    }
		}

		Archy.actions = function() {
			
			Archy.actionsOff();

			$target.on('click','.archymap-add-element.left', function() {
				var $self = $(this);
				
				var parentView = $self.parents('.archymap-view-child:first');
				if(parentView.hasClass('alone-parent')) {
					parentView.removeClass('alone-parent');
					if(parentView.parents('.archymap-view-child:first').length <= 1) {
						parentView.removeClass('alone-child');
					}
				}

				$(".new-span").removeClass('new-span');
				
				var firstChildren = $self.parents('.archymap-view-children:first');
				firstChildren.find('.archymap-view-child:first').removeClass('alone-child');

				var data = $self.data();
				var CHILD = Archy.generator.createChild({
								parent: data.parentid,
								isNew: true,
								order: data.order,
								lvl: data.lvl
							});
				$(CHILD).insertBefore($self.parents('.archymap-view-child:first'));
				
				firstChildren.find('.new-span').focus();

				Archy.preventLoad();
			});

			$target.on('click','.archymap-add-element.right', function() {
				var $self = $(this);

				var parentView = $self.closest('.archymap-view-child');
				var card = parentView.find('p:first');
				
				parentView.removeClass('alone-parent');

				var data = $self.data();
				
				$(".new-span").removeClass('new-span');
				$self.parents('.archymap-view-children:first')
						.find('.archymap-view-child:first')
						.removeClass('alone-child');
				
				var firstChild = $self.parents('.archymap-view-child:first')
				firstChild.removeClass('alone-child');
				
				var CHILD = Archy.generator.createChild({
					parent: data.parent,
					isNew: true,
					order: data.order+1,
					lvl: data.lvl
				});
				var newChild = $(CHILD).insertAfter(firstChild);
				
				var p = $self.parents('.archymap-view-children').find('p.new-span');
				p.focus();
				
				Archy.preventLoad();
			});

			$target.on('click','.archymap-add-element.bottom', function(){
				var $self = $(this);

				$(".new-span").removeClass('new-span');
				var firstParent = $self.parents('.archymap-view-parent:first');
				firstParent.find('.bottom').fadeOut(0);
				var span = firstParent.html();
				var parent = $self.parents('.archymap-view-child:first');
				$self.parents('.archymap-view-child:first').empty();
				
				var data = $self.data();
				var CHILD = Archy.generator.createChild({
					parent: data.cardid,
					isNew:true,
					alone:'alone-child',
					lvl:data.lvl
				});

				parent.append(
					'<div class="archymap-view">'
						+'<div class="archymap-view-parent">'+span+'</div>'
						+'<div class="archymap-view-children">'+CHILD+'</div>'
					+'</div>'
				);
				Archy.preventLoad();
				parent.find('.new-span').focus();
			});

			$target.on('click',".delete_element", function(e){
				e.preventDefault();

				$(this).parent().find('p').addClass('delete').unbind('focusout');

				var level = $(this).data('level');
				var card = $(this).parents('.simple-card:first');
				var view = $(card).parents('.archymap-view-child:first');
				var children = $(view).parents('.archymap-view-children:first');
				$(view).remove();
				if(children.children().length == 1){
					var alone_view = children.find('.archymap-view-child:first');
					alone_view.addClass('alone-child');
					if(alone_view.parents(".archymap-view-child:first").length == 0){
						alone_view.addClass('alone-parent');
					}
				} else if(children.children().length == 0) {
					var view_parent = children.parents(".archymap-view");
					if(view_parent.length > 1){
						view_parent.find('.archymap-view-parent:last').addClass('span-parent');
						view_parent.find('.bottom').fadeIn(-1);
					} else {
						$(".archymap-container").remove();
						$(".archymap-zoom").remove();
						
					}
				} else {

					var view = children.parent('.archymap-view:first');
					var parent = view.find(".archymap-view-parent:first");
					var views_children = view.find('.archymap-view-children');
					if(views_children.children().length == 1){
						views_children.find('.archymap-view-child').addClass('alone-child');
					}
					parent.find('.bottom').fadeIn(-1);
					if(children.children().length == 0){
						children.remove();
					}
				}
				window.onbeforeunload = null;	
			});
		}

		Archy.cardActions = function() {
			$target.off('focus','[contenteditable=true]');
			$target.off('focusout','[contenteditable=true]');
			$target.off('keydown','[contenteditable=true]');
			
			$target.on('focus','[contenteditable=true]',function(){

				$(".archymap-add-element").removeClass('ste-hover');
				$(this).parent().find(".archymap-add-element,.archymap-drop").addClass('ste-hover');
				original_name = $(this).text();

				var simple = $(this).parent('.simple-card').addClass('simple-focus');

				simple.find('.archymap-options').fadeOut(200);
				simple.find('.archymap-drop').fadeOut(200);
			});

			$target.on('focusout','[contenteditable=true]',function() {

				var $this = $(this);

				if($this.text() === ''){
					$this.parent().addClass('empty');
				} else {
					$this.parent().removeClass('empty');
				}
				$(".archymap-add-element,.archymap-drop").addClass('ste-hover');

				if($this.text() !== original_name || original_name === '' || typeof $this.data('duplication') !== 'undefined'){
					
					Archy.preventLoad();
					
					var hasError = $this.parent('.simple-card');
					
					hasError.removeClass('has-error');
					
					if($this.text() === ''){
					
						hasError.addClass('has-error');
					}

				}
				var simple = $this.parent('.simple-card');
				simple.removeClass('simple-focus');
				simple.removeAttr('style');
				simple.find('.archymap-options').fadeIn(200);
				simple.find('.archymap-drop').fadeIn(200);
				
				$target.find('.archymap-add-element').addClass('hide');
				$target.find('.archymap-add-element:not(.bottom)').removeAttr('style')
				
				setTimeout(function(){
					$target.find('.archymap-add-element').removeClass('hide');
				},0);
			});

			$target.on('keydown',"[contenteditable=true]", function(e) {

				$(this).attr('placeholder','');
				if($(this).text() === ''){
					$(this).attr('placeholder','card name');
				}
				if($(this).text() !== original_name){
					Archy.preventLoad();
				}
				var simple = $(this).parent('.simple-card');
				simple.removeClass('empty');
				simple.addClass('simple-focus')
				if(e.keyCode == 13){
					e.preventDefault();
					$(this).blur();
					$(".archymap-add-element,archymap-drop").addClass('ste-hover');
				}
			});
		}

		Archy.preventLoad = function() {
			window.onbeforeunload = function() {
		        return "Dude, are you sure you want to leave? Think of the kittens!";
		    }
		}

		Archy.calculatePercent = function(scale) {

			$(".archymap-wrapper").css('transform','scale('+scale+')');
			$('.archymap-scale').each(function(){
				$(this).data('scale',scale);
			});

			var percent = Math.round(100*scale);
			$target.find('.archymap-options').css('transform','scale('+(100/percent)+')').css('z-index',99999);
			$("#archymap-zoom-percent").text(percent+'%');
		}

		Archy.calculateZoom = function(dataScale, margin) {
			var scale = parseFloat(parseFloat(dataScale) + margin);
			Archy.calculatePercent(scale);
		}

		Archy.zoomAction = function() {

			doc.off('click','#archymap-zoomin');
			doc.off('click','#archymap-zoomout');
			doc.off('click','.archymap-zoomreset');

			doc.on('click',"#archymap-zoomin",function(){
				if($(this).data('scale') <= 1.5){
					Archy.calculateZoom($(this).data('scale'),0.1);
				}
			});
			doc.on('click',"#archymap-zoomout",function(){
				if($(this).data('scale') >= .6){
					Archy.calculateZoom($(this).data('scale'),-0.1);
				}
			});
			doc.on('click',".archymap-zoomreset",function(){
				$(".archymap-wrapper").css('transform','scale(1)');
				$('.archymap-scale').each(function(){
					$(this).data('scale',1);
				});
				$target.find('.archymap-options').css('transform','scale(1)');
				$("#archymap-zoom-percent").text((100)+'%');
			});
		}

		Archy.randomColor = function() {
			var index = Math.floor(Math.random()*settings.colors.background.length)
			return {
				bgColor:settings.colors.background[index],
				color:settings.colors.text[index]
			}
		}

		Archy.generator = {
			getMapContainer:function(hide, name, content) {
				return 	'<div class="archymap-container'+hide+'">'
							+'<div class="archymap-wrapper">'
								+'<div class="archymap-view">'
									+'<div class="archymap-view-parent first">'
										+'<span class="simple-card" style="display:none">'+name+'</span>'
									+'</div>'
									+'<div class="archymap-view-children">'+content+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
			},
			getMapExporters:function() {
				return '<div class="archymap-zoom">'
							+'<ul class="list-inline m-0">'
								+'<li>'
									+'<a href="javascript:;" class="archymap-zoomreset"><i class="'+settings.icons.zoomOut+'"></i></a>'
								+'</li>'
								+'<li>'
									+'<a data-scale="1" class="archymap-scale" href="javascript:;" id="archymap-zoomout"><i class="'+settings.icons.minus+'"></i></a>'
								+'</li>'
								+'<li>'
									+'<span id="archymap-zoom-percent">100%</span>'
								+'</li>'
								+'<li>'
									+'<a data-scale="1" class="archymap-scale" href="javascript:;" id="archymap-zoomin"><i class="'+settings.icons.plus+'"></i></a>'
								+'</li>'
							+'</ul>'
						+'</div>'
						+'<div class="archymap-loader">'
							+'<div class="col-xs-12 infinitescrolling-loading m-t-10 text-center">'
								+'<div class="kontent-loader"></div>'
								+'<span class="archymap-export-comment"></span>'
							+'</div>'
						+'</div>';
			},
			getMapSpan:function(spanOptions, lvl = 2) {
			
				var defaultOpt = {
					element:{
						id:0,
						name:'',
						parent:0
					},
					bottom:true,
					isNew:false
				};

				var opts = $.extend({}, defaultOpt, spanOptions);
				var elmid = opts.element.id;
				var order = opts.element.order;
				var parent = opts.element.parent;
				var bottom = '';
				var left = '';
				var right = '';
				var new_span = '';
				var label = '';

				if(opts.isNew) { 
					new_span = 'new-span'; 
					label = '<a href="javascript:;" data-level="'+opts.lvl+'" class="delete_element archymap-card-status archymap-status-danger zmdi zmdi-close-circle"></a>';
				}

				if(opts.bottom) {
					bottom = this.createElement({
						position: 'bottom', 
						id: elmid,
						isNew: opts.isNew,
						lvl: parseInt(lvl+1)
					});
				}

				var inputHolder = '';
				if(typeof spanOptions.name !== 'undefined'){
					opts.element.name = spanOptions.name;
					inputHolder = ' placeholder_title'
				}
				if (typeof cardColors['cardLvl'+lvl] === 'undefined') {
					cardColors['cardLvl'+lvl] = Archy.randomColor();
				}
				var styleCard = 'background-color:'+cardColors['cardLvl'+lvl].bgColor;
				var styleP = 'color:'+cardColors['cardLvl'+lvl].color;
				var span = 	'<div class="layer-simple-card">'
								+'<div data-level="'+lvl+'" class="simple-card archymap-card-'+elmid+' '+new_span+'" style="'+styleCard+'">'
									+ label
									+'<p id="card_'+elmid
										+'" style="'+styleP+'"'
										+'" data-order="'+order
										+'" data-parentid="'+parent
										+'" data-cardid="'+elmid
										+'" class="'+new_span+inputHolder+'" '
										+'" contenteditable=\'true\'"'
										+' placeholder="'+(typeof spanOptions.name === 'undefined' ? 'card name' : spanOptions.name)
										+'"'
									+'>'
										+opts.element.name
									+'</p>'
									
									+this.createElement({
										position:'left',
										id:elmid,
										order:order,
										parent:parent,
										isNew:opts.isNew,
										lvl:lvl
									})
									
									+bottom
									
									+this.createElement({
										position:'right',
										id:elmid,
										order:order,
										parent:parent,
										isNew:opts.isNew,
										lvl:lvl
									})
								+'</div>'
							+'</div>'
				return span;	
			},
			createElement:function(options) {
				
				var extraData = ' ';

				if(options.position !== 'bottom') {
					extraData = ' data-order="'+options.order+'" data-parentid="'+options.parent+'" ';
				}

				return '<a href="javascript:;" data-lvl="'+options.lvl+'" data-cardid="'+options.id+'""'+extraData+' class="archymap-add-element ste-hover '+options.position+' '+(options.new ? 'hide' : '')+'"><i class="'+settings.icons.plus+'"></i></a>';
			},
			createChild:function( options ) {
			
				var defaultOptions = {
					parent:0,
					alone:'',
					isNew:false,
					lvl:0
				};
				var opts = $.extend({}, defaultOptions, options);
				var elm_obj = {
					element: {
						id: 0,
						name: '',
						parent: opts.parent,
						order: parseInt(opts.order)
					},
					isNew: opts.isNew
				};
				
				if(typeof opts.duplication !== 'undefined') {
					elm_obj.duplication = opts.duplication;
				}
				
				if(typeof opts.name !== 'undefined') {
					elm_obj.name = opts.name
				}
				
				return 	'<div class="archymap-view-child '+opts.alone+'">'
							+'<div class="archymap-view" data-parentid="'+opts.parent+'">'
								+'<div class="archymap-view-parent alone-child">' + this.getMapSpan(elm_obj,opts.lvl) + '</div>'
							+'</div>'
						+'</div>';
			}
		}

		Archy.init();
		Archy.actions();
		Archy.cardActions();
		Archy.zoomAction();
	}


	$.fn.archymap = function(options) {
		return this.each(function() {
			var $self = $(this);
			if (undefined === $self.data('archymap')) 
			{
				var Archy = new $.archymap(this, options);
				$self.data('archymap', Archy);
			}
		});
	}
})(jQuery);
