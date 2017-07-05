(function ($, window, document, undefined) {
	"use strict";
	// Create the defaults once
	var pluginName = "textEllipser",
		defaults = {
			timeTaphold: 400,
			tooltip: true,
			goover: false,
			gooverTimeChar: 200,
			delay: 10000,
			scale: false
		};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;

		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	function camelCase(string) {
		return string.replace(/-([a-z])/ig, function (all, letter) {
			return letter.toUpperCase();
		});
	}

	function scaleElemEvent(e) {
		var te = e.data.te;
		var elem = e.data.elem
		te.scale(elem);
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
		init: function (conf) {
			var te = this;
			$.extend(te.settings, conf);
			if (!te.element) {
				te.element = $("body")[0];
			}
			$(te.element).contents().filter(function () {
				return (this.nodeType === 3) && this.nodeValue.match(/\S/);
			}).each(function () {
				var elem = $(this).parent().attr("title",
					$(this).text().trim()).css({
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis"
					});
				if (te.settings.scale) {
					te.scale(elem);
				} else {
					if (te.settings.tooltip) {
						te.tooltip(elem);
					}
					if (te.settings.goover) {
						te.goover(elem);
					}
				}
			});
		},
		calcWidth: function (elem) {
			var te = this;
			if (!elem) {
				elem = $(te.element);
			} else {
				elem = $(elem);
			}
			var aux = elem.clone().removeAttr('class').hide().appendTo("body");
			var w = aux.width();
			aux.remove();
			return w;
		},
		scale: function (elem) {
			var te = this;
			if (!elem) {
				elem = $(te.element);
			} else {
				elem = $(elem);
			}
			var wText = elem.data("width-text");
			var fontInit = elem.data("font-size");
			if (!wText) {
				wText = te.calcWidth(elem);
				fontInit = parseInt(elem.css("font-size"));
				elem.data("width-text", wText);
				elem.data("font-size", fontInit);
			}
			var wElem = elem.width();
			var s = (wElem / wText) > 1 ? 1 : (wElem / wText);
			elem.css({ fontSize: (s - .05) * fontInit });
			return true;
		},
		resetScale: function (elem) {
			var te = this;
			if (!elem) {
				elem = $(te.element);
			} else {
				elem = $(elem);
			}
			elem.css("font-size", "");
			elem.removeData("width-text");
			elem.removeData("font-size");
			return $(te.element);
		},
		goover: function (elem) {
			var te = this;
			if (!elem) {
				elem = $(te.element);
			} else {
				elem = $(elem);
			}
			var t = te.settings.gooverTimeChar * elem.text().length
			var w = te.calcWidth(elem);
			setInterval(toggle, t + 1000 + te.settings.delay);
			toggle();

			function toggle() {
				elem.animate({ textIndent: -(w - elem.width() * .8) }, t);
				elem.delay(2000);
				elem.fadeOut(function () {
					elem.css("text-indent", 0);
				}).fadeIn();
			}
		},
		tooltip: function (elem) {
			var te = this;
			if (!elem) {
				elem = $(te.element);
			} else {
				elem = $(elem);
			}
			elem.tooltip({
				trigger: "manual",
				placement: "auto",
				viewport: {
					selector: "body",
					padding: 0
				}
			});
			elem.on("mouseover", mouseover);
			elem.on("mouseout blur", mouseout);

			elem.on("touchstart", function (e) {
				var start = new Date();
				elem.data("startTaphold", start);
				mouseover(e);
				setTimeout(function () {
					mouseout(e);
				}, 3000);
			});
			elem.on("touchend", function (e) {
				var t = te.settings.timeTaphold;
				var start = elem.data("startTaphold").getTime();
				var end = (new Date()).getTime();
				elem.removeData("startTaphold");
				if ((end - start) < t) {
					e.stopImmediatePropagation();
					mouseout(e);
				}
			});

			function mouseover(e) {
				if (elem.data("timerTooltip")) {
					clearTimeout(elem.data("timerTooltip"));
				}
				var timerTooltip = setTimeout(function () {
					elem.tooltip("toggle");
					elem.removeData("timerTooltip");
				}, 1000);
				elem.data("timerTooltip", timerTooltip);
			}

			function mouseout(e) {
				setTimeout(function () {
					if (elem.data("timerTooltip")) {
						clearTimeout(elem.data("timerTooltip"));
						elem.removeData("timerTooltip");
					}
					elem.tooltip("hide");
				}, 100);
			}
		},
		help: function () {
			var funcs = $.map(this, function (elem, i) {
				if (typeof elem === "function") {
					return i;
				}
			});
			console.log("defaults");
			console.log(defaults);
			console.log("métodos disponibles");
			console.log(funcs);
			console.log("------------");
			return [JSON.stringify(defaults), JSON.stringify(funcs)];
		}
	});
	// preventing against multiple instantiations,
	// allowing set an action to do at the initialization
	$.fn[pluginName] = function (action, options) {
		var toReturn;
		if (typeof action !== "string") {
			options = action;
			toReturn = this.each(function (i, elem) {
				if (!$.data(elem, "plugin_" + pluginName)) {
					$.data(elem, "plugin_" +
						pluginName, new Plugin(elem, options));
				}
			});
		} else {
			toReturn = this.map(function (i, elem) {
				var plugin = $.data(elem, "plugin_" + pluginName);
				var tR;
				if (!plugin) {
					plugin = new Plugin(elem, options);
					$.data(elem, "plugin_" + pluginName, plugin);
				}
				if (typeof plugin[camelCase(action)] === "function") {
					tR = plugin[camelCase(action)](options);
				}
				return tR;
			}).get();
			switch (toReturn.length) {
				case 0:
					toReturn = null;
					break;
				case 1:
					toReturn = toReturn[0];
					break;
				default:
			}
		}
		return toReturn;
	};
	$[pluginName] = function (action) {
		if (!action) {
			action = "init";
		}
		return (new Plugin())[camelCase(action)]();
	};
})(jQuery, window, document);