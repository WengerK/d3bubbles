/**
 * D3Bubbles
 *
 * Generate Bubbles chart
 * Helps you bring data to life using HTML, SVG and CSS.
 *
 * @param {Object} settings [description]
 *
 * @author      Kevin WENGER <contact@kevin-wenger.ch>
 * @license     http://www.php.net/license/3_01.txt  PHP License 3.01
 * @version     1.0.5
 *
 */

// Dependencies
if("undefined"==typeof jQuery)throw new Error("D3Bubbles's JavaScript requires jQuery");
if("undefined"==typeof d3)throw new Error("D3Bubbles's JavaScript requires D3.js");

D3Bubbles = function(params) {

// ************************************************************************
// PRIVATE VARIABLES
// ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE
// ***********************************************************************
    var options = params;
    var that = this;

    var default_settings = {
        width: 'auto',
        height: 'auto',
        wrapper: null,
        container: null,
        data: null,
        bubbles: {
            bubbles_per_px: 0.02,
            bubbles_max: 'auto',
        },
        radius: {
            min:28,
            max:65,
        },
        colors: {
            bubbles:['#c9ad7d', '#e0c18c'],
            texts:['#FFF'],
        },
        features: {
            dragmove: true,
            overflow: false,
            fit_texts: true,
            responsive: true,
        },
    };


    // standard variables accessible to
    // the rest of the functions inside Bubbles
    var nodes = null;

    // these will be set in _prepare
    var svgContainer = null;
    var circles = null;

    // largest size for our bubbles
    // radius scale will be used to size our bubbles
    var radius = null;

    // Overwriteable settings
    var settings = null

    var m = 1;
    var padding = 100;

    var force = d3.layout.force();
    var x = null;

// ************************************************************************
// PUBLIC PROPERTIES -- ANYONE MAY READ/WRITE
// ************************************************************************
    this.width = null;
    this.height = null;

    this.bubbles_per_px = null;
    this.bubbles_max = null;

    this.radius_min = null;
    this.radius_max = null;

    this.colors_bubbles = null;
    this.colors_min_bubbles = null;
    this.colors_max_bubbles = null;
    this.colors_texts = null;
    this.colors_min_texts = null;
    this.colors_max_texts = null;

    this.features_dragmove = null;
    this.features_overflow = null;
    this.features_fit_texts = null;

// ************************************************************************
// PRIVILEGED METHODS
// MAY BE INVOKED PUBLICLY AND MAY ACCESS PRIVATE ITEMS
// ************************************************************************

    /**
     * [visualize description]
     * @param  {Objects}   data     [raw data in array of object]
     * @param  {Function} callback  [initalise events on plot after rendering element]
     */
    this.visualize = function() {
        var drawed = 0;
        nodes = settings.data;

       // first, get the data
        nodes = settings.data.slice(0, that.bubbles_max);

        // setup the radius scale's domain now that
        // we have some data
        var min_radius = d3.min(nodes, function(d) {
            return parseInt(d.radius);
        });
        var max_radius = d3.max(nodes, function(d) {
            return parseInt(d.radius);
        });
        radius = d3.scale.linear().domain([min_radius, max_radius]).range([that.radius_min, that.radius_max]);

        // setup the colors scale's domain
        var bubbles_colors = function(radius){
            return that.colors_min_bubbles;
        }
        if( that.colors_max_bubbles != null ){
            bubbles_colors = d3.scale.linear()
                .domain([that.radius_min, that.radius_max])
                .range([that.colors_min_bubbles, that.colors_max_bubbles]);
        }
        var texts_colors = function(radius){
            return that.colors_min_texts;
        }
        if( that.colors_max_texts != null ){
            texts_colors = d3.scale.linear()
                .domain([that.radius_min, that.radius_max])
                .range([that.colors_min_texts, that.colors_max_texts]);
        }

        // tweaks our dataset to get it into the
        // format we want
        nodes.forEach(function (item, index) {
            var i = Math.floor(Math.random() * m); //color
            var v = (i + 1) / m * -Math.log(Math.random()); //value
            // item.color = color(i);
            item.cx = x(i);
            item.cy = that.height / 2;
            item.count = item.radius;
            item.radius = radius(item.radius);
            item.name = item.name;
            item.id = Math.random().toString(36).substr(2, 9);
        });

        if( that.features_dragmove ){
            // Initalise drag Event
            var drag = force.drag()
                .on("dragstart", function(d) {
                    var ref = this;
                    var container = document.querySelector(settings.wrapper);
                    // definition of events
                    var event = new CustomEvent('dragstart', {
                        bubble: ref,
                        data: d,
                    });
                    !container.dispatchEvent(event);
                })
                .on('drag', dragmove)
                .on("dragend", function(d) {
                    var ref = this;
                    var container = document.querySelector(settings.wrapper);
                    // definition of events
                    var event = new CustomEvent('dragend', {
                        bubble: ref,
                        data: d,
                    });
                    !container.dispatchEvent(event);
                });
        }

        // ---
        // The force variable is the force layout controlling the bubbles
        // here we disable gravity and charge as we implement custom versions
        // of gravity and collisions for this visualization
        // ---
        force
            .size([that.width, that.height])
            .gravity(0)
            .charge(0)
            .nodes(nodes)
            .on('tick', tick)
            .start();

        // ---
        // circles will be used to group the bubbles
        // ---
        circles = svgContainer.selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .attr('data-label-text', function(d){ return d.name })
            .attr('data-label-count', function(d){ return d.label })
            .attr('id', function(d){ return 'bubble-wrapper-'+d.id })
            .attr('class', 'bubble-wrapper')
            .attr('cx', function(d){ return d.cx })
            .attr('cy', function(d){ return d.cy })
            .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
            // .call(drag);

            if( that.features_dragmove ){
                circles.call(drag);
            }

        // ---
        // Add our Circle
        // ---
        var circle = circles
            .append('circle')
            .attr('class', function(d){
                return 'bubble ' + d.type;
            })
            .attr('fill', function(d){ return bubbles_colors(d.radius) })
            .attr('r', function(d){ return d.radius });



        // ---
        // Add text
        // ---
        var text = circles
            .append('text')
            .attr('class', 'term')
            .attr('dy', '.3em')
            .attr('fill', function(d){ return texts_colors(d.radius) })
            .style('text-anchor', 'middle')
            .text(function(d) {
                var ref = this;
                var container = document.querySelector(settings.wrapper);

                // Callback event after rendering a bubble
                drawed++;

                // Add Event mouseover
                ref.addEventListener("mouseleave", function(){
                    // definition of events
                    var event = new CustomEvent('leave', {
                        bubble: ref,
                        data: d,
                    });
                    !container.dispatchEvent(event);
                });

                // Add Event mouseout
                ref.addEventListener("mouseenter", function(){
                    // definition of events
                    var event = new CustomEvent('enter', {
                        bubble: ref,
                        data: d,
                    });
                    !container.dispatchEvent(event);
                });

                // Event after rendering all bubbles
                if( drawed >= that.bubbles_max ){
                    // definition of events
                    var event = new CustomEvent('complete');
                    !container.dispatchEvent(event);
                }

                return d.name.substring(0, d.radius / 3);
            })
            .style('font-size', '10px')
            .style('font-size', function(d) {
                var size = 10;
                if(that.features_fit_texts){
                    //This is what gives it increased size of text
                    size = (2 * d.radius - 10) / this.getComputedTextLength() * 10 ;
                }
                return size+ 'px';
            });
    }

    this.init = function() {
        // window.addEventListener('resize', _resize);

        settings = $.extend(default_settings, options); // Overwrite settings

        // Initalise public properties with default settings and sended parameters
        this.width = settings.width;
        this.height = settings.height;

        this.bubbles_per_px = settings.bubbles.bubbles_per_px;
        // Must be an Integer because using slice function with this value
        this.bubbles_max = settings.bubbles.bubbles_max;

        this.radius_min = settings.radius.min;
        this.radius_max = settings.radius.max;

        if( settings.colors.bubbles.length == 1 ){
            this.colors_min_bubbles = settings.colors.bubbles[0];
        }else if( settings.colors.bubbles.length > 1){
            this.colors_min_bubbles = settings.colors.bubbles[0];
            this.colors_max_bubbles = settings.colors.bubbles[1];
        }
        if( settings.colors.texts.length == 1 ){
            this.colors_min_texts = settings.colors.texts[0];
        }else if( settings.colors.texts.length > 1){
            this.colors_min_texts = settings.colors.texts[0];
            this.colors_max_texts = settings.colors.texts[1];
        }

        this.features_dragmove = settings.features.dragmove;
        this.features_overflow = settings.features.overflow;
        this.features_fit_texts = settings.features.fit_texts;
        this.features_responsive = settings.features.responsive;

        _prepare();
    }

    this.redraw = function() {
        _prepare();
        this.visualize();
    }

// ************************************************************************
// PRIVATE METHODES
// ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE
// ***********************************************************************

/*    function _resize(){
        if (!running) {
            running = true;

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(that.redraw());
            } else {
                setTimeout(that.redraw(), 66);
            }
        }
    }*/

    /**
     * A fancy way to setup svg element
     */
    function _prepare() {

        if(that.width != 'auto' && that.features_responsive){
            console.warn('D3Bubbles\'s Warning - "responsive" enable but width != "auto".');
            that.width = 'auto';
        }

        if(that.width == 'auto'){
            that.width = $(settings.container).width();
        }

        if(that.height == 'auto'){
            that.height = $(settings.container).height();
        }

        if(that.bubbles_max == 'auto'){
            that.bubbles_max = parseInt(that.bubbles_per_px * that.width);
        }
        if( that.bubbles_max >= settings.data.length || that.bubbles_max <= 0 ){
            that.bubbles_max = settings.data.length;
        }else{
            that.bubbles_max = parseInt(that.bubbles_max);
        }

        x = d3.scale.ordinal().domain(d3.range(m)).rangePoints([0, that.width], 1);

        // Must clean area before drawing plot
        $(settings.container).html('');

        // setup svg element
        svgContainer = d3.select(settings.container).append('svg:svg')
            .attr('width', that.width)
            .attr('height', that.height)
            .attr('class', 'D3Bubbles');
    }

    /**
     * Drag Event on Bubble
     * Limite drag mouvement with container width and height
     * @param  {Object} d [Dragged element]
     */
    function dragmove(d) {
        var ref = this;
        var container = document.querySelector(settings.wrapper);
        // definition of events
        var event = new CustomEvent('drag', {
            bubble: ref,
            data: d,
        });
        !container.dispatchEvent(event);

        if (d.py > that.height) d.py = that.height;
        if (d.py < 0) d.py = 0;

        if (d.px > that.width) d.px = that.width;
        if (d.px < 0) d.px = 0;
    }


    /**
     * tick callback function will be executed for every iteration of the force simulation
     * - moves force nodes towards their destinations
     * - deals with collisions of force nodes
     * - updates visual bubbles to reflect new force node locations
     * @param  {Object} e [tick]
     */
    function tick(e) {
        // Most of the work is done by the gravity and collide functions
        circles.each(gravity(.5 * e.alpha))
            .each(collide(.5))
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            })
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
    }

    /**
     * Custom gravity to skew the bubble placement
     * @param  {float} alpha  [affect how much to push towards the horizontal or vertical]
     * @return {Function}     [modifies the x and y of a node]
     */
    function gravity(alpha) {
        return function(d) {
            var r = d.radius + 4;
            d.y += (d.cy - d.y) * alpha;
            d.x += (d.cx - d.x) * alpha / 8;

            if( !that.features_overflow ){
                if (d.x - r < 0) {
                    d.x = r;
                } else {
                    if (d.x + r > that.width) {
                        d.x = that.width - r;
                    }
                } if (d.y - r < 0) {
                    d.y = r;
                } else {
                    if (d.y + r > that.height) {
                        d.y = that.height - r;
                    }
                }
            }
        }
    };

    /**
     * custom collision function to prevent nodes from touching
     * we use quadtree to speed up implementation
     * @param  {float} alpha    [affect how much to push towards the horizontal or vertical]
     * @return {Function}       [modifies the x and y of a node]
     */
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var r = d.radius + radius.domain()[1] + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x;
                    var y = d.y - quad.point.y;
                    var l = Math.sqrt(x * x + y * y);
                    var r = d.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

};

// ************************************************************************
// PUBLIC METHODS -- ANYONE MAY READ/WRITE
// ************************************************************************


/**
 * Polyfill - detect working CustomEvent constructor
 */
(function () {
    if (typeof CustomEvent === 'function') {
        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        };

        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

})();
