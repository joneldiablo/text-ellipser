(function($, window, document, undefined) {
    "use strict";
    // Create the defaults once
    var pluginName = "textEllipser",
        defaults = {
            propertyName: "value"
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
        return string.replace(/-([a-z])/ig, function(all, letter) {
            return letter.toUpperCase();
        });
    }
    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function() {
            var te = this;
            if (!te.element) {
                te.element = $(body)[0];
            }
            $(te.element).contents().filter(function() {
                return (this.nodeType === 3) && this.nodeValue.match(/\S/);
            }).each(function() {
                $(this).parent().attr("title",
                    $(this).text().trim()).css({
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }).tooltip();

            });
        },
        help: function() {
            var funcs = $.map(this, function(elem, i) {
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
    $.fn[pluginName] = function(action, options) {
        var toReturn;
        if (typeof action !== "string") {
            options = action;
            toReturn = this.each(function(i, elem) {
                if (!$.data(elem, "plugin_" + pluginName)) {
                    $.data(elem, "plugin_" +
                        pluginName, new Plugin(elem, options));
                }
            });
        } else {
            toReturn = this.map(function(i, elem) {
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
    $[pluginName] = function(action) {
        return (new Plugin())[camelCase(action)]();
    };
})(jQuery, window, document);