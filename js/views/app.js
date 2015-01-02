/*-------------------------------------------------------------------

    Quick and dirty code by Urban Sanden jan 2015

-------------------------------------------------------------------*/

// Handlebars helper for gravatar images. Requires the md5-plugin
Handlebars.registerHelper('gravatar', function(context, options) {
    var email = context;
    var size = ( typeof(options.hash.size) === "undefined") ? 32 : options.hash.size;
    return '<img src="http://www.gravatar.com/avatar/' + md5( email ) + '?s='+ size+'">';
});

(function() {

    'use strict';

    var Radar = {

        init: function() {

            // Get things started
            this.getBlips();
            this.getUser();

        },

        // Get user info from user.json, using Handlebars
        getUser: function() {
            Radar.readUser('user.json', '#usertmpl', '#user');
        },

        readUser: function (url, tplId, anchor) {
            $.getJSON(url, function(data) {
                var template = $(tplId).html();
                var blip = Handlebars.compile(template)(data);
                $(anchor).append(blip);
            });
        },

        // Get blip info from blips.json, using Handlebars
        getBlips: function() {
            Radar.readBlips('blips.json', '#blipstmpl', '#blips');
        },

        readBlips: function (url, tplId, anchor) {

            $.getJSON(url, function(data) {
                var template = $(tplId).html();
                var blip = Handlebars.compile(template)(data);
                $(anchor).append(blip);
                Radar.positionBlips();
            });
        },

        positionBlips: function() {

            var blips = $("[data-color]").length;
            var start = 0.25;
            var radius;
            var quadrant;
            var quadrant_rotations;

            // Loop blips
            $("[data-color]").each(function() {
                var status = $(this).data('status');
                var area = $(this).data('color');
                $(this).addClass('blip--'+area);

                // Different radiuses depending on blips
                switch(status) {
                    case 'hold':
                        radius = ($(".radar").width() - $(this).width())/2;
                    break;
                    case 'assess':
                        radius = ($(".assess").width() - $(this).width())/2;
                    break;
                    case 'trial':
                        radius = ($(".trial").width() - $(this).width())/2;
                    break;
                    case 'adopt':
                        radius = ($(".adopt").width() - $(this).width())/2;
                    break;
                }

                // Different quadrants depending on area
                switch(area) {
                    case 'techniques':
                        quadrant_rotations = 105;
                        quadrant = 1;
                    break;
                    case 'tools':
                        quadrant_rotations = 110;
                        quadrant = 2;
                    break;
                    case 'platforms':
                        quadrant_rotations = 135;
                        quadrant = 3;
                    break;
                    case 'frameworks':
                        quadrant_rotations = 120;
                        quadrant = 4;
                    break;
                }

                // Calculate things
                var _blip = $(this);
                var radarx = ($(".radar").height()/2);
                var radary = ($(".radar").width()/2);
                var step = (9*Math.PI)/blips;
                var x = (radarx + radius * Math.sin(start)) - ($(this).height()/2);
                var y = (radary + radius * Math.cos(start)) - ($(this).width()/2);

                // Number of radians to jump to next blip
                start += step;

                // Now position the blip.
                _blip.css('left', x + 'px');
                _blip.css('top', y + 'px');

                var newLeft;
                var newTop;

                // Rotate to correct quadrant
                for ( var i = 0; i < quadrant_rotations; i++ ) {
                    newLeft = Math.floor(radarx + (radius * Math.cos(1.6*(0.1*i))));
                    newTop = Math.floor(radary + (radius * Math.sin(1.6*(0.1*i))));
                    _blip.css('left', newLeft + (Math.floor((Math.random() * 100) + 5)) + 'px');
                    _blip.css('top', newTop + (Math.floor((Math.random() * 50) + 5)) + 'px');
                    if(area == 'frameworks') {
                        _blip.css('left', newLeft + (Math.floor((Math.random() * 100) + 5)) - 100 + 'px');
                        _blip.css('top', newTop + (Math.floor((Math.random() * 50) + 5)) + 10 + 'px');
                    }
                }

            });

            Radar.tooltips();

        },

        tooltips: function() {
            var targets = $( '[rel~=tooltip]' ),
                target  = false,
                tooltip = false,
                title   = false,
                tip;

            targets.bind( 'mouseenter', function() {
                target  = $( this );
                tip     = target.attr( 'title' );
                tooltip = $( '<div class="tooltip"></div>' );

                if( !tip || tip == '' ) {
                    return false;
                } else {

                target.removeAttr( 'title' );
                tooltip.css( 'opacity', 0 )
                       .html( tip )
                       .appendTo( 'body' );
                }

                var init_tooltip = function() {
                    if( $( window ).width() < tooltip.outerWidth() * 1.5 )
                        tooltip.css( 'max-width', $( window ).width() / 2 );
                    else
                        tooltip.css( 'max-width', 340 );

                    var pos_left = target.offset().left + ( target.outerWidth() / 2 ) - ( tooltip.outerWidth() / 2 ),
                        pos_top  = target.offset().top - tooltip.outerHeight() - 20;

                    tooltip.css( { left: pos_left, top: pos_top } )
                           .addClass('active');
                };

                init_tooltip();
                $(window).on("debouncedresize", function( event ) {
                    init_tooltip();
                });

                var remove_tooltip = function() {
                    tooltip.addClass('inactive');
                    setTimeout(function() {
                        tooltip.remove();
                    }, 10);


                    target.attr( 'title', tip );
                };

                target.bind( 'mouseleave', remove_tooltip );
                tooltip.bind( 'click', remove_tooltip );
            });
        },

    };

    $(function() {
        Radar.init();
    });

    $(window).on("debouncedresize", function( event ) {
        Radar.positionBlips();
    });

}());