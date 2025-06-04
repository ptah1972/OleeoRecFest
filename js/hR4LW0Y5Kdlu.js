/*! BuildToolsCookbook v1.0.0 | (c) 2025 AD Styles */
(function () {
    'use strict';

    /* offside-js 1.4.0 26-03-2018
    * Minimal JavaScript kit without library dependencies to push things off-canvas using just class manipulation
    * https://github.com/toomuchdesign/offside.git
    *
    * by Andrea Carraro
    * Available under the MIT license
    */
    (function ( window, document, undefined$1 ) {

        // Self-invoking function returning the object which contains
        // the "getInstance" method used for initializing
        // the Offside sigleton factory
        var offside = (function () {

            // Global Offside singleton-factory constructor
            function initOffsideFactory( options ) {

                // Utility functions
                // Shared among factory and Offside instances, too

                // Close all open Offsides.
                // If an Offside instance id is provided, it just closes the matching instance instead
                var closeAll = function( offsideId ) {

                    // Look for an open Offside id
                    if ( openOffsidesId.length > 0 ) {

                        // Close matching Offside instance if an ID is provided
                        if ( !isNaN( offsideId ) ) {

                            instantiatedOffsides[ offsideId ].close();
                        } else {

                            // Close all Offside instances
                            openOffsidesId.forEach( function( offsideId ) {
                                instantiatedOffsides[ offsideId ].close();
                            });
                        }

                    }
                },

                // Append a class to body in order to turn on elements CSS 3D transitions
                // only when happens the first interation with an Offside instance.
                // Otherwise we would see Offside instances being smoothly pushed
                // out of the screen during DOM initialization.
                turnOnCssTransitions = function() {
                    addClass( body, transitionsClass );
                },

                addClass = function( el, c ) {
                    if ( el.classList ) {
                        el.classList.add(c);
                    } else {
                        el.className = ( el.className + ' ' + c ).trim();
                    }
                },

                removeClass = function( el, c ) {
                    if ( el.classList ) {
                        el.classList.remove(c);
                    } else {
                        el.className = el.className.replace( new RegExp( '(^|\\b)' + c.split(' ').join('|') + '(\\b|$)', 'gi' ), ' ' );
                    }
                },

                addEvent = function( el, eventName, eventHandler ) {
                    el.addEventListener( eventName, eventHandler );
                },

                removeEvent = function( el, eventName, eventHandler ) {
                    el.removeEventListener( eventName, eventHandler );
                },

                // Return a collection (array) of DOM elements from:
                // - A DOM element
                // - An array of DOM elements
                // - A string selector
                getDomElements = function( els ) {

                    // "els" is a DOM element
                    // http://stackoverflow.com/a/120275/2902821
                    if( els instanceof HTMLElement ){
                        return [ els ];
                    }

                    // "els" is an array
                    else if( Array.isArray( els ) ) {
                        return els;
                    }

                    // "els" is a string
                    else if( typeof els === 'string' ) {
                        // Convert Nodelist into an array
                        // http://www.jstips.co/en/converting-a-node-list-to-an-array/
                        return Array.apply( null, document.querySelectorAll( els ) );
                    }

                    return false;
                },

                // Check if a value exists in an array. Returns:
                // - array index if value exists
                // - "false" if value is not found
                // See: http://stackoverflow.com/a/5767357
                isInArray = function( arr, value ) {
                    var index = arr.indexOf( value );
                    return index > -1 ? index : false;
                };

                // Offside.js factory initialization

                var i,
                    factorySettings;                                    // Offside factory private settings

                // Default factory settings
                factorySettings = {

                    slidingElementsSelector: '.offside-sliding-element',    // String: Default sliding elements selectors ('#foo, #bar')
                    disableCss3dTransforms: false,                          // Disable CSS 3d Transforms support (for testing purposes)
                    debug: false,                                           // Boolean: If true, print errors in console
                };

                // User defined factory settings
                for ( i in options ) {
                    if ( factorySettings.hasOwnProperty( i ) ) {
                        factorySettings[i] = options[i];
                    }
                }

                // Private factory properties
                var globalClass = 'offside-js',                         // Global Offside classes namespace
                    initClass = globalClass + '--init',                 // Class appended to body when Offside is intialized
                    slidingElementsClass = 'offside-sliding-element',   // Class appended to sliding elements
                    transitionsClass = globalClass + '--interact',      // Class appended to body when ready to turn on Offside CSS transitions (Added when first menu interaction happens)
                    instantiatedOffsides = [],                          // Array containing all instantiated offside elements
                    firstInteraction = true,                            // Keep track of first Offside interaction
                    has3d = factorySettings.disableCss3dTransforms ? false : _has3d(),       // Browser supports CSS 3d Transforms
                    openOffsidesId = [],                                // Tracks opened Offside instances id's
                    body = document.body,
                    slidingElements = getDomElements( factorySettings.slidingElementsSelector ),     // Sliding elements
                    debug = factorySettings.debug;

                // Offside singleton-factory Dom initialization
                // It's called just once on Offside singleton-factory init.
                function _factoryDomInit() {

                    // Add class to sliding elements
                    slidingElements.forEach( function( item ) {
                        addClass( item, slidingElementsClass );
                    });

                    // DOM Fallbacks when CSS transform 3d not available
                    if ( !has3d ) {
                        // No CSS 3d Transform fallback
                        addClass( document.documentElement, 'no-csstransforms3d' ); //Adds Modernizr-like class to HTML element when CSS 3D Transforms not available
                    }

                    // Add init class to body
                    addClass( body, initClass );
                }

                // Private Offside factory methods

                // Testing for CSS 3D Transform Support
                // https://gist.github.com/lorenzopolidori/3794226
                function _has3d() {

                    if ( !window.getComputedStyle ) {
                        return false;
                    }

                    var el = document.createElement('p'),
                    has3d,
                    transforms = {
                        'webkitTransform':'-webkit-transform',
                        'OTransform':'-o-transform',
                        'msTransform':'-ms-transform',
                        'MozTransform':'-moz-transform',
                        'transform':'transform'
                    };

                    // Add it to the body to get the computed style
                    document.body.insertBefore(el, null);

                    for( var t in transforms ){
                        if( el.style[t] !== undefined$1 ){
                            el.style[t] = 'translate3d(1px,1px,1px)';
                            has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                        }
                    }

                    document.body.removeChild(el);

                    return ( has3d !== undefined$1 && has3d.length > 0 && has3d !== 'none' );
                }

                // Offside constructor wrapper
                // It supplies a wrapper around OffsideInstance constructor
                // to prevent instance initialization when casted on a non-existing DOM element
                // See: http://stackoverflow.com/a/8618792
                function createOffsideInstance( el, options, offsideId ) {

                    // Check if provided element exists before using it to instantiate an Offside instance
                    var domEl = el !== undefined$1 ?
                        getDomElements( el ) :
                        getDomElements( '.offside' );

                    // If provided el exists initialize an Offside instance, else return null
                    return domEl !== false ?
                        new OffsideInstance( domEl[0], options, offsideId ) :
                        null;
                }

                // Offside constructor
                // Set up and initialize a new Offside instance
                // Called by Offside factory "getOffsideInstance()" method
                function OffsideInstance( domEl, options, offsideId ) {

                    var i,
                        offsideSettings;

                    // Default Offside instance settings
                    offsideSettings = {

                        buttonsSelector: '',                // String: Offside toggle buttons selectors ('#foo, #bar')
                        slidingSide: 'left',                // String: Offside element pushed on left or right
                        init: function(){},                 // Function: After init callback
                        beforeOpen: function(){},           // Function: Before open callback
                        afterOpen: function(){},            // Function: After open callback
                        beforeClose: function(){},          // Function: Before close callback
                        afterClose: function(){},           // Function: After close callback
                        beforeDestroy: function(){},        // Function: After destroy callback
                        afterDestroy: function(){},         // Function: After destroy callback
                    };

                    // User defined Offside instance settings
                    for ( i in options ) {
                        if ( offsideSettings.hasOwnProperty( i ) ) {
                            offsideSettings[i] = options[i];
                        }
                    }

                    // Offside instance private properties
                    var offside = domEl,                                                        // Hello, I'm the Offside instance
                        offsideButtons = getDomElements( offsideSettings.buttonsSelector ),     // Offside toggle buttons
                        slidingSide = offsideSettings.slidingSide,
                        offsideClass = 'offside',                                               // Class added to Offside instance when initialized
                        offsideSideClass = offsideClass + '--' + slidingSide,                   // Class added to Offside instance when initialized (eg. offside offside--left)
                        offsideOpenClass = 'is-open',                                           // Class appended to Offside instance when open
                        offsideBodyOpenClass = globalClass + '--' + 'is-open',                  // Class appended to body when an Offside instance is open (offside-js--is-open)
                        offsideBodyOpenSideClass = globalClass + '--is-' + slidingSide,         // Class appended to body when Offside instance is open (eg. offside-js--is-left / offside-js--is-open)
                        id = offsideId || 0;                                                           // Offside instance id

                    // Offside instance private methods

                    var _toggleOffside = function() {

                        // Premise: Just 1 Offside instance at time can be open.

                        // Check currently toggling Offside status
                        isInArray( openOffsidesId, id ) === false ? _openOffside() : _closeOffside();
                    },

                    _openOffside = function() {

                        // beforeOpen callback
                        offsideSettings.beforeOpen();

                        // Turn on CSS transitions on first interaction with an Offside instance
                        if ( firstInteraction ) {
                            firstInteraction = false;
                            turnOnCssTransitions();
                        }

                        // If another Offside instance is already open,
                        // close it before going on
                        closeAll();

                        // Set global body active class for current Offside instance
                        addClass( body, offsideBodyOpenClass );
                        addClass( body, offsideBodyOpenSideClass );

                        // Add Offside instance open class
                        addClass( offside, offsideOpenClass );

                        // Update open Offside instances tracker
                        openOffsidesId.push( id );

                        // afterOpen callback
                        offsideSettings.afterOpen();
                    },

                    _closeOffside = function() {

                        // Proceed with closing stuff only if
                        // current Offside instance is listed among openOffsidesId array
                        var index = isInArray( openOffsidesId, id );

                        if ( index !== false ) {

                            // beforeClose callback
                            offsideSettings.beforeClose();

                            // Remove global body active class for current Offside instance
                            removeClass( body, offsideBodyOpenClass );
                            removeClass( body, offsideBodyOpenSideClass );

                            // Remove Offside instance open class
                            removeClass( offside, offsideOpenClass );

                            // Update open Offside instances tracker
                            openOffsidesId.splice( index, 1 );

                            // afterClose callback
                            offsideSettings.afterClose();
                        }
                    },

                    _closeAll = function() {

                        closeAll();
                    },

                    // Offside buttons click handler
                    _onButtonClick = function( e ) {

                        e.preventDefault();
                        _toggleOffside();
                    },

                    /*
                    // Get Offside instance unique ID
                    _getId = function() {
                        return id;
                    }
                    */

                    // Set up and initialize a new Offside instance
                    _initOffside = function() {

                        if ( debug ) {
                            _checkElements();
                        }

                        // Append classes to Offside instance (.offside and .offside{slidingSide})
                        addClass( offside, offsideClass );
                        addClass( offside, offsideSideClass );

                        // Toggle Offside on click event
                        offsideButtons.forEach( function( item ) {
                            addEvent( item, 'click', _onButtonClick );
                        });

                        // Init callback
                        offsideSettings.init();
                    },

                    _destroyOffside = function() {

                        // beforeDestroy callback
                        offsideSettings.beforeDestroy();

                        // Close Offside intance before destroy
                        _closeOffside();

                        // Remove click event from Offside buttons
                        offsideButtons.forEach( function( item ) {
                            removeEvent( item, 'click', _onButtonClick );
                        });

                        // Remove classes appended on init phase
                        removeClass( offside, offsideClass );
                        removeClass( offside, offsideSideClass );

                        // Destroy Offside instance
                        delete instantiatedOffsides[id];

                        // afterDestroy callback
                        offsideSettings.afterDestroy();
                    },

                    // Fire console errors if DOM elements are missing
                    _checkElements = function() {

                        if ( !offside ) {
                            console.error( 'Offside alert: "offside" selector could not match any element' );
                        }

                        if ( !offsideButtons.length ) {
                            console.error( 'Offside alert: "buttonsSelector" selector could not match any element' );
                        }
                    };

                    // Offside instances public methods
                    this.toggle = function() {
                        _toggleOffside();
                    };

                    this.open = function() {
                        _openOffside();
                    };

                    this.close = function() {
                        _closeOffside();
                    };

                    this.closeAll = function() {
                        _closeAll();
                    };

                    this.destroy = function() {
                        _destroyOffside();
                    };

                    // Ok, init Offside instance
                    _initOffside();

                } // OffsideInstance constructor end


                // DOM initialization
                _factoryDomInit();

                // This is the actual returned Offside factory
                return {

                    //Offside factory public methods
                    closeOpenOffside: function() {
                        closeAll();
                    },

                    // This is the method responsible for creating a new Offside instance
                    // and register it into "instantiatedOffsides" array
                    getOffsideInstance: function( el, options ) {

                            // Get length of instantiated Offsides array
                        var offsideId = instantiatedOffsides.length || 0,

                            // Instantiate new Offside instance
                            offsideInstance = createOffsideInstance( el, options, offsideId );

                        // If Offside instance is sccessfully created
                        if ( offsideInstance !== null ) {

                            // Push new instance into "instantiatedOffsides" array and return it

                            /*jshint -W093 */
                            return instantiatedOffsides[ offsideId ] = offsideInstance;
                            /*jshint +W093 */
                        }


                    }

                };

            } // initOffsideFactory() end

            var singleton = {

                // Get the Singleton instance if one exists
                // or create one if it doesn't
                getInstance: function ( el, options ) {

                    /*
                    * When Offside is called for the first time,
                    * inject a singleton-factory object
                    * as a static method in "offside.factory".
                    *
                    * Offside factory serves the following purposes:
                    * - DOM initialization
                    * - Centralized Offside instances management and initialization
                    */
                    if ( !singleton.getInstance.factory ) {
                        singleton.getInstance.factory = initOffsideFactory( options );
                    }

                    return singleton.getInstance.factory.getOffsideInstance( el, options );
                }
            };

            return singleton;
        })();

        // Store in window a reference to the Offside singleton factory
        if ( typeof module !== 'undefined' && module.exports ) {
            module.exports = offside.getInstance;
        } else {
            window.offside = offside.getInstance;
        }

    })( window, document );

    //Offside.js minimal setup
    offside( '#off-canvas-menu', {

        slidingElementsSelector:'#site-content-container',
        buttonsSelector: '.js-off-canvas-menu-button, .js-site-overlay',

        // all options
        // // Global offside options: affect all offside instances
        // slidingElementsSelector: '#my-content-container', // String: Sliding elements selectors ('#foo, #bar')
        // disableCss3dTransforms: false,                    // Disable CSS 3d Transforms support (for testing purposes)
        // debug: true,                                      // Boolean: If true, print errors in console

        // // Offside instance options: affect only this offside instance
        // buttonsSelector: '#my-button, .another-button',   // String: Offside toggle buttons selectors ('#foo, #bar')
        // slidingSide: 'right',                             // String: Offside element pushed on left or right
        // init: function(){},                               // Function: After init callback
        beforeOpen: function(){
         $('.js-hamburger').addClass('is-active');
        },                         // Function: Before open callback
        // afterOpen: function(){},                          // Function: After open callback
        // beforeClose: function(){
            // $('.js-hamburger').removeClass('is-active');
        // },                        // Function: Before close callback
        afterClose: function(){
            $('.js-hamburger').removeClass('is-active');
        },    // Function: After close callback   

    });

    /*!
     * jQuery JavaScript Library v3.6.1
     * https://jquery.com/
     *
     * Includes Sizzle.js
     * https://sizzlejs.com/
     *
     * Copyright OpenJS Foundation and other contributors
     * Released under the MIT license
     * https://jquery.org/license
     *
     * Date: 2022-08-26T17:52Z
     */
    ( function( global, factory ) {

    	if ( typeof module === "object" && typeof module.exports === "object" ) {

    		// For CommonJS and CommonJS-like environments where a proper `window`
    		// is present, execute the factory and get jQuery.
    		// For environments that do not have a `window` with a `document`
    		// (such as Node.js), expose a factory as module.exports.
    		// This accentuates the need for the creation of a real `window`.
    		// e.g. var jQuery = require("jquery")(window);
    		// See ticket trac-14549 for more info.
    		module.exports = global.document ?
    			factory( global, true ) :
    			function( w ) {
    				if ( !w.document ) {
    					throw new Error( "jQuery requires a window with a document" );
    				}
    				return factory( w );
    			};
    	} else {
    		factory( global );
    	}

    // Pass this if window is not defined yet
    } )( typeof window !== "undefined" ? window : undefined, function( window, noGlobal ) {

    var arr = [];

    var getProto = Object.getPrototypeOf;

    var slice = arr.slice;

    var flat = arr.flat ? function( array ) {
    	return arr.flat.call( array );
    } : function( array ) {
    	return arr.concat.apply( [], array );
    };


    var push = arr.push;

    var indexOf = arr.indexOf;

    var class2type = {};

    var toString = class2type.toString;

    var hasOwn = class2type.hasOwnProperty;

    var fnToString = hasOwn.toString;

    var ObjectFunctionString = fnToString.call( Object );

    var support = {};

    var isFunction = function isFunction( obj ) {

    		// Support: Chrome <=57, Firefox <=52
    		// In some browsers, typeof returns "function" for HTML <object> elements
    		// (i.e., `typeof document.createElement( "object" ) === "function"`).
    		// We don't want to classify *any* DOM node as a function.
    		// Support: QtWeb <=3.8.5, WebKit <=534.34, wkhtmltopdf tool <=0.12.5
    		// Plus for old WebKit, typeof returns "function" for HTML collections
    		// (e.g., `typeof document.getElementsByTagName("div") === "function"`). (gh-4756)
    		return typeof obj === "function" && typeof obj.nodeType !== "number" &&
    			typeof obj.item !== "function";
    	};


    var isWindow = function isWindow( obj ) {
    		return obj != null && obj === obj.window;
    	};


    var document = window.document;



    	var preservedScriptAttributes = {
    		type: true,
    		src: true,
    		nonce: true,
    		noModule: true
    	};

    	function DOMEval( code, node, doc ) {
    		doc = doc || document;

    		var i, val,
    			script = doc.createElement( "script" );

    		script.text = code;
    		if ( node ) {
    			for ( i in preservedScriptAttributes ) {

    				// Support: Firefox 64+, Edge 18+
    				// Some browsers don't support the "nonce" property on scripts.
    				// On the other hand, just using `getAttribute` is not enough as
    				// the `nonce` attribute is reset to an empty string whenever it
    				// becomes browsing-context connected.
    				// See https://github.com/whatwg/html/issues/2369
    				// See https://html.spec.whatwg.org/#nonce-attributes
    				// The `node.getAttribute` check was added for the sake of
    				// `jQuery.globalEval` so that it can fake a nonce-containing node
    				// via an object.
    				val = node[ i ] || node.getAttribute && node.getAttribute( i );
    				if ( val ) {
    					script.setAttribute( i, val );
    				}
    			}
    		}
    		doc.head.appendChild( script ).parentNode.removeChild( script );
    	}


    function toType( obj ) {
    	if ( obj == null ) {
    		return obj + "";
    	}

    	// Support: Android <=2.3 only (functionish RegExp)
    	return typeof obj === "object" || typeof obj === "function" ?
    		class2type[ toString.call( obj ) ] || "object" :
    		typeof obj;
    }
    /* global Symbol */
    // Defining this global in .eslintrc.json would create a danger of using the global
    // unguarded in another place, it seems safer to define global only for this module



    var
    	version = "3.6.1",

    	// Define a local copy of jQuery
    	jQuery = function( selector, context ) {

    		// The jQuery object is actually just the init constructor 'enhanced'
    		// Need init if jQuery is called (just allow error to be thrown if not included)
    		return new jQuery.fn.init( selector, context );
    	};

    jQuery.fn = jQuery.prototype = {

    	// The current version of jQuery being used
    	jquery: version,

    	constructor: jQuery,

    	// The default length of a jQuery object is 0
    	length: 0,

    	toArray: function() {
    		return slice.call( this );
    	},

    	// Get the Nth element in the matched element set OR
    	// Get the whole matched element set as a clean array
    	get: function( num ) {

    		// Return all the elements in a clean array
    		if ( num == null ) {
    			return slice.call( this );
    		}

    		// Return just the one element from the set
    		return num < 0 ? this[ num + this.length ] : this[ num ];
    	},

    	// Take an array of elements and push it onto the stack
    	// (returning the new matched element set)
    	pushStack: function( elems ) {

    		// Build a new jQuery matched element set
    		var ret = jQuery.merge( this.constructor(), elems );

    		// Add the old object onto the stack (as a reference)
    		ret.prevObject = this;

    		// Return the newly-formed element set
    		return ret;
    	},

    	// Execute a callback for every element in the matched set.
    	each: function( callback ) {
    		return jQuery.each( this, callback );
    	},

    	map: function( callback ) {
    		return this.pushStack( jQuery.map( this, function( elem, i ) {
    			return callback.call( elem, i, elem );
    		} ) );
    	},

    	slice: function() {
    		return this.pushStack( slice.apply( this, arguments ) );
    	},

    	first: function() {
    		return this.eq( 0 );
    	},

    	last: function() {
    		return this.eq( -1 );
    	},

    	even: function() {
    		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
    			return ( i + 1 ) % 2;
    		} ) );
    	},

    	odd: function() {
    		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
    			return i % 2;
    		} ) );
    	},

    	eq: function( i ) {
    		var len = this.length,
    			j = +i + ( i < 0 ? len : 0 );
    		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
    	},

    	end: function() {
    		return this.prevObject || this.constructor();
    	},

    	// For internal use only.
    	// Behaves like an Array's method, not like a jQuery method.
    	push: push,
    	sort: arr.sort,
    	splice: arr.splice
    };

    jQuery.extend = jQuery.fn.extend = function() {
    	var options, name, src, copy, copyIsArray, clone,
    		target = arguments[ 0 ] || {},
    		i = 1,
    		length = arguments.length,
    		deep = false;

    	// Handle a deep copy situation
    	if ( typeof target === "boolean" ) {
    		deep = target;

    		// Skip the boolean and the target
    		target = arguments[ i ] || {};
    		i++;
    	}

    	// Handle case when target is a string or something (possible in deep copy)
    	if ( typeof target !== "object" && !isFunction( target ) ) {
    		target = {};
    	}

    	// Extend jQuery itself if only one argument is passed
    	if ( i === length ) {
    		target = this;
    		i--;
    	}

    	for ( ; i < length; i++ ) {

    		// Only deal with non-null/undefined values
    		if ( ( options = arguments[ i ] ) != null ) {

    			// Extend the base object
    			for ( name in options ) {
    				copy = options[ name ];

    				// Prevent Object.prototype pollution
    				// Prevent never-ending loop
    				if ( name === "__proto__" || target === copy ) {
    					continue;
    				}

    				// Recurse if we're merging plain objects or arrays
    				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
    					( copyIsArray = Array.isArray( copy ) ) ) ) {
    					src = target[ name ];

    					// Ensure proper type for the source value
    					if ( copyIsArray && !Array.isArray( src ) ) {
    						clone = [];
    					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
    						clone = {};
    					} else {
    						clone = src;
    					}
    					copyIsArray = false;

    					// Never move original objects, clone them
    					target[ name ] = jQuery.extend( deep, clone, copy );

    				// Don't bring in undefined values
    				} else if ( copy !== undefined ) {
    					target[ name ] = copy;
    				}
    			}
    		}
    	}

    	// Return the modified object
    	return target;
    };

    jQuery.extend( {

    	// Unique for each copy of jQuery on the page
    	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

    	// Assume jQuery is ready without the ready module
    	isReady: true,

    	error: function( msg ) {
    		throw new Error( msg );
    	},

    	noop: function() {},

    	isPlainObject: function( obj ) {
    		var proto, Ctor;

    		// Detect obvious negatives
    		// Use toString instead of jQuery.type to catch host objects
    		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
    			return false;
    		}

    		proto = getProto( obj );

    		// Objects with no prototype (e.g., `Object.create( null )`) are plain
    		if ( !proto ) {
    			return true;
    		}

    		// Objects with prototype are plain iff they were constructed by a global Object function
    		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
    		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
    	},

    	isEmptyObject: function( obj ) {
    		var name;

    		for ( name in obj ) {
    			return false;
    		}
    		return true;
    	},

    	// Evaluates a script in a provided context; falls back to the global one
    	// if not specified.
    	globalEval: function( code, options, doc ) {
    		DOMEval( code, { nonce: options && options.nonce }, doc );
    	},

    	each: function( obj, callback ) {
    		var length, i = 0;

    		if ( isArrayLike( obj ) ) {
    			length = obj.length;
    			for ( ; i < length; i++ ) {
    				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
    					break;
    				}
    			}
    		} else {
    			for ( i in obj ) {
    				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
    					break;
    				}
    			}
    		}

    		return obj;
    	},

    	// results is for internal usage only
    	makeArray: function( arr, results ) {
    		var ret = results || [];

    		if ( arr != null ) {
    			if ( isArrayLike( Object( arr ) ) ) {
    				jQuery.merge( ret,
    					typeof arr === "string" ?
    						[ arr ] : arr
    				);
    			} else {
    				push.call( ret, arr );
    			}
    		}

    		return ret;
    	},

    	inArray: function( elem, arr, i ) {
    		return arr == null ? -1 : indexOf.call( arr, elem, i );
    	},

    	// Support: Android <=4.0 only, PhantomJS 1 only
    	// push.apply(_, arraylike) throws on ancient WebKit
    	merge: function( first, second ) {
    		var len = +second.length,
    			j = 0,
    			i = first.length;

    		for ( ; j < len; j++ ) {
    			first[ i++ ] = second[ j ];
    		}

    		first.length = i;

    		return first;
    	},

    	grep: function( elems, callback, invert ) {
    		var callbackInverse,
    			matches = [],
    			i = 0,
    			length = elems.length,
    			callbackExpect = !invert;

    		// Go through the array, only saving the items
    		// that pass the validator function
    		for ( ; i < length; i++ ) {
    			callbackInverse = !callback( elems[ i ], i );
    			if ( callbackInverse !== callbackExpect ) {
    				matches.push( elems[ i ] );
    			}
    		}

    		return matches;
    	},

    	// arg is for internal usage only
    	map: function( elems, callback, arg ) {
    		var length, value,
    			i = 0,
    			ret = [];

    		// Go through the array, translating each of the items to their new values
    		if ( isArrayLike( elems ) ) {
    			length = elems.length;
    			for ( ; i < length; i++ ) {
    				value = callback( elems[ i ], i, arg );

    				if ( value != null ) {
    					ret.push( value );
    				}
    			}

    		// Go through every key on the object,
    		} else {
    			for ( i in elems ) {
    				value = callback( elems[ i ], i, arg );

    				if ( value != null ) {
    					ret.push( value );
    				}
    			}
    		}

    		// Flatten any nested arrays
    		return flat( ret );
    	},

    	// A global GUID counter for objects
    	guid: 1,

    	// jQuery.support is not used in Core but other projects attach their
    	// properties to it so it needs to exist.
    	support: support
    } );

    if ( typeof Symbol === "function" ) {
    	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
    }

    // Populate the class2type map
    jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
    	function( _i, name ) {
    		class2type[ "[object " + name + "]" ] = name.toLowerCase();
    	} );

    function isArrayLike( obj ) {

    	// Support: real iOS 8.2 only (not reproducible in simulator)
    	// `in` check used to prevent JIT error (gh-2145)
    	// hasOwn isn't used here due to false negatives
    	// regarding Nodelist length in IE
    	var length = !!obj && "length" in obj && obj.length,
    		type = toType( obj );

    	if ( isFunction( obj ) || isWindow( obj ) ) {
    		return false;
    	}

    	return type === "array" || length === 0 ||
    		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
    }
    var Sizzle =
    /*!
     * Sizzle CSS Selector Engine v2.3.6
     * https://sizzlejs.com/
     *
     * Copyright JS Foundation and other contributors
     * Released under the MIT license
     * https://js.foundation/
     *
     * Date: 2021-02-16
     */
    ( function( window ) {
    var i,
    	support,
    	Expr,
    	getText,
    	isXML,
    	tokenize,
    	compile,
    	select,
    	outermostContext,
    	sortInput,
    	hasDuplicate,

    	// Local document vars
    	setDocument,
    	document,
    	docElem,
    	documentIsHTML,
    	rbuggyQSA,
    	rbuggyMatches,
    	matches,
    	contains,

    	// Instance-specific data
    	expando = "sizzle" + 1 * new Date(),
    	preferredDoc = window.document,
    	dirruns = 0,
    	done = 0,
    	classCache = createCache(),
    	tokenCache = createCache(),
    	compilerCache = createCache(),
    	nonnativeSelectorCache = createCache(),
    	sortOrder = function( a, b ) {
    		if ( a === b ) {
    			hasDuplicate = true;
    		}
    		return 0;
    	},

    	// Instance methods
    	hasOwn = ( {} ).hasOwnProperty,
    	arr = [],
    	pop = arr.pop,
    	pushNative = arr.push,
    	push = arr.push,
    	slice = arr.slice,

    	// Use a stripped-down indexOf as it's faster than native
    	// https://jsperf.com/thor-indexof-vs-for/5
    	indexOf = function( list, elem ) {
    		var i = 0,
    			len = list.length;
    		for ( ; i < len; i++ ) {
    			if ( list[ i ] === elem ) {
    				return i;
    			}
    		}
    		return -1;
    	},

    	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
    		"ismap|loop|multiple|open|readonly|required|scoped",

    	// Regular expressions

    	// http://www.w3.org/TR/css3-selectors/#whitespace
    	whitespace = "[\\x20\\t\\r\\n\\f]",

    	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
    	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
    		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

    	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
    	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

    		// Operator (capture 2)
    		"*([*^$|!~]?=)" + whitespace +

    		// "Attribute values must be CSS identifiers [capture 5]
    		// or strings [capture 3 or capture 4]"
    		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
    		whitespace + "*\\]",

    	pseudos = ":(" + identifier + ")(?:\\((" +

    		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
    		// 1. quoted (capture 3; capture 4 or capture 5)
    		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

    		// 2. simple (capture 6)
    		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

    		// 3. anything else (capture 2)
    		".*" +
    		")\\)|)",

    	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    	rwhitespace = new RegExp( whitespace + "+", "g" ),
    	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" +
    		whitespace + "+$", "g" ),

    	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
    	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace +
    		"*" ),
    	rdescend = new RegExp( whitespace + "|>" ),

    	rpseudo = new RegExp( pseudos ),
    	ridentifier = new RegExp( "^" + identifier + "$" ),

    	matchExpr = {
    		"ID": new RegExp( "^#(" + identifier + ")" ),
    		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
    		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
    		"ATTR": new RegExp( "^" + attributes ),
    		"PSEUDO": new RegExp( "^" + pseudos ),
    		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
    			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
    			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
    		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),

    		// For use in libraries implementing .is()
    		// We use this for POS matching in `select`
    		"needsContext": new RegExp( "^" + whitespace +
    			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
    			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
    	},

    	rhtml = /HTML$/i,
    	rinputs = /^(?:input|select|textarea|button)$/i,
    	rheader = /^h\d$/i,

    	rnative = /^[^{]+\{\s*\[native \w/,

    	// Easily-parseable/retrievable ID or TAG or CLASS selectors
    	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    	rsibling = /[+~]/,

    	// CSS escapes
    	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g" ),
    	funescape = function( escape, nonHex ) {
    		var high = "0x" + escape.slice( 1 ) - 0x10000;

    		return nonHex ?

    			// Strip the backslash prefix from a non-hex escape sequence
    			nonHex :

    			// Replace a hexadecimal escape sequence with the encoded Unicode code point
    			// Support: IE <=11+
    			// For values outside the Basic Multilingual Plane (BMP), manually construct a
    			// surrogate pair
    			high < 0 ?
    				String.fromCharCode( high + 0x10000 ) :
    				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
    	},

    	// CSS string/identifier serialization
    	// https://drafts.csswg.org/cssom/#common-serializing-idioms
    	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
    	fcssescape = function( ch, asCodePoint ) {
    		if ( asCodePoint ) {

    			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
    			if ( ch === "\0" ) {
    				return "\uFFFD";
    			}

    			// Control characters and (dependent upon position) numbers get escaped as code points
    			return ch.slice( 0, -1 ) + "\\" +
    				ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
    		}

    		// Other potentially-special ASCII characters get backslash-escaped
    		return "\\" + ch;
    	},

    	// Used for iframes
    	// See setDocument()
    	// Removing the function wrapper causes a "Permission Denied"
    	// error in IE
    	unloadHandler = function() {
    		setDocument();
    	},

    	inDisabledFieldset = addCombinator(
    		function( elem ) {
    			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
    		},
    		{ dir: "parentNode", next: "legend" }
    	);

    // Optimize for push.apply( _, NodeList )
    try {
    	push.apply(
    		( arr = slice.call( preferredDoc.childNodes ) ),
    		preferredDoc.childNodes
    	);

    	// Support: Android<4.0
    	// Detect silently failing push.apply
    	// eslint-disable-next-line no-unused-expressions
    	arr[ preferredDoc.childNodes.length ].nodeType;
    } catch ( e ) {
    	push = { apply: arr.length ?

    		// Leverage slice if possible
    		function( target, els ) {
    			pushNative.apply( target, slice.call( els ) );
    		} :

    		// Support: IE<9
    		// Otherwise append directly
    		function( target, els ) {
    			var j = target.length,
    				i = 0;

    			// Can't trust NodeList.length
    			while ( ( target[ j++ ] = els[ i++ ] ) ) {}
    			target.length = j - 1;
    		}
    	};
    }

    function Sizzle( selector, context, results, seed ) {
    	var m, i, elem, nid, match, groups, newSelector,
    		newContext = context && context.ownerDocument,

    		// nodeType defaults to 9, since context defaults to document
    		nodeType = context ? context.nodeType : 9;

    	results = results || [];

    	// Return early from calls with invalid selector or context
    	if ( typeof selector !== "string" || !selector ||
    		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

    		return results;
    	}

    	// Try to shortcut find operations (as opposed to filters) in HTML documents
    	if ( !seed ) {
    		setDocument( context );
    		context = context || document;

    		if ( documentIsHTML ) {

    			// If the selector is sufficiently simple, try using a "get*By*" DOM method
    			// (excepting DocumentFragment context, where the methods don't exist)
    			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

    				// ID selector
    				if ( ( m = match[ 1 ] ) ) {

    					// Document context
    					if ( nodeType === 9 ) {
    						if ( ( elem = context.getElementById( m ) ) ) {

    							// Support: IE, Opera, Webkit
    							// TODO: identify versions
    							// getElementById can match elements by name instead of ID
    							if ( elem.id === m ) {
    								results.push( elem );
    								return results;
    							}
    						} else {
    							return results;
    						}

    					// Element context
    					} else {

    						// Support: IE, Opera, Webkit
    						// TODO: identify versions
    						// getElementById can match elements by name instead of ID
    						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
    							contains( context, elem ) &&
    							elem.id === m ) {

    							results.push( elem );
    							return results;
    						}
    					}

    				// Type selector
    				} else if ( match[ 2 ] ) {
    					push.apply( results, context.getElementsByTagName( selector ) );
    					return results;

    				// Class selector
    				} else if ( ( m = match[ 3 ] ) && support.getElementsByClassName &&
    					context.getElementsByClassName ) {

    					push.apply( results, context.getElementsByClassName( m ) );
    					return results;
    				}
    			}

    			// Take advantage of querySelectorAll
    			if ( support.qsa &&
    				!nonnativeSelectorCache[ selector + " " ] &&
    				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) &&

    				// Support: IE 8 only
    				// Exclude object elements
    				( nodeType !== 1 || context.nodeName.toLowerCase() !== "object" ) ) {

    				newSelector = selector;
    				newContext = context;

    				// qSA considers elements outside a scoping root when evaluating child or
    				// descendant combinators, which is not what we want.
    				// In such cases, we work around the behavior by prefixing every selector in the
    				// list with an ID selector referencing the scope context.
    				// The technique has to be used as well when a leading combinator is used
    				// as such selectors are not recognized by querySelectorAll.
    				// Thanks to Andrew Dupont for this technique.
    				if ( nodeType === 1 &&
    					( rdescend.test( selector ) || rcombinators.test( selector ) ) ) {

    					// Expand context for sibling selectors
    					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
    						context;

    					// We can use :scope instead of the ID hack if the browser
    					// supports it & if we're not changing the context.
    					if ( newContext !== context || !support.scope ) {

    						// Capture the context ID, setting it first if necessary
    						if ( ( nid = context.getAttribute( "id" ) ) ) {
    							nid = nid.replace( rcssescape, fcssescape );
    						} else {
    							context.setAttribute( "id", ( nid = expando ) );
    						}
    					}

    					// Prefix every selector in the list
    					groups = tokenize( selector );
    					i = groups.length;
    					while ( i-- ) {
    						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
    							toSelector( groups[ i ] );
    					}
    					newSelector = groups.join( "," );
    				}

    				try {
    					push.apply( results,
    						newContext.querySelectorAll( newSelector )
    					);
    					return results;
    				} catch ( qsaError ) {
    					nonnativeSelectorCache( selector, true );
    				} finally {
    					if ( nid === expando ) {
    						context.removeAttribute( "id" );
    					}
    				}
    			}
    		}
    	}

    	// All others
    	return select( selector.replace( rtrim, "$1" ), context, results, seed );
    }

    /**
     * Create key-value caches of limited size
     * @returns {function(string, object)} Returns the Object data after storing it on itself with
     *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
     *	deleting the oldest entry
     */
    function createCache() {
    	var keys = [];

    	function cache( key, value ) {

    		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
    		if ( keys.push( key + " " ) > Expr.cacheLength ) {

    			// Only keep the most recent entries
    			delete cache[ keys.shift() ];
    		}
    		return ( cache[ key + " " ] = value );
    	}
    	return cache;
    }

    /**
     * Mark a function for special use by Sizzle
     * @param {Function} fn The function to mark
     */
    function markFunction( fn ) {
    	fn[ expando ] = true;
    	return fn;
    }

    /**
     * Support testing using an element
     * @param {Function} fn Passed the created element and returns a boolean result
     */
    function assert( fn ) {
    	var el = document.createElement( "fieldset" );

    	try {
    		return !!fn( el );
    	} catch ( e ) {
    		return false;
    	} finally {

    		// Remove from its parent by default
    		if ( el.parentNode ) {
    			el.parentNode.removeChild( el );
    		}

    		// release memory in IE
    		el = null;
    	}
    }

    /**
     * Adds the same handler for all of the specified attrs
     * @param {String} attrs Pipe-separated list of attributes
     * @param {Function} handler The method that will be applied
     */
    function addHandle( attrs, handler ) {
    	var arr = attrs.split( "|" ),
    		i = arr.length;

    	while ( i-- ) {
    		Expr.attrHandle[ arr[ i ] ] = handler;
    	}
    }

    /**
     * Checks document order of two siblings
     * @param {Element} a
     * @param {Element} b
     * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
     */
    function siblingCheck( a, b ) {
    	var cur = b && a,
    		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
    			a.sourceIndex - b.sourceIndex;

    	// Use IE sourceIndex if available on both nodes
    	if ( diff ) {
    		return diff;
    	}

    	// Check if b follows a
    	if ( cur ) {
    		while ( ( cur = cur.nextSibling ) ) {
    			if ( cur === b ) {
    				return -1;
    			}
    		}
    	}

    	return a ? 1 : -1;
    }

    /**
     * Returns a function to use in pseudos for input types
     * @param {String} type
     */
    function createInputPseudo( type ) {
    	return function( elem ) {
    		var name = elem.nodeName.toLowerCase();
    		return name === "input" && elem.type === type;
    	};
    }

    /**
     * Returns a function to use in pseudos for buttons
     * @param {String} type
     */
    function createButtonPseudo( type ) {
    	return function( elem ) {
    		var name = elem.nodeName.toLowerCase();
    		return ( name === "input" || name === "button" ) && elem.type === type;
    	};
    }

    /**
     * Returns a function to use in pseudos for :enabled/:disabled
     * @param {Boolean} disabled true for :disabled; false for :enabled
     */
    function createDisabledPseudo( disabled ) {

    	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
    	return function( elem ) {

    		// Only certain elements can match :enabled or :disabled
    		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
    		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
    		if ( "form" in elem ) {

    			// Check for inherited disabledness on relevant non-disabled elements:
    			// * listed form-associated elements in a disabled fieldset
    			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
    			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
    			// * option elements in a disabled optgroup
    			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
    			// All such elements have a "form" property.
    			if ( elem.parentNode && elem.disabled === false ) {

    				// Option elements defer to a parent optgroup if present
    				if ( "label" in elem ) {
    					if ( "label" in elem.parentNode ) {
    						return elem.parentNode.disabled === disabled;
    					} else {
    						return elem.disabled === disabled;
    					}
    				}

    				// Support: IE 6 - 11
    				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
    				return elem.isDisabled === disabled ||

    					// Where there is no isDisabled, check manually
    					/* jshint -W018 */
    					elem.isDisabled !== !disabled &&
    					inDisabledFieldset( elem ) === disabled;
    			}

    			return elem.disabled === disabled;

    		// Try to winnow out elements that can't be disabled before trusting the disabled property.
    		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
    		// even exist on them, let alone have a boolean value.
    		} else if ( "label" in elem ) {
    			return elem.disabled === disabled;
    		}

    		// Remaining elements are neither :enabled nor :disabled
    		return false;
    	};
    }

    /**
     * Returns a function to use in pseudos for positionals
     * @param {Function} fn
     */
    function createPositionalPseudo( fn ) {
    	return markFunction( function( argument ) {
    		argument = +argument;
    		return markFunction( function( seed, matches ) {
    			var j,
    				matchIndexes = fn( [], seed.length, argument ),
    				i = matchIndexes.length;

    			// Match elements found at the specified indexes
    			while ( i-- ) {
    				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
    					seed[ j ] = !( matches[ j ] = seed[ j ] );
    				}
    			}
    		} );
    	} );
    }

    /**
     * Checks a node for validity as a Sizzle context
     * @param {Element|Object=} context
     * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
     */
    function testContext( context ) {
    	return context && typeof context.getElementsByTagName !== "undefined" && context;
    }

    // Expose support vars for convenience
    support = Sizzle.support = {};

    /**
     * Detects XML nodes
     * @param {Element|Object} elem An element or a document
     * @returns {Boolean} True iff elem is a non-HTML XML node
     */
    isXML = Sizzle.isXML = function( elem ) {
    	var namespace = elem && elem.namespaceURI,
    		docElem = elem && ( elem.ownerDocument || elem ).documentElement;

    	// Support: IE <=8
    	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
    	// https://bugs.jquery.com/ticket/4833
    	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
    };

    /**
     * Sets document-related variables once based on the current document
     * @param {Element|Object} [doc] An element or document object to use to set the document
     * @returns {Object} Returns the current document
     */
    setDocument = Sizzle.setDocument = function( node ) {
    	var hasCompare, subWindow,
    		doc = node ? node.ownerDocument || node : preferredDoc;

    	// Return early if doc is invalid or already selected
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
    		return document;
    	}

    	// Update global variables
    	document = doc;
    	docElem = document.documentElement;
    	documentIsHTML = !isXML( document );

    	// Support: IE 9 - 11+, Edge 12 - 18+
    	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( preferredDoc != document &&
    		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

    		// Support: IE 11, Edge
    		if ( subWindow.addEventListener ) {
    			subWindow.addEventListener( "unload", unloadHandler, false );

    		// Support: IE 9 - 10 only
    		} else if ( subWindow.attachEvent ) {
    			subWindow.attachEvent( "onunload", unloadHandler );
    		}
    	}

    	// Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
    	// Safari 4 - 5 only, Opera <=11.6 - 12.x only
    	// IE/Edge & older browsers don't support the :scope pseudo-class.
    	// Support: Safari 6.0 only
    	// Safari 6.0 supports :scope but it's an alias of :root there.
    	support.scope = assert( function( el ) {
    		docElem.appendChild( el ).appendChild( document.createElement( "div" ) );
    		return typeof el.querySelectorAll !== "undefined" &&
    			!el.querySelectorAll( ":scope fieldset div" ).length;
    	} );

    	/* Attributes
    	---------------------------------------------------------------------- */

    	// Support: IE<8
    	// Verify that getAttribute really returns attributes and not properties
    	// (excepting IE8 booleans)
    	support.attributes = assert( function( el ) {
    		el.className = "i";
    		return !el.getAttribute( "className" );
    	} );

    	/* getElement(s)By*
    	---------------------------------------------------------------------- */

    	// Check if getElementsByTagName("*") returns only elements
    	support.getElementsByTagName = assert( function( el ) {
    		el.appendChild( document.createComment( "" ) );
    		return !el.getElementsByTagName( "*" ).length;
    	} );

    	// Support: IE<9
    	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

    	// Support: IE<10
    	// Check if getElementById returns elements by name
    	// The broken getElementById methods don't pick up programmatically-set names,
    	// so use a roundabout getElementsByName test
    	support.getById = assert( function( el ) {
    		docElem.appendChild( el ).id = expando;
    		return !document.getElementsByName || !document.getElementsByName( expando ).length;
    	} );

    	// ID filter and find
    	if ( support.getById ) {
    		Expr.filter[ "ID" ] = function( id ) {
    			var attrId = id.replace( runescape, funescape );
    			return function( elem ) {
    				return elem.getAttribute( "id" ) === attrId;
    			};
    		};
    		Expr.find[ "ID" ] = function( id, context ) {
    			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
    				var elem = context.getElementById( id );
    				return elem ? [ elem ] : [];
    			}
    		};
    	} else {
    		Expr.filter[ "ID" ] =  function( id ) {
    			var attrId = id.replace( runescape, funescape );
    			return function( elem ) {
    				var node = typeof elem.getAttributeNode !== "undefined" &&
    					elem.getAttributeNode( "id" );
    				return node && node.value === attrId;
    			};
    		};

    		// Support: IE 6 - 7 only
    		// getElementById is not reliable as a find shortcut
    		Expr.find[ "ID" ] = function( id, context ) {
    			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
    				var node, i, elems,
    					elem = context.getElementById( id );

    				if ( elem ) {

    					// Verify the id attribute
    					node = elem.getAttributeNode( "id" );
    					if ( node && node.value === id ) {
    						return [ elem ];
    					}

    					// Fall back on getElementsByName
    					elems = context.getElementsByName( id );
    					i = 0;
    					while ( ( elem = elems[ i++ ] ) ) {
    						node = elem.getAttributeNode( "id" );
    						if ( node && node.value === id ) {
    							return [ elem ];
    						}
    					}
    				}

    				return [];
    			}
    		};
    	}

    	// Tag
    	Expr.find[ "TAG" ] = support.getElementsByTagName ?
    		function( tag, context ) {
    			if ( typeof context.getElementsByTagName !== "undefined" ) {
    				return context.getElementsByTagName( tag );

    			// DocumentFragment nodes don't have gEBTN
    			} else if ( support.qsa ) {
    				return context.querySelectorAll( tag );
    			}
    		} :

    		function( tag, context ) {
    			var elem,
    				tmp = [],
    				i = 0,

    				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
    				results = context.getElementsByTagName( tag );

    			// Filter out possible comments
    			if ( tag === "*" ) {
    				while ( ( elem = results[ i++ ] ) ) {
    					if ( elem.nodeType === 1 ) {
    						tmp.push( elem );
    					}
    				}

    				return tmp;
    			}
    			return results;
    		};

    	// Class
    	Expr.find[ "CLASS" ] = support.getElementsByClassName && function( className, context ) {
    		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
    			return context.getElementsByClassName( className );
    		}
    	};

    	/* QSA/matchesSelector
    	---------------------------------------------------------------------- */

    	// QSA and matchesSelector support

    	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
    	rbuggyMatches = [];

    	// qSa(:focus) reports false when true (Chrome 21)
    	// We allow this because of a bug in IE8/9 that throws an error
    	// whenever `document.activeElement` is accessed on an iframe
    	// So, we allow :focus to pass through QSA all the time to avoid the IE error
    	// See https://bugs.jquery.com/ticket/13378
    	rbuggyQSA = [];

    	if ( ( support.qsa = rnative.test( document.querySelectorAll ) ) ) {

    		// Build QSA regex
    		// Regex strategy adopted from Diego Perini
    		assert( function( el ) {

    			var input;

    			// Select is set to empty string on purpose
    			// This is to test IE's treatment of not explicitly
    			// setting a boolean content attribute,
    			// since its presence should be enough
    			// https://bugs.jquery.com/ticket/12359
    			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
    				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
    				"<option selected=''></option></select>";

    			// Support: IE8, Opera 11-12.16
    			// Nothing should be selected when empty strings follow ^= or $= or *=
    			// The test attribute must be unknown in Opera but "safe" for WinRT
    			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
    			if ( el.querySelectorAll( "[msallowcapture^='']" ).length ) {
    				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
    			}

    			// Support: IE8
    			// Boolean attributes and "value" are not treated correctly
    			if ( !el.querySelectorAll( "[selected]" ).length ) {
    				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
    			}

    			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
    			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
    				rbuggyQSA.push( "~=" );
    			}

    			// Support: IE 11+, Edge 15 - 18+
    			// IE 11/Edge don't find elements on a `[name='']` query in some cases.
    			// Adding a temporary attribute to the document before the selection works
    			// around the issue.
    			// Interestingly, IE 10 & older don't seem to have the issue.
    			input = document.createElement( "input" );
    			input.setAttribute( "name", "" );
    			el.appendChild( input );
    			if ( !el.querySelectorAll( "[name='']" ).length ) {
    				rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
    					whitespace + "*(?:''|\"\")" );
    			}

    			// Webkit/Opera - :checked should return selected option elements
    			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
    			// IE8 throws error here and will not see later tests
    			if ( !el.querySelectorAll( ":checked" ).length ) {
    				rbuggyQSA.push( ":checked" );
    			}

    			// Support: Safari 8+, iOS 8+
    			// https://bugs.webkit.org/show_bug.cgi?id=136851
    			// In-page `selector#id sibling-combinator selector` fails
    			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
    				rbuggyQSA.push( ".#.+[+~]" );
    			}

    			// Support: Firefox <=3.6 - 5 only
    			// Old Firefox doesn't throw on a badly-escaped identifier.
    			el.querySelectorAll( "\\\f" );
    			rbuggyQSA.push( "[\\r\\n\\f]" );
    		} );

    		assert( function( el ) {
    			el.innerHTML = "<a href='' disabled='disabled'></a>" +
    				"<select disabled='disabled'><option/></select>";

    			// Support: Windows 8 Native Apps
    			// The type and name attributes are restricted during .innerHTML assignment
    			var input = document.createElement( "input" );
    			input.setAttribute( "type", "hidden" );
    			el.appendChild( input ).setAttribute( "name", "D" );

    			// Support: IE8
    			// Enforce case-sensitivity of name attribute
    			if ( el.querySelectorAll( "[name=d]" ).length ) {
    				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
    			}

    			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
    			// IE8 throws error here and will not see later tests
    			if ( el.querySelectorAll( ":enabled" ).length !== 2 ) {
    				rbuggyQSA.push( ":enabled", ":disabled" );
    			}

    			// Support: IE9-11+
    			// IE's :disabled selector does not pick up the children of disabled fieldsets
    			docElem.appendChild( el ).disabled = true;
    			if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
    				rbuggyQSA.push( ":enabled", ":disabled" );
    			}

    			// Support: Opera 10 - 11 only
    			// Opera 10-11 does not throw on post-comma invalid pseudos
    			el.querySelectorAll( "*,:x" );
    			rbuggyQSA.push( ",.*:" );
    		} );
    	}

    	if ( ( support.matchesSelector = rnative.test( ( matches = docElem.matches ||
    		docElem.webkitMatchesSelector ||
    		docElem.mozMatchesSelector ||
    		docElem.oMatchesSelector ||
    		docElem.msMatchesSelector ) ) ) ) {

    		assert( function( el ) {

    			// Check to see if it's possible to do matchesSelector
    			// on a disconnected node (IE 9)
    			support.disconnectedMatch = matches.call( el, "*" );

    			// This should fail with an exception
    			// Gecko does not error, returns false instead
    			matches.call( el, "[s!='']:x" );
    			rbuggyMatches.push( "!=", pseudos );
    		} );
    	}

    	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );
    	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join( "|" ) );

    	/* Contains
    	---------------------------------------------------------------------- */
    	hasCompare = rnative.test( docElem.compareDocumentPosition );

    	// Element contains another
    	// Purposefully self-exclusive
    	// As in, an element does not contain itself
    	contains = hasCompare || rnative.test( docElem.contains ) ?
    		function( a, b ) {
    			var adown = a.nodeType === 9 ? a.documentElement : a,
    				bup = b && b.parentNode;
    			return a === bup || !!( bup && bup.nodeType === 1 && (
    				adown.contains ?
    					adown.contains( bup ) :
    					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
    			) );
    		} :
    		function( a, b ) {
    			if ( b ) {
    				while ( ( b = b.parentNode ) ) {
    					if ( b === a ) {
    						return true;
    					}
    				}
    			}
    			return false;
    		};

    	/* Sorting
    	---------------------------------------------------------------------- */

    	// Document order sorting
    	sortOrder = hasCompare ?
    	function( a, b ) {

    		// Flag for duplicate removal
    		if ( a === b ) {
    			hasDuplicate = true;
    			return 0;
    		}

    		// Sort on method existence if only one input has compareDocumentPosition
    		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
    		if ( compare ) {
    			return compare;
    		}

    		// Calculate position if both inputs belong to the same document
    		// Support: IE 11+, Edge 17 - 18+
    		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    		// two documents; shallow comparisons work.
    		// eslint-disable-next-line eqeqeq
    		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
    			a.compareDocumentPosition( b ) :

    			// Otherwise we know they are disconnected
    			1;

    		// Disconnected nodes
    		if ( compare & 1 ||
    			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

    			// Choose the first element that is related to our preferred document
    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			// eslint-disable-next-line eqeqeq
    			if ( a == document || a.ownerDocument == preferredDoc &&
    				contains( preferredDoc, a ) ) {
    				return -1;
    			}

    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			// eslint-disable-next-line eqeqeq
    			if ( b == document || b.ownerDocument == preferredDoc &&
    				contains( preferredDoc, b ) ) {
    				return 1;
    			}

    			// Maintain original order
    			return sortInput ?
    				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
    				0;
    		}

    		return compare & 4 ? -1 : 1;
    	} :
    	function( a, b ) {

    		// Exit early if the nodes are identical
    		if ( a === b ) {
    			hasDuplicate = true;
    			return 0;
    		}

    		var cur,
    			i = 0,
    			aup = a.parentNode,
    			bup = b.parentNode,
    			ap = [ a ],
    			bp = [ b ];

    		// Parentless nodes are either documents or disconnected
    		if ( !aup || !bup ) {

    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			/* eslint-disable eqeqeq */
    			return a == document ? -1 :
    				b == document ? 1 :
    				/* eslint-enable eqeqeq */
    				aup ? -1 :
    				bup ? 1 :
    				sortInput ?
    				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
    				0;

    		// If the nodes are siblings, we can do a quick check
    		} else if ( aup === bup ) {
    			return siblingCheck( a, b );
    		}

    		// Otherwise we need full lists of their ancestors for comparison
    		cur = a;
    		while ( ( cur = cur.parentNode ) ) {
    			ap.unshift( cur );
    		}
    		cur = b;
    		while ( ( cur = cur.parentNode ) ) {
    			bp.unshift( cur );
    		}

    		// Walk down the tree looking for a discrepancy
    		while ( ap[ i ] === bp[ i ] ) {
    			i++;
    		}

    		return i ?

    			// Do a sibling check if the nodes have a common ancestor
    			siblingCheck( ap[ i ], bp[ i ] ) :

    			// Otherwise nodes in our document sort first
    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			/* eslint-disable eqeqeq */
    			ap[ i ] == preferredDoc ? -1 :
    			bp[ i ] == preferredDoc ? 1 :
    			/* eslint-enable eqeqeq */
    			0;
    	};

    	return document;
    };

    Sizzle.matches = function( expr, elements ) {
    	return Sizzle( expr, null, null, elements );
    };

    Sizzle.matchesSelector = function( elem, expr ) {
    	setDocument( elem );

    	if ( support.matchesSelector && documentIsHTML &&
    		!nonnativeSelectorCache[ expr + " " ] &&
    		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
    		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

    		try {
    			var ret = matches.call( elem, expr );

    			// IE 9's matchesSelector returns false on disconnected nodes
    			if ( ret || support.disconnectedMatch ||

    				// As well, disconnected nodes are said to be in a document
    				// fragment in IE 9
    				elem.document && elem.document.nodeType !== 11 ) {
    				return ret;
    			}
    		} catch ( e ) {
    			nonnativeSelectorCache( expr, true );
    		}
    	}

    	return Sizzle( expr, document, null, [ elem ] ).length > 0;
    };

    Sizzle.contains = function( context, elem ) {

    	// Set document vars if needed
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( ( context.ownerDocument || context ) != document ) {
    		setDocument( context );
    	}
    	return contains( context, elem );
    };

    Sizzle.attr = function( elem, name ) {

    	// Set document vars if needed
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( ( elem.ownerDocument || elem ) != document ) {
    		setDocument( elem );
    	}

    	var fn = Expr.attrHandle[ name.toLowerCase() ],

    		// Don't get fooled by Object.prototype properties (jQuery #13807)
    		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
    			fn( elem, name, !documentIsHTML ) :
    			undefined;

    	return val !== undefined ?
    		val :
    		support.attributes || !documentIsHTML ?
    			elem.getAttribute( name ) :
    			( val = elem.getAttributeNode( name ) ) && val.specified ?
    				val.value :
    				null;
    };

    Sizzle.escape = function( sel ) {
    	return ( sel + "" ).replace( rcssescape, fcssescape );
    };

    Sizzle.error = function( msg ) {
    	throw new Error( "Syntax error, unrecognized expression: " + msg );
    };

    /**
     * Document sorting and removing duplicates
     * @param {ArrayLike} results
     */
    Sizzle.uniqueSort = function( results ) {
    	var elem,
    		duplicates = [],
    		j = 0,
    		i = 0;

    	// Unless we *know* we can detect duplicates, assume their presence
    	hasDuplicate = !support.detectDuplicates;
    	sortInput = !support.sortStable && results.slice( 0 );
    	results.sort( sortOrder );

    	if ( hasDuplicate ) {
    		while ( ( elem = results[ i++ ] ) ) {
    			if ( elem === results[ i ] ) {
    				j = duplicates.push( i );
    			}
    		}
    		while ( j-- ) {
    			results.splice( duplicates[ j ], 1 );
    		}
    	}

    	// Clear input after sorting to release objects
    	// See https://github.com/jquery/sizzle/pull/225
    	sortInput = null;

    	return results;
    };

    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param {Array|Element} elem
     */
    getText = Sizzle.getText = function( elem ) {
    	var node,
    		ret = "",
    		i = 0,
    		nodeType = elem.nodeType;

    	if ( !nodeType ) {

    		// If no nodeType, this is expected to be an array
    		while ( ( node = elem[ i++ ] ) ) {

    			// Do not traverse comment nodes
    			ret += getText( node );
    		}
    	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {

    		// Use textContent for elements
    		// innerText usage removed for consistency of new lines (jQuery #11153)
    		if ( typeof elem.textContent === "string" ) {
    			return elem.textContent;
    		} else {

    			// Traverse its children
    			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
    				ret += getText( elem );
    			}
    		}
    	} else if ( nodeType === 3 || nodeType === 4 ) {
    		return elem.nodeValue;
    	}

    	// Do not include comment or processing instruction nodes

    	return ret;
    };

    Expr = Sizzle.selectors = {

    	// Can be adjusted by the user
    	cacheLength: 50,

    	createPseudo: markFunction,

    	match: matchExpr,

    	attrHandle: {},

    	find: {},

    	relative: {
    		">": { dir: "parentNode", first: true },
    		" ": { dir: "parentNode" },
    		"+": { dir: "previousSibling", first: true },
    		"~": { dir: "previousSibling" }
    	},

    	preFilter: {
    		"ATTR": function( match ) {
    			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

    			// Move the given value to match[3] whether quoted or unquoted
    			match[ 3 ] = ( match[ 3 ] || match[ 4 ] ||
    				match[ 5 ] || "" ).replace( runescape, funescape );

    			if ( match[ 2 ] === "~=" ) {
    				match[ 3 ] = " " + match[ 3 ] + " ";
    			}

    			return match.slice( 0, 4 );
    		},

    		"CHILD": function( match ) {

    			/* matches from matchExpr["CHILD"]
    				1 type (only|nth|...)
    				2 what (child|of-type)
    				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
    				4 xn-component of xn+y argument ([+-]?\d*n|)
    				5 sign of xn-component
    				6 x of xn-component
    				7 sign of y-component
    				8 y of y-component
    			*/
    			match[ 1 ] = match[ 1 ].toLowerCase();

    			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

    				// nth-* requires argument
    				if ( !match[ 3 ] ) {
    					Sizzle.error( match[ 0 ] );
    				}

    				// numeric x and y parameters for Expr.filter.CHILD
    				// remember that false/true cast respectively to 0/1
    				match[ 4 ] = +( match[ 4 ] ?
    					match[ 5 ] + ( match[ 6 ] || 1 ) :
    					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" ) );
    				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

    				// other types prohibit arguments
    			} else if ( match[ 3 ] ) {
    				Sizzle.error( match[ 0 ] );
    			}

    			return match;
    		},

    		"PSEUDO": function( match ) {
    			var excess,
    				unquoted = !match[ 6 ] && match[ 2 ];

    			if ( matchExpr[ "CHILD" ].test( match[ 0 ] ) ) {
    				return null;
    			}

    			// Accept quoted arguments as-is
    			if ( match[ 3 ] ) {
    				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

    			// Strip excess characters from unquoted arguments
    			} else if ( unquoted && rpseudo.test( unquoted ) &&

    				// Get excess from tokenize (recursively)
    				( excess = tokenize( unquoted, true ) ) &&

    				// advance to the next closing parenthesis
    				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

    				// excess is a negative index
    				match[ 0 ] = match[ 0 ].slice( 0, excess );
    				match[ 2 ] = unquoted.slice( 0, excess );
    			}

    			// Return only captures needed by the pseudo filter method (type and argument)
    			return match.slice( 0, 3 );
    		}
    	},

    	filter: {

    		"TAG": function( nodeNameSelector ) {
    			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
    			return nodeNameSelector === "*" ?
    				function() {
    					return true;
    				} :
    				function( elem ) {
    					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
    				};
    		},

    		"CLASS": function( className ) {
    			var pattern = classCache[ className + " " ];

    			return pattern ||
    				( pattern = new RegExp( "(^|" + whitespace +
    					")" + className + "(" + whitespace + "|$)" ) ) && classCache(
    						className, function( elem ) {
    							return pattern.test(
    								typeof elem.className === "string" && elem.className ||
    								typeof elem.getAttribute !== "undefined" &&
    									elem.getAttribute( "class" ) ||
    								""
    							);
    				} );
    		},

    		"ATTR": function( name, operator, check ) {
    			return function( elem ) {
    				var result = Sizzle.attr( elem, name );

    				if ( result == null ) {
    					return operator === "!=";
    				}
    				if ( !operator ) {
    					return true;
    				}

    				result += "";

    				/* eslint-disable max-len */

    				return operator === "=" ? result === check :
    					operator === "!=" ? result !== check :
    					operator === "^=" ? check && result.indexOf( check ) === 0 :
    					operator === "*=" ? check && result.indexOf( check ) > -1 :
    					operator === "$=" ? check && result.slice( -check.length ) === check :
    					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
    					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
    					false;
    				/* eslint-enable max-len */

    			};
    		},

    		"CHILD": function( type, what, _argument, first, last ) {
    			var simple = type.slice( 0, 3 ) !== "nth",
    				forward = type.slice( -4 ) !== "last",
    				ofType = what === "of-type";

    			return first === 1 && last === 0 ?

    				// Shortcut for :nth-*(n)
    				function( elem ) {
    					return !!elem.parentNode;
    				} :

    				function( elem, _context, xml ) {
    					var cache, uniqueCache, outerCache, node, nodeIndex, start,
    						dir = simple !== forward ? "nextSibling" : "previousSibling",
    						parent = elem.parentNode,
    						name = ofType && elem.nodeName.toLowerCase(),
    						useCache = !xml && !ofType,
    						diff = false;

    					if ( parent ) {

    						// :(first|last|only)-(child|of-type)
    						if ( simple ) {
    							while ( dir ) {
    								node = elem;
    								while ( ( node = node[ dir ] ) ) {
    									if ( ofType ?
    										node.nodeName.toLowerCase() === name :
    										node.nodeType === 1 ) {

    										return false;
    									}
    								}

    								// Reverse direction for :only-* (if we haven't yet done so)
    								start = dir = type === "only" && !start && "nextSibling";
    							}
    							return true;
    						}

    						start = [ forward ? parent.firstChild : parent.lastChild ];

    						// non-xml :nth-child(...) stores cache data on `parent`
    						if ( forward && useCache ) {

    							// Seek `elem` from a previously-cached index

    							// ...in a gzip-friendly way
    							node = parent;
    							outerCache = node[ expando ] || ( node[ expando ] = {} );

    							// Support: IE <9 only
    							// Defend against cloned attroperties (jQuery gh-1709)
    							uniqueCache = outerCache[ node.uniqueID ] ||
    								( outerCache[ node.uniqueID ] = {} );

    							cache = uniqueCache[ type ] || [];
    							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
    							diff = nodeIndex && cache[ 2 ];
    							node = nodeIndex && parent.childNodes[ nodeIndex ];

    							while ( ( node = ++nodeIndex && node && node[ dir ] ||

    								// Fallback to seeking `elem` from the start
    								( diff = nodeIndex = 0 ) || start.pop() ) ) {

    								// When found, cache indexes on `parent` and break
    								if ( node.nodeType === 1 && ++diff && node === elem ) {
    									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
    									break;
    								}
    							}

    						} else {

    							// Use previously-cached element index if available
    							if ( useCache ) {

    								// ...in a gzip-friendly way
    								node = elem;
    								outerCache = node[ expando ] || ( node[ expando ] = {} );

    								// Support: IE <9 only
    								// Defend against cloned attroperties (jQuery gh-1709)
    								uniqueCache = outerCache[ node.uniqueID ] ||
    									( outerCache[ node.uniqueID ] = {} );

    								cache = uniqueCache[ type ] || [];
    								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
    								diff = nodeIndex;
    							}

    							// xml :nth-child(...)
    							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
    							if ( diff === false ) {

    								// Use the same loop as above to seek `elem` from the start
    								while ( ( node = ++nodeIndex && node && node[ dir ] ||
    									( diff = nodeIndex = 0 ) || start.pop() ) ) {

    									if ( ( ofType ?
    										node.nodeName.toLowerCase() === name :
    										node.nodeType === 1 ) &&
    										++diff ) {

    										// Cache the index of each encountered element
    										if ( useCache ) {
    											outerCache = node[ expando ] ||
    												( node[ expando ] = {} );

    											// Support: IE <9 only
    											// Defend against cloned attroperties (jQuery gh-1709)
    											uniqueCache = outerCache[ node.uniqueID ] ||
    												( outerCache[ node.uniqueID ] = {} );

    											uniqueCache[ type ] = [ dirruns, diff ];
    										}

    										if ( node === elem ) {
    											break;
    										}
    									}
    								}
    							}
    						}

    						// Incorporate the offset, then check against cycle size
    						diff -= last;
    						return diff === first || ( diff % first === 0 && diff / first >= 0 );
    					}
    				};
    		},

    		"PSEUDO": function( pseudo, argument ) {

    			// pseudo-class names are case-insensitive
    			// http://www.w3.org/TR/selectors/#pseudo-classes
    			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
    			// Remember that setFilters inherits from pseudos
    			var args,
    				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
    					Sizzle.error( "unsupported pseudo: " + pseudo );

    			// The user may use createPseudo to indicate that
    			// arguments are needed to create the filter function
    			// just as Sizzle does
    			if ( fn[ expando ] ) {
    				return fn( argument );
    			}

    			// But maintain support for old signatures
    			if ( fn.length > 1 ) {
    				args = [ pseudo, pseudo, "", argument ];
    				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
    					markFunction( function( seed, matches ) {
    						var idx,
    							matched = fn( seed, argument ),
    							i = matched.length;
    						while ( i-- ) {
    							idx = indexOf( seed, matched[ i ] );
    							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
    						}
    					} ) :
    					function( elem ) {
    						return fn( elem, 0, args );
    					};
    			}

    			return fn;
    		}
    	},

    	pseudos: {

    		// Potentially complex pseudos
    		"not": markFunction( function( selector ) {

    			// Trim the selector passed to compile
    			// to avoid treating leading and trailing
    			// spaces as combinators
    			var input = [],
    				results = [],
    				matcher = compile( selector.replace( rtrim, "$1" ) );

    			return matcher[ expando ] ?
    				markFunction( function( seed, matches, _context, xml ) {
    					var elem,
    						unmatched = matcher( seed, null, xml, [] ),
    						i = seed.length;

    					// Match elements unmatched by `matcher`
    					while ( i-- ) {
    						if ( ( elem = unmatched[ i ] ) ) {
    							seed[ i ] = !( matches[ i ] = elem );
    						}
    					}
    				} ) :
    				function( elem, _context, xml ) {
    					input[ 0 ] = elem;
    					matcher( input, null, xml, results );

    					// Don't keep the element (issue #299)
    					input[ 0 ] = null;
    					return !results.pop();
    				};
    		} ),

    		"has": markFunction( function( selector ) {
    			return function( elem ) {
    				return Sizzle( selector, elem ).length > 0;
    			};
    		} ),

    		"contains": markFunction( function( text ) {
    			text = text.replace( runescape, funescape );
    			return function( elem ) {
    				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
    			};
    		} ),

    		// "Whether an element is represented by a :lang() selector
    		// is based solely on the element's language value
    		// being equal to the identifier C,
    		// or beginning with the identifier C immediately followed by "-".
    		// The matching of C against the element's language value is performed case-insensitively.
    		// The identifier C does not have to be a valid language name."
    		// http://www.w3.org/TR/selectors/#lang-pseudo
    		"lang": markFunction( function( lang ) {

    			// lang value must be a valid identifier
    			if ( !ridentifier.test( lang || "" ) ) {
    				Sizzle.error( "unsupported lang: " + lang );
    			}
    			lang = lang.replace( runescape, funescape ).toLowerCase();
    			return function( elem ) {
    				var elemLang;
    				do {
    					if ( ( elemLang = documentIsHTML ?
    						elem.lang :
    						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

    						elemLang = elemLang.toLowerCase();
    						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
    					}
    				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
    				return false;
    			};
    		} ),

    		// Miscellaneous
    		"target": function( elem ) {
    			var hash = window.location && window.location.hash;
    			return hash && hash.slice( 1 ) === elem.id;
    		},

    		"root": function( elem ) {
    			return elem === docElem;
    		},

    		"focus": function( elem ) {
    			return elem === document.activeElement &&
    				( !document.hasFocus || document.hasFocus() ) &&
    				!!( elem.type || elem.href || ~elem.tabIndex );
    		},

    		// Boolean properties
    		"enabled": createDisabledPseudo( false ),
    		"disabled": createDisabledPseudo( true ),

    		"checked": function( elem ) {

    			// In CSS3, :checked should return both checked and selected elements
    			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
    			var nodeName = elem.nodeName.toLowerCase();
    			return ( nodeName === "input" && !!elem.checked ) ||
    				( nodeName === "option" && !!elem.selected );
    		},

    		"selected": function( elem ) {

    			// Accessing this property makes selected-by-default
    			// options in Safari work properly
    			if ( elem.parentNode ) {
    				// eslint-disable-next-line no-unused-expressions
    				elem.parentNode.selectedIndex;
    			}

    			return elem.selected === true;
    		},

    		// Contents
    		"empty": function( elem ) {

    			// http://www.w3.org/TR/selectors/#empty-pseudo
    			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
    			//   but not by others (comment: 8; processing instruction: 7; etc.)
    			// nodeType < 6 works because attributes (2) do not appear as children
    			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
    				if ( elem.nodeType < 6 ) {
    					return false;
    				}
    			}
    			return true;
    		},

    		"parent": function( elem ) {
    			return !Expr.pseudos[ "empty" ]( elem );
    		},

    		// Element/input types
    		"header": function( elem ) {
    			return rheader.test( elem.nodeName );
    		},

    		"input": function( elem ) {
    			return rinputs.test( elem.nodeName );
    		},

    		"button": function( elem ) {
    			var name = elem.nodeName.toLowerCase();
    			return name === "input" && elem.type === "button" || name === "button";
    		},

    		"text": function( elem ) {
    			var attr;
    			return elem.nodeName.toLowerCase() === "input" &&
    				elem.type === "text" &&

    				// Support: IE<8
    				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
    				( ( attr = elem.getAttribute( "type" ) ) == null ||
    					attr.toLowerCase() === "text" );
    		},

    		// Position-in-collection
    		"first": createPositionalPseudo( function() {
    			return [ 0 ];
    		} ),

    		"last": createPositionalPseudo( function( _matchIndexes, length ) {
    			return [ length - 1 ];
    		} ),

    		"eq": createPositionalPseudo( function( _matchIndexes, length, argument ) {
    			return [ argument < 0 ? argument + length : argument ];
    		} ),

    		"even": createPositionalPseudo( function( matchIndexes, length ) {
    			var i = 0;
    			for ( ; i < length; i += 2 ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} ),

    		"odd": createPositionalPseudo( function( matchIndexes, length ) {
    			var i = 1;
    			for ( ; i < length; i += 2 ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} ),

    		"lt": createPositionalPseudo( function( matchIndexes, length, argument ) {
    			var i = argument < 0 ?
    				argument + length :
    				argument > length ?
    					length :
    					argument;
    			for ( ; --i >= 0; ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} ),

    		"gt": createPositionalPseudo( function( matchIndexes, length, argument ) {
    			var i = argument < 0 ? argument + length : argument;
    			for ( ; ++i < length; ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} )
    	}
    };

    Expr.pseudos[ "nth" ] = Expr.pseudos[ "eq" ];

    // Add button/input type pseudos
    for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
    	Expr.pseudos[ i ] = createInputPseudo( i );
    }
    for ( i in { submit: true, reset: true } ) {
    	Expr.pseudos[ i ] = createButtonPseudo( i );
    }

    // Easy API for creating new setFilters
    function setFilters() {}
    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();

    tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
    	var matched, match, tokens, type,
    		soFar, groups, preFilters,
    		cached = tokenCache[ selector + " " ];

    	if ( cached ) {
    		return parseOnly ? 0 : cached.slice( 0 );
    	}

    	soFar = selector;
    	groups = [];
    	preFilters = Expr.preFilter;

    	while ( soFar ) {

    		// Comma and first run
    		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
    			if ( match ) {

    				// Don't consume trailing commas as valid
    				soFar = soFar.slice( match[ 0 ].length ) || soFar;
    			}
    			groups.push( ( tokens = [] ) );
    		}

    		matched = false;

    		// Combinators
    		if ( ( match = rcombinators.exec( soFar ) ) ) {
    			matched = match.shift();
    			tokens.push( {
    				value: matched,

    				// Cast descendant combinators to space
    				type: match[ 0 ].replace( rtrim, " " )
    			} );
    			soFar = soFar.slice( matched.length );
    		}

    		// Filters
    		for ( type in Expr.filter ) {
    			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
    				( match = preFilters[ type ]( match ) ) ) ) {
    				matched = match.shift();
    				tokens.push( {
    					value: matched,
    					type: type,
    					matches: match
    				} );
    				soFar = soFar.slice( matched.length );
    			}
    		}

    		if ( !matched ) {
    			break;
    		}
    	}

    	// Return the length of the invalid excess
    	// if we're just parsing
    	// Otherwise, throw an error or return tokens
    	return parseOnly ?
    		soFar.length :
    		soFar ?
    			Sizzle.error( selector ) :

    			// Cache the tokens
    			tokenCache( selector, groups ).slice( 0 );
    };

    function toSelector( tokens ) {
    	var i = 0,
    		len = tokens.length,
    		selector = "";
    	for ( ; i < len; i++ ) {
    		selector += tokens[ i ].value;
    	}
    	return selector;
    }

    function addCombinator( matcher, combinator, base ) {
    	var dir = combinator.dir,
    		skip = combinator.next,
    		key = skip || dir,
    		checkNonElements = base && key === "parentNode",
    		doneName = done++;

    	return combinator.first ?

    		// Check against closest ancestor/preceding element
    		function( elem, context, xml ) {
    			while ( ( elem = elem[ dir ] ) ) {
    				if ( elem.nodeType === 1 || checkNonElements ) {
    					return matcher( elem, context, xml );
    				}
    			}
    			return false;
    		} :

    		// Check against all ancestor/preceding elements
    		function( elem, context, xml ) {
    			var oldCache, uniqueCache, outerCache,
    				newCache = [ dirruns, doneName ];

    			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
    			if ( xml ) {
    				while ( ( elem = elem[ dir ] ) ) {
    					if ( elem.nodeType === 1 || checkNonElements ) {
    						if ( matcher( elem, context, xml ) ) {
    							return true;
    						}
    					}
    				}
    			} else {
    				while ( ( elem = elem[ dir ] ) ) {
    					if ( elem.nodeType === 1 || checkNonElements ) {
    						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

    						// Support: IE <9 only
    						// Defend against cloned attroperties (jQuery gh-1709)
    						uniqueCache = outerCache[ elem.uniqueID ] ||
    							( outerCache[ elem.uniqueID ] = {} );

    						if ( skip && skip === elem.nodeName.toLowerCase() ) {
    							elem = elem[ dir ] || elem;
    						} else if ( ( oldCache = uniqueCache[ key ] ) &&
    							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

    							// Assign to newCache so results back-propagate to previous elements
    							return ( newCache[ 2 ] = oldCache[ 2 ] );
    						} else {

    							// Reuse newcache so results back-propagate to previous elements
    							uniqueCache[ key ] = newCache;

    							// A match means we're done; a fail means we have to keep checking
    							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
    								return true;
    							}
    						}
    					}
    				}
    			}
    			return false;
    		};
    }

    function elementMatcher( matchers ) {
    	return matchers.length > 1 ?
    		function( elem, context, xml ) {
    			var i = matchers.length;
    			while ( i-- ) {
    				if ( !matchers[ i ]( elem, context, xml ) ) {
    					return false;
    				}
    			}
    			return true;
    		} :
    		matchers[ 0 ];
    }

    function multipleContexts( selector, contexts, results ) {
    	var i = 0,
    		len = contexts.length;
    	for ( ; i < len; i++ ) {
    		Sizzle( selector, contexts[ i ], results );
    	}
    	return results;
    }

    function condense( unmatched, map, filter, context, xml ) {
    	var elem,
    		newUnmatched = [],
    		i = 0,
    		len = unmatched.length,
    		mapped = map != null;

    	for ( ; i < len; i++ ) {
    		if ( ( elem = unmatched[ i ] ) ) {
    			if ( !filter || filter( elem, context, xml ) ) {
    				newUnmatched.push( elem );
    				if ( mapped ) {
    					map.push( i );
    				}
    			}
    		}
    	}

    	return newUnmatched;
    }

    function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
    	if ( postFilter && !postFilter[ expando ] ) {
    		postFilter = setMatcher( postFilter );
    	}
    	if ( postFinder && !postFinder[ expando ] ) {
    		postFinder = setMatcher( postFinder, postSelector );
    	}
    	return markFunction( function( seed, results, context, xml ) {
    		var temp, i, elem,
    			preMap = [],
    			postMap = [],
    			preexisting = results.length,

    			// Get initial elements from seed or context
    			elems = seed || multipleContexts(
    				selector || "*",
    				context.nodeType ? [ context ] : context,
    				[]
    			),

    			// Prefilter to get matcher input, preserving a map for seed-results synchronization
    			matcherIn = preFilter && ( seed || !selector ) ?
    				condense( elems, preMap, preFilter, context, xml ) :
    				elems,

    			matcherOut = matcher ?

    				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
    				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

    					// ...intermediate processing is necessary
    					[] :

    					// ...otherwise use results directly
    					results :
    				matcherIn;

    		// Find primary matches
    		if ( matcher ) {
    			matcher( matcherIn, matcherOut, context, xml );
    		}

    		// Apply postFilter
    		if ( postFilter ) {
    			temp = condense( matcherOut, postMap );
    			postFilter( temp, [], context, xml );

    			// Un-match failing elements by moving them back to matcherIn
    			i = temp.length;
    			while ( i-- ) {
    				if ( ( elem = temp[ i ] ) ) {
    					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
    				}
    			}
    		}

    		if ( seed ) {
    			if ( postFinder || preFilter ) {
    				if ( postFinder ) {

    					// Get the final matcherOut by condensing this intermediate into postFinder contexts
    					temp = [];
    					i = matcherOut.length;
    					while ( i-- ) {
    						if ( ( elem = matcherOut[ i ] ) ) {

    							// Restore matcherIn since elem is not yet a final match
    							temp.push( ( matcherIn[ i ] = elem ) );
    						}
    					}
    					postFinder( null, ( matcherOut = [] ), temp, xml );
    				}

    				// Move matched elements from seed to results to keep them synchronized
    				i = matcherOut.length;
    				while ( i-- ) {
    					if ( ( elem = matcherOut[ i ] ) &&
    						( temp = postFinder ? indexOf( seed, elem ) : preMap[ i ] ) > -1 ) {

    						seed[ temp ] = !( results[ temp ] = elem );
    					}
    				}
    			}

    		// Add elements to results, through postFinder if defined
    		} else {
    			matcherOut = condense(
    				matcherOut === results ?
    					matcherOut.splice( preexisting, matcherOut.length ) :
    					matcherOut
    			);
    			if ( postFinder ) {
    				postFinder( null, results, matcherOut, xml );
    			} else {
    				push.apply( results, matcherOut );
    			}
    		}
    	} );
    }

    function matcherFromTokens( tokens ) {
    	var checkContext, matcher, j,
    		len = tokens.length,
    		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
    		implicitRelative = leadingRelative || Expr.relative[ " " ],
    		i = leadingRelative ? 1 : 0,

    		// The foundational matcher ensures that elements are reachable from top-level context(s)
    		matchContext = addCombinator( function( elem ) {
    			return elem === checkContext;
    		}, implicitRelative, true ),
    		matchAnyContext = addCombinator( function( elem ) {
    			return indexOf( checkContext, elem ) > -1;
    		}, implicitRelative, true ),
    		matchers = [ function( elem, context, xml ) {
    			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
    				( checkContext = context ).nodeType ?
    					matchContext( elem, context, xml ) :
    					matchAnyContext( elem, context, xml ) );

    			// Avoid hanging onto element (issue #299)
    			checkContext = null;
    			return ret;
    		} ];

    	for ( ; i < len; i++ ) {
    		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
    			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
    		} else {
    			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

    			// Return special upon seeing a positional matcher
    			if ( matcher[ expando ] ) {

    				// Find the next relative operator (if any) for proper handling
    				j = ++i;
    				for ( ; j < len; j++ ) {
    					if ( Expr.relative[ tokens[ j ].type ] ) {
    						break;
    					}
    				}
    				return setMatcher(
    					i > 1 && elementMatcher( matchers ),
    					i > 1 && toSelector(

    					// If the preceding token was a descendant combinator, insert an implicit any-element `*`
    					tokens
    						.slice( 0, i - 1 )
    						.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
    					).replace( rtrim, "$1" ),
    					matcher,
    					i < j && matcherFromTokens( tokens.slice( i, j ) ),
    					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
    					j < len && toSelector( tokens )
    				);
    			}
    			matchers.push( matcher );
    		}
    	}

    	return elementMatcher( matchers );
    }

    function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
    	var bySet = setMatchers.length > 0,
    		byElement = elementMatchers.length > 0,
    		superMatcher = function( seed, context, xml, results, outermost ) {
    			var elem, j, matcher,
    				matchedCount = 0,
    				i = "0",
    				unmatched = seed && [],
    				setMatched = [],
    				contextBackup = outermostContext,

    				// We must always have either seed elements or outermost context
    				elems = seed || byElement && Expr.find[ "TAG" ]( "*", outermost ),

    				// Use integer dirruns iff this is the outermost matcher
    				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
    				len = elems.length;

    			if ( outermost ) {

    				// Support: IE 11+, Edge 17 - 18+
    				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    				// two documents; shallow comparisons work.
    				// eslint-disable-next-line eqeqeq
    				outermostContext = context == document || context || outermost;
    			}

    			// Add elements passing elementMatchers directly to results
    			// Support: IE<9, Safari
    			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
    			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
    				if ( byElement && elem ) {
    					j = 0;

    					// Support: IE 11+, Edge 17 - 18+
    					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    					// two documents; shallow comparisons work.
    					// eslint-disable-next-line eqeqeq
    					if ( !context && elem.ownerDocument != document ) {
    						setDocument( elem );
    						xml = !documentIsHTML;
    					}
    					while ( ( matcher = elementMatchers[ j++ ] ) ) {
    						if ( matcher( elem, context || document, xml ) ) {
    							results.push( elem );
    							break;
    						}
    					}
    					if ( outermost ) {
    						dirruns = dirrunsUnique;
    					}
    				}

    				// Track unmatched elements for set filters
    				if ( bySet ) {

    					// They will have gone through all possible matchers
    					if ( ( elem = !matcher && elem ) ) {
    						matchedCount--;
    					}

    					// Lengthen the array for every element, matched or not
    					if ( seed ) {
    						unmatched.push( elem );
    					}
    				}
    			}

    			// `i` is now the count of elements visited above, and adding it to `matchedCount`
    			// makes the latter nonnegative.
    			matchedCount += i;

    			// Apply set filters to unmatched elements
    			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
    			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
    			// no element matchers and no seed.
    			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
    			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
    			// numerically zero.
    			if ( bySet && i !== matchedCount ) {
    				j = 0;
    				while ( ( matcher = setMatchers[ j++ ] ) ) {
    					matcher( unmatched, setMatched, context, xml );
    				}

    				if ( seed ) {

    					// Reintegrate element matches to eliminate the need for sorting
    					if ( matchedCount > 0 ) {
    						while ( i-- ) {
    							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
    								setMatched[ i ] = pop.call( results );
    							}
    						}
    					}

    					// Discard index placeholder values to get only actual matches
    					setMatched = condense( setMatched );
    				}

    				// Add matches to results
    				push.apply( results, setMatched );

    				// Seedless set matches succeeding multiple successful matchers stipulate sorting
    				if ( outermost && !seed && setMatched.length > 0 &&
    					( matchedCount + setMatchers.length ) > 1 ) {

    					Sizzle.uniqueSort( results );
    				}
    			}

    			// Override manipulation of globals by nested matchers
    			if ( outermost ) {
    				dirruns = dirrunsUnique;
    				outermostContext = contextBackup;
    			}

    			return unmatched;
    		};

    	return bySet ?
    		markFunction( superMatcher ) :
    		superMatcher;
    }

    compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
    	var i,
    		setMatchers = [],
    		elementMatchers = [],
    		cached = compilerCache[ selector + " " ];

    	if ( !cached ) {

    		// Generate a function of recursive functions that can be used to check each element
    		if ( !match ) {
    			match = tokenize( selector );
    		}
    		i = match.length;
    		while ( i-- ) {
    			cached = matcherFromTokens( match[ i ] );
    			if ( cached[ expando ] ) {
    				setMatchers.push( cached );
    			} else {
    				elementMatchers.push( cached );
    			}
    		}

    		// Cache the compiled function
    		cached = compilerCache(
    			selector,
    			matcherFromGroupMatchers( elementMatchers, setMatchers )
    		);

    		// Save selector and tokenization
    		cached.selector = selector;
    	}
    	return cached;
    };

    /**
     * A low-level selection function that works with Sizzle's compiled
     *  selector functions
     * @param {String|Function} selector A selector or a pre-compiled
     *  selector function built with Sizzle.compile
     * @param {Element} context
     * @param {Array} [results]
     * @param {Array} [seed] A set of elements to match against
     */
    select = Sizzle.select = function( selector, context, results, seed ) {
    	var i, tokens, token, type, find,
    		compiled = typeof selector === "function" && selector,
    		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

    	results = results || [];

    	// Try to minimize operations if there is only one selector in the list and no seed
    	// (the latter of which guarantees us context)
    	if ( match.length === 1 ) {

    		// Reduce context if the leading compound selector is an ID
    		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
    		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
    			context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

    			context = ( Expr.find[ "ID" ]( token.matches[ 0 ]
    				.replace( runescape, funescape ), context ) || [] )[ 0 ];
    			if ( !context ) {
    				return results;

    			// Precompiled matchers will still verify ancestry, so step up a level
    			} else if ( compiled ) {
    				context = context.parentNode;
    			}

    			selector = selector.slice( tokens.shift().value.length );
    		}

    		// Fetch a seed set for right-to-left matching
    		i = matchExpr[ "needsContext" ].test( selector ) ? 0 : tokens.length;
    		while ( i-- ) {
    			token = tokens[ i ];

    			// Abort if we hit a combinator
    			if ( Expr.relative[ ( type = token.type ) ] ) {
    				break;
    			}
    			if ( ( find = Expr.find[ type ] ) ) {

    				// Search, expanding context for leading sibling combinators
    				if ( ( seed = find(
    					token.matches[ 0 ].replace( runescape, funescape ),
    					rsibling.test( tokens[ 0 ].type ) && testContext( context.parentNode ) ||
    						context
    				) ) ) {

    					// If seed is empty or no tokens remain, we can return early
    					tokens.splice( i, 1 );
    					selector = seed.length && toSelector( tokens );
    					if ( !selector ) {
    						push.apply( results, seed );
    						return results;
    					}

    					break;
    				}
    			}
    		}
    	}

    	// Compile and execute a filtering function if one is not provided
    	// Provide `match` to avoid retokenization if we modified the selector above
    	( compiled || compile( selector, match ) )(
    		seed,
    		context,
    		!documentIsHTML,
    		results,
    		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
    	);
    	return results;
    };

    // One-time assignments

    // Sort stability
    support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

    // Support: Chrome 14-35+
    // Always assume duplicates if they aren't passed to the comparison function
    support.detectDuplicates = !!hasDuplicate;

    // Initialize against the default document
    setDocument();

    // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
    // Detached nodes confoundingly follow *each other*
    support.sortDetached = assert( function( el ) {

    	// Should return 1, but returns 4 (following)
    	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
    } );

    // Support: IE<8
    // Prevent attribute/property "interpolation"
    // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
    if ( !assert( function( el ) {
    	el.innerHTML = "<a href='#'></a>";
    	return el.firstChild.getAttribute( "href" ) === "#";
    } ) ) {
    	addHandle( "type|href|height|width", function( elem, name, isXML ) {
    		if ( !isXML ) {
    			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
    		}
    	} );
    }

    // Support: IE<9
    // Use defaultValue in place of getAttribute("value")
    if ( !support.attributes || !assert( function( el ) {
    	el.innerHTML = "<input/>";
    	el.firstChild.setAttribute( "value", "" );
    	return el.firstChild.getAttribute( "value" ) === "";
    } ) ) {
    	addHandle( "value", function( elem, _name, isXML ) {
    		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
    			return elem.defaultValue;
    		}
    	} );
    }

    // Support: IE<9
    // Use getAttributeNode to fetch booleans when getAttribute lies
    if ( !assert( function( el ) {
    	return el.getAttribute( "disabled" ) == null;
    } ) ) {
    	addHandle( booleans, function( elem, name, isXML ) {
    		var val;
    		if ( !isXML ) {
    			return elem[ name ] === true ? name.toLowerCase() :
    				( val = elem.getAttributeNode( name ) ) && val.specified ?
    					val.value :
    					null;
    		}
    	} );
    }

    return Sizzle;

    } )( window );



    jQuery.find = Sizzle;
    jQuery.expr = Sizzle.selectors;

    // Deprecated
    jQuery.expr[ ":" ] = jQuery.expr.pseudos;
    jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
    jQuery.text = Sizzle.getText;
    jQuery.isXMLDoc = Sizzle.isXML;
    jQuery.contains = Sizzle.contains;
    jQuery.escapeSelector = Sizzle.escape;




    var dir = function( elem, dir, until ) {
    	var matched = [],
    		truncate = until !== undefined;

    	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
    		if ( elem.nodeType === 1 ) {
    			if ( truncate && jQuery( elem ).is( until ) ) {
    				break;
    			}
    			matched.push( elem );
    		}
    	}
    	return matched;
    };


    var siblings = function( n, elem ) {
    	var matched = [];

    	for ( ; n; n = n.nextSibling ) {
    		if ( n.nodeType === 1 && n !== elem ) {
    			matched.push( n );
    		}
    	}

    	return matched;
    };


    var rneedsContext = jQuery.expr.match.needsContext;



    function nodeName( elem, name ) {

    	return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

    }
    var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



    // Implement the identical functionality for filter and not
    function winnow( elements, qualifier, not ) {
    	if ( isFunction( qualifier ) ) {
    		return jQuery.grep( elements, function( elem, i ) {
    			return !!qualifier.call( elem, i, elem ) !== not;
    		} );
    	}

    	// Single element
    	if ( qualifier.nodeType ) {
    		return jQuery.grep( elements, function( elem ) {
    			return ( elem === qualifier ) !== not;
    		} );
    	}

    	// Arraylike of elements (jQuery, arguments, Array)
    	if ( typeof qualifier !== "string" ) {
    		return jQuery.grep( elements, function( elem ) {
    			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
    		} );
    	}

    	// Filtered directly for both simple and complex selectors
    	return jQuery.filter( qualifier, elements, not );
    }

    jQuery.filter = function( expr, elems, not ) {
    	var elem = elems[ 0 ];

    	if ( not ) {
    		expr = ":not(" + expr + ")";
    	}

    	if ( elems.length === 1 && elem.nodeType === 1 ) {
    		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
    	}

    	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
    		return elem.nodeType === 1;
    	} ) );
    };

    jQuery.fn.extend( {
    	find: function( selector ) {
    		var i, ret,
    			len = this.length,
    			self = this;

    		if ( typeof selector !== "string" ) {
    			return this.pushStack( jQuery( selector ).filter( function() {
    				for ( i = 0; i < len; i++ ) {
    					if ( jQuery.contains( self[ i ], this ) ) {
    						return true;
    					}
    				}
    			} ) );
    		}

    		ret = this.pushStack( [] );

    		for ( i = 0; i < len; i++ ) {
    			jQuery.find( selector, self[ i ], ret );
    		}

    		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
    	},
    	filter: function( selector ) {
    		return this.pushStack( winnow( this, selector || [], false ) );
    	},
    	not: function( selector ) {
    		return this.pushStack( winnow( this, selector || [], true ) );
    	},
    	is: function( selector ) {
    		return !!winnow(
    			this,

    			// If this is a positional/relative selector, check membership in the returned set
    			// so $("p:first").is("p:last") won't return true for a doc with two "p".
    			typeof selector === "string" && rneedsContext.test( selector ) ?
    				jQuery( selector ) :
    				selector || [],
    			false
    		).length;
    	}
    } );


    // Initialize a jQuery object


    // A central reference to the root jQuery(document)
    var rootjQuery,

    	// A simple way to check for HTML strings
    	// Prioritize #id over <tag> to avoid XSS via location.hash (trac-9521)
    	// Strict HTML recognition (trac-11290: must start with <)
    	// Shortcut simple #id case for speed
    	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

    	init = jQuery.fn.init = function( selector, context, root ) {
    		var match, elem;

    		// HANDLE: $(""), $(null), $(undefined), $(false)
    		if ( !selector ) {
    			return this;
    		}

    		// Method init() accepts an alternate rootjQuery
    		// so migrate can support jQuery.sub (gh-2101)
    		root = root || rootjQuery;

    		// Handle HTML strings
    		if ( typeof selector === "string" ) {
    			if ( selector[ 0 ] === "<" &&
    				selector[ selector.length - 1 ] === ">" &&
    				selector.length >= 3 ) {

    				// Assume that strings that start and end with <> are HTML and skip the regex check
    				match = [ null, selector, null ];

    			} else {
    				match = rquickExpr.exec( selector );
    			}

    			// Match html or make sure no context is specified for #id
    			if ( match && ( match[ 1 ] || !context ) ) {

    				// HANDLE: $(html) -> $(array)
    				if ( match[ 1 ] ) {
    					context = context instanceof jQuery ? context[ 0 ] : context;

    					// Option to run scripts is true for back-compat
    					// Intentionally let the error be thrown if parseHTML is not present
    					jQuery.merge( this, jQuery.parseHTML(
    						match[ 1 ],
    						context && context.nodeType ? context.ownerDocument || context : document,
    						true
    					) );

    					// HANDLE: $(html, props)
    					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
    						for ( match in context ) {

    							// Properties of context are called as methods if possible
    							if ( isFunction( this[ match ] ) ) {
    								this[ match ]( context[ match ] );

    							// ...and otherwise set as attributes
    							} else {
    								this.attr( match, context[ match ] );
    							}
    						}
    					}

    					return this;

    				// HANDLE: $(#id)
    				} else {
    					elem = document.getElementById( match[ 2 ] );

    					if ( elem ) {

    						// Inject the element directly into the jQuery object
    						this[ 0 ] = elem;
    						this.length = 1;
    					}
    					return this;
    				}

    			// HANDLE: $(expr, $(...))
    			} else if ( !context || context.jquery ) {
    				return ( context || root ).find( selector );

    			// HANDLE: $(expr, context)
    			// (which is just equivalent to: $(context).find(expr)
    			} else {
    				return this.constructor( context ).find( selector );
    			}

    		// HANDLE: $(DOMElement)
    		} else if ( selector.nodeType ) {
    			this[ 0 ] = selector;
    			this.length = 1;
    			return this;

    		// HANDLE: $(function)
    		// Shortcut for document ready
    		} else if ( isFunction( selector ) ) {
    			return root.ready !== undefined ?
    				root.ready( selector ) :

    				// Execute immediately if ready is not present
    				selector( jQuery );
    		}

    		return jQuery.makeArray( selector, this );
    	};

    // Give the init function the jQuery prototype for later instantiation
    init.prototype = jQuery.fn;

    // Initialize central reference
    rootjQuery = jQuery( document );


    var rparentsprev = /^(?:parents|prev(?:Until|All))/,

    	// Methods guaranteed to produce a unique set when starting from a unique set
    	guaranteedUnique = {
    		children: true,
    		contents: true,
    		next: true,
    		prev: true
    	};

    jQuery.fn.extend( {
    	has: function( target ) {
    		var targets = jQuery( target, this ),
    			l = targets.length;

    		return this.filter( function() {
    			var i = 0;
    			for ( ; i < l; i++ ) {
    				if ( jQuery.contains( this, targets[ i ] ) ) {
    					return true;
    				}
    			}
    		} );
    	},

    	closest: function( selectors, context ) {
    		var cur,
    			i = 0,
    			l = this.length,
    			matched = [],
    			targets = typeof selectors !== "string" && jQuery( selectors );

    		// Positional selectors never match, since there's no _selection_ context
    		if ( !rneedsContext.test( selectors ) ) {
    			for ( ; i < l; i++ ) {
    				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

    					// Always skip document fragments
    					if ( cur.nodeType < 11 && ( targets ?
    						targets.index( cur ) > -1 :

    						// Don't pass non-elements to Sizzle
    						cur.nodeType === 1 &&
    							jQuery.find.matchesSelector( cur, selectors ) ) ) {

    						matched.push( cur );
    						break;
    					}
    				}
    			}
    		}

    		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
    	},

    	// Determine the position of an element within the set
    	index: function( elem ) {

    		// No argument, return index in parent
    		if ( !elem ) {
    			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
    		}

    		// Index in selector
    		if ( typeof elem === "string" ) {
    			return indexOf.call( jQuery( elem ), this[ 0 ] );
    		}

    		// Locate the position of the desired element
    		return indexOf.call( this,

    			// If it receives a jQuery object, the first element is used
    			elem.jquery ? elem[ 0 ] : elem
    		);
    	},

    	add: function( selector, context ) {
    		return this.pushStack(
    			jQuery.uniqueSort(
    				jQuery.merge( this.get(), jQuery( selector, context ) )
    			)
    		);
    	},

    	addBack: function( selector ) {
    		return this.add( selector == null ?
    			this.prevObject : this.prevObject.filter( selector )
    		);
    	}
    } );

    function sibling( cur, dir ) {
    	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
    	return cur;
    }

    jQuery.each( {
    	parent: function( elem ) {
    		var parent = elem.parentNode;
    		return parent && parent.nodeType !== 11 ? parent : null;
    	},
    	parents: function( elem ) {
    		return dir( elem, "parentNode" );
    	},
    	parentsUntil: function( elem, _i, until ) {
    		return dir( elem, "parentNode", until );
    	},
    	next: function( elem ) {
    		return sibling( elem, "nextSibling" );
    	},
    	prev: function( elem ) {
    		return sibling( elem, "previousSibling" );
    	},
    	nextAll: function( elem ) {
    		return dir( elem, "nextSibling" );
    	},
    	prevAll: function( elem ) {
    		return dir( elem, "previousSibling" );
    	},
    	nextUntil: function( elem, _i, until ) {
    		return dir( elem, "nextSibling", until );
    	},
    	prevUntil: function( elem, _i, until ) {
    		return dir( elem, "previousSibling", until );
    	},
    	siblings: function( elem ) {
    		return siblings( ( elem.parentNode || {} ).firstChild, elem );
    	},
    	children: function( elem ) {
    		return siblings( elem.firstChild );
    	},
    	contents: function( elem ) {
    		if ( elem.contentDocument != null &&

    			// Support: IE 11+
    			// <object> elements with no `data` attribute has an object
    			// `contentDocument` with a `null` prototype.
    			getProto( elem.contentDocument ) ) {

    			return elem.contentDocument;
    		}

    		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
    		// Treat the template element as a regular one in browsers that
    		// don't support it.
    		if ( nodeName( elem, "template" ) ) {
    			elem = elem.content || elem;
    		}

    		return jQuery.merge( [], elem.childNodes );
    	}
    }, function( name, fn ) {
    	jQuery.fn[ name ] = function( until, selector ) {
    		var matched = jQuery.map( this, fn, until );

    		if ( name.slice( -5 ) !== "Until" ) {
    			selector = until;
    		}

    		if ( selector && typeof selector === "string" ) {
    			matched = jQuery.filter( selector, matched );
    		}

    		if ( this.length > 1 ) {

    			// Remove duplicates
    			if ( !guaranteedUnique[ name ] ) {
    				jQuery.uniqueSort( matched );
    			}

    			// Reverse order for parents* and prev-derivatives
    			if ( rparentsprev.test( name ) ) {
    				matched.reverse();
    			}
    		}

    		return this.pushStack( matched );
    	};
    } );
    var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



    // Convert String-formatted options into Object-formatted ones
    function createOptions( options ) {
    	var object = {};
    	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
    		object[ flag ] = true;
    	} );
    	return object;
    }

    /*
     * Create a callback list using the following parameters:
     *
     *	options: an optional list of space-separated options that will change how
     *			the callback list behaves or a more traditional option object
     *
     * By default a callback list will act like an event callback list and can be
     * "fired" multiple times.
     *
     * Possible options:
     *
     *	once:			will ensure the callback list can only be fired once (like a Deferred)
     *
     *	memory:			will keep track of previous values and will call any callback added
     *					after the list has been fired right away with the latest "memorized"
     *					values (like a Deferred)
     *
     *	unique:			will ensure a callback can only be added once (no duplicate in the list)
     *
     *	stopOnFalse:	interrupt callings when a callback returns false
     *
     */
    jQuery.Callbacks = function( options ) {

    	// Convert options from String-formatted to Object-formatted if needed
    	// (we check in cache first)
    	options = typeof options === "string" ?
    		createOptions( options ) :
    		jQuery.extend( {}, options );

    	var // Flag to know if list is currently firing
    		firing,

    		// Last fire value for non-forgettable lists
    		memory,

    		// Flag to know if list was already fired
    		fired,

    		// Flag to prevent firing
    		locked,

    		// Actual callback list
    		list = [],

    		// Queue of execution data for repeatable lists
    		queue = [],

    		// Index of currently firing callback (modified by add/remove as needed)
    		firingIndex = -1,

    		// Fire callbacks
    		fire = function() {

    			// Enforce single-firing
    			locked = locked || options.once;

    			// Execute callbacks for all pending executions,
    			// respecting firingIndex overrides and runtime changes
    			fired = firing = true;
    			for ( ; queue.length; firingIndex = -1 ) {
    				memory = queue.shift();
    				while ( ++firingIndex < list.length ) {

    					// Run callback and check for early termination
    					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
    						options.stopOnFalse ) {

    						// Jump to end and forget the data so .add doesn't re-fire
    						firingIndex = list.length;
    						memory = false;
    					}
    				}
    			}

    			// Forget the data if we're done with it
    			if ( !options.memory ) {
    				memory = false;
    			}

    			firing = false;

    			// Clean up if we're done firing for good
    			if ( locked ) {

    				// Keep an empty list if we have data for future add calls
    				if ( memory ) {
    					list = [];

    				// Otherwise, this object is spent
    				} else {
    					list = "";
    				}
    			}
    		},

    		// Actual Callbacks object
    		self = {

    			// Add a callback or a collection of callbacks to the list
    			add: function() {
    				if ( list ) {

    					// If we have memory from a past run, we should fire after adding
    					if ( memory && !firing ) {
    						firingIndex = list.length - 1;
    						queue.push( memory );
    					}

    					( function add( args ) {
    						jQuery.each( args, function( _, arg ) {
    							if ( isFunction( arg ) ) {
    								if ( !options.unique || !self.has( arg ) ) {
    									list.push( arg );
    								}
    							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

    								// Inspect recursively
    								add( arg );
    							}
    						} );
    					} )( arguments );

    					if ( memory && !firing ) {
    						fire();
    					}
    				}
    				return this;
    			},

    			// Remove a callback from the list
    			remove: function() {
    				jQuery.each( arguments, function( _, arg ) {
    					var index;
    					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
    						list.splice( index, 1 );

    						// Handle firing indexes
    						if ( index <= firingIndex ) {
    							firingIndex--;
    						}
    					}
    				} );
    				return this;
    			},

    			// Check if a given callback is in the list.
    			// If no argument is given, return whether or not list has callbacks attached.
    			has: function( fn ) {
    				return fn ?
    					jQuery.inArray( fn, list ) > -1 :
    					list.length > 0;
    			},

    			// Remove all callbacks from the list
    			empty: function() {
    				if ( list ) {
    					list = [];
    				}
    				return this;
    			},

    			// Disable .fire and .add
    			// Abort any current/pending executions
    			// Clear all callbacks and values
    			disable: function() {
    				locked = queue = [];
    				list = memory = "";
    				return this;
    			},
    			disabled: function() {
    				return !list;
    			},

    			// Disable .fire
    			// Also disable .add unless we have memory (since it would have no effect)
    			// Abort any pending executions
    			lock: function() {
    				locked = queue = [];
    				if ( !memory && !firing ) {
    					list = memory = "";
    				}
    				return this;
    			},
    			locked: function() {
    				return !!locked;
    			},

    			// Call all callbacks with the given context and arguments
    			fireWith: function( context, args ) {
    				if ( !locked ) {
    					args = args || [];
    					args = [ context, args.slice ? args.slice() : args ];
    					queue.push( args );
    					if ( !firing ) {
    						fire();
    					}
    				}
    				return this;
    			},

    			// Call all the callbacks with the given arguments
    			fire: function() {
    				self.fireWith( this, arguments );
    				return this;
    			},

    			// To know if the callbacks have already been called at least once
    			fired: function() {
    				return !!fired;
    			}
    		};

    	return self;
    };


    function Identity( v ) {
    	return v;
    }
    function Thrower( ex ) {
    	throw ex;
    }

    function adoptValue( value, resolve, reject, noValue ) {
    	var method;

    	try {

    		// Check for promise aspect first to privilege synchronous behavior
    		if ( value && isFunction( ( method = value.promise ) ) ) {
    			method.call( value ).done( resolve ).fail( reject );

    		// Other thenables
    		} else if ( value && isFunction( ( method = value.then ) ) ) {
    			method.call( value, resolve, reject );

    		// Other non-thenables
    		} else {

    			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
    			// * false: [ value ].slice( 0 ) => resolve( value )
    			// * true: [ value ].slice( 1 ) => resolve()
    			resolve.apply( undefined, [ value ].slice( noValue ) );
    		}

    	// For Promises/A+, convert exceptions into rejections
    	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
    	// Deferred#then to conditionally suppress rejection.
    	} catch ( value ) {

    		// Support: Android 4.0 only
    		// Strict mode functions invoked without .call/.apply get global-object context
    		reject.apply( undefined, [ value ] );
    	}
    }

    jQuery.extend( {

    	Deferred: function( func ) {
    		var tuples = [

    				// action, add listener, callbacks,
    				// ... .then handlers, argument index, [final state]
    				[ "notify", "progress", jQuery.Callbacks( "memory" ),
    					jQuery.Callbacks( "memory" ), 2 ],
    				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
    					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
    				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
    					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
    			],
    			state = "pending",
    			promise = {
    				state: function() {
    					return state;
    				},
    				always: function() {
    					deferred.done( arguments ).fail( arguments );
    					return this;
    				},
    				"catch": function( fn ) {
    					return promise.then( null, fn );
    				},

    				// Keep pipe for back-compat
    				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
    					var fns = arguments;

    					return jQuery.Deferred( function( newDefer ) {
    						jQuery.each( tuples, function( _i, tuple ) {

    							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
    							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

    							// deferred.progress(function() { bind to newDefer or newDefer.notify })
    							// deferred.done(function() { bind to newDefer or newDefer.resolve })
    							// deferred.fail(function() { bind to newDefer or newDefer.reject })
    							deferred[ tuple[ 1 ] ]( function() {
    								var returned = fn && fn.apply( this, arguments );
    								if ( returned && isFunction( returned.promise ) ) {
    									returned.promise()
    										.progress( newDefer.notify )
    										.done( newDefer.resolve )
    										.fail( newDefer.reject );
    								} else {
    									newDefer[ tuple[ 0 ] + "With" ](
    										this,
    										fn ? [ returned ] : arguments
    									);
    								}
    							} );
    						} );
    						fns = null;
    					} ).promise();
    				},
    				then: function( onFulfilled, onRejected, onProgress ) {
    					var maxDepth = 0;
    					function resolve( depth, deferred, handler, special ) {
    						return function() {
    							var that = this,
    								args = arguments,
    								mightThrow = function() {
    									var returned, then;

    									// Support: Promises/A+ section 2.3.3.3.3
    									// https://promisesaplus.com/#point-59
    									// Ignore double-resolution attempts
    									if ( depth < maxDepth ) {
    										return;
    									}

    									returned = handler.apply( that, args );

    									// Support: Promises/A+ section 2.3.1
    									// https://promisesaplus.com/#point-48
    									if ( returned === deferred.promise() ) {
    										throw new TypeError( "Thenable self-resolution" );
    									}

    									// Support: Promises/A+ sections 2.3.3.1, 3.5
    									// https://promisesaplus.com/#point-54
    									// https://promisesaplus.com/#point-75
    									// Retrieve `then` only once
    									then = returned &&

    										// Support: Promises/A+ section 2.3.4
    										// https://promisesaplus.com/#point-64
    										// Only check objects and functions for thenability
    										( typeof returned === "object" ||
    											typeof returned === "function" ) &&
    										returned.then;

    									// Handle a returned thenable
    									if ( isFunction( then ) ) {

    										// Special processors (notify) just wait for resolution
    										if ( special ) {
    											then.call(
    												returned,
    												resolve( maxDepth, deferred, Identity, special ),
    												resolve( maxDepth, deferred, Thrower, special )
    											);

    										// Normal processors (resolve) also hook into progress
    										} else {

    											// ...and disregard older resolution values
    											maxDepth++;

    											then.call(
    												returned,
    												resolve( maxDepth, deferred, Identity, special ),
    												resolve( maxDepth, deferred, Thrower, special ),
    												resolve( maxDepth, deferred, Identity,
    													deferred.notifyWith )
    											);
    										}

    									// Handle all other returned values
    									} else {

    										// Only substitute handlers pass on context
    										// and multiple values (non-spec behavior)
    										if ( handler !== Identity ) {
    											that = undefined;
    											args = [ returned ];
    										}

    										// Process the value(s)
    										// Default process is resolve
    										( special || deferred.resolveWith )( that, args );
    									}
    								},

    								// Only normal processors (resolve) catch and reject exceptions
    								process = special ?
    									mightThrow :
    									function() {
    										try {
    											mightThrow();
    										} catch ( e ) {

    											if ( jQuery.Deferred.exceptionHook ) {
    												jQuery.Deferred.exceptionHook( e,
    													process.stackTrace );
    											}

    											// Support: Promises/A+ section 2.3.3.3.4.1
    											// https://promisesaplus.com/#point-61
    											// Ignore post-resolution exceptions
    											if ( depth + 1 >= maxDepth ) {

    												// Only substitute handlers pass on context
    												// and multiple values (non-spec behavior)
    												if ( handler !== Thrower ) {
    													that = undefined;
    													args = [ e ];
    												}

    												deferred.rejectWith( that, args );
    											}
    										}
    									};

    							// Support: Promises/A+ section 2.3.3.3.1
    							// https://promisesaplus.com/#point-57
    							// Re-resolve promises immediately to dodge false rejection from
    							// subsequent errors
    							if ( depth ) {
    								process();
    							} else {

    								// Call an optional hook to record the stack, in case of exception
    								// since it's otherwise lost when execution goes async
    								if ( jQuery.Deferred.getStackHook ) {
    									process.stackTrace = jQuery.Deferred.getStackHook();
    								}
    								window.setTimeout( process );
    							}
    						};
    					}

    					return jQuery.Deferred( function( newDefer ) {

    						// progress_handlers.add( ... )
    						tuples[ 0 ][ 3 ].add(
    							resolve(
    								0,
    								newDefer,
    								isFunction( onProgress ) ?
    									onProgress :
    									Identity,
    								newDefer.notifyWith
    							)
    						);

    						// fulfilled_handlers.add( ... )
    						tuples[ 1 ][ 3 ].add(
    							resolve(
    								0,
    								newDefer,
    								isFunction( onFulfilled ) ?
    									onFulfilled :
    									Identity
    							)
    						);

    						// rejected_handlers.add( ... )
    						tuples[ 2 ][ 3 ].add(
    							resolve(
    								0,
    								newDefer,
    								isFunction( onRejected ) ?
    									onRejected :
    									Thrower
    							)
    						);
    					} ).promise();
    				},

    				// Get a promise for this deferred
    				// If obj is provided, the promise aspect is added to the object
    				promise: function( obj ) {
    					return obj != null ? jQuery.extend( obj, promise ) : promise;
    				}
    			},
    			deferred = {};

    		// Add list-specific methods
    		jQuery.each( tuples, function( i, tuple ) {
    			var list = tuple[ 2 ],
    				stateString = tuple[ 5 ];

    			// promise.progress = list.add
    			// promise.done = list.add
    			// promise.fail = list.add
    			promise[ tuple[ 1 ] ] = list.add;

    			// Handle state
    			if ( stateString ) {
    				list.add(
    					function() {

    						// state = "resolved" (i.e., fulfilled)
    						// state = "rejected"
    						state = stateString;
    					},

    					// rejected_callbacks.disable
    					// fulfilled_callbacks.disable
    					tuples[ 3 - i ][ 2 ].disable,

    					// rejected_handlers.disable
    					// fulfilled_handlers.disable
    					tuples[ 3 - i ][ 3 ].disable,

    					// progress_callbacks.lock
    					tuples[ 0 ][ 2 ].lock,

    					// progress_handlers.lock
    					tuples[ 0 ][ 3 ].lock
    				);
    			}

    			// progress_handlers.fire
    			// fulfilled_handlers.fire
    			// rejected_handlers.fire
    			list.add( tuple[ 3 ].fire );

    			// deferred.notify = function() { deferred.notifyWith(...) }
    			// deferred.resolve = function() { deferred.resolveWith(...) }
    			// deferred.reject = function() { deferred.rejectWith(...) }
    			deferred[ tuple[ 0 ] ] = function() {
    				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
    				return this;
    			};

    			// deferred.notifyWith = list.fireWith
    			// deferred.resolveWith = list.fireWith
    			// deferred.rejectWith = list.fireWith
    			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
    		} );

    		// Make the deferred a promise
    		promise.promise( deferred );

    		// Call given func if any
    		if ( func ) {
    			func.call( deferred, deferred );
    		}

    		// All done!
    		return deferred;
    	},

    	// Deferred helper
    	when: function( singleValue ) {
    		var

    			// count of uncompleted subordinates
    			remaining = arguments.length,

    			// count of unprocessed arguments
    			i = remaining,

    			// subordinate fulfillment data
    			resolveContexts = Array( i ),
    			resolveValues = slice.call( arguments ),

    			// the primary Deferred
    			primary = jQuery.Deferred(),

    			// subordinate callback factory
    			updateFunc = function( i ) {
    				return function( value ) {
    					resolveContexts[ i ] = this;
    					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
    					if ( !( --remaining ) ) {
    						primary.resolveWith( resolveContexts, resolveValues );
    					}
    				};
    			};

    		// Single- and empty arguments are adopted like Promise.resolve
    		if ( remaining <= 1 ) {
    			adoptValue( singleValue, primary.done( updateFunc( i ) ).resolve, primary.reject,
    				!remaining );

    			// Use .then() to unwrap secondary thenables (cf. gh-3000)
    			if ( primary.state() === "pending" ||
    				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

    				return primary.then();
    			}
    		}

    		// Multiple arguments are aggregated like Promise.all array elements
    		while ( i-- ) {
    			adoptValue( resolveValues[ i ], updateFunc( i ), primary.reject );
    		}

    		return primary.promise();
    	}
    } );


    // These usually indicate a programmer mistake during development,
    // warn about them ASAP rather than swallowing them by default.
    var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

    jQuery.Deferred.exceptionHook = function( error, stack ) {

    	// Support: IE 8 - 9 only
    	// Console exists when dev tools are open, which can happen at any time
    	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
    		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
    	}
    };




    jQuery.readyException = function( error ) {
    	window.setTimeout( function() {
    		throw error;
    	} );
    };




    // The deferred used on DOM ready
    var readyList = jQuery.Deferred();

    jQuery.fn.ready = function( fn ) {

    	readyList
    		.then( fn )

    		// Wrap jQuery.readyException in a function so that the lookup
    		// happens at the time of error handling instead of callback
    		// registration.
    		.catch( function( error ) {
    			jQuery.readyException( error );
    		} );

    	return this;
    };

    jQuery.extend( {

    	// Is the DOM ready to be used? Set to true once it occurs.
    	isReady: false,

    	// A counter to track how many items to wait for before
    	// the ready event fires. See trac-6781
    	readyWait: 1,

    	// Handle when the DOM is ready
    	ready: function( wait ) {

    		// Abort if there are pending holds or we're already ready
    		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
    			return;
    		}

    		// Remember that the DOM is ready
    		jQuery.isReady = true;

    		// If a normal DOM Ready event fired, decrement, and wait if need be
    		if ( wait !== true && --jQuery.readyWait > 0 ) {
    			return;
    		}

    		// If there are functions bound, to execute
    		readyList.resolveWith( document, [ jQuery ] );
    	}
    } );

    jQuery.ready.then = readyList.then;

    // The ready event handler and self cleanup method
    function completed() {
    	document.removeEventListener( "DOMContentLoaded", completed );
    	window.removeEventListener( "load", completed );
    	jQuery.ready();
    }

    // Catch cases where $(document).ready() is called
    // after the browser event has already occurred.
    // Support: IE <=9 - 10 only
    // Older IE sometimes signals "interactive" too soon
    if ( document.readyState === "complete" ||
    	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

    	// Handle it asynchronously to allow scripts the opportunity to delay ready
    	window.setTimeout( jQuery.ready );

    } else {

    	// Use the handy event callback
    	document.addEventListener( "DOMContentLoaded", completed );

    	// A fallback to window.onload, that will always work
    	window.addEventListener( "load", completed );
    }




    // Multifunctional method to get and set values of a collection
    // The value/s can optionally be executed if it's a function
    var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
    	var i = 0,
    		len = elems.length,
    		bulk = key == null;

    	// Sets many values
    	if ( toType( key ) === "object" ) {
    		chainable = true;
    		for ( i in key ) {
    			access( elems, fn, i, key[ i ], true, emptyGet, raw );
    		}

    	// Sets one value
    	} else if ( value !== undefined ) {
    		chainable = true;

    		if ( !isFunction( value ) ) {
    			raw = true;
    		}

    		if ( bulk ) {

    			// Bulk operations run against the entire set
    			if ( raw ) {
    				fn.call( elems, value );
    				fn = null;

    			// ...except when executing function values
    			} else {
    				bulk = fn;
    				fn = function( elem, _key, value ) {
    					return bulk.call( jQuery( elem ), value );
    				};
    			}
    		}

    		if ( fn ) {
    			for ( ; i < len; i++ ) {
    				fn(
    					elems[ i ], key, raw ?
    						value :
    						value.call( elems[ i ], i, fn( elems[ i ], key ) )
    				);
    			}
    		}
    	}

    	if ( chainable ) {
    		return elems;
    	}

    	// Gets
    	if ( bulk ) {
    		return fn.call( elems );
    	}

    	return len ? fn( elems[ 0 ], key ) : emptyGet;
    };


    // Matches dashed string for camelizing
    var rmsPrefix = /^-ms-/,
    	rdashAlpha = /-([a-z])/g;

    // Used by camelCase as callback to replace()
    function fcamelCase( _all, letter ) {
    	return letter.toUpperCase();
    }

    // Convert dashed to camelCase; used by the css and data modules
    // Support: IE <=9 - 11, Edge 12 - 15
    // Microsoft forgot to hump their vendor prefix (trac-9572)
    function camelCase( string ) {
    	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
    }
    var acceptData = function( owner ) {

    	// Accepts only:
    	//  - Node
    	//    - Node.ELEMENT_NODE
    	//    - Node.DOCUMENT_NODE
    	//  - Object
    	//    - Any
    	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
    };




    function Data() {
    	this.expando = jQuery.expando + Data.uid++;
    }

    Data.uid = 1;

    Data.prototype = {

    	cache: function( owner ) {

    		// Check if the owner object already has a cache
    		var value = owner[ this.expando ];

    		// If not, create one
    		if ( !value ) {
    			value = {};

    			// We can accept data for non-element nodes in modern browsers,
    			// but we should not, see trac-8335.
    			// Always return an empty object.
    			if ( acceptData( owner ) ) {

    				// If it is a node unlikely to be stringify-ed or looped over
    				// use plain assignment
    				if ( owner.nodeType ) {
    					owner[ this.expando ] = value;

    				// Otherwise secure it in a non-enumerable property
    				// configurable must be true to allow the property to be
    				// deleted when data is removed
    				} else {
    					Object.defineProperty( owner, this.expando, {
    						value: value,
    						configurable: true
    					} );
    				}
    			}
    		}

    		return value;
    	},
    	set: function( owner, data, value ) {
    		var prop,
    			cache = this.cache( owner );

    		// Handle: [ owner, key, value ] args
    		// Always use camelCase key (gh-2257)
    		if ( typeof data === "string" ) {
    			cache[ camelCase( data ) ] = value;

    		// Handle: [ owner, { properties } ] args
    		} else {

    			// Copy the properties one-by-one to the cache object
    			for ( prop in data ) {
    				cache[ camelCase( prop ) ] = data[ prop ];
    			}
    		}
    		return cache;
    	},
    	get: function( owner, key ) {
    		return key === undefined ?
    			this.cache( owner ) :

    			// Always use camelCase key (gh-2257)
    			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
    	},
    	access: function( owner, key, value ) {

    		// In cases where either:
    		//
    		//   1. No key was specified
    		//   2. A string key was specified, but no value provided
    		//
    		// Take the "read" path and allow the get method to determine
    		// which value to return, respectively either:
    		//
    		//   1. The entire cache object
    		//   2. The data stored at the key
    		//
    		if ( key === undefined ||
    				( ( key && typeof key === "string" ) && value === undefined ) ) {

    			return this.get( owner, key );
    		}

    		// When the key is not a string, or both a key and value
    		// are specified, set or extend (existing objects) with either:
    		//
    		//   1. An object of properties
    		//   2. A key and value
    		//
    		this.set( owner, key, value );

    		// Since the "set" path can have two possible entry points
    		// return the expected data based on which path was taken[*]
    		return value !== undefined ? value : key;
    	},
    	remove: function( owner, key ) {
    		var i,
    			cache = owner[ this.expando ];

    		if ( cache === undefined ) {
    			return;
    		}

    		if ( key !== undefined ) {

    			// Support array or space separated string of keys
    			if ( Array.isArray( key ) ) {

    				// If key is an array of keys...
    				// We always set camelCase keys, so remove that.
    				key = key.map( camelCase );
    			} else {
    				key = camelCase( key );

    				// If a key with the spaces exists, use it.
    				// Otherwise, create an array by matching non-whitespace
    				key = key in cache ?
    					[ key ] :
    					( key.match( rnothtmlwhite ) || [] );
    			}

    			i = key.length;

    			while ( i-- ) {
    				delete cache[ key[ i ] ];
    			}
    		}

    		// Remove the expando if there's no more data
    		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

    			// Support: Chrome <=35 - 45
    			// Webkit & Blink performance suffers when deleting properties
    			// from DOM nodes, so set to undefined instead
    			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
    			if ( owner.nodeType ) {
    				owner[ this.expando ] = undefined;
    			} else {
    				delete owner[ this.expando ];
    			}
    		}
    	},
    	hasData: function( owner ) {
    		var cache = owner[ this.expando ];
    		return cache !== undefined && !jQuery.isEmptyObject( cache );
    	}
    };
    var dataPriv = new Data();

    var dataUser = new Data();



    //	Implementation Summary
    //
    //	1. Enforce API surface and semantic compatibility with 1.9.x branch
    //	2. Improve the module's maintainability by reducing the storage
    //		paths to a single mechanism.
    //	3. Use the same single mechanism to support "private" and "user" data.
    //	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
    //	5. Avoid exposing implementation details on user objects (eg. expando properties)
    //	6. Provide a clear path for implementation upgrade to WeakMap in 2014

    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    	rmultiDash = /[A-Z]/g;

    function getData( data ) {
    	if ( data === "true" ) {
    		return true;
    	}

    	if ( data === "false" ) {
    		return false;
    	}

    	if ( data === "null" ) {
    		return null;
    	}

    	// Only convert to a number if it doesn't change the string
    	if ( data === +data + "" ) {
    		return +data;
    	}

    	if ( rbrace.test( data ) ) {
    		return JSON.parse( data );
    	}

    	return data;
    }

    function dataAttr( elem, key, data ) {
    	var name;

    	// If nothing was found internally, try to fetch any
    	// data from the HTML5 data-* attribute
    	if ( data === undefined && elem.nodeType === 1 ) {
    		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
    		data = elem.getAttribute( name );

    		if ( typeof data === "string" ) {
    			try {
    				data = getData( data );
    			} catch ( e ) {}

    			// Make sure we set the data so it isn't changed later
    			dataUser.set( elem, key, data );
    		} else {
    			data = undefined;
    		}
    	}
    	return data;
    }

    jQuery.extend( {
    	hasData: function( elem ) {
    		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
    	},

    	data: function( elem, name, data ) {
    		return dataUser.access( elem, name, data );
    	},

    	removeData: function( elem, name ) {
    		dataUser.remove( elem, name );
    	},

    	// TODO: Now that all calls to _data and _removeData have been replaced
    	// with direct calls to dataPriv methods, these can be deprecated.
    	_data: function( elem, name, data ) {
    		return dataPriv.access( elem, name, data );
    	},

    	_removeData: function( elem, name ) {
    		dataPriv.remove( elem, name );
    	}
    } );

    jQuery.fn.extend( {
    	data: function( key, value ) {
    		var i, name, data,
    			elem = this[ 0 ],
    			attrs = elem && elem.attributes;

    		// Gets all values
    		if ( key === undefined ) {
    			if ( this.length ) {
    				data = dataUser.get( elem );

    				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
    					i = attrs.length;
    					while ( i-- ) {

    						// Support: IE 11 only
    						// The attrs elements can be null (trac-14894)
    						if ( attrs[ i ] ) {
    							name = attrs[ i ].name;
    							if ( name.indexOf( "data-" ) === 0 ) {
    								name = camelCase( name.slice( 5 ) );
    								dataAttr( elem, name, data[ name ] );
    							}
    						}
    					}
    					dataPriv.set( elem, "hasDataAttrs", true );
    				}
    			}

    			return data;
    		}

    		// Sets multiple values
    		if ( typeof key === "object" ) {
    			return this.each( function() {
    				dataUser.set( this, key );
    			} );
    		}

    		return access( this, function( value ) {
    			var data;

    			// The calling jQuery object (element matches) is not empty
    			// (and therefore has an element appears at this[ 0 ]) and the
    			// `value` parameter was not undefined. An empty jQuery object
    			// will result in `undefined` for elem = this[ 0 ] which will
    			// throw an exception if an attempt to read a data cache is made.
    			if ( elem && value === undefined ) {

    				// Attempt to get data from the cache
    				// The key will always be camelCased in Data
    				data = dataUser.get( elem, key );
    				if ( data !== undefined ) {
    					return data;
    				}

    				// Attempt to "discover" the data in
    				// HTML5 custom data-* attrs
    				data = dataAttr( elem, key );
    				if ( data !== undefined ) {
    					return data;
    				}

    				// We tried really hard, but the data doesn't exist.
    				return;
    			}

    			// Set the data...
    			this.each( function() {

    				// We always store the camelCased key
    				dataUser.set( this, key, value );
    			} );
    		}, null, value, arguments.length > 1, null, true );
    	},

    	removeData: function( key ) {
    		return this.each( function() {
    			dataUser.remove( this, key );
    		} );
    	}
    } );


    jQuery.extend( {
    	queue: function( elem, type, data ) {
    		var queue;

    		if ( elem ) {
    			type = ( type || "fx" ) + "queue";
    			queue = dataPriv.get( elem, type );

    			// Speed up dequeue by getting out quickly if this is just a lookup
    			if ( data ) {
    				if ( !queue || Array.isArray( data ) ) {
    					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
    				} else {
    					queue.push( data );
    				}
    			}
    			return queue || [];
    		}
    	},

    	dequeue: function( elem, type ) {
    		type = type || "fx";

    		var queue = jQuery.queue( elem, type ),
    			startLength = queue.length,
    			fn = queue.shift(),
    			hooks = jQuery._queueHooks( elem, type ),
    			next = function() {
    				jQuery.dequeue( elem, type );
    			};

    		// If the fx queue is dequeued, always remove the progress sentinel
    		if ( fn === "inprogress" ) {
    			fn = queue.shift();
    			startLength--;
    		}

    		if ( fn ) {

    			// Add a progress sentinel to prevent the fx queue from being
    			// automatically dequeued
    			if ( type === "fx" ) {
    				queue.unshift( "inprogress" );
    			}

    			// Clear up the last queue stop function
    			delete hooks.stop;
    			fn.call( elem, next, hooks );
    		}

    		if ( !startLength && hooks ) {
    			hooks.empty.fire();
    		}
    	},

    	// Not public - generate a queueHooks object, or return the current one
    	_queueHooks: function( elem, type ) {
    		var key = type + "queueHooks";
    		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
    			empty: jQuery.Callbacks( "once memory" ).add( function() {
    				dataPriv.remove( elem, [ type + "queue", key ] );
    			} )
    		} );
    	}
    } );

    jQuery.fn.extend( {
    	queue: function( type, data ) {
    		var setter = 2;

    		if ( typeof type !== "string" ) {
    			data = type;
    			type = "fx";
    			setter--;
    		}

    		if ( arguments.length < setter ) {
    			return jQuery.queue( this[ 0 ], type );
    		}

    		return data === undefined ?
    			this :
    			this.each( function() {
    				var queue = jQuery.queue( this, type, data );

    				// Ensure a hooks for this queue
    				jQuery._queueHooks( this, type );

    				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
    					jQuery.dequeue( this, type );
    				}
    			} );
    	},
    	dequeue: function( type ) {
    		return this.each( function() {
    			jQuery.dequeue( this, type );
    		} );
    	},
    	clearQueue: function( type ) {
    		return this.queue( type || "fx", [] );
    	},

    	// Get a promise resolved when queues of a certain type
    	// are emptied (fx is the type by default)
    	promise: function( type, obj ) {
    		var tmp,
    			count = 1,
    			defer = jQuery.Deferred(),
    			elements = this,
    			i = this.length,
    			resolve = function() {
    				if ( !( --count ) ) {
    					defer.resolveWith( elements, [ elements ] );
    				}
    			};

    		if ( typeof type !== "string" ) {
    			obj = type;
    			type = undefined;
    		}
    		type = type || "fx";

    		while ( i-- ) {
    			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
    			if ( tmp && tmp.empty ) {
    				count++;
    				tmp.empty.add( resolve );
    			}
    		}
    		resolve();
    		return defer.promise( obj );
    	}
    } );
    var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

    var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


    var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

    var documentElement = document.documentElement;



    	var isAttached = function( elem ) {
    			return jQuery.contains( elem.ownerDocument, elem );
    		},
    		composed = { composed: true };

    	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
    	// Check attachment across shadow DOM boundaries when possible (gh-3504)
    	// Support: iOS 10.0-10.2 only
    	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
    	// leading to errors. We need to check for `getRootNode`.
    	if ( documentElement.getRootNode ) {
    		isAttached = function( elem ) {
    			return jQuery.contains( elem.ownerDocument, elem ) ||
    				elem.getRootNode( composed ) === elem.ownerDocument;
    		};
    	}
    var isHiddenWithinTree = function( elem, el ) {

    		// isHiddenWithinTree might be called from jQuery#filter function;
    		// in that case, element will be second argument
    		elem = el || elem;

    		// Inline style trumps all
    		return elem.style.display === "none" ||
    			elem.style.display === "" &&

    			// Otherwise, check computed style
    			// Support: Firefox <=43 - 45
    			// Disconnected elements can have computed display: none, so first confirm that elem is
    			// in the document.
    			isAttached( elem ) &&

    			jQuery.css( elem, "display" ) === "none";
    	};



    function adjustCSS( elem, prop, valueParts, tween ) {
    	var adjusted, scale,
    		maxIterations = 20,
    		currentValue = tween ?
    			function() {
    				return tween.cur();
    			} :
    			function() {
    				return jQuery.css( elem, prop, "" );
    			},
    		initial = currentValue(),
    		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

    		// Starting value computation is required for potential unit mismatches
    		initialInUnit = elem.nodeType &&
    			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
    			rcssNum.exec( jQuery.css( elem, prop ) );

    	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

    		// Support: Firefox <=54
    		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
    		initial = initial / 2;

    		// Trust units reported by jQuery.css
    		unit = unit || initialInUnit[ 3 ];

    		// Iteratively approximate from a nonzero starting point
    		initialInUnit = +initial || 1;

    		while ( maxIterations-- ) {

    			// Evaluate and update our best guess (doubling guesses that zero out).
    			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
    			jQuery.style( elem, prop, initialInUnit + unit );
    			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
    				maxIterations = 0;
    			}
    			initialInUnit = initialInUnit / scale;

    		}

    		initialInUnit = initialInUnit * 2;
    		jQuery.style( elem, prop, initialInUnit + unit );

    		// Make sure we update the tween properties later on
    		valueParts = valueParts || [];
    	}

    	if ( valueParts ) {
    		initialInUnit = +initialInUnit || +initial || 0;

    		// Apply relative offset (+=/-=) if specified
    		adjusted = valueParts[ 1 ] ?
    			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
    			+valueParts[ 2 ];
    		if ( tween ) {
    			tween.unit = unit;
    			tween.start = initialInUnit;
    			tween.end = adjusted;
    		}
    	}
    	return adjusted;
    }


    var defaultDisplayMap = {};

    function getDefaultDisplay( elem ) {
    	var temp,
    		doc = elem.ownerDocument,
    		nodeName = elem.nodeName,
    		display = defaultDisplayMap[ nodeName ];

    	if ( display ) {
    		return display;
    	}

    	temp = doc.body.appendChild( doc.createElement( nodeName ) );
    	display = jQuery.css( temp, "display" );

    	temp.parentNode.removeChild( temp );

    	if ( display === "none" ) {
    		display = "block";
    	}
    	defaultDisplayMap[ nodeName ] = display;

    	return display;
    }

    function showHide( elements, show ) {
    	var display, elem,
    		values = [],
    		index = 0,
    		length = elements.length;

    	// Determine new display value for elements that need to change
    	for ( ; index < length; index++ ) {
    		elem = elements[ index ];
    		if ( !elem.style ) {
    			continue;
    		}

    		display = elem.style.display;
    		if ( show ) {

    			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
    			// check is required in this first loop unless we have a nonempty display value (either
    			// inline or about-to-be-restored)
    			if ( display === "none" ) {
    				values[ index ] = dataPriv.get( elem, "display" ) || null;
    				if ( !values[ index ] ) {
    					elem.style.display = "";
    				}
    			}
    			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
    				values[ index ] = getDefaultDisplay( elem );
    			}
    		} else {
    			if ( display !== "none" ) {
    				values[ index ] = "none";

    				// Remember what we're overwriting
    				dataPriv.set( elem, "display", display );
    			}
    		}
    	}

    	// Set the display of the elements in a second loop to avoid constant reflow
    	for ( index = 0; index < length; index++ ) {
    		if ( values[ index ] != null ) {
    			elements[ index ].style.display = values[ index ];
    		}
    	}

    	return elements;
    }

    jQuery.fn.extend( {
    	show: function() {
    		return showHide( this, true );
    	},
    	hide: function() {
    		return showHide( this );
    	},
    	toggle: function( state ) {
    		if ( typeof state === "boolean" ) {
    			return state ? this.show() : this.hide();
    		}

    		return this.each( function() {
    			if ( isHiddenWithinTree( this ) ) {
    				jQuery( this ).show();
    			} else {
    				jQuery( this ).hide();
    			}
    		} );
    	}
    } );
    var rcheckableType = ( /^(?:checkbox|radio)$/i );

    var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

    var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



    ( function() {
    	var fragment = document.createDocumentFragment(),
    		div = fragment.appendChild( document.createElement( "div" ) ),
    		input = document.createElement( "input" );

    	// Support: Android 4.0 - 4.3 only
    	// Check state lost if the name is set (trac-11217)
    	// Support: Windows Web Apps (WWA)
    	// `name` and `type` must use .setAttribute for WWA (trac-14901)
    	input.setAttribute( "type", "radio" );
    	input.setAttribute( "checked", "checked" );
    	input.setAttribute( "name", "t" );

    	div.appendChild( input );

    	// Support: Android <=4.1 only
    	// Older WebKit doesn't clone checked state correctly in fragments
    	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

    	// Support: IE <=11 only
    	// Make sure textarea (and checkbox) defaultValue is properly cloned
    	div.innerHTML = "<textarea>x</textarea>";
    	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

    	// Support: IE <=9 only
    	// IE <=9 replaces <option> tags with their contents when inserted outside of
    	// the select element.
    	div.innerHTML = "<option></option>";
    	support.option = !!div.lastChild;
    } )();


    // We have to close these tags to support XHTML (trac-13200)
    var wrapMap = {

    	// XHTML parsers do not magically insert elements in the
    	// same way that tag soup parsers do. So we cannot shorten
    	// this by omitting <tbody> or other required elements.
    	thead: [ 1, "<table>", "</table>" ],
    	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
    	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

    	_default: [ 0, "", "" ]
    };

    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    // Support: IE <=9 only
    if ( !support.option ) {
    	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
    }


    function getAll( context, tag ) {

    	// Support: IE <=9 - 11 only
    	// Use typeof to avoid zero-argument method invocation on host objects (trac-15151)
    	var ret;

    	if ( typeof context.getElementsByTagName !== "undefined" ) {
    		ret = context.getElementsByTagName( tag || "*" );

    	} else if ( typeof context.querySelectorAll !== "undefined" ) {
    		ret = context.querySelectorAll( tag || "*" );

    	} else {
    		ret = [];
    	}

    	if ( tag === undefined || tag && nodeName( context, tag ) ) {
    		return jQuery.merge( [ context ], ret );
    	}

    	return ret;
    }


    // Mark scripts as having already been evaluated
    function setGlobalEval( elems, refElements ) {
    	var i = 0,
    		l = elems.length;

    	for ( ; i < l; i++ ) {
    		dataPriv.set(
    			elems[ i ],
    			"globalEval",
    			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
    		);
    	}
    }


    var rhtml = /<|&#?\w+;/;

    function buildFragment( elems, context, scripts, selection, ignored ) {
    	var elem, tmp, tag, wrap, attached, j,
    		fragment = context.createDocumentFragment(),
    		nodes = [],
    		i = 0,
    		l = elems.length;

    	for ( ; i < l; i++ ) {
    		elem = elems[ i ];

    		if ( elem || elem === 0 ) {

    			// Add nodes directly
    			if ( toType( elem ) === "object" ) {

    				// Support: Android <=4.0 only, PhantomJS 1 only
    				// push.apply(_, arraylike) throws on ancient WebKit
    				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

    			// Convert non-html into a text node
    			} else if ( !rhtml.test( elem ) ) {
    				nodes.push( context.createTextNode( elem ) );

    			// Convert html into DOM nodes
    			} else {
    				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

    				// Deserialize a standard representation
    				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
    				wrap = wrapMap[ tag ] || wrapMap._default;
    				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

    				// Descend through wrappers to the right content
    				j = wrap[ 0 ];
    				while ( j-- ) {
    					tmp = tmp.lastChild;
    				}

    				// Support: Android <=4.0 only, PhantomJS 1 only
    				// push.apply(_, arraylike) throws on ancient WebKit
    				jQuery.merge( nodes, tmp.childNodes );

    				// Remember the top-level container
    				tmp = fragment.firstChild;

    				// Ensure the created nodes are orphaned (trac-12392)
    				tmp.textContent = "";
    			}
    		}
    	}

    	// Remove wrapper from fragment
    	fragment.textContent = "";

    	i = 0;
    	while ( ( elem = nodes[ i++ ] ) ) {

    		// Skip elements already in the context collection (trac-4087)
    		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
    			if ( ignored ) {
    				ignored.push( elem );
    			}
    			continue;
    		}

    		attached = isAttached( elem );

    		// Append to fragment
    		tmp = getAll( fragment.appendChild( elem ), "script" );

    		// Preserve script evaluation history
    		if ( attached ) {
    			setGlobalEval( tmp );
    		}

    		// Capture executables
    		if ( scripts ) {
    			j = 0;
    			while ( ( elem = tmp[ j++ ] ) ) {
    				if ( rscriptType.test( elem.type || "" ) ) {
    					scripts.push( elem );
    				}
    			}
    		}
    	}

    	return fragment;
    }


    var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

    function returnTrue() {
    	return true;
    }

    function returnFalse() {
    	return false;
    }

    // Support: IE <=9 - 11+
    // focus() and blur() are asynchronous, except when they are no-op.
    // So expect focus to be synchronous when the element is already active,
    // and blur to be synchronous when the element is not already active.
    // (focus and blur are always synchronous in other supported browsers,
    // this just defines when we can count on it).
    function expectSync( elem, type ) {
    	return ( elem === safeActiveElement() ) === ( type === "focus" );
    }

    // Support: IE <=9 only
    // Accessing document.activeElement can throw unexpectedly
    // https://bugs.jquery.com/ticket/13393
    function safeActiveElement() {
    	try {
    		return document.activeElement;
    	} catch ( err ) { }
    }

    function on( elem, types, selector, data, fn, one ) {
    	var origFn, type;

    	// Types can be a map of types/handlers
    	if ( typeof types === "object" ) {

    		// ( types-Object, selector, data )
    		if ( typeof selector !== "string" ) {

    			// ( types-Object, data )
    			data = data || selector;
    			selector = undefined;
    		}
    		for ( type in types ) {
    			on( elem, type, selector, data, types[ type ], one );
    		}
    		return elem;
    	}

    	if ( data == null && fn == null ) {

    		// ( types, fn )
    		fn = selector;
    		data = selector = undefined;
    	} else if ( fn == null ) {
    		if ( typeof selector === "string" ) {

    			// ( types, selector, fn )
    			fn = data;
    			data = undefined;
    		} else {

    			// ( types, data, fn )
    			fn = data;
    			data = selector;
    			selector = undefined;
    		}
    	}
    	if ( fn === false ) {
    		fn = returnFalse;
    	} else if ( !fn ) {
    		return elem;
    	}

    	if ( one === 1 ) {
    		origFn = fn;
    		fn = function( event ) {

    			// Can use an empty set, since event contains the info
    			jQuery().off( event );
    			return origFn.apply( this, arguments );
    		};

    		// Use same guid so caller can remove using origFn
    		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
    	}
    	return elem.each( function() {
    		jQuery.event.add( this, types, fn, data, selector );
    	} );
    }

    /*
     * Helper functions for managing events -- not part of the public interface.
     * Props to Dean Edwards' addEvent library for many of the ideas.
     */
    jQuery.event = {

    	global: {},

    	add: function( elem, types, handler, data, selector ) {

    		var handleObjIn, eventHandle, tmp,
    			events, t, handleObj,
    			special, handlers, type, namespaces, origType,
    			elemData = dataPriv.get( elem );

    		// Only attach events to objects that accept data
    		if ( !acceptData( elem ) ) {
    			return;
    		}

    		// Caller can pass in an object of custom data in lieu of the handler
    		if ( handler.handler ) {
    			handleObjIn = handler;
    			handler = handleObjIn.handler;
    			selector = handleObjIn.selector;
    		}

    		// Ensure that invalid selectors throw exceptions at attach time
    		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
    		if ( selector ) {
    			jQuery.find.matchesSelector( documentElement, selector );
    		}

    		// Make sure that the handler has a unique ID, used to find/remove it later
    		if ( !handler.guid ) {
    			handler.guid = jQuery.guid++;
    		}

    		// Init the element's event structure and main handler, if this is the first
    		if ( !( events = elemData.events ) ) {
    			events = elemData.events = Object.create( null );
    		}
    		if ( !( eventHandle = elemData.handle ) ) {
    			eventHandle = elemData.handle = function( e ) {

    				// Discard the second event of a jQuery.event.trigger() and
    				// when an event is called after a page has unloaded
    				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
    					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
    			};
    		}

    		// Handle multiple events separated by a space
    		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
    		t = types.length;
    		while ( t-- ) {
    			tmp = rtypenamespace.exec( types[ t ] ) || [];
    			type = origType = tmp[ 1 ];
    			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

    			// There *must* be a type, no attaching namespace-only handlers
    			if ( !type ) {
    				continue;
    			}

    			// If event changes its type, use the special event handlers for the changed type
    			special = jQuery.event.special[ type ] || {};

    			// If selector defined, determine special event api type, otherwise given type
    			type = ( selector ? special.delegateType : special.bindType ) || type;

    			// Update special based on newly reset type
    			special = jQuery.event.special[ type ] || {};

    			// handleObj is passed to all event handlers
    			handleObj = jQuery.extend( {
    				type: type,
    				origType: origType,
    				data: data,
    				handler: handler,
    				guid: handler.guid,
    				selector: selector,
    				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
    				namespace: namespaces.join( "." )
    			}, handleObjIn );

    			// Init the event handler queue if we're the first
    			if ( !( handlers = events[ type ] ) ) {
    				handlers = events[ type ] = [];
    				handlers.delegateCount = 0;

    				// Only use addEventListener if the special events handler returns false
    				if ( !special.setup ||
    					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

    					if ( elem.addEventListener ) {
    						elem.addEventListener( type, eventHandle );
    					}
    				}
    			}

    			if ( special.add ) {
    				special.add.call( elem, handleObj );

    				if ( !handleObj.handler.guid ) {
    					handleObj.handler.guid = handler.guid;
    				}
    			}

    			// Add to the element's handler list, delegates in front
    			if ( selector ) {
    				handlers.splice( handlers.delegateCount++, 0, handleObj );
    			} else {
    				handlers.push( handleObj );
    			}

    			// Keep track of which events have ever been used, for event optimization
    			jQuery.event.global[ type ] = true;
    		}

    	},

    	// Detach an event or set of events from an element
    	remove: function( elem, types, handler, selector, mappedTypes ) {

    		var j, origCount, tmp,
    			events, t, handleObj,
    			special, handlers, type, namespaces, origType,
    			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

    		if ( !elemData || !( events = elemData.events ) ) {
    			return;
    		}

    		// Once for each type.namespace in types; type may be omitted
    		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
    		t = types.length;
    		while ( t-- ) {
    			tmp = rtypenamespace.exec( types[ t ] ) || [];
    			type = origType = tmp[ 1 ];
    			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

    			// Unbind all events (on this namespace, if provided) for the element
    			if ( !type ) {
    				for ( type in events ) {
    					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
    				}
    				continue;
    			}

    			special = jQuery.event.special[ type ] || {};
    			type = ( selector ? special.delegateType : special.bindType ) || type;
    			handlers = events[ type ] || [];
    			tmp = tmp[ 2 ] &&
    				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

    			// Remove matching events
    			origCount = j = handlers.length;
    			while ( j-- ) {
    				handleObj = handlers[ j ];

    				if ( ( mappedTypes || origType === handleObj.origType ) &&
    					( !handler || handler.guid === handleObj.guid ) &&
    					( !tmp || tmp.test( handleObj.namespace ) ) &&
    					( !selector || selector === handleObj.selector ||
    						selector === "**" && handleObj.selector ) ) {
    					handlers.splice( j, 1 );

    					if ( handleObj.selector ) {
    						handlers.delegateCount--;
    					}
    					if ( special.remove ) {
    						special.remove.call( elem, handleObj );
    					}
    				}
    			}

    			// Remove generic event handler if we removed something and no more handlers exist
    			// (avoids potential for endless recursion during removal of special event handlers)
    			if ( origCount && !handlers.length ) {
    				if ( !special.teardown ||
    					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

    					jQuery.removeEvent( elem, type, elemData.handle );
    				}

    				delete events[ type ];
    			}
    		}

    		// Remove data and the expando if it's no longer used
    		if ( jQuery.isEmptyObject( events ) ) {
    			dataPriv.remove( elem, "handle events" );
    		}
    	},

    	dispatch: function( nativeEvent ) {

    		var i, j, ret, matched, handleObj, handlerQueue,
    			args = new Array( arguments.length ),

    			// Make a writable jQuery.Event from the native event object
    			event = jQuery.event.fix( nativeEvent ),

    			handlers = (
    				dataPriv.get( this, "events" ) || Object.create( null )
    			)[ event.type ] || [],
    			special = jQuery.event.special[ event.type ] || {};

    		// Use the fix-ed jQuery.Event rather than the (read-only) native event
    		args[ 0 ] = event;

    		for ( i = 1; i < arguments.length; i++ ) {
    			args[ i ] = arguments[ i ];
    		}

    		event.delegateTarget = this;

    		// Call the preDispatch hook for the mapped type, and let it bail if desired
    		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
    			return;
    		}

    		// Determine handlers
    		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

    		// Run delegates first; they may want to stop propagation beneath us
    		i = 0;
    		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
    			event.currentTarget = matched.elem;

    			j = 0;
    			while ( ( handleObj = matched.handlers[ j++ ] ) &&
    				!event.isImmediatePropagationStopped() ) {

    				// If the event is namespaced, then each handler is only invoked if it is
    				// specially universal or its namespaces are a superset of the event's.
    				if ( !event.rnamespace || handleObj.namespace === false ||
    					event.rnamespace.test( handleObj.namespace ) ) {

    					event.handleObj = handleObj;
    					event.data = handleObj.data;

    					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
    						handleObj.handler ).apply( matched.elem, args );

    					if ( ret !== undefined ) {
    						if ( ( event.result = ret ) === false ) {
    							event.preventDefault();
    							event.stopPropagation();
    						}
    					}
    				}
    			}
    		}

    		// Call the postDispatch hook for the mapped type
    		if ( special.postDispatch ) {
    			special.postDispatch.call( this, event );
    		}

    		return event.result;
    	},

    	handlers: function( event, handlers ) {
    		var i, handleObj, sel, matchedHandlers, matchedSelectors,
    			handlerQueue = [],
    			delegateCount = handlers.delegateCount,
    			cur = event.target;

    		// Find delegate handlers
    		if ( delegateCount &&

    			// Support: IE <=9
    			// Black-hole SVG <use> instance trees (trac-13180)
    			cur.nodeType &&

    			// Support: Firefox <=42
    			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
    			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
    			// Support: IE 11 only
    			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
    			!( event.type === "click" && event.button >= 1 ) ) {

    			for ( ; cur !== this; cur = cur.parentNode || this ) {

    				// Don't check non-elements (trac-13208)
    				// Don't process clicks on disabled elements (trac-6911, trac-8165, trac-11382, trac-11764)
    				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
    					matchedHandlers = [];
    					matchedSelectors = {};
    					for ( i = 0; i < delegateCount; i++ ) {
    						handleObj = handlers[ i ];

    						// Don't conflict with Object.prototype properties (trac-13203)
    						sel = handleObj.selector + " ";

    						if ( matchedSelectors[ sel ] === undefined ) {
    							matchedSelectors[ sel ] = handleObj.needsContext ?
    								jQuery( sel, this ).index( cur ) > -1 :
    								jQuery.find( sel, this, null, [ cur ] ).length;
    						}
    						if ( matchedSelectors[ sel ] ) {
    							matchedHandlers.push( handleObj );
    						}
    					}
    					if ( matchedHandlers.length ) {
    						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
    					}
    				}
    			}
    		}

    		// Add the remaining (directly-bound) handlers
    		cur = this;
    		if ( delegateCount < handlers.length ) {
    			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
    		}

    		return handlerQueue;
    	},

    	addProp: function( name, hook ) {
    		Object.defineProperty( jQuery.Event.prototype, name, {
    			enumerable: true,
    			configurable: true,

    			get: isFunction( hook ) ?
    				function() {
    					if ( this.originalEvent ) {
    						return hook( this.originalEvent );
    					}
    				} :
    				function() {
    					if ( this.originalEvent ) {
    						return this.originalEvent[ name ];
    					}
    				},

    			set: function( value ) {
    				Object.defineProperty( this, name, {
    					enumerable: true,
    					configurable: true,
    					writable: true,
    					value: value
    				} );
    			}
    		} );
    	},

    	fix: function( originalEvent ) {
    		return originalEvent[ jQuery.expando ] ?
    			originalEvent :
    			new jQuery.Event( originalEvent );
    	},

    	special: {
    		load: {

    			// Prevent triggered image.load events from bubbling to window.load
    			noBubble: true
    		},
    		click: {

    			// Utilize native event to ensure correct state for checkable inputs
    			setup: function( data ) {

    				// For mutual compressibility with _default, replace `this` access with a local var.
    				// `|| data` is dead code meant only to preserve the variable through minification.
    				var el = this || data;

    				// Claim the first handler
    				if ( rcheckableType.test( el.type ) &&
    					el.click && nodeName( el, "input" ) ) {

    					// dataPriv.set( el, "click", ... )
    					leverageNative( el, "click", returnTrue );
    				}

    				// Return false to allow normal processing in the caller
    				return false;
    			},
    			trigger: function( data ) {

    				// For mutual compressibility with _default, replace `this` access with a local var.
    				// `|| data` is dead code meant only to preserve the variable through minification.
    				var el = this || data;

    				// Force setup before triggering a click
    				if ( rcheckableType.test( el.type ) &&
    					el.click && nodeName( el, "input" ) ) {

    					leverageNative( el, "click" );
    				}

    				// Return non-false to allow normal event-path propagation
    				return true;
    			},

    			// For cross-browser consistency, suppress native .click() on links
    			// Also prevent it if we're currently inside a leveraged native-event stack
    			_default: function( event ) {
    				var target = event.target;
    				return rcheckableType.test( target.type ) &&
    					target.click && nodeName( target, "input" ) &&
    					dataPriv.get( target, "click" ) ||
    					nodeName( target, "a" );
    			}
    		},

    		beforeunload: {
    			postDispatch: function( event ) {

    				// Support: Firefox 20+
    				// Firefox doesn't alert if the returnValue field is not set.
    				if ( event.result !== undefined && event.originalEvent ) {
    					event.originalEvent.returnValue = event.result;
    				}
    			}
    		}
    	}
    };

    // Ensure the presence of an event listener that handles manually-triggered
    // synthetic events by interrupting progress until reinvoked in response to
    // *native* events that it fires directly, ensuring that state changes have
    // already occurred before other listeners are invoked.
    function leverageNative( el, type, expectSync ) {

    	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
    	if ( !expectSync ) {
    		if ( dataPriv.get( el, type ) === undefined ) {
    			jQuery.event.add( el, type, returnTrue );
    		}
    		return;
    	}

    	// Register the controller as a special universal handler for all event namespaces
    	dataPriv.set( el, type, false );
    	jQuery.event.add( el, type, {
    		namespace: false,
    		handler: function( event ) {
    			var notAsync, result,
    				saved = dataPriv.get( this, type );

    			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

    				// Interrupt processing of the outer synthetic .trigger()ed event
    				// Saved data should be false in such cases, but might be a leftover capture object
    				// from an async native handler (gh-4350)
    				if ( !saved.length ) {

    					// Store arguments for use when handling the inner native event
    					// There will always be at least one argument (an event object), so this array
    					// will not be confused with a leftover capture object.
    					saved = slice.call( arguments );
    					dataPriv.set( this, type, saved );

    					// Trigger the native event and capture its result
    					// Support: IE <=9 - 11+
    					// focus() and blur() are asynchronous
    					notAsync = expectSync( this, type );
    					this[ type ]();
    					result = dataPriv.get( this, type );
    					if ( saved !== result || notAsync ) {
    						dataPriv.set( this, type, false );
    					} else {
    						result = {};
    					}
    					if ( saved !== result ) {

    						// Cancel the outer synthetic event
    						event.stopImmediatePropagation();
    						event.preventDefault();

    						// Support: Chrome 86+
    						// In Chrome, if an element having a focusout handler is blurred by
    						// clicking outside of it, it invokes the handler synchronously. If
    						// that handler calls `.remove()` on the element, the data is cleared,
    						// leaving `result` undefined. We need to guard against this.
    						return result && result.value;
    					}

    				// If this is an inner synthetic event for an event with a bubbling surrogate
    				// (focus or blur), assume that the surrogate already propagated from triggering the
    				// native event and prevent that from happening again here.
    				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
    				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
    				// less bad than duplication.
    				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
    					event.stopPropagation();
    				}

    			// If this is a native event triggered above, everything is now in order
    			// Fire an inner synthetic event with the original arguments
    			} else if ( saved.length ) {

    				// ...and capture the result
    				dataPriv.set( this, type, {
    					value: jQuery.event.trigger(

    						// Support: IE <=9 - 11+
    						// Extend with the prototype to reset the above stopImmediatePropagation()
    						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
    						saved.slice( 1 ),
    						this
    					)
    				} );

    				// Abort handling of the native event
    				event.stopImmediatePropagation();
    			}
    		}
    	} );
    }

    jQuery.removeEvent = function( elem, type, handle ) {

    	// This "if" is needed for plain objects
    	if ( elem.removeEventListener ) {
    		elem.removeEventListener( type, handle );
    	}
    };

    jQuery.Event = function( src, props ) {

    	// Allow instantiation without the 'new' keyword
    	if ( !( this instanceof jQuery.Event ) ) {
    		return new jQuery.Event( src, props );
    	}

    	// Event object
    	if ( src && src.type ) {
    		this.originalEvent = src;
    		this.type = src.type;

    		// Events bubbling up the document may have been marked as prevented
    		// by a handler lower down the tree; reflect the correct value.
    		this.isDefaultPrevented = src.defaultPrevented ||
    				src.defaultPrevented === undefined &&

    				// Support: Android <=2.3 only
    				src.returnValue === false ?
    			returnTrue :
    			returnFalse;

    		// Create target properties
    		// Support: Safari <=6 - 7 only
    		// Target should not be a text node (trac-504, trac-13143)
    		this.target = ( src.target && src.target.nodeType === 3 ) ?
    			src.target.parentNode :
    			src.target;

    		this.currentTarget = src.currentTarget;
    		this.relatedTarget = src.relatedTarget;

    	// Event type
    	} else {
    		this.type = src;
    	}

    	// Put explicitly provided properties onto the event object
    	if ( props ) {
    		jQuery.extend( this, props );
    	}

    	// Create a timestamp if incoming event doesn't have one
    	this.timeStamp = src && src.timeStamp || Date.now();

    	// Mark it as fixed
    	this[ jQuery.expando ] = true;
    };

    // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    jQuery.Event.prototype = {
    	constructor: jQuery.Event,
    	isDefaultPrevented: returnFalse,
    	isPropagationStopped: returnFalse,
    	isImmediatePropagationStopped: returnFalse,
    	isSimulated: false,

    	preventDefault: function() {
    		var e = this.originalEvent;

    		this.isDefaultPrevented = returnTrue;

    		if ( e && !this.isSimulated ) {
    			e.preventDefault();
    		}
    	},
    	stopPropagation: function() {
    		var e = this.originalEvent;

    		this.isPropagationStopped = returnTrue;

    		if ( e && !this.isSimulated ) {
    			e.stopPropagation();
    		}
    	},
    	stopImmediatePropagation: function() {
    		var e = this.originalEvent;

    		this.isImmediatePropagationStopped = returnTrue;

    		if ( e && !this.isSimulated ) {
    			e.stopImmediatePropagation();
    		}

    		this.stopPropagation();
    	}
    };

    // Includes all common event props including KeyEvent and MouseEvent specific props
    jQuery.each( {
    	altKey: true,
    	bubbles: true,
    	cancelable: true,
    	changedTouches: true,
    	ctrlKey: true,
    	detail: true,
    	eventPhase: true,
    	metaKey: true,
    	pageX: true,
    	pageY: true,
    	shiftKey: true,
    	view: true,
    	"char": true,
    	code: true,
    	charCode: true,
    	key: true,
    	keyCode: true,
    	button: true,
    	buttons: true,
    	clientX: true,
    	clientY: true,
    	offsetX: true,
    	offsetY: true,
    	pointerId: true,
    	pointerType: true,
    	screenX: true,
    	screenY: true,
    	targetTouches: true,
    	toElement: true,
    	touches: true,
    	which: true
    }, jQuery.event.addProp );

    jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
    	jQuery.event.special[ type ] = {

    		// Utilize native event if possible so blur/focus sequence is correct
    		setup: function() {

    			// Claim the first handler
    			// dataPriv.set( this, "focus", ... )
    			// dataPriv.set( this, "blur", ... )
    			leverageNative( this, type, expectSync );

    			// Return false to allow normal processing in the caller
    			return false;
    		},
    		trigger: function() {

    			// Force setup before trigger
    			leverageNative( this, type );

    			// Return non-false to allow normal event-path propagation
    			return true;
    		},

    		// Suppress native focus or blur if we're currently inside
    		// a leveraged native-event stack
    		_default: function( event ) {
    			return dataPriv.get( event.target, type );
    		},

    		delegateType: delegateType
    	};
    } );

    // Create mouseenter/leave events using mouseover/out and event-time checks
    // so that event delegation works in jQuery.
    // Do the same for pointerenter/pointerleave and pointerover/pointerout
    //
    // Support: Safari 7 only
    // Safari sends mouseenter too often; see:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=470258
    // for the description of the bug (it existed in older Chrome versions as well).
    jQuery.each( {
    	mouseenter: "mouseover",
    	mouseleave: "mouseout",
    	pointerenter: "pointerover",
    	pointerleave: "pointerout"
    }, function( orig, fix ) {
    	jQuery.event.special[ orig ] = {
    		delegateType: fix,
    		bindType: fix,

    		handle: function( event ) {
    			var ret,
    				target = this,
    				related = event.relatedTarget,
    				handleObj = event.handleObj;

    			// For mouseenter/leave call the handler if related is outside the target.
    			// NB: No relatedTarget if the mouse left/entered the browser window
    			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
    				event.type = handleObj.origType;
    				ret = handleObj.handler.apply( this, arguments );
    				event.type = fix;
    			}
    			return ret;
    		}
    	};
    } );

    jQuery.fn.extend( {

    	on: function( types, selector, data, fn ) {
    		return on( this, types, selector, data, fn );
    	},
    	one: function( types, selector, data, fn ) {
    		return on( this, types, selector, data, fn, 1 );
    	},
    	off: function( types, selector, fn ) {
    		var handleObj, type;
    		if ( types && types.preventDefault && types.handleObj ) {

    			// ( event )  dispatched jQuery.Event
    			handleObj = types.handleObj;
    			jQuery( types.delegateTarget ).off(
    				handleObj.namespace ?
    					handleObj.origType + "." + handleObj.namespace :
    					handleObj.origType,
    				handleObj.selector,
    				handleObj.handler
    			);
    			return this;
    		}
    		if ( typeof types === "object" ) {

    			// ( types-object [, selector] )
    			for ( type in types ) {
    				this.off( type, selector, types[ type ] );
    			}
    			return this;
    		}
    		if ( selector === false || typeof selector === "function" ) {

    			// ( types [, fn] )
    			fn = selector;
    			selector = undefined;
    		}
    		if ( fn === false ) {
    			fn = returnFalse;
    		}
    		return this.each( function() {
    			jQuery.event.remove( this, types, fn, selector );
    		} );
    	}
    } );


    var

    	// Support: IE <=10 - 11, Edge 12 - 13 only
    	// In IE/Edge using regex groups here causes severe slowdowns.
    	// See https://connect.microsoft.com/IE/feedback/details/1736512/
    	rnoInnerhtml = /<script|<style|<link/i,

    	// checked="checked" or checked
    	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,

    	rcleanScript = /^\s*<!\[CDATA\[|\]\]>\s*$/g;

    // Prefer a tbody over its parent table for containing new rows
    function manipulationTarget( elem, content ) {
    	if ( nodeName( elem, "table" ) &&
    		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

    		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
    	}

    	return elem;
    }

    // Replace/restore the type attribute of script elements for safe DOM manipulation
    function disableScript( elem ) {
    	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
    	return elem;
    }
    function restoreScript( elem ) {
    	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
    		elem.type = elem.type.slice( 5 );
    	} else {
    		elem.removeAttribute( "type" );
    	}

    	return elem;
    }

    function cloneCopyEvent( src, dest ) {
    	var i, l, type, pdataOld, udataOld, udataCur, events;

    	if ( dest.nodeType !== 1 ) {
    		return;
    	}

    	// 1. Copy private data: events, handlers, etc.
    	if ( dataPriv.hasData( src ) ) {
    		pdataOld = dataPriv.get( src );
    		events = pdataOld.events;

    		if ( events ) {
    			dataPriv.remove( dest, "handle events" );

    			for ( type in events ) {
    				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
    					jQuery.event.add( dest, type, events[ type ][ i ] );
    				}
    			}
    		}
    	}

    	// 2. Copy user data
    	if ( dataUser.hasData( src ) ) {
    		udataOld = dataUser.access( src );
    		udataCur = jQuery.extend( {}, udataOld );

    		dataUser.set( dest, udataCur );
    	}
    }

    // Fix IE bugs, see support tests
    function fixInput( src, dest ) {
    	var nodeName = dest.nodeName.toLowerCase();

    	// Fails to persist the checked state of a cloned checkbox or radio button.
    	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
    		dest.checked = src.checked;

    	// Fails to return the selected option to the default selected state when cloning options
    	} else if ( nodeName === "input" || nodeName === "textarea" ) {
    		dest.defaultValue = src.defaultValue;
    	}
    }

    function domManip( collection, args, callback, ignored ) {

    	// Flatten any nested arrays
    	args = flat( args );

    	var fragment, first, scripts, hasScripts, node, doc,
    		i = 0,
    		l = collection.length,
    		iNoClone = l - 1,
    		value = args[ 0 ],
    		valueIsFunction = isFunction( value );

    	// We can't cloneNode fragments that contain checked, in WebKit
    	if ( valueIsFunction ||
    			( l > 1 && typeof value === "string" &&
    				!support.checkClone && rchecked.test( value ) ) ) {
    		return collection.each( function( index ) {
    			var self = collection.eq( index );
    			if ( valueIsFunction ) {
    				args[ 0 ] = value.call( this, index, self.html() );
    			}
    			domManip( self, args, callback, ignored );
    		} );
    	}

    	if ( l ) {
    		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
    		first = fragment.firstChild;

    		if ( fragment.childNodes.length === 1 ) {
    			fragment = first;
    		}

    		// Require either new content or an interest in ignored elements to invoke the callback
    		if ( first || ignored ) {
    			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
    			hasScripts = scripts.length;

    			// Use the original fragment for the last item
    			// instead of the first because it can end up
    			// being emptied incorrectly in certain situations (trac-8070).
    			for ( ; i < l; i++ ) {
    				node = fragment;

    				if ( i !== iNoClone ) {
    					node = jQuery.clone( node, true, true );

    					// Keep references to cloned scripts for later restoration
    					if ( hasScripts ) {

    						// Support: Android <=4.0 only, PhantomJS 1 only
    						// push.apply(_, arraylike) throws on ancient WebKit
    						jQuery.merge( scripts, getAll( node, "script" ) );
    					}
    				}

    				callback.call( collection[ i ], node, i );
    			}

    			if ( hasScripts ) {
    				doc = scripts[ scripts.length - 1 ].ownerDocument;

    				// Reenable scripts
    				jQuery.map( scripts, restoreScript );

    				// Evaluate executable scripts on first document insertion
    				for ( i = 0; i < hasScripts; i++ ) {
    					node = scripts[ i ];
    					if ( rscriptType.test( node.type || "" ) &&
    						!dataPriv.access( node, "globalEval" ) &&
    						jQuery.contains( doc, node ) ) {

    						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

    							// Optional AJAX dependency, but won't run scripts if not present
    							if ( jQuery._evalUrl && !node.noModule ) {
    								jQuery._evalUrl( node.src, {
    									nonce: node.nonce || node.getAttribute( "nonce" )
    								}, doc );
    							}
    						} else {

    							// Unwrap a CDATA section containing script contents. This shouldn't be
    							// needed as in XML documents they're already not visible when
    							// inspecting element contents and in HTML documents they have no
    							// meaning but we're preserving that logic for backwards compatibility.
    							// This will be removed completely in 4.0. See gh-4904.
    							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
    						}
    					}
    				}
    			}
    		}
    	}

    	return collection;
    }

    function remove( elem, selector, keepData ) {
    	var node,
    		nodes = selector ? jQuery.filter( selector, elem ) : elem,
    		i = 0;

    	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
    		if ( !keepData && node.nodeType === 1 ) {
    			jQuery.cleanData( getAll( node ) );
    		}

    		if ( node.parentNode ) {
    			if ( keepData && isAttached( node ) ) {
    				setGlobalEval( getAll( node, "script" ) );
    			}
    			node.parentNode.removeChild( node );
    		}
    	}

    	return elem;
    }

    jQuery.extend( {
    	htmlPrefilter: function( html ) {
    		return html;
    	},

    	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
    		var i, l, srcElements, destElements,
    			clone = elem.cloneNode( true ),
    			inPage = isAttached( elem );

    		// Fix IE cloning issues
    		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
    				!jQuery.isXMLDoc( elem ) ) {

    			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
    			destElements = getAll( clone );
    			srcElements = getAll( elem );

    			for ( i = 0, l = srcElements.length; i < l; i++ ) {
    				fixInput( srcElements[ i ], destElements[ i ] );
    			}
    		}

    		// Copy the events from the original to the clone
    		if ( dataAndEvents ) {
    			if ( deepDataAndEvents ) {
    				srcElements = srcElements || getAll( elem );
    				destElements = destElements || getAll( clone );

    				for ( i = 0, l = srcElements.length; i < l; i++ ) {
    					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
    				}
    			} else {
    				cloneCopyEvent( elem, clone );
    			}
    		}

    		// Preserve script evaluation history
    		destElements = getAll( clone, "script" );
    		if ( destElements.length > 0 ) {
    			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
    		}

    		// Return the cloned set
    		return clone;
    	},

    	cleanData: function( elems ) {
    		var data, elem, type,
    			special = jQuery.event.special,
    			i = 0;

    		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
    			if ( acceptData( elem ) ) {
    				if ( ( data = elem[ dataPriv.expando ] ) ) {
    					if ( data.events ) {
    						for ( type in data.events ) {
    							if ( special[ type ] ) {
    								jQuery.event.remove( elem, type );

    							// This is a shortcut to avoid jQuery.event.remove's overhead
    							} else {
    								jQuery.removeEvent( elem, type, data.handle );
    							}
    						}
    					}

    					// Support: Chrome <=35 - 45+
    					// Assign undefined instead of using delete, see Data#remove
    					elem[ dataPriv.expando ] = undefined;
    				}
    				if ( elem[ dataUser.expando ] ) {

    					// Support: Chrome <=35 - 45+
    					// Assign undefined instead of using delete, see Data#remove
    					elem[ dataUser.expando ] = undefined;
    				}
    			}
    		}
    	}
    } );

    jQuery.fn.extend( {
    	detach: function( selector ) {
    		return remove( this, selector, true );
    	},

    	remove: function( selector ) {
    		return remove( this, selector );
    	},

    	text: function( value ) {
    		return access( this, function( value ) {
    			return value === undefined ?
    				jQuery.text( this ) :
    				this.empty().each( function() {
    					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
    						this.textContent = value;
    					}
    				} );
    		}, null, value, arguments.length );
    	},

    	append: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
    				var target = manipulationTarget( this, elem );
    				target.appendChild( elem );
    			}
    		} );
    	},

    	prepend: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
    				var target = manipulationTarget( this, elem );
    				target.insertBefore( elem, target.firstChild );
    			}
    		} );
    	},

    	before: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.parentNode ) {
    				this.parentNode.insertBefore( elem, this );
    			}
    		} );
    	},

    	after: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.parentNode ) {
    				this.parentNode.insertBefore( elem, this.nextSibling );
    			}
    		} );
    	},

    	empty: function() {
    		var elem,
    			i = 0;

    		for ( ; ( elem = this[ i ] ) != null; i++ ) {
    			if ( elem.nodeType === 1 ) {

    				// Prevent memory leaks
    				jQuery.cleanData( getAll( elem, false ) );

    				// Remove any remaining nodes
    				elem.textContent = "";
    			}
    		}

    		return this;
    	},

    	clone: function( dataAndEvents, deepDataAndEvents ) {
    		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

    		return this.map( function() {
    			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
    		} );
    	},

    	html: function( value ) {
    		return access( this, function( value ) {
    			var elem = this[ 0 ] || {},
    				i = 0,
    				l = this.length;

    			if ( value === undefined && elem.nodeType === 1 ) {
    				return elem.innerHTML;
    			}

    			// See if we can take a shortcut and just use innerHTML
    			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
    				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

    				value = jQuery.htmlPrefilter( value );

    				try {
    					for ( ; i < l; i++ ) {
    						elem = this[ i ] || {};

    						// Remove element nodes and prevent memory leaks
    						if ( elem.nodeType === 1 ) {
    							jQuery.cleanData( getAll( elem, false ) );
    							elem.innerHTML = value;
    						}
    					}

    					elem = 0;

    				// If using innerHTML throws an exception, use the fallback method
    				} catch ( e ) {}
    			}

    			if ( elem ) {
    				this.empty().append( value );
    			}
    		}, null, value, arguments.length );
    	},

    	replaceWith: function() {
    		var ignored = [];

    		// Make the changes, replacing each non-ignored context element with the new content
    		return domManip( this, arguments, function( elem ) {
    			var parent = this.parentNode;

    			if ( jQuery.inArray( this, ignored ) < 0 ) {
    				jQuery.cleanData( getAll( this ) );
    				if ( parent ) {
    					parent.replaceChild( elem, this );
    				}
    			}

    		// Force callback invocation
    		}, ignored );
    	}
    } );

    jQuery.each( {
    	appendTo: "append",
    	prependTo: "prepend",
    	insertBefore: "before",
    	insertAfter: "after",
    	replaceAll: "replaceWith"
    }, function( name, original ) {
    	jQuery.fn[ name ] = function( selector ) {
    		var elems,
    			ret = [],
    			insert = jQuery( selector ),
    			last = insert.length - 1,
    			i = 0;

    		for ( ; i <= last; i++ ) {
    			elems = i === last ? this : this.clone( true );
    			jQuery( insert[ i ] )[ original ]( elems );

    			// Support: Android <=4.0 only, PhantomJS 1 only
    			// .get() because push.apply(_, arraylike) throws on ancient WebKit
    			push.apply( ret, elems.get() );
    		}

    		return this.pushStack( ret );
    	};
    } );
    var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

    var rcustomProp = /^--/;


    var getStyles = function( elem ) {

    		// Support: IE <=11 only, Firefox <=30 (trac-15098, trac-14150)
    		// IE throws on elements created in popups
    		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
    		var view = elem.ownerDocument.defaultView;

    		if ( !view || !view.opener ) {
    			view = window;
    		}

    		return view.getComputedStyle( elem );
    	};

    var swap = function( elem, options, callback ) {
    	var ret, name,
    		old = {};

    	// Remember the old values, and insert the new ones
    	for ( name in options ) {
    		old[ name ] = elem.style[ name ];
    		elem.style[ name ] = options[ name ];
    	}

    	ret = callback.call( elem );

    	// Revert the old values
    	for ( name in options ) {
    		elem.style[ name ] = old[ name ];
    	}

    	return ret;
    };


    var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );

    var whitespace = "[\\x20\\t\\r\\n\\f]";


    var rtrimCSS = new RegExp(
    	"^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
    	"g"
    );




    ( function() {

    	// Executing both pixelPosition & boxSizingReliable tests require only one layout
    	// so they're executed at the same time to save the second computation.
    	function computeStyleTests() {

    		// This is a singleton, we need to execute it only once
    		if ( !div ) {
    			return;
    		}

    		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
    			"margin-top:1px;padding:0;border:0";
    		div.style.cssText =
    			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
    			"margin:auto;border:1px;padding:1px;" +
    			"width:60%;top:1%";
    		documentElement.appendChild( container ).appendChild( div );

    		var divStyle = window.getComputedStyle( div );
    		pixelPositionVal = divStyle.top !== "1%";

    		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
    		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

    		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
    		// Some styles come back with percentage values, even though they shouldn't
    		div.style.right = "60%";
    		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

    		// Support: IE 9 - 11 only
    		// Detect misreporting of content dimensions for box-sizing:border-box elements
    		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

    		// Support: IE 9 only
    		// Detect overflow:scroll screwiness (gh-3699)
    		// Support: Chrome <=64
    		// Don't get tricked when zoom affects offsetWidth (gh-4029)
    		div.style.position = "absolute";
    		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

    		documentElement.removeChild( container );

    		// Nullify the div so it wouldn't be stored in the memory and
    		// it will also be a sign that checks already performed
    		div = null;
    	}

    	function roundPixelMeasures( measure ) {
    		return Math.round( parseFloat( measure ) );
    	}

    	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
    		reliableTrDimensionsVal, reliableMarginLeftVal,
    		container = document.createElement( "div" ),
    		div = document.createElement( "div" );

    	// Finish early in limited (non-browser) environments
    	if ( !div.style ) {
    		return;
    	}

    	// Support: IE <=9 - 11 only
    	// Style of cloned element affects source element cloned (trac-8908)
    	div.style.backgroundClip = "content-box";
    	div.cloneNode( true ).style.backgroundClip = "";
    	support.clearCloneStyle = div.style.backgroundClip === "content-box";

    	jQuery.extend( support, {
    		boxSizingReliable: function() {
    			computeStyleTests();
    			return boxSizingReliableVal;
    		},
    		pixelBoxStyles: function() {
    			computeStyleTests();
    			return pixelBoxStylesVal;
    		},
    		pixelPosition: function() {
    			computeStyleTests();
    			return pixelPositionVal;
    		},
    		reliableMarginLeft: function() {
    			computeStyleTests();
    			return reliableMarginLeftVal;
    		},
    		scrollboxSize: function() {
    			computeStyleTests();
    			return scrollboxSizeVal;
    		},

    		// Support: IE 9 - 11+, Edge 15 - 18+
    		// IE/Edge misreport `getComputedStyle` of table rows with width/height
    		// set in CSS while `offset*` properties report correct values.
    		// Behavior in IE 9 is more subtle than in newer versions & it passes
    		// some versions of this test; make sure not to make it pass there!
    		//
    		// Support: Firefox 70+
    		// Only Firefox includes border widths
    		// in computed dimensions. (gh-4529)
    		reliableTrDimensions: function() {
    			var table, tr, trChild, trStyle;
    			if ( reliableTrDimensionsVal == null ) {
    				table = document.createElement( "table" );
    				tr = document.createElement( "tr" );
    				trChild = document.createElement( "div" );

    				table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
    				tr.style.cssText = "border:1px solid";

    				// Support: Chrome 86+
    				// Height set through cssText does not get applied.
    				// Computed height then comes back as 0.
    				tr.style.height = "1px";
    				trChild.style.height = "9px";

    				// Support: Android 8 Chrome 86+
    				// In our bodyBackground.html iframe,
    				// display for all div elements is set to "inline",
    				// which causes a problem only in Android 8 Chrome 86.
    				// Ensuring the div is display: block
    				// gets around this issue.
    				trChild.style.display = "block";

    				documentElement
    					.appendChild( table )
    					.appendChild( tr )
    					.appendChild( trChild );

    				trStyle = window.getComputedStyle( tr );
    				reliableTrDimensionsVal = ( parseInt( trStyle.height, 10 ) +
    					parseInt( trStyle.borderTopWidth, 10 ) +
    					parseInt( trStyle.borderBottomWidth, 10 ) ) === tr.offsetHeight;

    				documentElement.removeChild( table );
    			}
    			return reliableTrDimensionsVal;
    		}
    	} );
    } )();


    function curCSS( elem, name, computed ) {
    	var width, minWidth, maxWidth, ret,
    		isCustomProp = rcustomProp.test( name ),

    		// Support: Firefox 51+
    		// Retrieving style before computed somehow
    		// fixes an issue with getting wrong values
    		// on detached elements
    		style = elem.style;

    	computed = computed || getStyles( elem );

    	// getPropertyValue is needed for:
    	//   .css('filter') (IE 9 only, trac-12537)
    	//   .css('--customProperty) (gh-3144)
    	if ( computed ) {
    		ret = computed.getPropertyValue( name ) || computed[ name ];

    		// trim whitespace for custom property (issue gh-4926)
    		if ( isCustomProp ) {

    			// rtrim treats U+000D CARRIAGE RETURN and U+000C FORM FEED
    			// as whitespace while CSS does not, but this is not a problem
    			// because CSS preprocessing replaces them with U+000A LINE FEED
    			// (which *is* CSS whitespace)
    			// https://www.w3.org/TR/css-syntax-3/#input-preprocessing
    			ret = ret.replace( rtrimCSS, "$1" );
    		}

    		if ( ret === "" && !isAttached( elem ) ) {
    			ret = jQuery.style( elem, name );
    		}

    		// A tribute to the "awesome hack by Dean Edwards"
    		// Android Browser returns percentage for some values,
    		// but width seems to be reliably pixels.
    		// This is against the CSSOM draft spec:
    		// https://drafts.csswg.org/cssom/#resolved-values
    		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

    			// Remember the original values
    			width = style.width;
    			minWidth = style.minWidth;
    			maxWidth = style.maxWidth;

    			// Put in the new values to get a computed value out
    			style.minWidth = style.maxWidth = style.width = ret;
    			ret = computed.width;

    			// Revert the changed values
    			style.width = width;
    			style.minWidth = minWidth;
    			style.maxWidth = maxWidth;
    		}
    	}

    	return ret !== undefined ?

    		// Support: IE <=9 - 11 only
    		// IE returns zIndex value as an integer.
    		ret + "" :
    		ret;
    }


    function addGetHookIf( conditionFn, hookFn ) {

    	// Define the hook, we'll check on the first run if it's really needed.
    	return {
    		get: function() {
    			if ( conditionFn() ) {

    				// Hook not needed (or it's not possible to use it due
    				// to missing dependency), remove it.
    				delete this.get;
    				return;
    			}

    			// Hook needed; redefine it so that the support test is not executed again.
    			return ( this.get = hookFn ).apply( this, arguments );
    		}
    	};
    }


    var cssPrefixes = [ "Webkit", "Moz", "ms" ],
    	emptyStyle = document.createElement( "div" ).style,
    	vendorProps = {};

    // Return a vendor-prefixed property or undefined
    function vendorPropName( name ) {

    	// Check for vendor prefixed names
    	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
    		i = cssPrefixes.length;

    	while ( i-- ) {
    		name = cssPrefixes[ i ] + capName;
    		if ( name in emptyStyle ) {
    			return name;
    		}
    	}
    }

    // Return a potentially-mapped jQuery.cssProps or vendor prefixed property
    function finalPropName( name ) {
    	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

    	if ( final ) {
    		return final;
    	}
    	if ( name in emptyStyle ) {
    		return name;
    	}
    	return vendorProps[ name ] = vendorPropName( name ) || name;
    }


    var

    	// Swappable if display is none or starts with table
    	// except "table", "table-cell", or "table-caption"
    	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
    	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
    	cssNormalTransform = {
    		letterSpacing: "0",
    		fontWeight: "400"
    	};

    function setPositiveNumber( _elem, value, subtract ) {

    	// Any relative (+/-) values have already been
    	// normalized at this point
    	var matches = rcssNum.exec( value );
    	return matches ?

    		// Guard against undefined "subtract", e.g., when used as in cssHooks
    		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
    		value;
    }

    function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
    	var i = dimension === "width" ? 1 : 0,
    		extra = 0,
    		delta = 0;

    	// Adjustment may not be necessary
    	if ( box === ( isBorderBox ? "border" : "content" ) ) {
    		return 0;
    	}

    	for ( ; i < 4; i += 2 ) {

    		// Both box models exclude margin
    		if ( box === "margin" ) {
    			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
    		}

    		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
    		if ( !isBorderBox ) {

    			// Add padding
    			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

    			// For "border" or "margin", add border
    			if ( box !== "padding" ) {
    				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

    			// But still keep track of it otherwise
    			} else {
    				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
    			}

    		// If we get here with a border-box (content + padding + border), we're seeking "content" or
    		// "padding" or "margin"
    		} else {

    			// For "content", subtract padding
    			if ( box === "content" ) {
    				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
    			}

    			// For "content" or "padding", subtract border
    			if ( box !== "margin" ) {
    				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
    			}
    		}
    	}

    	// Account for positive content-box scroll gutter when requested by providing computedVal
    	if ( !isBorderBox && computedVal >= 0 ) {

    		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
    		// Assuming integer scroll gutter, subtract the rest and round down
    		delta += Math.max( 0, Math.ceil(
    			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
    			computedVal -
    			delta -
    			extra -
    			0.5

    		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
    		// Use an explicit zero to avoid NaN (gh-3964)
    		) ) || 0;
    	}

    	return delta;
    }

    function getWidthOrHeight( elem, dimension, extra ) {

    	// Start with computed style
    	var styles = getStyles( elem ),

    		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
    		// Fake content-box until we know it's needed to know the true value.
    		boxSizingNeeded = !support.boxSizingReliable() || extra,
    		isBorderBox = boxSizingNeeded &&
    			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
    		valueIsBorderBox = isBorderBox,

    		val = curCSS( elem, dimension, styles ),
    		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

    	// Support: Firefox <=54
    	// Return a confounding non-pixel value or feign ignorance, as appropriate.
    	if ( rnumnonpx.test( val ) ) {
    		if ( !extra ) {
    			return val;
    		}
    		val = "auto";
    	}


    	// Support: IE 9 - 11 only
    	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
    	// In those cases, the computed value can be trusted to be border-box.
    	if ( ( !support.boxSizingReliable() && isBorderBox ||

    		// Support: IE 10 - 11+, Edge 15 - 18+
    		// IE/Edge misreport `getComputedStyle` of table rows with width/height
    		// set in CSS while `offset*` properties report correct values.
    		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
    		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

    		// Fall back to offsetWidth/offsetHeight when value is "auto"
    		// This happens for inline elements with no explicit setting (gh-3571)
    		val === "auto" ||

    		// Support: Android <=4.1 - 4.3 only
    		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
    		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

    		// Make sure the element is visible & connected
    		elem.getClientRects().length ) {

    		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

    		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
    		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
    		// retrieved value as a content box dimension.
    		valueIsBorderBox = offsetProp in elem;
    		if ( valueIsBorderBox ) {
    			val = elem[ offsetProp ];
    		}
    	}

    	// Normalize "" and auto
    	val = parseFloat( val ) || 0;

    	// Adjust for the element's box model
    	return ( val +
    		boxModelAdjustment(
    			elem,
    			dimension,
    			extra || ( isBorderBox ? "border" : "content" ),
    			valueIsBorderBox,
    			styles,

    			// Provide the current computed size to request scroll gutter calculation (gh-3589)
    			val
    		)
    	) + "px";
    }

    jQuery.extend( {

    	// Add in style property hooks for overriding the default
    	// behavior of getting and setting a style property
    	cssHooks: {
    		opacity: {
    			get: function( elem, computed ) {
    				if ( computed ) {

    					// We should always get a number back from opacity
    					var ret = curCSS( elem, "opacity" );
    					return ret === "" ? "1" : ret;
    				}
    			}
    		}
    	},

    	// Don't automatically add "px" to these possibly-unitless properties
    	cssNumber: {
    		"animationIterationCount": true,
    		"columnCount": true,
    		"fillOpacity": true,
    		"flexGrow": true,
    		"flexShrink": true,
    		"fontWeight": true,
    		"gridArea": true,
    		"gridColumn": true,
    		"gridColumnEnd": true,
    		"gridColumnStart": true,
    		"gridRow": true,
    		"gridRowEnd": true,
    		"gridRowStart": true,
    		"lineHeight": true,
    		"opacity": true,
    		"order": true,
    		"orphans": true,
    		"widows": true,
    		"zIndex": true,
    		"zoom": true
    	},

    	// Add in properties whose names you wish to fix before
    	// setting or getting the value
    	cssProps: {},

    	// Get and set the style property on a DOM Node
    	style: function( elem, name, value, extra ) {

    		// Don't set styles on text and comment nodes
    		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
    			return;
    		}

    		// Make sure that we're working with the right name
    		var ret, type, hooks,
    			origName = camelCase( name ),
    			isCustomProp = rcustomProp.test( name ),
    			style = elem.style;

    		// Make sure that we're working with the right name. We don't
    		// want to query the value if it is a CSS custom property
    		// since they are user-defined.
    		if ( !isCustomProp ) {
    			name = finalPropName( origName );
    		}

    		// Gets hook for the prefixed version, then unprefixed version
    		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    		// Check if we're setting a value
    		if ( value !== undefined ) {
    			type = typeof value;

    			// Convert "+=" or "-=" to relative numbers (trac-7345)
    			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
    				value = adjustCSS( elem, name, ret );

    				// Fixes bug trac-9237
    				type = "number";
    			}

    			// Make sure that null and NaN values aren't set (trac-7116)
    			if ( value == null || value !== value ) {
    				return;
    			}

    			// If a number was passed in, add the unit (except for certain CSS properties)
    			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
    			// "px" to a few hardcoded values.
    			if ( type === "number" && !isCustomProp ) {
    				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
    			}

    			// background-* props affect original clone's values
    			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
    				style[ name ] = "inherit";
    			}

    			// If a hook was provided, use that value, otherwise just set the specified value
    			if ( !hooks || !( "set" in hooks ) ||
    				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

    				if ( isCustomProp ) {
    					style.setProperty( name, value );
    				} else {
    					style[ name ] = value;
    				}
    			}

    		} else {

    			// If a hook was provided get the non-computed value from there
    			if ( hooks && "get" in hooks &&
    				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

    				return ret;
    			}

    			// Otherwise just get the value from the style object
    			return style[ name ];
    		}
    	},

    	css: function( elem, name, extra, styles ) {
    		var val, num, hooks,
    			origName = camelCase( name ),
    			isCustomProp = rcustomProp.test( name );

    		// Make sure that we're working with the right name. We don't
    		// want to modify the value if it is a CSS custom property
    		// since they are user-defined.
    		if ( !isCustomProp ) {
    			name = finalPropName( origName );
    		}

    		// Try prefixed name followed by the unprefixed name
    		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    		// If a hook was provided get the computed value from there
    		if ( hooks && "get" in hooks ) {
    			val = hooks.get( elem, true, extra );
    		}

    		// Otherwise, if a way to get the computed value exists, use that
    		if ( val === undefined ) {
    			val = curCSS( elem, name, styles );
    		}

    		// Convert "normal" to computed value
    		if ( val === "normal" && name in cssNormalTransform ) {
    			val = cssNormalTransform[ name ];
    		}

    		// Make numeric if forced or a qualifier was provided and val looks numeric
    		if ( extra === "" || extra ) {
    			num = parseFloat( val );
    			return extra === true || isFinite( num ) ? num || 0 : val;
    		}

    		return val;
    	}
    } );

    jQuery.each( [ "height", "width" ], function( _i, dimension ) {
    	jQuery.cssHooks[ dimension ] = {
    		get: function( elem, computed, extra ) {
    			if ( computed ) {

    				// Certain elements can have dimension info if we invisibly show them
    				// but it must have a current display style that would benefit
    				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

    					// Support: Safari 8+
    					// Table columns in Safari have non-zero offsetWidth & zero
    					// getBoundingClientRect().width unless display is changed.
    					// Support: IE <=11 only
    					// Running getBoundingClientRect on a disconnected node
    					// in IE throws an error.
    					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
    					swap( elem, cssShow, function() {
    						return getWidthOrHeight( elem, dimension, extra );
    					} ) :
    					getWidthOrHeight( elem, dimension, extra );
    			}
    		},

    		set: function( elem, value, extra ) {
    			var matches,
    				styles = getStyles( elem ),

    				// Only read styles.position if the test has a chance to fail
    				// to avoid forcing a reflow.
    				scrollboxSizeBuggy = !support.scrollboxSize() &&
    					styles.position === "absolute",

    				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
    				boxSizingNeeded = scrollboxSizeBuggy || extra,
    				isBorderBox = boxSizingNeeded &&
    					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
    				subtract = extra ?
    					boxModelAdjustment(
    						elem,
    						dimension,
    						extra,
    						isBorderBox,
    						styles
    					) :
    					0;

    			// Account for unreliable border-box dimensions by comparing offset* to computed and
    			// faking a content-box to get border and padding (gh-3699)
    			if ( isBorderBox && scrollboxSizeBuggy ) {
    				subtract -= Math.ceil(
    					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
    					parseFloat( styles[ dimension ] ) -
    					boxModelAdjustment( elem, dimension, "border", false, styles ) -
    					0.5
    				);
    			}

    			// Convert to pixels if value adjustment is needed
    			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
    				( matches[ 3 ] || "px" ) !== "px" ) {

    				elem.style[ dimension ] = value;
    				value = jQuery.css( elem, dimension );
    			}

    			return setPositiveNumber( elem, value, subtract );
    		}
    	};
    } );

    jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
    	function( elem, computed ) {
    		if ( computed ) {
    			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
    				elem.getBoundingClientRect().left -
    					swap( elem, { marginLeft: 0 }, function() {
    						return elem.getBoundingClientRect().left;
    					} )
    			) + "px";
    		}
    	}
    );

    // These hooks are used by animate to expand properties
    jQuery.each( {
    	margin: "",
    	padding: "",
    	border: "Width"
    }, function( prefix, suffix ) {
    	jQuery.cssHooks[ prefix + suffix ] = {
    		expand: function( value ) {
    			var i = 0,
    				expanded = {},

    				// Assumes a single number if not a string
    				parts = typeof value === "string" ? value.split( " " ) : [ value ];

    			for ( ; i < 4; i++ ) {
    				expanded[ prefix + cssExpand[ i ] + suffix ] =
    					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
    			}

    			return expanded;
    		}
    	};

    	if ( prefix !== "margin" ) {
    		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
    	}
    } );

    jQuery.fn.extend( {
    	css: function( name, value ) {
    		return access( this, function( elem, name, value ) {
    			var styles, len,
    				map = {},
    				i = 0;

    			if ( Array.isArray( name ) ) {
    				styles = getStyles( elem );
    				len = name.length;

    				for ( ; i < len; i++ ) {
    					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
    				}

    				return map;
    			}

    			return value !== undefined ?
    				jQuery.style( elem, name, value ) :
    				jQuery.css( elem, name );
    		}, name, value, arguments.length > 1 );
    	}
    } );


    function Tween( elem, options, prop, end, easing ) {
    	return new Tween.prototype.init( elem, options, prop, end, easing );
    }
    jQuery.Tween = Tween;

    Tween.prototype = {
    	constructor: Tween,
    	init: function( elem, options, prop, end, easing, unit ) {
    		this.elem = elem;
    		this.prop = prop;
    		this.easing = easing || jQuery.easing._default;
    		this.options = options;
    		this.start = this.now = this.cur();
    		this.end = end;
    		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
    	},
    	cur: function() {
    		var hooks = Tween.propHooks[ this.prop ];

    		return hooks && hooks.get ?
    			hooks.get( this ) :
    			Tween.propHooks._default.get( this );
    	},
    	run: function( percent ) {
    		var eased,
    			hooks = Tween.propHooks[ this.prop ];

    		if ( this.options.duration ) {
    			this.pos = eased = jQuery.easing[ this.easing ](
    				percent, this.options.duration * percent, 0, 1, this.options.duration
    			);
    		} else {
    			this.pos = eased = percent;
    		}
    		this.now = ( this.end - this.start ) * eased + this.start;

    		if ( this.options.step ) {
    			this.options.step.call( this.elem, this.now, this );
    		}

    		if ( hooks && hooks.set ) {
    			hooks.set( this );
    		} else {
    			Tween.propHooks._default.set( this );
    		}
    		return this;
    	}
    };

    Tween.prototype.init.prototype = Tween.prototype;

    Tween.propHooks = {
    	_default: {
    		get: function( tween ) {
    			var result;

    			// Use a property on the element directly when it is not a DOM element,
    			// or when there is no matching style property that exists.
    			if ( tween.elem.nodeType !== 1 ||
    				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
    				return tween.elem[ tween.prop ];
    			}

    			// Passing an empty string as a 3rd parameter to .css will automatically
    			// attempt a parseFloat and fallback to a string if the parse fails.
    			// Simple values such as "10px" are parsed to Float;
    			// complex values such as "rotate(1rad)" are returned as-is.
    			result = jQuery.css( tween.elem, tween.prop, "" );

    			// Empty strings, null, undefined and "auto" are converted to 0.
    			return !result || result === "auto" ? 0 : result;
    		},
    		set: function( tween ) {

    			// Use step hook for back compat.
    			// Use cssHook if its there.
    			// Use .style if available and use plain properties where available.
    			if ( jQuery.fx.step[ tween.prop ] ) {
    				jQuery.fx.step[ tween.prop ]( tween );
    			} else if ( tween.elem.nodeType === 1 && (
    				jQuery.cssHooks[ tween.prop ] ||
    					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
    				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
    			} else {
    				tween.elem[ tween.prop ] = tween.now;
    			}
    		}
    	}
    };

    // Support: IE <=9 only
    // Panic based approach to setting things on disconnected nodes
    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
    	set: function( tween ) {
    		if ( tween.elem.nodeType && tween.elem.parentNode ) {
    			tween.elem[ tween.prop ] = tween.now;
    		}
    	}
    };

    jQuery.easing = {
    	linear: function( p ) {
    		return p;
    	},
    	swing: function( p ) {
    		return 0.5 - Math.cos( p * Math.PI ) / 2;
    	},
    	_default: "swing"
    };

    jQuery.fx = Tween.prototype.init;

    // Back compat <1.8 extension point
    jQuery.fx.step = {};




    var
    	fxNow, inProgress,
    	rfxtypes = /^(?:toggle|show|hide)$/,
    	rrun = /queueHooks$/;

    function schedule() {
    	if ( inProgress ) {
    		if ( document.hidden === false && window.requestAnimationFrame ) {
    			window.requestAnimationFrame( schedule );
    		} else {
    			window.setTimeout( schedule, jQuery.fx.interval );
    		}

    		jQuery.fx.tick();
    	}
    }

    // Animations created synchronously will run synchronously
    function createFxNow() {
    	window.setTimeout( function() {
    		fxNow = undefined;
    	} );
    	return ( fxNow = Date.now() );
    }

    // Generate parameters to create a standard animation
    function genFx( type, includeWidth ) {
    	var which,
    		i = 0,
    		attrs = { height: type };

    	// If we include width, step value is 1 to do all cssExpand values,
    	// otherwise step value is 2 to skip over Left and Right
    	includeWidth = includeWidth ? 1 : 0;
    	for ( ; i < 4; i += 2 - includeWidth ) {
    		which = cssExpand[ i ];
    		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
    	}

    	if ( includeWidth ) {
    		attrs.opacity = attrs.width = type;
    	}

    	return attrs;
    }

    function createTween( value, prop, animation ) {
    	var tween,
    		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
    		index = 0,
    		length = collection.length;
    	for ( ; index < length; index++ ) {
    		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

    			// We're done with this property
    			return tween;
    		}
    	}
    }

    function defaultPrefilter( elem, props, opts ) {
    	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
    		isBox = "width" in props || "height" in props,
    		anim = this,
    		orig = {},
    		style = elem.style,
    		hidden = elem.nodeType && isHiddenWithinTree( elem ),
    		dataShow = dataPriv.get( elem, "fxshow" );

    	// Queue-skipping animations hijack the fx hooks
    	if ( !opts.queue ) {
    		hooks = jQuery._queueHooks( elem, "fx" );
    		if ( hooks.unqueued == null ) {
    			hooks.unqueued = 0;
    			oldfire = hooks.empty.fire;
    			hooks.empty.fire = function() {
    				if ( !hooks.unqueued ) {
    					oldfire();
    				}
    			};
    		}
    		hooks.unqueued++;

    		anim.always( function() {

    			// Ensure the complete handler is called before this completes
    			anim.always( function() {
    				hooks.unqueued--;
    				if ( !jQuery.queue( elem, "fx" ).length ) {
    					hooks.empty.fire();
    				}
    			} );
    		} );
    	}

    	// Detect show/hide animations
    	for ( prop in props ) {
    		value = props[ prop ];
    		if ( rfxtypes.test( value ) ) {
    			delete props[ prop ];
    			toggle = toggle || value === "toggle";
    			if ( value === ( hidden ? "hide" : "show" ) ) {

    				// Pretend to be hidden if this is a "show" and
    				// there is still data from a stopped show/hide
    				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
    					hidden = true;

    				// Ignore all other no-op show/hide data
    				} else {
    					continue;
    				}
    			}
    			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
    		}
    	}

    	// Bail out if this is a no-op like .hide().hide()
    	propTween = !jQuery.isEmptyObject( props );
    	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
    		return;
    	}

    	// Restrict "overflow" and "display" styles during box animations
    	if ( isBox && elem.nodeType === 1 ) {

    		// Support: IE <=9 - 11, Edge 12 - 15
    		// Record all 3 overflow attributes because IE does not infer the shorthand
    		// from identically-valued overflowX and overflowY and Edge just mirrors
    		// the overflowX value there.
    		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

    		// Identify a display type, preferring old show/hide data over the CSS cascade
    		restoreDisplay = dataShow && dataShow.display;
    		if ( restoreDisplay == null ) {
    			restoreDisplay = dataPriv.get( elem, "display" );
    		}
    		display = jQuery.css( elem, "display" );
    		if ( display === "none" ) {
    			if ( restoreDisplay ) {
    				display = restoreDisplay;
    			} else {

    				// Get nonempty value(s) by temporarily forcing visibility
    				showHide( [ elem ], true );
    				restoreDisplay = elem.style.display || restoreDisplay;
    				display = jQuery.css( elem, "display" );
    				showHide( [ elem ] );
    			}
    		}

    		// Animate inline elements as inline-block
    		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
    			if ( jQuery.css( elem, "float" ) === "none" ) {

    				// Restore the original display value at the end of pure show/hide animations
    				if ( !propTween ) {
    					anim.done( function() {
    						style.display = restoreDisplay;
    					} );
    					if ( restoreDisplay == null ) {
    						display = style.display;
    						restoreDisplay = display === "none" ? "" : display;
    					}
    				}
    				style.display = "inline-block";
    			}
    		}
    	}

    	if ( opts.overflow ) {
    		style.overflow = "hidden";
    		anim.always( function() {
    			style.overflow = opts.overflow[ 0 ];
    			style.overflowX = opts.overflow[ 1 ];
    			style.overflowY = opts.overflow[ 2 ];
    		} );
    	}

    	// Implement show/hide animations
    	propTween = false;
    	for ( prop in orig ) {

    		// General show/hide setup for this element animation
    		if ( !propTween ) {
    			if ( dataShow ) {
    				if ( "hidden" in dataShow ) {
    					hidden = dataShow.hidden;
    				}
    			} else {
    				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
    			}

    			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
    			if ( toggle ) {
    				dataShow.hidden = !hidden;
    			}

    			// Show elements before animating them
    			if ( hidden ) {
    				showHide( [ elem ], true );
    			}

    			/* eslint-disable no-loop-func */

    			anim.done( function() {

    				/* eslint-enable no-loop-func */

    				// The final step of a "hide" animation is actually hiding the element
    				if ( !hidden ) {
    					showHide( [ elem ] );
    				}
    				dataPriv.remove( elem, "fxshow" );
    				for ( prop in orig ) {
    					jQuery.style( elem, prop, orig[ prop ] );
    				}
    			} );
    		}

    		// Per-property setup
    		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
    		if ( !( prop in dataShow ) ) {
    			dataShow[ prop ] = propTween.start;
    			if ( hidden ) {
    				propTween.end = propTween.start;
    				propTween.start = 0;
    			}
    		}
    	}
    }

    function propFilter( props, specialEasing ) {
    	var index, name, easing, value, hooks;

    	// camelCase, specialEasing and expand cssHook pass
    	for ( index in props ) {
    		name = camelCase( index );
    		easing = specialEasing[ name ];
    		value = props[ index ];
    		if ( Array.isArray( value ) ) {
    			easing = value[ 1 ];
    			value = props[ index ] = value[ 0 ];
    		}

    		if ( index !== name ) {
    			props[ name ] = value;
    			delete props[ index ];
    		}

    		hooks = jQuery.cssHooks[ name ];
    		if ( hooks && "expand" in hooks ) {
    			value = hooks.expand( value );
    			delete props[ name ];

    			// Not quite $.extend, this won't overwrite existing keys.
    			// Reusing 'index' because we have the correct "name"
    			for ( index in value ) {
    				if ( !( index in props ) ) {
    					props[ index ] = value[ index ];
    					specialEasing[ index ] = easing;
    				}
    			}
    		} else {
    			specialEasing[ name ] = easing;
    		}
    	}
    }

    function Animation( elem, properties, options ) {
    	var result,
    		stopped,
    		index = 0,
    		length = Animation.prefilters.length,
    		deferred = jQuery.Deferred().always( function() {

    			// Don't match elem in the :animated selector
    			delete tick.elem;
    		} ),
    		tick = function() {
    			if ( stopped ) {
    				return false;
    			}
    			var currentTime = fxNow || createFxNow(),
    				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

    				// Support: Android 2.3 only
    				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (trac-12497)
    				temp = remaining / animation.duration || 0,
    				percent = 1 - temp,
    				index = 0,
    				length = animation.tweens.length;

    			for ( ; index < length; index++ ) {
    				animation.tweens[ index ].run( percent );
    			}

    			deferred.notifyWith( elem, [ animation, percent, remaining ] );

    			// If there's more to do, yield
    			if ( percent < 1 && length ) {
    				return remaining;
    			}

    			// If this was an empty animation, synthesize a final progress notification
    			if ( !length ) {
    				deferred.notifyWith( elem, [ animation, 1, 0 ] );
    			}

    			// Resolve the animation and report its conclusion
    			deferred.resolveWith( elem, [ animation ] );
    			return false;
    		},
    		animation = deferred.promise( {
    			elem: elem,
    			props: jQuery.extend( {}, properties ),
    			opts: jQuery.extend( true, {
    				specialEasing: {},
    				easing: jQuery.easing._default
    			}, options ),
    			originalProperties: properties,
    			originalOptions: options,
    			startTime: fxNow || createFxNow(),
    			duration: options.duration,
    			tweens: [],
    			createTween: function( prop, end ) {
    				var tween = jQuery.Tween( elem, animation.opts, prop, end,
    					animation.opts.specialEasing[ prop ] || animation.opts.easing );
    				animation.tweens.push( tween );
    				return tween;
    			},
    			stop: function( gotoEnd ) {
    				var index = 0,

    					// If we are going to the end, we want to run all the tweens
    					// otherwise we skip this part
    					length = gotoEnd ? animation.tweens.length : 0;
    				if ( stopped ) {
    					return this;
    				}
    				stopped = true;
    				for ( ; index < length; index++ ) {
    					animation.tweens[ index ].run( 1 );
    				}

    				// Resolve when we played the last frame; otherwise, reject
    				if ( gotoEnd ) {
    					deferred.notifyWith( elem, [ animation, 1, 0 ] );
    					deferred.resolveWith( elem, [ animation, gotoEnd ] );
    				} else {
    					deferred.rejectWith( elem, [ animation, gotoEnd ] );
    				}
    				return this;
    			}
    		} ),
    		props = animation.props;

    	propFilter( props, animation.opts.specialEasing );

    	for ( ; index < length; index++ ) {
    		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
    		if ( result ) {
    			if ( isFunction( result.stop ) ) {
    				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
    					result.stop.bind( result );
    			}
    			return result;
    		}
    	}

    	jQuery.map( props, createTween, animation );

    	if ( isFunction( animation.opts.start ) ) {
    		animation.opts.start.call( elem, animation );
    	}

    	// Attach callbacks from options
    	animation
    		.progress( animation.opts.progress )
    		.done( animation.opts.done, animation.opts.complete )
    		.fail( animation.opts.fail )
    		.always( animation.opts.always );

    	jQuery.fx.timer(
    		jQuery.extend( tick, {
    			elem: elem,
    			anim: animation,
    			queue: animation.opts.queue
    		} )
    	);

    	return animation;
    }

    jQuery.Animation = jQuery.extend( Animation, {

    	tweeners: {
    		"*": [ function( prop, value ) {
    			var tween = this.createTween( prop, value );
    			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
    			return tween;
    		} ]
    	},

    	tweener: function( props, callback ) {
    		if ( isFunction( props ) ) {
    			callback = props;
    			props = [ "*" ];
    		} else {
    			props = props.match( rnothtmlwhite );
    		}

    		var prop,
    			index = 0,
    			length = props.length;

    		for ( ; index < length; index++ ) {
    			prop = props[ index ];
    			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
    			Animation.tweeners[ prop ].unshift( callback );
    		}
    	},

    	prefilters: [ defaultPrefilter ],

    	prefilter: function( callback, prepend ) {
    		if ( prepend ) {
    			Animation.prefilters.unshift( callback );
    		} else {
    			Animation.prefilters.push( callback );
    		}
    	}
    } );

    jQuery.speed = function( speed, easing, fn ) {
    	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
    		complete: fn || !fn && easing ||
    			isFunction( speed ) && speed,
    		duration: speed,
    		easing: fn && easing || easing && !isFunction( easing ) && easing
    	};

    	// Go to the end state if fx are off
    	if ( jQuery.fx.off ) {
    		opt.duration = 0;

    	} else {
    		if ( typeof opt.duration !== "number" ) {
    			if ( opt.duration in jQuery.fx.speeds ) {
    				opt.duration = jQuery.fx.speeds[ opt.duration ];

    			} else {
    				opt.duration = jQuery.fx.speeds._default;
    			}
    		}
    	}

    	// Normalize opt.queue - true/undefined/null -> "fx"
    	if ( opt.queue == null || opt.queue === true ) {
    		opt.queue = "fx";
    	}

    	// Queueing
    	opt.old = opt.complete;

    	opt.complete = function() {
    		if ( isFunction( opt.old ) ) {
    			opt.old.call( this );
    		}

    		if ( opt.queue ) {
    			jQuery.dequeue( this, opt.queue );
    		}
    	};

    	return opt;
    };

    jQuery.fn.extend( {
    	fadeTo: function( speed, to, easing, callback ) {

    		// Show any hidden elements after setting opacity to 0
    		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

    			// Animate to the value specified
    			.end().animate( { opacity: to }, speed, easing, callback );
    	},
    	animate: function( prop, speed, easing, callback ) {
    		var empty = jQuery.isEmptyObject( prop ),
    			optall = jQuery.speed( speed, easing, callback ),
    			doAnimation = function() {

    				// Operate on a copy of prop so per-property easing won't be lost
    				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

    				// Empty animations, or finishing resolves immediately
    				if ( empty || dataPriv.get( this, "finish" ) ) {
    					anim.stop( true );
    				}
    			};

    		doAnimation.finish = doAnimation;

    		return empty || optall.queue === false ?
    			this.each( doAnimation ) :
    			this.queue( optall.queue, doAnimation );
    	},
    	stop: function( type, clearQueue, gotoEnd ) {
    		var stopQueue = function( hooks ) {
    			var stop = hooks.stop;
    			delete hooks.stop;
    			stop( gotoEnd );
    		};

    		if ( typeof type !== "string" ) {
    			gotoEnd = clearQueue;
    			clearQueue = type;
    			type = undefined;
    		}
    		if ( clearQueue ) {
    			this.queue( type || "fx", [] );
    		}

    		return this.each( function() {
    			var dequeue = true,
    				index = type != null && type + "queueHooks",
    				timers = jQuery.timers,
    				data = dataPriv.get( this );

    			if ( index ) {
    				if ( data[ index ] && data[ index ].stop ) {
    					stopQueue( data[ index ] );
    				}
    			} else {
    				for ( index in data ) {
    					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
    						stopQueue( data[ index ] );
    					}
    				}
    			}

    			for ( index = timers.length; index--; ) {
    				if ( timers[ index ].elem === this &&
    					( type == null || timers[ index ].queue === type ) ) {

    					timers[ index ].anim.stop( gotoEnd );
    					dequeue = false;
    					timers.splice( index, 1 );
    				}
    			}

    			// Start the next in the queue if the last step wasn't forced.
    			// Timers currently will call their complete callbacks, which
    			// will dequeue but only if they were gotoEnd.
    			if ( dequeue || !gotoEnd ) {
    				jQuery.dequeue( this, type );
    			}
    		} );
    	},
    	finish: function( type ) {
    		if ( type !== false ) {
    			type = type || "fx";
    		}
    		return this.each( function() {
    			var index,
    				data = dataPriv.get( this ),
    				queue = data[ type + "queue" ],
    				hooks = data[ type + "queueHooks" ],
    				timers = jQuery.timers,
    				length = queue ? queue.length : 0;

    			// Enable finishing flag on private data
    			data.finish = true;

    			// Empty the queue first
    			jQuery.queue( this, type, [] );

    			if ( hooks && hooks.stop ) {
    				hooks.stop.call( this, true );
    			}

    			// Look for any active animations, and finish them
    			for ( index = timers.length; index--; ) {
    				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
    					timers[ index ].anim.stop( true );
    					timers.splice( index, 1 );
    				}
    			}

    			// Look for any animations in the old queue and finish them
    			for ( index = 0; index < length; index++ ) {
    				if ( queue[ index ] && queue[ index ].finish ) {
    					queue[ index ].finish.call( this );
    				}
    			}

    			// Turn off finishing flag
    			delete data.finish;
    		} );
    	}
    } );

    jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
    	var cssFn = jQuery.fn[ name ];
    	jQuery.fn[ name ] = function( speed, easing, callback ) {
    		return speed == null || typeof speed === "boolean" ?
    			cssFn.apply( this, arguments ) :
    			this.animate( genFx( name, true ), speed, easing, callback );
    	};
    } );

    // Generate shortcuts for custom animations
    jQuery.each( {
    	slideDown: genFx( "show" ),
    	slideUp: genFx( "hide" ),
    	slideToggle: genFx( "toggle" ),
    	fadeIn: { opacity: "show" },
    	fadeOut: { opacity: "hide" },
    	fadeToggle: { opacity: "toggle" }
    }, function( name, props ) {
    	jQuery.fn[ name ] = function( speed, easing, callback ) {
    		return this.animate( props, speed, easing, callback );
    	};
    } );

    jQuery.timers = [];
    jQuery.fx.tick = function() {
    	var timer,
    		i = 0,
    		timers = jQuery.timers;

    	fxNow = Date.now();

    	for ( ; i < timers.length; i++ ) {
    		timer = timers[ i ];

    		// Run the timer and safely remove it when done (allowing for external removal)
    		if ( !timer() && timers[ i ] === timer ) {
    			timers.splice( i--, 1 );
    		}
    	}

    	if ( !timers.length ) {
    		jQuery.fx.stop();
    	}
    	fxNow = undefined;
    };

    jQuery.fx.timer = function( timer ) {
    	jQuery.timers.push( timer );
    	jQuery.fx.start();
    };

    jQuery.fx.interval = 13;
    jQuery.fx.start = function() {
    	if ( inProgress ) {
    		return;
    	}

    	inProgress = true;
    	schedule();
    };

    jQuery.fx.stop = function() {
    	inProgress = null;
    };

    jQuery.fx.speeds = {
    	slow: 600,
    	fast: 200,

    	// Default speed
    	_default: 400
    };


    // Based off of the plugin by Clint Helfers, with permission.
    jQuery.fn.delay = function( time, type ) {
    	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
    	type = type || "fx";

    	return this.queue( type, function( next, hooks ) {
    		var timeout = window.setTimeout( next, time );
    		hooks.stop = function() {
    			window.clearTimeout( timeout );
    		};
    	} );
    };


    ( function() {
    	var input = document.createElement( "input" ),
    		select = document.createElement( "select" ),
    		opt = select.appendChild( document.createElement( "option" ) );

    	input.type = "checkbox";

    	// Support: Android <=4.3 only
    	// Default value for a checkbox should be "on"
    	support.checkOn = input.value !== "";

    	// Support: IE <=11 only
    	// Must access selectedIndex to make default options select
    	support.optSelected = opt.selected;

    	// Support: IE <=11 only
    	// An input loses its value after becoming a radio
    	input = document.createElement( "input" );
    	input.value = "t";
    	input.type = "radio";
    	support.radioValue = input.value === "t";
    } )();


    var boolHook,
    	attrHandle = jQuery.expr.attrHandle;

    jQuery.fn.extend( {
    	attr: function( name, value ) {
    		return access( this, jQuery.attr, name, value, arguments.length > 1 );
    	},

    	removeAttr: function( name ) {
    		return this.each( function() {
    			jQuery.removeAttr( this, name );
    		} );
    	}
    } );

    jQuery.extend( {
    	attr: function( elem, name, value ) {
    		var ret, hooks,
    			nType = elem.nodeType;

    		// Don't get/set attributes on text, comment and attribute nodes
    		if ( nType === 3 || nType === 8 || nType === 2 ) {
    			return;
    		}

    		// Fallback to prop when attributes are not supported
    		if ( typeof elem.getAttribute === "undefined" ) {
    			return jQuery.prop( elem, name, value );
    		}

    		// Attribute hooks are determined by the lowercase version
    		// Grab necessary hook if one is defined
    		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
    			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
    				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
    		}

    		if ( value !== undefined ) {
    			if ( value === null ) {
    				jQuery.removeAttr( elem, name );
    				return;
    			}

    			if ( hooks && "set" in hooks &&
    				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
    				return ret;
    			}

    			elem.setAttribute( name, value + "" );
    			return value;
    		}

    		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
    			return ret;
    		}

    		ret = jQuery.find.attr( elem, name );

    		// Non-existent attributes return null, we normalize to undefined
    		return ret == null ? undefined : ret;
    	},

    	attrHooks: {
    		type: {
    			set: function( elem, value ) {
    				if ( !support.radioValue && value === "radio" &&
    					nodeName( elem, "input" ) ) {
    					var val = elem.value;
    					elem.setAttribute( "type", value );
    					if ( val ) {
    						elem.value = val;
    					}
    					return value;
    				}
    			}
    		}
    	},

    	removeAttr: function( elem, value ) {
    		var name,
    			i = 0,

    			// Attribute names can contain non-HTML whitespace characters
    			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    			attrNames = value && value.match( rnothtmlwhite );

    		if ( attrNames && elem.nodeType === 1 ) {
    			while ( ( name = attrNames[ i++ ] ) ) {
    				elem.removeAttribute( name );
    			}
    		}
    	}
    } );

    // Hooks for boolean attributes
    boolHook = {
    	set: function( elem, value, name ) {
    		if ( value === false ) {

    			// Remove boolean attributes when set to false
    			jQuery.removeAttr( elem, name );
    		} else {
    			elem.setAttribute( name, name );
    		}
    		return name;
    	}
    };

    jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
    	var getter = attrHandle[ name ] || jQuery.find.attr;

    	attrHandle[ name ] = function( elem, name, isXML ) {
    		var ret, handle,
    			lowercaseName = name.toLowerCase();

    		if ( !isXML ) {

    			// Avoid an infinite loop by temporarily removing this function from the getter
    			handle = attrHandle[ lowercaseName ];
    			attrHandle[ lowercaseName ] = ret;
    			ret = getter( elem, name, isXML ) != null ?
    				lowercaseName :
    				null;
    			attrHandle[ lowercaseName ] = handle;
    		}
    		return ret;
    	};
    } );




    var rfocusable = /^(?:input|select|textarea|button)$/i,
    	rclickable = /^(?:a|area)$/i;

    jQuery.fn.extend( {
    	prop: function( name, value ) {
    		return access( this, jQuery.prop, name, value, arguments.length > 1 );
    	},

    	removeProp: function( name ) {
    		return this.each( function() {
    			delete this[ jQuery.propFix[ name ] || name ];
    		} );
    	}
    } );

    jQuery.extend( {
    	prop: function( elem, name, value ) {
    		var ret, hooks,
    			nType = elem.nodeType;

    		// Don't get/set properties on text, comment and attribute nodes
    		if ( nType === 3 || nType === 8 || nType === 2 ) {
    			return;
    		}

    		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

    			// Fix name and attach hooks
    			name = jQuery.propFix[ name ] || name;
    			hooks = jQuery.propHooks[ name ];
    		}

    		if ( value !== undefined ) {
    			if ( hooks && "set" in hooks &&
    				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
    				return ret;
    			}

    			return ( elem[ name ] = value );
    		}

    		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
    			return ret;
    		}

    		return elem[ name ];
    	},

    	propHooks: {
    		tabIndex: {
    			get: function( elem ) {

    				// Support: IE <=9 - 11 only
    				// elem.tabIndex doesn't always return the
    				// correct value when it hasn't been explicitly set
    				// Use proper attribute retrieval (trac-12072)
    				var tabindex = jQuery.find.attr( elem, "tabindex" );

    				if ( tabindex ) {
    					return parseInt( tabindex, 10 );
    				}

    				if (
    					rfocusable.test( elem.nodeName ) ||
    					rclickable.test( elem.nodeName ) &&
    					elem.href
    				) {
    					return 0;
    				}

    				return -1;
    			}
    		}
    	},

    	propFix: {
    		"for": "htmlFor",
    		"class": "className"
    	}
    } );

    // Support: IE <=11 only
    // Accessing the selectedIndex property
    // forces the browser to respect setting selected
    // on the option
    // The getter ensures a default option is selected
    // when in an optgroup
    // eslint rule "no-unused-expressions" is disabled for this code
    // since it considers such accessions noop
    if ( !support.optSelected ) {
    	jQuery.propHooks.selected = {
    		get: function( elem ) {

    			/* eslint no-unused-expressions: "off" */

    			var parent = elem.parentNode;
    			if ( parent && parent.parentNode ) {
    				parent.parentNode.selectedIndex;
    			}
    			return null;
    		},
    		set: function( elem ) {

    			/* eslint no-unused-expressions: "off" */

    			var parent = elem.parentNode;
    			if ( parent ) {
    				parent.selectedIndex;

    				if ( parent.parentNode ) {
    					parent.parentNode.selectedIndex;
    				}
    			}
    		}
    	};
    }

    jQuery.each( [
    	"tabIndex",
    	"readOnly",
    	"maxLength",
    	"cellSpacing",
    	"cellPadding",
    	"rowSpan",
    	"colSpan",
    	"useMap",
    	"frameBorder",
    	"contentEditable"
    ], function() {
    	jQuery.propFix[ this.toLowerCase() ] = this;
    } );




    	// Strip and collapse whitespace according to HTML spec
    	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
    	function stripAndCollapse( value ) {
    		var tokens = value.match( rnothtmlwhite ) || [];
    		return tokens.join( " " );
    	}


    function getClass( elem ) {
    	return elem.getAttribute && elem.getAttribute( "class" ) || "";
    }

    function classesToArray( value ) {
    	if ( Array.isArray( value ) ) {
    		return value;
    	}
    	if ( typeof value === "string" ) {
    		return value.match( rnothtmlwhite ) || [];
    	}
    	return [];
    }

    jQuery.fn.extend( {
    	addClass: function( value ) {
    		var classNames, cur, curValue, className, i, finalValue;

    		if ( isFunction( value ) ) {
    			return this.each( function( j ) {
    				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
    			} );
    		}

    		classNames = classesToArray( value );

    		if ( classNames.length ) {
    			return this.each( function() {
    				curValue = getClass( this );
    				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

    				if ( cur ) {
    					for ( i = 0; i < classNames.length; i++ ) {
    						className = classNames[ i ];
    						if ( cur.indexOf( " " + className + " " ) < 0 ) {
    							cur += className + " ";
    						}
    					}

    					// Only assign if different to avoid unneeded rendering.
    					finalValue = stripAndCollapse( cur );
    					if ( curValue !== finalValue ) {
    						this.setAttribute( "class", finalValue );
    					}
    				}
    			} );
    		}

    		return this;
    	},

    	removeClass: function( value ) {
    		var classNames, cur, curValue, className, i, finalValue;

    		if ( isFunction( value ) ) {
    			return this.each( function( j ) {
    				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
    			} );
    		}

    		if ( !arguments.length ) {
    			return this.attr( "class", "" );
    		}

    		classNames = classesToArray( value );

    		if ( classNames.length ) {
    			return this.each( function() {
    				curValue = getClass( this );

    				// This expression is here for better compressibility (see addClass)
    				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

    				if ( cur ) {
    					for ( i = 0; i < classNames.length; i++ ) {
    						className = classNames[ i ];

    						// Remove *all* instances
    						while ( cur.indexOf( " " + className + " " ) > -1 ) {
    							cur = cur.replace( " " + className + " ", " " );
    						}
    					}

    					// Only assign if different to avoid unneeded rendering.
    					finalValue = stripAndCollapse( cur );
    					if ( curValue !== finalValue ) {
    						this.setAttribute( "class", finalValue );
    					}
    				}
    			} );
    		}

    		return this;
    	},

    	toggleClass: function( value, stateVal ) {
    		var classNames, className, i, self,
    			type = typeof value,
    			isValidValue = type === "string" || Array.isArray( value );

    		if ( isFunction( value ) ) {
    			return this.each( function( i ) {
    				jQuery( this ).toggleClass(
    					value.call( this, i, getClass( this ), stateVal ),
    					stateVal
    				);
    			} );
    		}

    		if ( typeof stateVal === "boolean" && isValidValue ) {
    			return stateVal ? this.addClass( value ) : this.removeClass( value );
    		}

    		classNames = classesToArray( value );

    		return this.each( function() {
    			if ( isValidValue ) {

    				// Toggle individual class names
    				self = jQuery( this );

    				for ( i = 0; i < classNames.length; i++ ) {
    					className = classNames[ i ];

    					// Check each className given, space separated list
    					if ( self.hasClass( className ) ) {
    						self.removeClass( className );
    					} else {
    						self.addClass( className );
    					}
    				}

    			// Toggle whole class name
    			} else if ( value === undefined || type === "boolean" ) {
    				className = getClass( this );
    				if ( className ) {

    					// Store className if set
    					dataPriv.set( this, "__className__", className );
    				}

    				// If the element has a class name or if we're passed `false`,
    				// then remove the whole classname (if there was one, the above saved it).
    				// Otherwise bring back whatever was previously saved (if anything),
    				// falling back to the empty string if nothing was stored.
    				if ( this.setAttribute ) {
    					this.setAttribute( "class",
    						className || value === false ?
    							"" :
    							dataPriv.get( this, "__className__" ) || ""
    					);
    				}
    			}
    		} );
    	},

    	hasClass: function( selector ) {
    		var className, elem,
    			i = 0;

    		className = " " + selector + " ";
    		while ( ( elem = this[ i++ ] ) ) {
    			if ( elem.nodeType === 1 &&
    				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
    				return true;
    			}
    		}

    		return false;
    	}
    } );




    var rreturn = /\r/g;

    jQuery.fn.extend( {
    	val: function( value ) {
    		var hooks, ret, valueIsFunction,
    			elem = this[ 0 ];

    		if ( !arguments.length ) {
    			if ( elem ) {
    				hooks = jQuery.valHooks[ elem.type ] ||
    					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

    				if ( hooks &&
    					"get" in hooks &&
    					( ret = hooks.get( elem, "value" ) ) !== undefined
    				) {
    					return ret;
    				}

    				ret = elem.value;

    				// Handle most common string cases
    				if ( typeof ret === "string" ) {
    					return ret.replace( rreturn, "" );
    				}

    				// Handle cases where value is null/undef or number
    				return ret == null ? "" : ret;
    			}

    			return;
    		}

    		valueIsFunction = isFunction( value );

    		return this.each( function( i ) {
    			var val;

    			if ( this.nodeType !== 1 ) {
    				return;
    			}

    			if ( valueIsFunction ) {
    				val = value.call( this, i, jQuery( this ).val() );
    			} else {
    				val = value;
    			}

    			// Treat null/undefined as ""; convert numbers to string
    			if ( val == null ) {
    				val = "";

    			} else if ( typeof val === "number" ) {
    				val += "";

    			} else if ( Array.isArray( val ) ) {
    				val = jQuery.map( val, function( value ) {
    					return value == null ? "" : value + "";
    				} );
    			}

    			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

    			// If set returns undefined, fall back to normal setting
    			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
    				this.value = val;
    			}
    		} );
    	}
    } );

    jQuery.extend( {
    	valHooks: {
    		option: {
    			get: function( elem ) {

    				var val = jQuery.find.attr( elem, "value" );
    				return val != null ?
    					val :

    					// Support: IE <=10 - 11 only
    					// option.text throws exceptions (trac-14686, trac-14858)
    					// Strip and collapse whitespace
    					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
    					stripAndCollapse( jQuery.text( elem ) );
    			}
    		},
    		select: {
    			get: function( elem ) {
    				var value, option, i,
    					options = elem.options,
    					index = elem.selectedIndex,
    					one = elem.type === "select-one",
    					values = one ? null : [],
    					max = one ? index + 1 : options.length;

    				if ( index < 0 ) {
    					i = max;

    				} else {
    					i = one ? index : 0;
    				}

    				// Loop through all the selected options
    				for ( ; i < max; i++ ) {
    					option = options[ i ];

    					// Support: IE <=9 only
    					// IE8-9 doesn't update selected after form reset (trac-2551)
    					if ( ( option.selected || i === index ) &&

    							// Don't return options that are disabled or in a disabled optgroup
    							!option.disabled &&
    							( !option.parentNode.disabled ||
    								!nodeName( option.parentNode, "optgroup" ) ) ) {

    						// Get the specific value for the option
    						value = jQuery( option ).val();

    						// We don't need an array for one selects
    						if ( one ) {
    							return value;
    						}

    						// Multi-Selects return an array
    						values.push( value );
    					}
    				}

    				return values;
    			},

    			set: function( elem, value ) {
    				var optionSet, option,
    					options = elem.options,
    					values = jQuery.makeArray( value ),
    					i = options.length;

    				while ( i-- ) {
    					option = options[ i ];

    					/* eslint-disable no-cond-assign */

    					if ( option.selected =
    						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
    					) {
    						optionSet = true;
    					}

    					/* eslint-enable no-cond-assign */
    				}

    				// Force browsers to behave consistently when non-matching value is set
    				if ( !optionSet ) {
    					elem.selectedIndex = -1;
    				}
    				return values;
    			}
    		}
    	}
    } );

    // Radios and checkboxes getter/setter
    jQuery.each( [ "radio", "checkbox" ], function() {
    	jQuery.valHooks[ this ] = {
    		set: function( elem, value ) {
    			if ( Array.isArray( value ) ) {
    				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
    			}
    		}
    	};
    	if ( !support.checkOn ) {
    		jQuery.valHooks[ this ].get = function( elem ) {
    			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
    		};
    	}
    } );




    // Return jQuery for attributes-only inclusion


    support.focusin = "onfocusin" in window;


    var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    	stopPropagationCallback = function( e ) {
    		e.stopPropagation();
    	};

    jQuery.extend( jQuery.event, {

    	trigger: function( event, data, elem, onlyHandlers ) {

    		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
    			eventPath = [ elem || document ],
    			type = hasOwn.call( event, "type" ) ? event.type : event,
    			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

    		cur = lastElement = tmp = elem = elem || document;

    		// Don't do events on text and comment nodes
    		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
    			return;
    		}

    		// focus/blur morphs to focusin/out; ensure we're not firing them right now
    		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
    			return;
    		}

    		if ( type.indexOf( "." ) > -1 ) {

    			// Namespaced trigger; create a regexp to match event type in handle()
    			namespaces = type.split( "." );
    			type = namespaces.shift();
    			namespaces.sort();
    		}
    		ontype = type.indexOf( ":" ) < 0 && "on" + type;

    		// Caller can pass in a jQuery.Event object, Object, or just an event type string
    		event = event[ jQuery.expando ] ?
    			event :
    			new jQuery.Event( type, typeof event === "object" && event );

    		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
    		event.isTrigger = onlyHandlers ? 2 : 3;
    		event.namespace = namespaces.join( "." );
    		event.rnamespace = event.namespace ?
    			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
    			null;

    		// Clean up the event in case it is being reused
    		event.result = undefined;
    		if ( !event.target ) {
    			event.target = elem;
    		}

    		// Clone any incoming data and prepend the event, creating the handler arg list
    		data = data == null ?
    			[ event ] :
    			jQuery.makeArray( data, [ event ] );

    		// Allow special events to draw outside the lines
    		special = jQuery.event.special[ type ] || {};
    		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
    			return;
    		}

    		// Determine event propagation path in advance, per W3C events spec (trac-9951)
    		// Bubble up to document, then to window; watch for a global ownerDocument var (trac-9724)
    		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

    			bubbleType = special.delegateType || type;
    			if ( !rfocusMorph.test( bubbleType + type ) ) {
    				cur = cur.parentNode;
    			}
    			for ( ; cur; cur = cur.parentNode ) {
    				eventPath.push( cur );
    				tmp = cur;
    			}

    			// Only add window if we got to document (e.g., not plain obj or detached DOM)
    			if ( tmp === ( elem.ownerDocument || document ) ) {
    				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
    			}
    		}

    		// Fire handlers on the event path
    		i = 0;
    		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
    			lastElement = cur;
    			event.type = i > 1 ?
    				bubbleType :
    				special.bindType || type;

    			// jQuery handler
    			handle = ( dataPriv.get( cur, "events" ) || Object.create( null ) )[ event.type ] &&
    				dataPriv.get( cur, "handle" );
    			if ( handle ) {
    				handle.apply( cur, data );
    			}

    			// Native handler
    			handle = ontype && cur[ ontype ];
    			if ( handle && handle.apply && acceptData( cur ) ) {
    				event.result = handle.apply( cur, data );
    				if ( event.result === false ) {
    					event.preventDefault();
    				}
    			}
    		}
    		event.type = type;

    		// If nobody prevented the default action, do it now
    		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

    			if ( ( !special._default ||
    				special._default.apply( eventPath.pop(), data ) === false ) &&
    				acceptData( elem ) ) {

    				// Call a native DOM method on the target with the same name as the event.
    				// Don't do default actions on window, that's where global variables be (trac-6170)
    				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

    					// Don't re-trigger an onFOO event when we call its FOO() method
    					tmp = elem[ ontype ];

    					if ( tmp ) {
    						elem[ ontype ] = null;
    					}

    					// Prevent re-triggering of the same event, since we already bubbled it above
    					jQuery.event.triggered = type;

    					if ( event.isPropagationStopped() ) {
    						lastElement.addEventListener( type, stopPropagationCallback );
    					}

    					elem[ type ]();

    					if ( event.isPropagationStopped() ) {
    						lastElement.removeEventListener( type, stopPropagationCallback );
    					}

    					jQuery.event.triggered = undefined;

    					if ( tmp ) {
    						elem[ ontype ] = tmp;
    					}
    				}
    			}
    		}

    		return event.result;
    	},

    	// Piggyback on a donor event to simulate a different one
    	// Used only for `focus(in | out)` events
    	simulate: function( type, elem, event ) {
    		var e = jQuery.extend(
    			new jQuery.Event(),
    			event,
    			{
    				type: type,
    				isSimulated: true
    			}
    		);

    		jQuery.event.trigger( e, null, elem );
    	}

    } );

    jQuery.fn.extend( {

    	trigger: function( type, data ) {
    		return this.each( function() {
    			jQuery.event.trigger( type, data, this );
    		} );
    	},
    	triggerHandler: function( type, data ) {
    		var elem = this[ 0 ];
    		if ( elem ) {
    			return jQuery.event.trigger( type, data, elem, true );
    		}
    	}
    } );


    // Support: Firefox <=44
    // Firefox doesn't have focus(in | out) events
    // Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
    //
    // Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
    // focus(in | out) events fire after focus & blur events,
    // which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
    // Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
    if ( !support.focusin ) {
    	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

    		// Attach a single capturing handler on the document while someone wants focusin/focusout
    		var handler = function( event ) {
    			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
    		};

    		jQuery.event.special[ fix ] = {
    			setup: function() {

    				// Handle: regular nodes (via `this.ownerDocument`), window
    				// (via `this.document`) & document (via `this`).
    				var doc = this.ownerDocument || this.document || this,
    					attaches = dataPriv.access( doc, fix );

    				if ( !attaches ) {
    					doc.addEventListener( orig, handler, true );
    				}
    				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
    			},
    			teardown: function() {
    				var doc = this.ownerDocument || this.document || this,
    					attaches = dataPriv.access( doc, fix ) - 1;

    				if ( !attaches ) {
    					doc.removeEventListener( orig, handler, true );
    					dataPriv.remove( doc, fix );

    				} else {
    					dataPriv.access( doc, fix, attaches );
    				}
    			}
    		};
    	} );
    }
    var location = window.location;

    var nonce = { guid: Date.now() };

    var rquery = ( /\?/ );



    // Cross-browser xml parsing
    jQuery.parseXML = function( data ) {
    	var xml, parserErrorElem;
    	if ( !data || typeof data !== "string" ) {
    		return null;
    	}

    	// Support: IE 9 - 11 only
    	// IE throws on parseFromString with invalid input.
    	try {
    		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
    	} catch ( e ) {}

    	parserErrorElem = xml && xml.getElementsByTagName( "parsererror" )[ 0 ];
    	if ( !xml || parserErrorElem ) {
    		jQuery.error( "Invalid XML: " + (
    			parserErrorElem ?
    				jQuery.map( parserErrorElem.childNodes, function( el ) {
    					return el.textContent;
    				} ).join( "\n" ) :
    				data
    		) );
    	}
    	return xml;
    };


    var
    	rbracket = /\[\]$/,
    	rCRLF = /\r?\n/g,
    	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
    	rsubmittable = /^(?:input|select|textarea|keygen)/i;

    function buildParams( prefix, obj, traditional, add ) {
    	var name;

    	if ( Array.isArray( obj ) ) {

    		// Serialize array item.
    		jQuery.each( obj, function( i, v ) {
    			if ( traditional || rbracket.test( prefix ) ) {

    				// Treat each array item as a scalar.
    				add( prefix, v );

    			} else {

    				// Item is non-scalar (array or object), encode its numeric index.
    				buildParams(
    					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
    					v,
    					traditional,
    					add
    				);
    			}
    		} );

    	} else if ( !traditional && toType( obj ) === "object" ) {

    		// Serialize object item.
    		for ( name in obj ) {
    			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
    		}

    	} else {

    		// Serialize scalar item.
    		add( prefix, obj );
    	}
    }

    // Serialize an array of form elements or a set of
    // key/values into a query string
    jQuery.param = function( a, traditional ) {
    	var prefix,
    		s = [],
    		add = function( key, valueOrFunction ) {

    			// If value is a function, invoke it and use its return value
    			var value = isFunction( valueOrFunction ) ?
    				valueOrFunction() :
    				valueOrFunction;

    			s[ s.length ] = encodeURIComponent( key ) + "=" +
    				encodeURIComponent( value == null ? "" : value );
    		};

    	if ( a == null ) {
    		return "";
    	}

    	// If an array was passed in, assume that it is an array of form elements.
    	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

    		// Serialize the form elements
    		jQuery.each( a, function() {
    			add( this.name, this.value );
    		} );

    	} else {

    		// If traditional, encode the "old" way (the way 1.3.2 or older
    		// did it), otherwise encode params recursively.
    		for ( prefix in a ) {
    			buildParams( prefix, a[ prefix ], traditional, add );
    		}
    	}

    	// Return the resulting serialization
    	return s.join( "&" );
    };

    jQuery.fn.extend( {
    	serialize: function() {
    		return jQuery.param( this.serializeArray() );
    	},
    	serializeArray: function() {
    		return this.map( function() {

    			// Can add propHook for "elements" to filter or add form elements
    			var elements = jQuery.prop( this, "elements" );
    			return elements ? jQuery.makeArray( elements ) : this;
    		} ).filter( function() {
    			var type = this.type;

    			// Use .is( ":disabled" ) so that fieldset[disabled] works
    			return this.name && !jQuery( this ).is( ":disabled" ) &&
    				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
    				( this.checked || !rcheckableType.test( type ) );
    		} ).map( function( _i, elem ) {
    			var val = jQuery( this ).val();

    			if ( val == null ) {
    				return null;
    			}

    			if ( Array.isArray( val ) ) {
    				return jQuery.map( val, function( val ) {
    					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    				} );
    			}

    			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    		} ).get();
    	}
    } );


    var
    	r20 = /%20/g,
    	rhash = /#.*$/,
    	rantiCache = /([?&])_=[^&]*/,
    	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

    	// trac-7653, trac-8125, trac-8152: local protocol detection
    	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
    	rnoContent = /^(?:GET|HEAD)$/,
    	rprotocol = /^\/\//,

    	/* Prefilters
    	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
    	 * 2) These are called:
    	 *    - BEFORE asking for a transport
    	 *    - AFTER param serialization (s.data is a string if s.processData is true)
    	 * 3) key is the dataType
    	 * 4) the catchall symbol "*" can be used
    	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
    	 */
    	prefilters = {},

    	/* Transports bindings
    	 * 1) key is the dataType
    	 * 2) the catchall symbol "*" can be used
    	 * 3) selection will start with transport dataType and THEN go to "*" if needed
    	 */
    	transports = {},

    	// Avoid comment-prolog char sequence (trac-10098); must appease lint and evade compression
    	allTypes = "*/".concat( "*" ),

    	// Anchor tag for parsing the document origin
    	originAnchor = document.createElement( "a" );

    originAnchor.href = location.href;

    // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports( structure ) {

    	// dataTypeExpression is optional and defaults to "*"
    	return function( dataTypeExpression, func ) {

    		if ( typeof dataTypeExpression !== "string" ) {
    			func = dataTypeExpression;
    			dataTypeExpression = "*";
    		}

    		var dataType,
    			i = 0,
    			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

    		if ( isFunction( func ) ) {

    			// For each dataType in the dataTypeExpression
    			while ( ( dataType = dataTypes[ i++ ] ) ) {

    				// Prepend if requested
    				if ( dataType[ 0 ] === "+" ) {
    					dataType = dataType.slice( 1 ) || "*";
    					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

    				// Otherwise append
    				} else {
    					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
    				}
    			}
    		}
    	};
    }

    // Base inspection function for prefilters and transports
    function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

    	var inspected = {},
    		seekingTransport = ( structure === transports );

    	function inspect( dataType ) {
    		var selected;
    		inspected[ dataType ] = true;
    		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
    			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
    			if ( typeof dataTypeOrTransport === "string" &&
    				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

    				options.dataTypes.unshift( dataTypeOrTransport );
    				inspect( dataTypeOrTransport );
    				return false;
    			} else if ( seekingTransport ) {
    				return !( selected = dataTypeOrTransport );
    			}
    		} );
    		return selected;
    	}

    	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
    }

    // A special extend for ajax options
    // that takes "flat" options (not to be deep extended)
    // Fixes trac-9887
    function ajaxExtend( target, src ) {
    	var key, deep,
    		flatOptions = jQuery.ajaxSettings.flatOptions || {};

    	for ( key in src ) {
    		if ( src[ key ] !== undefined ) {
    			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
    		}
    	}
    	if ( deep ) {
    		jQuery.extend( true, target, deep );
    	}

    	return target;
    }

    /* Handles responses to an ajax request:
     * - finds the right dataType (mediates between content-type and expected dataType)
     * - returns the corresponding response
     */
    function ajaxHandleResponses( s, jqXHR, responses ) {

    	var ct, type, finalDataType, firstDataType,
    		contents = s.contents,
    		dataTypes = s.dataTypes;

    	// Remove auto dataType and get content-type in the process
    	while ( dataTypes[ 0 ] === "*" ) {
    		dataTypes.shift();
    		if ( ct === undefined ) {
    			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
    		}
    	}

    	// Check if we're dealing with a known content-type
    	if ( ct ) {
    		for ( type in contents ) {
    			if ( contents[ type ] && contents[ type ].test( ct ) ) {
    				dataTypes.unshift( type );
    				break;
    			}
    		}
    	}

    	// Check to see if we have a response for the expected dataType
    	if ( dataTypes[ 0 ] in responses ) {
    		finalDataType = dataTypes[ 0 ];
    	} else {

    		// Try convertible dataTypes
    		for ( type in responses ) {
    			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
    				finalDataType = type;
    				break;
    			}
    			if ( !firstDataType ) {
    				firstDataType = type;
    			}
    		}

    		// Or just use first one
    		finalDataType = finalDataType || firstDataType;
    	}

    	// If we found a dataType
    	// We add the dataType to the list if needed
    	// and return the corresponding response
    	if ( finalDataType ) {
    		if ( finalDataType !== dataTypes[ 0 ] ) {
    			dataTypes.unshift( finalDataType );
    		}
    		return responses[ finalDataType ];
    	}
    }

    /* Chain conversions given the request and the original response
     * Also sets the responseXXX fields on the jqXHR instance
     */
    function ajaxConvert( s, response, jqXHR, isSuccess ) {
    	var conv2, current, conv, tmp, prev,
    		converters = {},

    		// Work with a copy of dataTypes in case we need to modify it for conversion
    		dataTypes = s.dataTypes.slice();

    	// Create converters map with lowercased keys
    	if ( dataTypes[ 1 ] ) {
    		for ( conv in s.converters ) {
    			converters[ conv.toLowerCase() ] = s.converters[ conv ];
    		}
    	}

    	current = dataTypes.shift();

    	// Convert to each sequential dataType
    	while ( current ) {

    		if ( s.responseFields[ current ] ) {
    			jqXHR[ s.responseFields[ current ] ] = response;
    		}

    		// Apply the dataFilter if provided
    		if ( !prev && isSuccess && s.dataFilter ) {
    			response = s.dataFilter( response, s.dataType );
    		}

    		prev = current;
    		current = dataTypes.shift();

    		if ( current ) {

    			// There's only work to do if current dataType is non-auto
    			if ( current === "*" ) {

    				current = prev;

    			// Convert response if prev dataType is non-auto and differs from current
    			} else if ( prev !== "*" && prev !== current ) {

    				// Seek a direct converter
    				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

    				// If none found, seek a pair
    				if ( !conv ) {
    					for ( conv2 in converters ) {

    						// If conv2 outputs current
    						tmp = conv2.split( " " );
    						if ( tmp[ 1 ] === current ) {

    							// If prev can be converted to accepted input
    							conv = converters[ prev + " " + tmp[ 0 ] ] ||
    								converters[ "* " + tmp[ 0 ] ];
    							if ( conv ) {

    								// Condense equivalence converters
    								if ( conv === true ) {
    									conv = converters[ conv2 ];

    								// Otherwise, insert the intermediate dataType
    								} else if ( converters[ conv2 ] !== true ) {
    									current = tmp[ 0 ];
    									dataTypes.unshift( tmp[ 1 ] );
    								}
    								break;
    							}
    						}
    					}
    				}

    				// Apply converter (if not an equivalence)
    				if ( conv !== true ) {

    					// Unless errors are allowed to bubble, catch and return them
    					if ( conv && s.throws ) {
    						response = conv( response );
    					} else {
    						try {
    							response = conv( response );
    						} catch ( e ) {
    							return {
    								state: "parsererror",
    								error: conv ? e : "No conversion from " + prev + " to " + current
    							};
    						}
    					}
    				}
    			}
    		}
    	}

    	return { state: "success", data: response };
    }

    jQuery.extend( {

    	// Counter for holding the number of active queries
    	active: 0,

    	// Last-Modified header cache for next request
    	lastModified: {},
    	etag: {},

    	ajaxSettings: {
    		url: location.href,
    		type: "GET",
    		isLocal: rlocalProtocol.test( location.protocol ),
    		global: true,
    		processData: true,
    		async: true,
    		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

    		/*
    		timeout: 0,
    		data: null,
    		dataType: null,
    		username: null,
    		password: null,
    		cache: null,
    		throws: false,
    		traditional: false,
    		headers: {},
    		*/

    		accepts: {
    			"*": allTypes,
    			text: "text/plain",
    			html: "text/html",
    			xml: "application/xml, text/xml",
    			json: "application/json, text/javascript"
    		},

    		contents: {
    			xml: /\bxml\b/,
    			html: /\bhtml/,
    			json: /\bjson\b/
    		},

    		responseFields: {
    			xml: "responseXML",
    			text: "responseText",
    			json: "responseJSON"
    		},

    		// Data converters
    		// Keys separate source (or catchall "*") and destination types with a single space
    		converters: {

    			// Convert anything to text
    			"* text": String,

    			// Text to html (true = no transformation)
    			"text html": true,

    			// Evaluate text as a json expression
    			"text json": JSON.parse,

    			// Parse text as xml
    			"text xml": jQuery.parseXML
    		},

    		// For options that shouldn't be deep extended:
    		// you can add your own custom options here if
    		// and when you create one that shouldn't be
    		// deep extended (see ajaxExtend)
    		flatOptions: {
    			url: true,
    			context: true
    		}
    	},

    	// Creates a full fledged settings object into target
    	// with both ajaxSettings and settings fields.
    	// If target is omitted, writes into ajaxSettings.
    	ajaxSetup: function( target, settings ) {
    		return settings ?

    			// Building a settings object
    			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

    			// Extending ajaxSettings
    			ajaxExtend( jQuery.ajaxSettings, target );
    	},

    	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
    	ajaxTransport: addToPrefiltersOrTransports( transports ),

    	// Main method
    	ajax: function( url, options ) {

    		// If url is an object, simulate pre-1.5 signature
    		if ( typeof url === "object" ) {
    			options = url;
    			url = undefined;
    		}

    		// Force options to be an object
    		options = options || {};

    		var transport,

    			// URL without anti-cache param
    			cacheURL,

    			// Response headers
    			responseHeadersString,
    			responseHeaders,

    			// timeout handle
    			timeoutTimer,

    			// Url cleanup var
    			urlAnchor,

    			// Request state (becomes false upon send and true upon completion)
    			completed,

    			// To know if global events are to be dispatched
    			fireGlobals,

    			// Loop variable
    			i,

    			// uncached part of the url
    			uncached,

    			// Create the final options object
    			s = jQuery.ajaxSetup( {}, options ),

    			// Callbacks context
    			callbackContext = s.context || s,

    			// Context for global events is callbackContext if it is a DOM node or jQuery collection
    			globalEventContext = s.context &&
    				( callbackContext.nodeType || callbackContext.jquery ) ?
    				jQuery( callbackContext ) :
    				jQuery.event,

    			// Deferreds
    			deferred = jQuery.Deferred(),
    			completeDeferred = jQuery.Callbacks( "once memory" ),

    			// Status-dependent callbacks
    			statusCode = s.statusCode || {},

    			// Headers (they are sent all at once)
    			requestHeaders = {},
    			requestHeadersNames = {},

    			// Default abort message
    			strAbort = "canceled",

    			// Fake xhr
    			jqXHR = {
    				readyState: 0,

    				// Builds headers hashtable if needed
    				getResponseHeader: function( key ) {
    					var match;
    					if ( completed ) {
    						if ( !responseHeaders ) {
    							responseHeaders = {};
    							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
    								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
    									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
    										.concat( match[ 2 ] );
    							}
    						}
    						match = responseHeaders[ key.toLowerCase() + " " ];
    					}
    					return match == null ? null : match.join( ", " );
    				},

    				// Raw string
    				getAllResponseHeaders: function() {
    					return completed ? responseHeadersString : null;
    				},

    				// Caches the header
    				setRequestHeader: function( name, value ) {
    					if ( completed == null ) {
    						name = requestHeadersNames[ name.toLowerCase() ] =
    							requestHeadersNames[ name.toLowerCase() ] || name;
    						requestHeaders[ name ] = value;
    					}
    					return this;
    				},

    				// Overrides response content-type header
    				overrideMimeType: function( type ) {
    					if ( completed == null ) {
    						s.mimeType = type;
    					}
    					return this;
    				},

    				// Status-dependent callbacks
    				statusCode: function( map ) {
    					var code;
    					if ( map ) {
    						if ( completed ) {

    							// Execute the appropriate callbacks
    							jqXHR.always( map[ jqXHR.status ] );
    						} else {

    							// Lazy-add the new callbacks in a way that preserves old ones
    							for ( code in map ) {
    								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
    							}
    						}
    					}
    					return this;
    				},

    				// Cancel the request
    				abort: function( statusText ) {
    					var finalText = statusText || strAbort;
    					if ( transport ) {
    						transport.abort( finalText );
    					}
    					done( 0, finalText );
    					return this;
    				}
    			};

    		// Attach deferreds
    		deferred.promise( jqXHR );

    		// Add protocol if not provided (prefilters might expect it)
    		// Handle falsy url in the settings object (trac-10093: consistency with old signature)
    		// We also use the url parameter if available
    		s.url = ( ( url || s.url || location.href ) + "" )
    			.replace( rprotocol, location.protocol + "//" );

    		// Alias method option to type as per ticket trac-12004
    		s.type = options.method || options.type || s.method || s.type;

    		// Extract dataTypes list
    		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

    		// A cross-domain request is in order when the origin doesn't match the current origin.
    		if ( s.crossDomain == null ) {
    			urlAnchor = document.createElement( "a" );

    			// Support: IE <=8 - 11, Edge 12 - 15
    			// IE throws exception on accessing the href property if url is malformed,
    			// e.g. http://example.com:80x/
    			try {
    				urlAnchor.href = s.url;

    				// Support: IE <=8 - 11 only
    				// Anchor's host property isn't correctly set when s.url is relative
    				urlAnchor.href = urlAnchor.href;
    				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
    					urlAnchor.protocol + "//" + urlAnchor.host;
    			} catch ( e ) {

    				// If there is an error parsing the URL, assume it is crossDomain,
    				// it can be rejected by the transport if it is invalid
    				s.crossDomain = true;
    			}
    		}

    		// Convert data if not already a string
    		if ( s.data && s.processData && typeof s.data !== "string" ) {
    			s.data = jQuery.param( s.data, s.traditional );
    		}

    		// Apply prefilters
    		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

    		// If request was aborted inside a prefilter, stop there
    		if ( completed ) {
    			return jqXHR;
    		}

    		// We can fire global events as of now if asked to
    		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (trac-15118)
    		fireGlobals = jQuery.event && s.global;

    		// Watch for a new set of requests
    		if ( fireGlobals && jQuery.active++ === 0 ) {
    			jQuery.event.trigger( "ajaxStart" );
    		}

    		// Uppercase the type
    		s.type = s.type.toUpperCase();

    		// Determine if request has content
    		s.hasContent = !rnoContent.test( s.type );

    		// Save the URL in case we're toying with the If-Modified-Since
    		// and/or If-None-Match header later on
    		// Remove hash to simplify url manipulation
    		cacheURL = s.url.replace( rhash, "" );

    		// More options handling for requests with no content
    		if ( !s.hasContent ) {

    			// Remember the hash so we can put it back
    			uncached = s.url.slice( cacheURL.length );

    			// If data is available and should be processed, append data to url
    			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
    				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

    				// trac-9682: remove data so that it's not used in an eventual retry
    				delete s.data;
    			}

    			// Add or update anti-cache param if needed
    			if ( s.cache === false ) {
    				cacheURL = cacheURL.replace( rantiCache, "$1" );
    				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
    					uncached;
    			}

    			// Put hash and anti-cache on the URL that will be requested (gh-1732)
    			s.url = cacheURL + uncached;

    		// Change '%20' to '+' if this is encoded form body content (gh-2658)
    		} else if ( s.data && s.processData &&
    			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
    			s.data = s.data.replace( r20, "+" );
    		}

    		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    		if ( s.ifModified ) {
    			if ( jQuery.lastModified[ cacheURL ] ) {
    				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
    			}
    			if ( jQuery.etag[ cacheURL ] ) {
    				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
    			}
    		}

    		// Set the correct header, if data is being sent
    		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
    			jqXHR.setRequestHeader( "Content-Type", s.contentType );
    		}

    		// Set the Accepts header for the server, depending on the dataType
    		jqXHR.setRequestHeader(
    			"Accept",
    			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
    				s.accepts[ s.dataTypes[ 0 ] ] +
    					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
    				s.accepts[ "*" ]
    		);

    		// Check for headers option
    		for ( i in s.headers ) {
    			jqXHR.setRequestHeader( i, s.headers[ i ] );
    		}

    		// Allow custom headers/mimetypes and early abort
    		if ( s.beforeSend &&
    			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

    			// Abort if not done already and return
    			return jqXHR.abort();
    		}

    		// Aborting is no longer a cancellation
    		strAbort = "abort";

    		// Install callbacks on deferreds
    		completeDeferred.add( s.complete );
    		jqXHR.done( s.success );
    		jqXHR.fail( s.error );

    		// Get transport
    		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

    		// If no transport, we auto-abort
    		if ( !transport ) {
    			done( -1, "No Transport" );
    		} else {
    			jqXHR.readyState = 1;

    			// Send global event
    			if ( fireGlobals ) {
    				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
    			}

    			// If request was aborted inside ajaxSend, stop there
    			if ( completed ) {
    				return jqXHR;
    			}

    			// Timeout
    			if ( s.async && s.timeout > 0 ) {
    				timeoutTimer = window.setTimeout( function() {
    					jqXHR.abort( "timeout" );
    				}, s.timeout );
    			}

    			try {
    				completed = false;
    				transport.send( requestHeaders, done );
    			} catch ( e ) {

    				// Rethrow post-completion exceptions
    				if ( completed ) {
    					throw e;
    				}

    				// Propagate others as results
    				done( -1, e );
    			}
    		}

    		// Callback for when everything is done
    		function done( status, nativeStatusText, responses, headers ) {
    			var isSuccess, success, error, response, modified,
    				statusText = nativeStatusText;

    			// Ignore repeat invocations
    			if ( completed ) {
    				return;
    			}

    			completed = true;

    			// Clear timeout if it exists
    			if ( timeoutTimer ) {
    				window.clearTimeout( timeoutTimer );
    			}

    			// Dereference transport for early garbage collection
    			// (no matter how long the jqXHR object will be used)
    			transport = undefined;

    			// Cache response headers
    			responseHeadersString = headers || "";

    			// Set readyState
    			jqXHR.readyState = status > 0 ? 4 : 0;

    			// Determine if successful
    			isSuccess = status >= 200 && status < 300 || status === 304;

    			// Get response data
    			if ( responses ) {
    				response = ajaxHandleResponses( s, jqXHR, responses );
    			}

    			// Use a noop converter for missing script but not if jsonp
    			if ( !isSuccess &&
    				jQuery.inArray( "script", s.dataTypes ) > -1 &&
    				jQuery.inArray( "json", s.dataTypes ) < 0 ) {
    				s.converters[ "text script" ] = function() {};
    			}

    			// Convert no matter what (that way responseXXX fields are always set)
    			response = ajaxConvert( s, response, jqXHR, isSuccess );

    			// If successful, handle type chaining
    			if ( isSuccess ) {

    				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    				if ( s.ifModified ) {
    					modified = jqXHR.getResponseHeader( "Last-Modified" );
    					if ( modified ) {
    						jQuery.lastModified[ cacheURL ] = modified;
    					}
    					modified = jqXHR.getResponseHeader( "etag" );
    					if ( modified ) {
    						jQuery.etag[ cacheURL ] = modified;
    					}
    				}

    				// if no content
    				if ( status === 204 || s.type === "HEAD" ) {
    					statusText = "nocontent";

    				// if not modified
    				} else if ( status === 304 ) {
    					statusText = "notmodified";

    				// If we have data, let's convert it
    				} else {
    					statusText = response.state;
    					success = response.data;
    					error = response.error;
    					isSuccess = !error;
    				}
    			} else {

    				// Extract error from statusText and normalize for non-aborts
    				error = statusText;
    				if ( status || !statusText ) {
    					statusText = "error";
    					if ( status < 0 ) {
    						status = 0;
    					}
    				}
    			}

    			// Set data for the fake xhr object
    			jqXHR.status = status;
    			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

    			// Success/Error
    			if ( isSuccess ) {
    				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
    			} else {
    				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
    			}

    			// Status-dependent callbacks
    			jqXHR.statusCode( statusCode );
    			statusCode = undefined;

    			if ( fireGlobals ) {
    				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
    					[ jqXHR, s, isSuccess ? success : error ] );
    			}

    			// Complete
    			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

    			if ( fireGlobals ) {
    				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

    				// Handle the global AJAX counter
    				if ( !( --jQuery.active ) ) {
    					jQuery.event.trigger( "ajaxStop" );
    				}
    			}
    		}

    		return jqXHR;
    	},

    	getJSON: function( url, data, callback ) {
    		return jQuery.get( url, data, callback, "json" );
    	},

    	getScript: function( url, callback ) {
    		return jQuery.get( url, undefined, callback, "script" );
    	}
    } );

    jQuery.each( [ "get", "post" ], function( _i, method ) {
    	jQuery[ method ] = function( url, data, callback, type ) {

    		// Shift arguments if data argument was omitted
    		if ( isFunction( data ) ) {
    			type = type || callback;
    			callback = data;
    			data = undefined;
    		}

    		// The url can be an options object (which then must have .url)
    		return jQuery.ajax( jQuery.extend( {
    			url: url,
    			type: method,
    			dataType: type,
    			data: data,
    			success: callback
    		}, jQuery.isPlainObject( url ) && url ) );
    	};
    } );

    jQuery.ajaxPrefilter( function( s ) {
    	var i;
    	for ( i in s.headers ) {
    		if ( i.toLowerCase() === "content-type" ) {
    			s.contentType = s.headers[ i ] || "";
    		}
    	}
    } );


    jQuery._evalUrl = function( url, options, doc ) {
    	return jQuery.ajax( {
    		url: url,

    		// Make this explicit, since user can override this through ajaxSetup (trac-11264)
    		type: "GET",
    		dataType: "script",
    		cache: true,
    		async: false,
    		global: false,

    		// Only evaluate the response if it is successful (gh-4126)
    		// dataFilter is not invoked for failure responses, so using it instead
    		// of the default converter is kludgy but it works.
    		converters: {
    			"text script": function() {}
    		},
    		dataFilter: function( response ) {
    			jQuery.globalEval( response, options, doc );
    		}
    	} );
    };


    jQuery.fn.extend( {
    	wrapAll: function( html ) {
    		var wrap;

    		if ( this[ 0 ] ) {
    			if ( isFunction( html ) ) {
    				html = html.call( this[ 0 ] );
    			}

    			// The elements to wrap the target around
    			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

    			if ( this[ 0 ].parentNode ) {
    				wrap.insertBefore( this[ 0 ] );
    			}

    			wrap.map( function() {
    				var elem = this;

    				while ( elem.firstElementChild ) {
    					elem = elem.firstElementChild;
    				}

    				return elem;
    			} ).append( this );
    		}

    		return this;
    	},

    	wrapInner: function( html ) {
    		if ( isFunction( html ) ) {
    			return this.each( function( i ) {
    				jQuery( this ).wrapInner( html.call( this, i ) );
    			} );
    		}

    		return this.each( function() {
    			var self = jQuery( this ),
    				contents = self.contents();

    			if ( contents.length ) {
    				contents.wrapAll( html );

    			} else {
    				self.append( html );
    			}
    		} );
    	},

    	wrap: function( html ) {
    		var htmlIsFunction = isFunction( html );

    		return this.each( function( i ) {
    			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
    		} );
    	},

    	unwrap: function( selector ) {
    		this.parent( selector ).not( "body" ).each( function() {
    			jQuery( this ).replaceWith( this.childNodes );
    		} );
    		return this;
    	}
    } );


    jQuery.expr.pseudos.hidden = function( elem ) {
    	return !jQuery.expr.pseudos.visible( elem );
    };
    jQuery.expr.pseudos.visible = function( elem ) {
    	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
    };




    jQuery.ajaxSettings.xhr = function() {
    	try {
    		return new window.XMLHttpRequest();
    	} catch ( e ) {}
    };

    var xhrSuccessStatus = {

    		// File protocol always yields status code 0, assume 200
    		0: 200,

    		// Support: IE <=9 only
    		// trac-1450: sometimes IE returns 1223 when it should be 204
    		1223: 204
    	},
    	xhrSupported = jQuery.ajaxSettings.xhr();

    support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
    support.ajax = xhrSupported = !!xhrSupported;

    jQuery.ajaxTransport( function( options ) {
    	var callback, errorCallback;

    	// Cross domain only allowed if supported through XMLHttpRequest
    	if ( support.cors || xhrSupported && !options.crossDomain ) {
    		return {
    			send: function( headers, complete ) {
    				var i,
    					xhr = options.xhr();

    				xhr.open(
    					options.type,
    					options.url,
    					options.async,
    					options.username,
    					options.password
    				);

    				// Apply custom fields if provided
    				if ( options.xhrFields ) {
    					for ( i in options.xhrFields ) {
    						xhr[ i ] = options.xhrFields[ i ];
    					}
    				}

    				// Override mime type if needed
    				if ( options.mimeType && xhr.overrideMimeType ) {
    					xhr.overrideMimeType( options.mimeType );
    				}

    				// X-Requested-With header
    				// For cross-domain requests, seeing as conditions for a preflight are
    				// akin to a jigsaw puzzle, we simply never set it to be sure.
    				// (it can always be set on a per-request basis or even using ajaxSetup)
    				// For same-domain requests, won't change header if already provided.
    				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
    					headers[ "X-Requested-With" ] = "XMLHttpRequest";
    				}

    				// Set headers
    				for ( i in headers ) {
    					xhr.setRequestHeader( i, headers[ i ] );
    				}

    				// Callback
    				callback = function( type ) {
    					return function() {
    						if ( callback ) {
    							callback = errorCallback = xhr.onload =
    								xhr.onerror = xhr.onabort = xhr.ontimeout =
    									xhr.onreadystatechange = null;

    							if ( type === "abort" ) {
    								xhr.abort();
    							} else if ( type === "error" ) {

    								// Support: IE <=9 only
    								// On a manual native abort, IE9 throws
    								// errors on any property access that is not readyState
    								if ( typeof xhr.status !== "number" ) {
    									complete( 0, "error" );
    								} else {
    									complete(

    										// File: protocol always yields status 0; see trac-8605, trac-14207
    										xhr.status,
    										xhr.statusText
    									);
    								}
    							} else {
    								complete(
    									xhrSuccessStatus[ xhr.status ] || xhr.status,
    									xhr.statusText,

    									// Support: IE <=9 only
    									// IE9 has no XHR2 but throws on binary (trac-11426)
    									// For XHR2 non-text, let the caller handle it (gh-2498)
    									( xhr.responseType || "text" ) !== "text"  ||
    									typeof xhr.responseText !== "string" ?
    										{ binary: xhr.response } :
    										{ text: xhr.responseText },
    									xhr.getAllResponseHeaders()
    								);
    							}
    						}
    					};
    				};

    				// Listen to events
    				xhr.onload = callback();
    				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

    				// Support: IE 9 only
    				// Use onreadystatechange to replace onabort
    				// to handle uncaught aborts
    				if ( xhr.onabort !== undefined ) {
    					xhr.onabort = errorCallback;
    				} else {
    					xhr.onreadystatechange = function() {

    						// Check readyState before timeout as it changes
    						if ( xhr.readyState === 4 ) {

    							// Allow onerror to be called first,
    							// but that will not handle a native abort
    							// Also, save errorCallback to a variable
    							// as xhr.onerror cannot be accessed
    							window.setTimeout( function() {
    								if ( callback ) {
    									errorCallback();
    								}
    							} );
    						}
    					};
    				}

    				// Create the abort callback
    				callback = callback( "abort" );

    				try {

    					// Do send the request (this may raise an exception)
    					xhr.send( options.hasContent && options.data || null );
    				} catch ( e ) {

    					// trac-14683: Only rethrow if this hasn't been notified as an error yet
    					if ( callback ) {
    						throw e;
    					}
    				}
    			},

    			abort: function() {
    				if ( callback ) {
    					callback();
    				}
    			}
    		};
    	}
    } );




    // Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
    jQuery.ajaxPrefilter( function( s ) {
    	if ( s.crossDomain ) {
    		s.contents.script = false;
    	}
    } );

    // Install script dataType
    jQuery.ajaxSetup( {
    	accepts: {
    		script: "text/javascript, application/javascript, " +
    			"application/ecmascript, application/x-ecmascript"
    	},
    	contents: {
    		script: /\b(?:java|ecma)script\b/
    	},
    	converters: {
    		"text script": function( text ) {
    			jQuery.globalEval( text );
    			return text;
    		}
    	}
    } );

    // Handle cache's special case and crossDomain
    jQuery.ajaxPrefilter( "script", function( s ) {
    	if ( s.cache === undefined ) {
    		s.cache = false;
    	}
    	if ( s.crossDomain ) {
    		s.type = "GET";
    	}
    } );

    // Bind script tag hack transport
    jQuery.ajaxTransport( "script", function( s ) {

    	// This transport only deals with cross domain or forced-by-attrs requests
    	if ( s.crossDomain || s.scriptAttrs ) {
    		var script, callback;
    		return {
    			send: function( _, complete ) {
    				script = jQuery( "<script>" )
    					.attr( s.scriptAttrs || {} )
    					.prop( { charset: s.scriptCharset, src: s.url } )
    					.on( "load error", callback = function( evt ) {
    						script.remove();
    						callback = null;
    						if ( evt ) {
    							complete( evt.type === "error" ? 404 : 200, evt.type );
    						}
    					} );

    				// Use native DOM manipulation to avoid our domManip AJAX trickery
    				document.head.appendChild( script[ 0 ] );
    			},
    			abort: function() {
    				if ( callback ) {
    					callback();
    				}
    			}
    		};
    	}
    } );




    var oldCallbacks = [],
    	rjsonp = /(=)\?(?=&|$)|\?\?/;

    // Default jsonp settings
    jQuery.ajaxSetup( {
    	jsonp: "callback",
    	jsonpCallback: function() {
    		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
    		this[ callback ] = true;
    		return callback;
    	}
    } );

    // Detect, normalize options and install callbacks for jsonp requests
    jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

    	var callbackName, overwritten, responseContainer,
    		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
    			"url" :
    			typeof s.data === "string" &&
    				( s.contentType || "" )
    					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
    				rjsonp.test( s.data ) && "data"
    		);

    	// Handle iff the expected data type is "jsonp" or we have a parameter to set
    	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

    		// Get callback name, remembering preexisting value associated with it
    		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
    			s.jsonpCallback() :
    			s.jsonpCallback;

    		// Insert callback into url or form data
    		if ( jsonProp ) {
    			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
    		} else if ( s.jsonp !== false ) {
    			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
    		}

    		// Use data converter to retrieve json after script execution
    		s.converters[ "script json" ] = function() {
    			if ( !responseContainer ) {
    				jQuery.error( callbackName + " was not called" );
    			}
    			return responseContainer[ 0 ];
    		};

    		// Force json dataType
    		s.dataTypes[ 0 ] = "json";

    		// Install callback
    		overwritten = window[ callbackName ];
    		window[ callbackName ] = function() {
    			responseContainer = arguments;
    		};

    		// Clean-up function (fires after converters)
    		jqXHR.always( function() {

    			// If previous value didn't exist - remove it
    			if ( overwritten === undefined ) {
    				jQuery( window ).removeProp( callbackName );

    			// Otherwise restore preexisting value
    			} else {
    				window[ callbackName ] = overwritten;
    			}

    			// Save back as free
    			if ( s[ callbackName ] ) {

    				// Make sure that re-using the options doesn't screw things around
    				s.jsonpCallback = originalSettings.jsonpCallback;

    				// Save the callback name for future use
    				oldCallbacks.push( callbackName );
    			}

    			// Call if it was a function and we have a response
    			if ( responseContainer && isFunction( overwritten ) ) {
    				overwritten( responseContainer[ 0 ] );
    			}

    			responseContainer = overwritten = undefined;
    		} );

    		// Delegate to script
    		return "script";
    	}
    } );




    // Support: Safari 8 only
    // In Safari 8 documents created via document.implementation.createHTMLDocument
    // collapse sibling forms: the second one becomes a child of the first one.
    // Because of that, this security measure has to be disabled in Safari 8.
    // https://bugs.webkit.org/show_bug.cgi?id=137337
    support.createHTMLDocument = ( function() {
    	var body = document.implementation.createHTMLDocument( "" ).body;
    	body.innerHTML = "<form></form><form></form>";
    	return body.childNodes.length === 2;
    } )();


    // Argument "data" should be string of html
    // context (optional): If specified, the fragment will be created in this context,
    // defaults to document
    // keepScripts (optional): If true, will include scripts passed in the html string
    jQuery.parseHTML = function( data, context, keepScripts ) {
    	if ( typeof data !== "string" ) {
    		return [];
    	}
    	if ( typeof context === "boolean" ) {
    		keepScripts = context;
    		context = false;
    	}

    	var base, parsed, scripts;

    	if ( !context ) {

    		// Stop scripts or inline event handlers from being executed immediately
    		// by using document.implementation
    		if ( support.createHTMLDocument ) {
    			context = document.implementation.createHTMLDocument( "" );

    			// Set the base href for the created document
    			// so any parsed elements with URLs
    			// are based on the document's URL (gh-2965)
    			base = context.createElement( "base" );
    			base.href = document.location.href;
    			context.head.appendChild( base );
    		} else {
    			context = document;
    		}
    	}

    	parsed = rsingleTag.exec( data );
    	scripts = !keepScripts && [];

    	// Single tag
    	if ( parsed ) {
    		return [ context.createElement( parsed[ 1 ] ) ];
    	}

    	parsed = buildFragment( [ data ], context, scripts );

    	if ( scripts && scripts.length ) {
    		jQuery( scripts ).remove();
    	}

    	return jQuery.merge( [], parsed.childNodes );
    };


    /**
     * Load a url into a page
     */
    jQuery.fn.load = function( url, params, callback ) {
    	var selector, type, response,
    		self = this,
    		off = url.indexOf( " " );

    	if ( off > -1 ) {
    		selector = stripAndCollapse( url.slice( off ) );
    		url = url.slice( 0, off );
    	}

    	// If it's a function
    	if ( isFunction( params ) ) {

    		// We assume that it's the callback
    		callback = params;
    		params = undefined;

    	// Otherwise, build a param string
    	} else if ( params && typeof params === "object" ) {
    		type = "POST";
    	}

    	// If we have elements to modify, make the request
    	if ( self.length > 0 ) {
    		jQuery.ajax( {
    			url: url,

    			// If "type" variable is undefined, then "GET" method will be used.
    			// Make value of this field explicit since
    			// user can override it through ajaxSetup method
    			type: type || "GET",
    			dataType: "html",
    			data: params
    		} ).done( function( responseText ) {

    			// Save response for use in complete callback
    			response = arguments;

    			self.html( selector ?

    				// If a selector was specified, locate the right elements in a dummy div
    				// Exclude scripts to avoid IE 'Permission Denied' errors
    				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

    				// Otherwise use the full result
    				responseText );

    		// If the request succeeds, this function gets "data", "status", "jqXHR"
    		// but they are ignored because response was set above.
    		// If it fails, this function gets "jqXHR", "status", "error"
    		} ).always( callback && function( jqXHR, status ) {
    			self.each( function() {
    				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
    			} );
    		} );
    	}

    	return this;
    };




    jQuery.expr.pseudos.animated = function( elem ) {
    	return jQuery.grep( jQuery.timers, function( fn ) {
    		return elem === fn.elem;
    	} ).length;
    };




    jQuery.offset = {
    	setOffset: function( elem, options, i ) {
    		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
    			position = jQuery.css( elem, "position" ),
    			curElem = jQuery( elem ),
    			props = {};

    		// Set position first, in-case top/left are set even on static elem
    		if ( position === "static" ) {
    			elem.style.position = "relative";
    		}

    		curOffset = curElem.offset();
    		curCSSTop = jQuery.css( elem, "top" );
    		curCSSLeft = jQuery.css( elem, "left" );
    		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
    			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

    		// Need to be able to calculate position if either
    		// top or left is auto and position is either absolute or fixed
    		if ( calculatePosition ) {
    			curPosition = curElem.position();
    			curTop = curPosition.top;
    			curLeft = curPosition.left;

    		} else {
    			curTop = parseFloat( curCSSTop ) || 0;
    			curLeft = parseFloat( curCSSLeft ) || 0;
    		}

    		if ( isFunction( options ) ) {

    			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
    			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
    		}

    		if ( options.top != null ) {
    			props.top = ( options.top - curOffset.top ) + curTop;
    		}
    		if ( options.left != null ) {
    			props.left = ( options.left - curOffset.left ) + curLeft;
    		}

    		if ( "using" in options ) {
    			options.using.call( elem, props );

    		} else {
    			curElem.css( props );
    		}
    	}
    };

    jQuery.fn.extend( {

    	// offset() relates an element's border box to the document origin
    	offset: function( options ) {

    		// Preserve chaining for setter
    		if ( arguments.length ) {
    			return options === undefined ?
    				this :
    				this.each( function( i ) {
    					jQuery.offset.setOffset( this, options, i );
    				} );
    		}

    		var rect, win,
    			elem = this[ 0 ];

    		if ( !elem ) {
    			return;
    		}

    		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
    		// Support: IE <=11 only
    		// Running getBoundingClientRect on a
    		// disconnected node in IE throws an error
    		if ( !elem.getClientRects().length ) {
    			return { top: 0, left: 0 };
    		}

    		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
    		rect = elem.getBoundingClientRect();
    		win = elem.ownerDocument.defaultView;
    		return {
    			top: rect.top + win.pageYOffset,
    			left: rect.left + win.pageXOffset
    		};
    	},

    	// position() relates an element's margin box to its offset parent's padding box
    	// This corresponds to the behavior of CSS absolute positioning
    	position: function() {
    		if ( !this[ 0 ] ) {
    			return;
    		}

    		var offsetParent, offset, doc,
    			elem = this[ 0 ],
    			parentOffset = { top: 0, left: 0 };

    		// position:fixed elements are offset from the viewport, which itself always has zero offset
    		if ( jQuery.css( elem, "position" ) === "fixed" ) {

    			// Assume position:fixed implies availability of getBoundingClientRect
    			offset = elem.getBoundingClientRect();

    		} else {
    			offset = this.offset();

    			// Account for the *real* offset parent, which can be the document or its root element
    			// when a statically positioned element is identified
    			doc = elem.ownerDocument;
    			offsetParent = elem.offsetParent || doc.documentElement;
    			while ( offsetParent &&
    				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
    				jQuery.css( offsetParent, "position" ) === "static" ) {

    				offsetParent = offsetParent.parentNode;
    			}
    			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

    				// Incorporate borders into its offset, since they are outside its content origin
    				parentOffset = jQuery( offsetParent ).offset();
    				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
    				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
    			}
    		}

    		// Subtract parent offsets and element margins
    		return {
    			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
    			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
    		};
    	},

    	// This method will return documentElement in the following cases:
    	// 1) For the element inside the iframe without offsetParent, this method will return
    	//    documentElement of the parent window
    	// 2) For the hidden or detached element
    	// 3) For body or html element, i.e. in case of the html node - it will return itself
    	//
    	// but those exceptions were never presented as a real life use-cases
    	// and might be considered as more preferable results.
    	//
    	// This logic, however, is not guaranteed and can change at any point in the future
    	offsetParent: function() {
    		return this.map( function() {
    			var offsetParent = this.offsetParent;

    			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
    				offsetParent = offsetParent.offsetParent;
    			}

    			return offsetParent || documentElement;
    		} );
    	}
    } );

    // Create scrollLeft and scrollTop methods
    jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
    	var top = "pageYOffset" === prop;

    	jQuery.fn[ method ] = function( val ) {
    		return access( this, function( elem, method, val ) {

    			// Coalesce documents and windows
    			var win;
    			if ( isWindow( elem ) ) {
    				win = elem;
    			} else if ( elem.nodeType === 9 ) {
    				win = elem.defaultView;
    			}

    			if ( val === undefined ) {
    				return win ? win[ prop ] : elem[ method ];
    			}

    			if ( win ) {
    				win.scrollTo(
    					!top ? val : win.pageXOffset,
    					top ? val : win.pageYOffset
    				);

    			} else {
    				elem[ method ] = val;
    			}
    		}, method, val, arguments.length );
    	};
    } );

    // Support: Safari <=7 - 9.1, Chrome <=37 - 49
    // Add the top/left cssHooks using jQuery.fn.position
    // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
    // Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
    // getComputedStyle returns percent when specified for top/left/bottom/right;
    // rather than make the css module depend on the offset module, just check for it here
    jQuery.each( [ "top", "left" ], function( _i, prop ) {
    	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
    		function( elem, computed ) {
    			if ( computed ) {
    				computed = curCSS( elem, prop );

    				// If curCSS returns percentage, fallback to offset
    				return rnumnonpx.test( computed ) ?
    					jQuery( elem ).position()[ prop ] + "px" :
    					computed;
    			}
    		}
    	);
    } );


    // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
    jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
    	jQuery.each( {
    		padding: "inner" + name,
    		content: type,
    		"": "outer" + name
    	}, function( defaultExtra, funcName ) {

    		// Margin is only for outerHeight, outerWidth
    		jQuery.fn[ funcName ] = function( margin, value ) {
    			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
    				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

    			return access( this, function( elem, type, value ) {
    				var doc;

    				if ( isWindow( elem ) ) {

    					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
    					return funcName.indexOf( "outer" ) === 0 ?
    						elem[ "inner" + name ] :
    						elem.document.documentElement[ "client" + name ];
    				}

    				// Get document width or height
    				if ( elem.nodeType === 9 ) {
    					doc = elem.documentElement;

    					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
    					// whichever is greatest
    					return Math.max(
    						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
    						elem.body[ "offset" + name ], doc[ "offset" + name ],
    						doc[ "client" + name ]
    					);
    				}

    				return value === undefined ?

    					// Get width or height on the element, requesting but not forcing parseFloat
    					jQuery.css( elem, type, extra ) :

    					// Set width or height on the element
    					jQuery.style( elem, type, value, extra );
    			}, type, chainable ? margin : undefined, chainable );
    		};
    	} );
    } );


    jQuery.each( [
    	"ajaxStart",
    	"ajaxStop",
    	"ajaxComplete",
    	"ajaxError",
    	"ajaxSuccess",
    	"ajaxSend"
    ], function( _i, type ) {
    	jQuery.fn[ type ] = function( fn ) {
    		return this.on( type, fn );
    	};
    } );




    jQuery.fn.extend( {

    	bind: function( types, data, fn ) {
    		return this.on( types, null, data, fn );
    	},
    	unbind: function( types, fn ) {
    		return this.off( types, null, fn );
    	},

    	delegate: function( selector, types, data, fn ) {
    		return this.on( types, selector, data, fn );
    	},
    	undelegate: function( selector, types, fn ) {

    		// ( namespace ) or ( selector, types [, fn] )
    		return arguments.length === 1 ?
    			this.off( selector, "**" ) :
    			this.off( types, selector || "**", fn );
    	},

    	hover: function( fnOver, fnOut ) {
    		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
    	}
    } );

    jQuery.each(
    	( "blur focus focusin focusout resize scroll click dblclick " +
    	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
    	function( _i, name ) {

    		// Handle event binding
    		jQuery.fn[ name ] = function( data, fn ) {
    			return arguments.length > 0 ?
    				this.on( name, null, data, fn ) :
    				this.trigger( name );
    		};
    	}
    );




    // Support: Android <=4.0 only
    // Make sure we trim BOM and NBSP
    // Require that the "whitespace run" starts from a non-whitespace
    // to avoid O(N^2) behavior when the engine would try matching "\s+$" at each space position.
    var rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;

    // Bind a function to a context, optionally partially applying any
    // arguments.
    // jQuery.proxy is deprecated to promote standards (specifically Function#bind)
    // However, it is not slated for removal any time soon
    jQuery.proxy = function( fn, context ) {
    	var tmp, args, proxy;

    	if ( typeof context === "string" ) {
    		tmp = fn[ context ];
    		context = fn;
    		fn = tmp;
    	}

    	// Quick check to determine if target is callable, in the spec
    	// this throws a TypeError, but we will just return undefined.
    	if ( !isFunction( fn ) ) {
    		return undefined;
    	}

    	// Simulated bind
    	args = slice.call( arguments, 2 );
    	proxy = function() {
    		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
    	};

    	// Set the guid of unique handler to the same of original handler, so it can be removed
    	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

    	return proxy;
    };

    jQuery.holdReady = function( hold ) {
    	if ( hold ) {
    		jQuery.readyWait++;
    	} else {
    		jQuery.ready( true );
    	}
    };
    jQuery.isArray = Array.isArray;
    jQuery.parseJSON = JSON.parse;
    jQuery.nodeName = nodeName;
    jQuery.isFunction = isFunction;
    jQuery.isWindow = isWindow;
    jQuery.camelCase = camelCase;
    jQuery.type = toType;

    jQuery.now = Date.now;

    jQuery.isNumeric = function( obj ) {

    	// As of jQuery 3.0, isNumeric is limited to
    	// strings and numbers (primitives or objects)
    	// that can be coerced to finite numbers (gh-2662)
    	var type = jQuery.type( obj );
    	return ( type === "number" || type === "string" ) &&

    		// parseFloat NaNs numeric-cast false positives ("")
    		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    		// subtraction forces infinities to NaN
    		!isNaN( obj - parseFloat( obj ) );
    };

    jQuery.trim = function( text ) {
    	return text == null ?
    		"" :
    		( text + "" ).replace( rtrim, "$1" );
    };



    // Register as a named AMD module, since jQuery can be concatenated with other
    // files that may use define, but not via a proper concatenation script that
    // understands anonymous AMD modules. A named AMD is safest and most robust
    // way to register. Lowercase jquery is used because AMD module names are
    // derived from file names, and jQuery is normally delivered in a lowercase
    // file name. Do this after creating the global so that if an AMD module wants
    // to call noConflict to hide this version of jQuery, it will work.

    // Note that for maximum portability, libraries that are not jQuery should
    // declare themselves as anonymous modules, and avoid setting a global if an
    // AMD loader is present. jQuery is a special case. For more information, see
    // https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

    if ( typeof define === "function" && define.amd ) {
    	define( "jquery", [], function() {
    		return jQuery;
    	} );
    }




    var

    	// Map over jQuery in case of overwrite
    	_jQuery = window.jQuery,

    	// Map over the $ in case of overwrite
    	_$ = window.$;

    jQuery.noConflict = function( deep ) {
    	if ( window.$ === jQuery ) {
    		window.$ = _$;
    	}

    	if ( deep && window.jQuery === jQuery ) {
    		window.jQuery = _jQuery;
    	}

    	return jQuery;
    };

    // Expose jQuery and $ identifiers, even in AMD
    // (trac-7102#comment:10, https://github.com/jquery/jquery/pull/557)
    // and CommonJS for browser emulators (trac-13566)
    if ( typeof noGlobal === "undefined" ) {
    	window.jQuery = window.$ = jQuery;
    }




    return jQuery;
    } );

    /*!
      * PhotoSwipe Lightbox 5.3.3 - https://photoswipe.com
      * (c) 2022 Dmytro Semenov
      */
    /** @typedef {import('../photoswipe.js').Point} Point */

    /** @typedef {undefined | null | false | '' | 0} Falsy */
    /** @typedef {keyof HTMLElementTagNameMap} HTMLElementTagName */

    /**
     * @template {HTMLElementTagName | Falsy} [T="div"]
     * @template {Node | undefined} [NodeToAppendElementTo=undefined]
     * @param {string=} className
     * @param {T=} [tagName]
     * @param {NodeToAppendElementTo=} appendToEl
     * @returns {T extends HTMLElementTagName ? HTMLElementTagNameMap[T] : HTMLElementTagNameMap['div']}
     */
    function createElement$1(className, tagName, appendToEl) {
      const el = document.createElement(tagName || 'div');
      if (className) {
        el.className = className;
      }
      if (appendToEl) {
        appendToEl.appendChild(el);
      }
      // @ts-expect-error
      return el;
    }

    /**
     * Get transform string
     *
     * @param {number} x
     * @param {number=} y
     * @param {number=} scale
     */
    function toTransformString$1(x, y, scale) {
      let propValue = 'translate3d('
        + x + 'px,' + (y || 0) + 'px'
        + ',0)';

      if (scale !== undefined) {
        propValue += ' scale3d('
          + scale + ',' + scale
          + ',1)';
      }

      return propValue;
    }

    /**
     * Apply width and height CSS properties to element
     *
     * @param {HTMLElement} el
     * @param {string | number} w
     * @param {string | number} h
     */
    function setWidthHeight$1(el, w, h) {
      el.style.width = (typeof w === 'number') ? (w + 'px') : w;
      el.style.height = (typeof h === 'number') ? (h + 'px') : h;
    }

    /** @typedef {LOAD_STATE[keyof LOAD_STATE]} LoadState */
    /** @type {{ IDLE: 'idle'; LOADING: 'loading'; LOADED: 'loaded'; ERROR: 'error' }} */
    const LOAD_STATE$1 = {
      IDLE: 'idle',
      LOADING: 'loading',
      LOADED: 'loaded',
      ERROR: 'error',
    };


    /**
     * Check if click or keydown event was dispatched
     * with a special key or via mouse wheel.
     *
     * @param {MouseEvent | KeyboardEvent} e
     */
    function specialKeyUsed$1(e) {
      if (e.which === 2 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return true;
      }
    }

    /**
     * Parse `gallery` or `children` options.
     *
     * @param {import('../photoswipe.js').ElementProvider} option
     * @param {string=} legacySelector
     * @param {HTMLElement | Document} [parent]
     * @returns HTMLElement[]
     */
    function getElementsFromOption$1(option, legacySelector, parent = document) {
      /** @type {HTMLElement[]} */
      let elements = [];

      if (option instanceof Element) {
        elements = [option];
      } else if (option instanceof NodeList || Array.isArray(option)) {
        elements = Array.from(option);
      } else {
        const selector = typeof option === 'string' ? option : legacySelector;
        if (selector) {
          elements = Array.from(parent.querySelectorAll(selector));
        }
      }

      return elements;
    }

    /**
     * Check if variable is PhotoSwipe class
     *
     * @param {any} fn
     */
    function isPswpClass(fn) {
      return typeof fn === 'function'
        && fn.prototype
        && fn.prototype.goTo;
    }

    /**
     * Check if browser is Safari
     *
     * @returns {boolean}
     */
    function isSafari$1() {
      return !!(navigator.vendor && navigator.vendor.match(/apple/i));
    }

    /** @typedef {import('../lightbox/lightbox.js').default} PhotoSwipeLightbox */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../photoswipe.js').PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import('../photoswipe.js').DataSource} DataSource */
    /** @typedef {import('../ui/ui-element.js').UIElementData} UIElementData */
    /** @typedef {import('../slide/content.js').default} ContentDefault */
    /** @typedef {import('../slide/slide.js').default} Slide */
    /** @typedef {import('../slide/slide.js').SlideData} SlideData */
    /** @typedef {import('../slide/zoom-level.js').default} ZoomLevel */
    /** @typedef {import('../slide/get-thumb-bounds.js').Bounds} Bounds */

    /**
     * Allow adding an arbitrary props to the Content
     * https://photoswipe.com/custom-content/#using-webp-image-format
     * @typedef {ContentDefault & Record<string, any>} Content
     */
    /** @typedef {{ x?: number; y?: number }} Point */

    /**
     * @typedef {Object} PhotoSwipeEventsMap https://photoswipe.com/events/
     *
     *
     * https://photoswipe.com/adding-ui-elements/
     *
     * @prop {undefined} uiRegister
     * @prop {{ data: UIElementData }} uiElementCreate
     *
     *
     * https://photoswipe.com/events/#initialization-events
     *
     * @prop {undefined} beforeOpen
     * @prop {undefined} firstUpdate
     * @prop {undefined} initialLayout
     * @prop {undefined} change
     * @prop {undefined} afterInit
     * @prop {undefined} bindEvents
     *
     *
     * https://photoswipe.com/events/#opening-or-closing-transition-events
     *
     * @prop {undefined} openingAnimationStart
     * @prop {undefined} openingAnimationEnd
     * @prop {undefined} closingAnimationStart
     * @prop {undefined} closingAnimationEnd
     *
     *
     * https://photoswipe.com/events/#closing-events
     *
     * @prop {undefined} close
     * @prop {undefined} destroy
     *
     *
     * https://photoswipe.com/events/#pointer-and-gesture-events
     *
     * @prop {{ originalEvent: PointerEvent }} pointerDown
     * @prop {{ originalEvent: PointerEvent }} pointerMove
     * @prop {{ originalEvent: PointerEvent }} pointerUp
     * @prop {{ bgOpacity: number }} pinchClose can be default prevented
     * @prop {{ panY: number }} verticalDrag can be default prevented
     *
     *
     * https://photoswipe.com/events/#slide-content-events
     *
     * @prop {{ content: Content }} contentInit
     * @prop {{ content: Content; isLazy: boolean }} contentLoad can be default prevented
     * @prop {{ content: Content; isLazy: boolean }} contentLoadImage can be default prevented
     * @prop {{ content: Content; slide: Slide; isError?: boolean }} loadComplete
     * @prop {{ content: Content; slide: Slide }} loadError
     * @prop {{ content: Content; width: number; height: number }} contentResize can be default prevented
     * @prop {{ content: Content; width: number; height: number; slide: Slide }} imageSizeChange
     * @prop {{ content: Content }} contentLazyLoad can be default prevented
     * @prop {{ content: Content }} contentAppend can be default prevented
     * @prop {{ content: Content }} contentActivate can be default prevented
     * @prop {{ content: Content }} contentDeactivate can be default prevented
     * @prop {{ content: Content }} contentRemove can be default prevented
     * @prop {{ content: Content }} contentDestroy can be default prevented
     *
     *
     * undocumented
     *
     * @prop {{ point: Point; originalEvent: PointerEvent }} imageClickAction can be default prevented
     * @prop {{ point: Point; originalEvent: PointerEvent }} bgClickAction can be default prevented
     * @prop {{ point: Point; originalEvent: PointerEvent }} tapAction can be default prevented
     * @prop {{ point: Point; originalEvent: PointerEvent }} doubleTapAction can be default prevented
     *
     * @prop {{ originalEvent: KeyboardEvent }} keydown can be default prevented
     * @prop {{ x: number; dragging: boolean }} moveMainScroll
     * @prop {{ slide: Slide }} firstZoomPan
     * @prop {{ slide: Slide, data: SlideData, index: number }} gettingData
     * @prop {undefined} beforeResize
     * @prop {undefined} resize
     * @prop {undefined} viewportSize
     * @prop {undefined} updateScrollOffset
     * @prop {{ slide: Slide }} slideInit
     * @prop {{ slide: Slide }} afterSetContent
     * @prop {{ slide: Slide }} slideLoad
     * @prop {{ slide: Slide }} appendHeavy can be default prevented
     * @prop {{ slide: Slide }} appendHeavyContent
     * @prop {{ slide: Slide }} slideActivate
     * @prop {{ slide: Slide }} slideDeactivate
     * @prop {{ slide: Slide }} slideDestroy
     * @prop {{ destZoomLevel: number, centerPoint: Point, transitionDuration: number | false }} beforeZoomTo
     * @prop {{ slide: Slide }} zoomPanUpdate
     * @prop {{ slide: Slide }} initialZoomPan
     * @prop {{ slide: Slide }} calcSlideSize
     * @prop {undefined} resolutionChanged
     * @prop {{ originalEvent: WheelEvent }} wheel can be default prevented
     * @prop {{ content: Content }} contentAppendImage can be default prevented
     * @prop {{ index: number; itemData: SlideData }} lazyLoadSlide can be default prevented
     * @prop {undefined} lazyLoad
     * @prop {{ slide: Slide }} calcBounds
     * @prop {{ zoomLevels: ZoomLevel, slideData: SlideData }} zoomLevelsUpdate
     *
     *
     * legacy
     *
     * @prop {undefined} init
     * @prop {undefined} initialZoomIn
     * @prop {undefined} initialZoomOut
     * @prop {undefined} initialZoomInEnd
     * @prop {undefined} initialZoomOutEnd
     * @prop {{ dataSource: DataSource, numItems: number }} numItems
     * @prop {{ itemData: SlideData; index: number }} itemData
     * @prop {{ index: number, itemData: SlideData, instance: PhotoSwipe }} thumbBounds
     */

    /**
     * @typedef {Object} PhotoSwipeFiltersMap https://photoswipe.com/filters/
     *
     * @prop {(numItems: number, dataSource: DataSource) => number} numItems
     * Modify the total amount of slides. Example on Data sources page.
     * https://photoswipe.com/filters/#numitems
     *
     * @prop {(itemData: SlideData, index: number) => SlideData} itemData
     * Modify slide item data. Example on Data sources page.
     * https://photoswipe.com/filters/#itemdata
     *
     * @prop {(itemData: SlideData, element: HTMLElement, linkEl: HTMLAnchorElement) => SlideData} domItemData
     * Modify item data when it's parsed from DOM element. Example on Data sources page.
     * https://photoswipe.com/filters/#domitemdata
     *
     * @prop {(clickedIndex: number, e: MouseEvent, instance: PhotoSwipeLightbox) => number} clickedIndex
     * Modify clicked gallery item index.
     * https://photoswipe.com/filters/#clickedindex
     *
     * @prop {(placeholderSrc: string | false, content: Content) => string | false} placeholderSrc
     * Modify placeholder image source.
     * https://photoswipe.com/filters/#placeholdersrc
     *
     * @prop {(isContentLoading: boolean, content: Content) => boolean} isContentLoading
     * Modify if the content is currently loading.
     * https://photoswipe.com/filters/#iscontentloading
     *
     * @prop {(isContentZoomable: boolean, content: Content) => boolean} isContentZoomable
     * Modify if the content can be zoomed.
     * https://photoswipe.com/filters/#iscontentzoomable
     *
     * @prop {(useContentPlaceholder: boolean, content: Content) => boolean} useContentPlaceholder
     * Modify if the placeholder should be used for the content.
     * https://photoswipe.com/filters/#usecontentplaceholder
     *
     * @prop {(isKeepingPlaceholder: boolean, content: Content) => boolean} isKeepingPlaceholder
     * Modify if the placeholder should be kept after the content is loaded.
     * https://photoswipe.com/filters/#iskeepingplaceholder
     *
     *
     * @prop {(contentErrorElement: HTMLElement, content: Content) => HTMLElement} contentErrorElement
     * Modify an element when the content has error state (for example, if image cannot be loaded).
     * https://photoswipe.com/filters/#contenterrorelement
     *
     * @prop {(element: HTMLElement, data: UIElementData) => HTMLElement} uiElement
     * Modify a UI element that's being created.
     * https://photoswipe.com/filters/#uielement
     *
     * @prop {(thumbnail: HTMLElement, itemData: SlideData, index: number) => HTMLElement} thumbEl
     * Modify the thubmnail element from which opening zoom animation starts or ends.
     * https://photoswipe.com/filters/#thumbel
     *
     * @prop {(thumbBounds: Bounds, itemData: SlideData, index: number) => Bounds} thumbBounds
     * Modify the thubmnail bounds from which opening zoom animation starts or ends.
     * https://photoswipe.com/filters/#thumbbounds
     *
     * @prop {(srcsetSizesWidth: number, content: Content) => number} srcsetSizesWidth
     *
     */

    /**
     * @template {keyof PhotoSwipeFiltersMap} T
     * @typedef {{ fn: PhotoSwipeFiltersMap[T], priority: number }} Filter<T>
     */

    /**
     * @template {keyof PhotoSwipeEventsMap} T
     * @typedef {PhotoSwipeEventsMap[T] extends undefined ? PhotoSwipeEvent<T> : PhotoSwipeEvent<T> & PhotoSwipeEventsMap[T]} AugmentedEvent
     */

    /**
     * @template {keyof PhotoSwipeEventsMap} T
     * @typedef {(event: AugmentedEvent<T>) => void} EventCallback<T>
     */

    /**
     * Base PhotoSwipe event object
     *
     * @template {keyof PhotoSwipeEventsMap} T
     */
    class PhotoSwipeEvent$1 {
      /**
       * @param {T} type
       * @param {PhotoSwipeEventsMap[T]} [details]
       */
      constructor(type, details) {
        this.type = type;
        if (details) {
          Object.assign(this, details);
        }
      }

      preventDefault() {
        this.defaultPrevented = true;
      }
    }

    /**
     * PhotoSwipe base class that can listen and dispatch for events.
     * Shared by PhotoSwipe Core and PhotoSwipe Lightbox, extended by base.js
     */
    class Eventable$1 {
      constructor() {
        /**
         * @type {{ [T in keyof PhotoSwipeEventsMap]?: ((event: AugmentedEvent<T>) => void)[] }}
         */
        this._listeners = {};

        /**
         * @type {{ [T in keyof PhotoSwipeFiltersMap]?: Filter<T>[] }}
         */
        this._filters = {};

        /** @type {PhotoSwipe=} */
        this.pswp = undefined;

        /** @type {PhotoSwipeOptions} */
        this.options = undefined;
      }

      /**
       * @template {keyof PhotoSwipeFiltersMap} T
       * @param {T} name
       * @param {PhotoSwipeFiltersMap[T]} fn
       * @param {number} priority
       */
      addFilter(name, fn, priority = 100) {
        if (!this._filters[name]) {
          this._filters[name] = [];
        }

        this._filters[name].push({ fn, priority });
        this._filters[name].sort((f1, f2) => f1.priority - f2.priority);

        if (this.pswp) {
          this.pswp.addFilter(name, fn, priority);
        }
      }

      /**
       * @template {keyof PhotoSwipeFiltersMap} T
       * @param {T} name
       * @param {PhotoSwipeFiltersMap[T]} fn
       */
      removeFilter(name, fn) {
        if (this._filters[name]) {
          // @ts-expect-error
          this._filters[name] = this._filters[name].filter(filter => (filter.fn !== fn));
        }

        if (this.pswp) {
          this.pswp.removeFilter(name, fn);
        }
      }

      /**
       * @template {keyof PhotoSwipeFiltersMap} T
       * @param {T} name
       * @param {Parameters<PhotoSwipeFiltersMap[T]>} args
       * @returns {Parameters<PhotoSwipeFiltersMap[T]>[0]}
       */
      applyFilters(name, ...args) {
        if (this._filters[name]) {
          this._filters[name].forEach((filter) => {
            // @ts-expect-error
            args[0] = filter.fn.apply(this, args);
          });
        }
        return args[0];
      }

      /**
       * @template {keyof PhotoSwipeEventsMap} T
       * @param {T} name
       * @param {EventCallback<T>} fn
       */
      on(name, fn) {
        if (!this._listeners[name]) {
          this._listeners[name] = [];
        }
        this._listeners[name].push(fn);

        // When binding events to lightbox,
        // also bind events to PhotoSwipe Core,
        // if it's open.
        if (this.pswp) {
          this.pswp.on(name, fn);
        }
      }

      /**
       * @template {keyof PhotoSwipeEventsMap} T
       * @param {T} name
       * @param {EventCallback<T>} fn
       */
      off(name, fn) {
        if (this._listeners[name]) {
          // @ts-expect-error
          this._listeners[name] = this._listeners[name].filter(listener => (fn !== listener));
        }

        if (this.pswp) {
          this.pswp.off(name, fn);
        }
      }

      /**
       * @template {keyof PhotoSwipeEventsMap} T
       * @param {T} name
       * @param {PhotoSwipeEventsMap[T]} [details]
       * @returns {AugmentedEvent<T>}
       */
      dispatch(name, details) {
        if (this.pswp) {
          return this.pswp.dispatch(name, details);
        }

        const event = /** @type {AugmentedEvent<T>} */ (new PhotoSwipeEvent$1(name, details));

        if (!this._listeners) {
          return event;
        }

        if (this._listeners[name]) {
          this._listeners[name].forEach((listener) => {
            listener.call(this, event);
          });
        }

        return event;
      }
    }

    class Placeholder$1 {
      /**
       * @param {string | false} imageSrc
       * @param {HTMLElement} container
       */
      constructor(imageSrc, container) {
        // Create placeholder
        // (stretched thumbnail or simple div behind the main image)
        this.element = createElement$1(
          'pswp__img pswp__img--placeholder',
          imageSrc ? 'img' : '',
          container
        );

        if (imageSrc) {
          /** @type {HTMLImageElement} */
          (this.element).decoding = 'async';
          /** @type {HTMLImageElement} */
          (this.element).alt = '';
          /** @type {HTMLImageElement} */
          (this.element).src = imageSrc;
          this.element.setAttribute('role', 'presentation');
        }

        this.element.setAttribute('aria-hidden', 'true');
      }

      /**
       * @param {number} width
       * @param {number} height
       */
      setDisplayedSize(width, height) {
        if (!this.element) {
          return;
        }

        if (this.element.tagName === 'IMG') {
          // Use transform scale() to modify img placeholder size
          // (instead of changing width/height directly).
          // This helps with performance, specifically in iOS15 Safari.
          setWidthHeight$1(this.element, 250, 'auto');
          this.element.style.transformOrigin = '0 0';
          this.element.style.transform = toTransformString$1(0, 0, width / 250);
        } else {
          setWidthHeight$1(this.element, width, height);
        }
      }

      destroy() {
        if (this.element.parentNode) {
          this.element.remove();
        }
        this.element = null;
      }
    }

    /** @typedef {import('./slide.js').default} Slide */
    /** @typedef {import('./slide.js').SlideData} SlideData */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../util/util.js').LoadState} LoadState */

    class Content$1 {
      /**
       * @param {SlideData} itemData Slide data
       * @param {PhotoSwipe} instance PhotoSwipe or PhotoSwipeLightbox instance
       * @param {number} index
       */
      constructor(itemData, instance, index) {
        this.instance = instance;
        this.data = itemData;
        this.index = index;

        /** @type {HTMLImageElement | HTMLDivElement} */
        this.element = undefined;

        this.displayedImageWidth = 0;
        this.displayedImageHeight = 0;

        this.width = Number(this.data.w) || Number(this.data.width) || 0;
        this.height = Number(this.data.h) || Number(this.data.height) || 0;

        this.isAttached = false;
        this.hasSlide = false;
        /** @type {LoadState} */
        this.state = LOAD_STATE$1.IDLE;

        if (this.data.type) {
          this.type = this.data.type;
        } else if (this.data.src) {
          this.type = 'image';
        } else {
          this.type = 'html';
        }

        this.instance.dispatch('contentInit', { content: this });
      }

      removePlaceholder() {
        if (this.placeholder && !this.keepPlaceholder()) {
          // With delay, as image might be loaded, but not rendered
          setTimeout(() => {
            if (this.placeholder) {
              this.placeholder.destroy();
              this.placeholder = null;
            }
          }, 1000);
        }
      }

      /**
       * Preload content
       *
       * @param {boolean=} isLazy
       * @param {boolean=} reload
       */
      load(isLazy, reload) {
        if (this.slide && this.usePlaceholder()) {
          if (!this.placeholder) {
            const placeholderSrc = this.instance.applyFilters(
              'placeholderSrc',
              // use  image-based placeholder only for the first slide,
              // as rendering (even small stretched thumbnail) is an expensive operation
              (this.data.msrc && this.slide.isFirstSlide) ? this.data.msrc : false,
              this
            );
            this.placeholder = new Placeholder$1(
              placeholderSrc,
              this.slide.container
            );
          } else {
            const placeholderEl = this.placeholder.element;
            // Add placeholder to DOM if it was already created
            if (placeholderEl && !placeholderEl.parentElement) {
              this.slide.container.prepend(placeholderEl);
            }
          }
        }

        if (this.element && !reload) {
          return;
        }

        if (this.instance.dispatch('contentLoad', { content: this, isLazy }).defaultPrevented) {
          return;
        }

        if (this.isImageContent()) {
          this.element = createElement$1('pswp__img', 'img');
          // Start loading only after width is defined, as sizes might depend on it.
          // Due to Safari feature, we must define sizes before srcset.
          if (this.displayedImageWidth) {
            this.loadImage(isLazy);
          }
        } else {
          this.element = createElement$1('pswp__content');
          this.element.innerHTML = this.data.html || '';
        }

        if (reload && this.slide) {
          this.slide.updateContentSize(true);
        }
      }

      /**
       * Preload image
       *
       * @param {boolean} isLazy
       */
      loadImage(isLazy) {
        const imageElement = /** @type HTMLImageElement */ (this.element);

        if (this.instance.dispatch('contentLoadImage', { content: this, isLazy }).defaultPrevented) {
          return;
        }

        this.updateSrcsetSizes();

        if (this.data.srcset) {
          imageElement.srcset = this.data.srcset;
        }

        imageElement.src = this.data.src;

        imageElement.alt = this.data.alt || '';

        this.state = LOAD_STATE$1.LOADING;

        if (imageElement.complete) {
          this.onLoaded();
        } else {
          imageElement.onload = () => {
            this.onLoaded();
          };

          imageElement.onerror = () => {
            this.onError();
          };
        }
      }

      /**
       * Assign slide to content
       *
       * @param {Slide} slide
       */
      setSlide(slide) {
        this.slide = slide;
        this.hasSlide = true;
        this.instance = slide.pswp;

        // todo: do we need to unset slide?
      }

      /**
       * Content load success handler
       */
      onLoaded() {
        this.state = LOAD_STATE$1.LOADED;

        if (this.slide) {
          this.instance.dispatch('loadComplete', { slide: this.slide, content: this });

          // if content is reloaded
          if (this.slide.isActive
              && this.slide.heavyAppended
              && !this.element.parentNode) {
            this.append();
            this.slide.updateContentSize(true);
          }

          if (this.state === LOAD_STATE$1.LOADED || this.state === LOAD_STATE$1.ERROR) {
            this.removePlaceholder();
          }
        }
      }

      /**
       * Content load error handler
       */
      onError() {
        this.state = LOAD_STATE$1.ERROR;

        if (this.slide) {
          this.displayError();
          this.instance.dispatch('loadComplete', { slide: this.slide, isError: true, content: this });
          this.instance.dispatch('loadError', { slide: this.slide, content: this });
        }
      }

      /**
       * @returns {Boolean} If the content is currently loading
       */
      isLoading() {
        return this.instance.applyFilters(
          'isContentLoading',
          this.state === LOAD_STATE$1.LOADING,
          this
        );
      }

      isError() {
        return this.state === LOAD_STATE$1.ERROR;
      }

      /**
       * @returns {boolean} If the content is image
       */
      isImageContent() {
        return this.type === 'image';
      }

      /**
       * Update content size
       *
       * @param {Number} width
       * @param {Number} height
       */
      setDisplayedSize(width, height) {
        if (!this.element) {
          return;
        }

        if (this.placeholder) {
          this.placeholder.setDisplayedSize(width, height);
        }

        // eslint-disable-next-line max-len
        if (this.instance.dispatch('contentResize', { content: this, width, height }).defaultPrevented) {
          return;
        }

        setWidthHeight$1(this.element, width, height);

        if (this.isImageContent() && !this.isError()) {
          const isInitialSizeUpdate = (!this.displayedImageWidth && width);

          this.displayedImageWidth = width;
          this.displayedImageHeight = height;

          if (isInitialSizeUpdate) {
            this.loadImage(false);
          } else {
            this.updateSrcsetSizes();
          }

          if (this.slide) {
            // eslint-disable-next-line max-len
            this.instance.dispatch('imageSizeChange', { slide: this.slide, width, height, content: this });
          }
        }
      }

      /**
       * @returns {boolean} If the content can be zoomed
       */
      isZoomable() {
        return this.instance.applyFilters(
          'isContentZoomable',
          this.isImageContent() && (this.state !== LOAD_STATE$1.ERROR),
          this
        );
      }

      /**
       * Update image srcset sizes attribute based on width and height
       */
      updateSrcsetSizes() {
        // Handle srcset sizes attribute.
        //
        // Never lower quality, if it was increased previously.
        // Chrome does this automatically, Firefox and Safari do not,
        // so we store largest used size in dataset.
        // Handle srcset sizes attribute.
        //
        // Never lower quality, if it was increased previously.
        // Chrome does this automatically, Firefox and Safari do not,
        // so we store largest used size in dataset.
        if (this.data.srcset) {
          const image = /** @type HTMLImageElement */ (this.element);
          const sizesWidth = this.instance.applyFilters(
            'srcsetSizesWidth',
            this.displayedImageWidth,
            this
          );

          if (!image.dataset.largestUsedSize
              || sizesWidth > parseInt(image.dataset.largestUsedSize, 10)) {
            image.sizes = sizesWidth + 'px';
            image.dataset.largestUsedSize = String(sizesWidth);
          }
        }
      }

      /**
       * @returns {boolean} If content should use a placeholder (from msrc by default)
       */
      usePlaceholder() {
        return this.instance.applyFilters(
          'useContentPlaceholder',
          this.isImageContent(),
          this
        );
      }

      /**
       * Preload content with lazy-loading param
       */
      lazyLoad() {
        if (this.instance.dispatch('contentLazyLoad', { content: this }).defaultPrevented) {
          return;
        }

        this.load(true);
      }

      /**
       * @returns {boolean} If placeholder should be kept after content is loaded
       */
      keepPlaceholder() {
        return this.instance.applyFilters(
          'isKeepingPlaceholder',
          this.isLoading(),
          this
        );
      }

      /**
       * Destroy the content
       */
      destroy() {
        this.hasSlide = false;
        this.slide = null;

        if (this.instance.dispatch('contentDestroy', { content: this }).defaultPrevented) {
          return;
        }

        this.remove();

        if (this.placeholder) {
          this.placeholder.destroy();
          this.placeholder = null;
        }

        if (this.isImageContent() && this.element) {
          this.element.onload = null;
          this.element.onerror = null;
          this.element = null;
        }
      }

      /**
       * Display error message
       */
      displayError() {
        if (this.slide) {
          /** @type {HTMLElement} */
          let errorMsgEl = createElement$1('pswp__error-msg');
          errorMsgEl.innerText = this.instance.options.errorMsg;
          errorMsgEl = this.instance.applyFilters(
            'contentErrorElement',
            errorMsgEl,
            this
          );
          this.element = createElement$1('pswp__content pswp__error-msg-container');
          this.element.appendChild(errorMsgEl);
          this.slide.container.innerText = '';
          this.slide.container.appendChild(this.element);
          this.slide.updateContentSize(true);
          this.removePlaceholder();
        }
      }

      /**
       * Append the content
       */
      append() {
        if (this.isAttached) {
          return;
        }

        this.isAttached = true;

        if (this.state === LOAD_STATE$1.ERROR) {
          this.displayError();
          return;
        }

        if (this.instance.dispatch('contentAppend', { content: this }).defaultPrevented) {
          return;
        }

        const supportsDecode = ('decode' in this.element);

        if (this.isImageContent()) {
          // Use decode() on nearby slides
          //
          // Nearby slide images are in DOM and not hidden via display:none.
          // However, they are placed offscreen (to the left and right side).
          //
          // Some browsers do not composite the image until it's actually visible,
          // using decode() helps.
          //
          // You might ask "why dont you just decode() and then append all images",
          // that's because I want to show image before it's fully loaded,
          // as browser can render parts of image while it is loading.
          // We do not do this in Safari due to partial loading bug.
          if (supportsDecode && this.slide && (!this.slide.isActive || isSafari$1())) {
            this.isDecoding = true;
            // purposefully using finally instead of then,
            // as if srcset sizes changes dynamically - it may cause decode error
            /** @type {HTMLImageElement} */
            (this.element).decode().catch(() => {}).finally(() => {
              this.isDecoding = false;
              this.appendImage();
            });
          } else {
            this.appendImage();
          }
        } else if (this.element && !this.element.parentNode) {
          this.slide.container.appendChild(this.element);
        }
      }

      /**
       * Activate the slide,
       * active slide is generally the current one,
       * meaning the user can see it.
       */
      activate() {
        if (this.instance.dispatch('contentActivate', { content: this }).defaultPrevented) {
          return;
        }

        if (this.slide) {
          if (this.isImageContent() && this.isDecoding && !isSafari$1()) {
            // add image to slide when it becomes active,
            // even if it's not finished decoding
            this.appendImage();
          } else if (this.isError()) {
            this.load(false, true); // try to reload
          }
        }
      }

      /**
       * Deactivate the content
       */
      deactivate() {
        this.instance.dispatch('contentDeactivate', { content: this });
      }


      /**
       * Remove the content from DOM
       */
      remove() {
        this.isAttached = false;

        if (this.instance.dispatch('contentRemove', { content: this }).defaultPrevented) {
          return;
        }

        if (this.element && this.element.parentNode) {
          this.element.remove();
        }

        if (this.placeholder && this.placeholder.element) {
          this.placeholder.element.remove();
        }
      }

      /**
       * Append the image content to slide container
       */
      appendImage() {
        if (!this.isAttached) {
          return;
        }

        if (this.instance.dispatch('contentAppendImage', { content: this }).defaultPrevented) {
          return;
        }

        // ensure that element exists and is not already appended
        if (this.slide && this.element && !this.element.parentNode) {
          this.slide.container.appendChild(this.element);
        }

        if (this.state === LOAD_STATE$1.LOADED || this.state === LOAD_STATE$1.ERROR) {
          this.removePlaceholder();
        }
      }
    }

    /** @typedef {import('../photoswipe.js').PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../slide/slide.js').SlideData} SlideData */

    /**
     * @param {PhotoSwipeOptions} options
     * @param {PhotoSwipe} pswp
     */
    function getViewportSize$1(options, pswp) {
      if (options.getViewportSizeFn) {
        const newViewportSize = options.getViewportSizeFn(options, pswp);
        if (newViewportSize) {
          return newViewportSize;
        }
      }

      return {
        x: document.documentElement.clientWidth,

        // TODO: height on mobile is very incosistent due to toolbar
        // find a way to improve this
        //
        // document.documentElement.clientHeight - doesn't seem to work well
        y: window.innerHeight
      };
    }

    /**
     * Parses padding option.
     * Supported formats:
     *
     * // Object
     * padding: {
     *  top: 0,
     *  bottom: 0,
     *  left: 0,
     *  right: 0
     * }
     *
     * // A function that returns the object
     * paddingFn: (viewportSize, itemData, index) => {
     *  return {
     *    top: 0,
     *    bottom: 0,
     *    left: 0,
     *    right: 0
     *  };
     * }
     *
     * // Legacy variant
     * paddingLeft: 0,
     * paddingRight: 0,
     * paddingTop: 0,
     * paddingBottom: 0,
     *
     * @param {'left' | 'top' | 'bottom' | 'right'} prop
     * @param {PhotoSwipeOptions} options PhotoSwipe options
     * @param {{ x?: number; y?: number }} viewportSize PhotoSwipe viewport size, for example: { x:800, y:600 }
     * @param {SlideData} itemData Data about the slide
     * @param {number} index Slide index
     * @returns {number}
     */
    function parsePaddingOption$1(prop, options, viewportSize, itemData, index) {
      /** @type {number} */
      let paddingValue;

      if (options.paddingFn) {
        paddingValue = options.paddingFn(viewportSize, itemData, index)[prop];
      } else if (options.padding) {
        paddingValue = options.padding[prop];
      } else {
        const legacyPropName = 'padding' + prop[0].toUpperCase() + prop.slice(1);
        // @ts-expect-error
        if (options[legacyPropName]) {
          // @ts-expect-error
          paddingValue = options[legacyPropName];
        }
      }

      return paddingValue || 0;
    }

    /**
     * @param {PhotoSwipeOptions} options
     * @param {{ x?: number; y?: number }} viewportSize
     * @param {SlideData} itemData
     * @param {number} index
     */
    function getPanAreaSize$1(options, viewportSize, itemData, index) {
      return {
        x: viewportSize.x
          - parsePaddingOption$1('left', options, viewportSize, itemData, index)
          - parsePaddingOption$1('right', options, viewportSize, itemData, index),
        y: viewportSize.y
          - parsePaddingOption$1('top', options, viewportSize, itemData, index)
          - parsePaddingOption$1('bottom', options, viewportSize, itemData, index)
      };
    }

    const MAX_IMAGE_WIDTH$1 = 4000;

    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../photoswipe.js').PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import('../slide/slide.js').SlideData} SlideData */

    /** @typedef {'fit' | 'fill' | number | ((zoomLevelObject: ZoomLevel) => number)} ZoomLevelOption */

    /**
     * Calculates zoom levels for specific slide.
     * Depends on viewport size and image size.
     */
    class ZoomLevel$1 {
      /**
       * @param {PhotoSwipeOptions} options PhotoSwipe options
       * @param {SlideData} itemData Slide data
       * @param {number} index Slide index
       * @param {PhotoSwipe=} pswp PhotoSwipe instance, can be undefined if not initialized yet
       */
      constructor(options, itemData, index, pswp) {
        this.pswp = pswp;
        this.options = options;
        this.itemData = itemData;
        this.index = index;
      }

      /**
       * Calculate initial, secondary and maximum zoom level for the specified slide.
       *
       * It should be called when either image or viewport size changes.
       *
       * @param {number} maxWidth
       * @param {number} maxHeight
       * @param {{ x?: number; y?: number }} panAreaSize
       */
      update(maxWidth, maxHeight, panAreaSize) {
        this.elementSize = {
          x: maxWidth,
          y: maxHeight
        };

        this.panAreaSize = panAreaSize;

        const hRatio = this.panAreaSize.x / this.elementSize.x;
        const vRatio = this.panAreaSize.y / this.elementSize.y;

        this.fit = Math.min(1, hRatio < vRatio ? hRatio : vRatio);
        this.fill = Math.min(1, hRatio > vRatio ? hRatio : vRatio);

        // zoom.vFill defines zoom level of the image
        // when it has 100% of viewport vertical space (height)
        this.vFill = Math.min(1, vRatio);

        this.initial = this._getInitial();
        this.secondary = this._getSecondary();
        this.max = Math.max(
          this.initial,
          this.secondary,
          this._getMax()
        );

        this.min = Math.min(
          this.fit,
          this.initial,
          this.secondary
        );

        if (this.pswp) {
          this.pswp.dispatch('zoomLevelsUpdate', { zoomLevels: this, slideData: this.itemData });
        }
      }

      /**
       * Parses user-defined zoom option.
       *
       * @private
       * @param {'initial' | 'secondary' | 'max'} optionPrefix Zoom level option prefix (initial, secondary, max)
       */
      _parseZoomLevelOption(optionPrefix) {
        // eslint-disable-next-line max-len
        const optionName = /** @type {'initialZoomLevel' | 'secondaryZoomLevel' | 'maxZoomLevel'} */ (optionPrefix + 'ZoomLevel');
        const optionValue = this.options[optionName];

        if (!optionValue) {
          return;
        }

        if (typeof optionValue === 'function') {
          return optionValue(this);
        }

        if (optionValue === 'fill') {
          return this.fill;
        }

        if (optionValue === 'fit') {
          return this.fit;
        }

        return Number(optionValue);
      }

      /**
       * Get zoom level to which image will be zoomed after double-tap gesture,
       * or when user clicks on zoom icon,
       * or mouse-click on image itself.
       * If you return 1 image will be zoomed to its original size.
       *
       * @private
       * @return {number}
       */
      _getSecondary() {
        let currZoomLevel = this._parseZoomLevelOption('secondary');

        if (currZoomLevel) {
          return currZoomLevel;
        }

        // 3x of "fit" state, but not larger than original
        currZoomLevel = Math.min(1, this.fit * 3);

        if (currZoomLevel * this.elementSize.x > MAX_IMAGE_WIDTH$1) {
          currZoomLevel = MAX_IMAGE_WIDTH$1 / this.elementSize.x;
        }

        return currZoomLevel;
      }

      /**
       * Get initial image zoom level.
       *
       * @private
       * @return {number}
       */
      _getInitial() {
        return this._parseZoomLevelOption('initial') || this.fit;
      }

      /**
       * Maximum zoom level when user zooms
       * via zoom/pinch gesture,
       * via cmd/ctrl-wheel or via trackpad.
       *
       * @private
       * @return {number}
       */
      _getMax() {
        const currZoomLevel = this._parseZoomLevelOption('max');

        if (currZoomLevel) {
          return currZoomLevel;
        }

        // max zoom level is x4 from "fit state",
        // used for zoom gesture and ctrl/trackpad zoom
        return Math.max(1, this.fit * 4);
      }
    }

    /**
     * Lazy-load an image
     * This function is used both by Lightbox and PhotoSwipe core,
     * thus it can be called before dialog is opened.
     *
     * @param {SlideData} itemData Data about the slide
     * @param {PhotoSwipe | PhotoSwipeLightbox | PhotoSwipeBase} instance PhotoSwipe instance
     * @param {number} index
     * @returns Image that is being decoded or false.
     */
    function lazyLoadData$1(itemData, instance, index) {
      // src/slide/content/content.js
      const content = instance.createContentFromData(itemData, index);

      if (!content || !content.lazyLoad) {
        return;
      }

      const { options } = instance;

      // We need to know dimensions of the image to preload it,
      // as it might use srcset and we need to define sizes
      // @ts-expect-error should provide pswp instance?
      const viewportSize = instance.viewportSize || getViewportSize$1(options, instance);
      const panAreaSize = getPanAreaSize$1(options, viewportSize, itemData, index);

      const zoomLevel = new ZoomLevel$1(options, itemData, -1);
      zoomLevel.update(content.width, content.height, panAreaSize);

      content.lazyLoad();
      content.setDisplayedSize(
        Math.ceil(content.width * zoomLevel.initial),
        Math.ceil(content.height * zoomLevel.initial)
      );

      return content;
    }


    /**
     * Lazy-loads specific slide.
     * This function is used both by Lightbox and PhotoSwipe core,
     * thus it can be called before dialog is opened.
     *
     * By default it loads image based on viewport size and initial zoom level.
     *
     * @param {number} index Slide index
     * @param {PhotoSwipe | PhotoSwipeLightbox} instance PhotoSwipe or PhotoSwipeLightbox eventable instance
     */
    function lazyLoadSlide$1(index, instance) {
      const itemData = instance.getItemData(index);

      if (instance.dispatch('lazyLoadSlide', { index, itemData }).defaultPrevented) {
        return;
      }

      return lazyLoadData$1(itemData, instance, index);
    }

    /** @typedef {import("../photoswipe.js").default} PhotoSwipe */
    /** @typedef {import("../photoswipe.js").PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import("../slide/slide.js").SlideData} SlideData */

    /**
     * PhotoSwipe base class that can retrieve data about every slide.
     * Shared by PhotoSwipe Core and PhotoSwipe Lightbox
     */
    class PhotoSwipeBase$1 extends Eventable$1 {
      /**
       * Get total number of slides
       *
       * @returns {number}
       */
      getNumItems() {
        let numItems;
        const { dataSource } = this.options;
        if (!dataSource) {
          numItems = 0;
        } else if ('length' in dataSource) {
          // may be an array or just object with length property
          numItems = dataSource.length;
        } else if ('gallery' in dataSource) {
          // query DOM elements
          if (!dataSource.items) {
            dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
          }

          if (dataSource.items) {
            numItems = dataSource.items.length;
          }
        }

        // legacy event, before filters were introduced
        const event = this.dispatch('numItems', {
          dataSource,
          numItems
        });
        return this.applyFilters('numItems', event.numItems, dataSource);
      }

      /**
       * @param {SlideData} slideData
       * @param {number} index
       */
      createContentFromData(slideData, index) {
        // @ts-expect-error
        return new Content$1(slideData, this, index);
      }

      /**
       * Get item data by index.
       *
       * "item data" should contain normalized information that PhotoSwipe needs to generate a slide.
       * For example, it may contain properties like
       * `src`, `srcset`, `w`, `h`, which will be used to generate a slide with image.
       *
       * @param {number} index
       */
      getItemData(index) {
        const { dataSource } = this.options;
        let dataSourceItem;
        if (Array.isArray(dataSource)) {
          // Datasource is an array of elements
          dataSourceItem = dataSource[index];
        } else if (dataSource && dataSource.gallery) {
          // dataSource has gallery property,
          // thus it was created by Lightbox, based on
          // gallery and children options

          // query DOM elements
          if (!dataSource.items) {
            dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
          }

          dataSourceItem = dataSource.items[index];
        }

        let itemData = dataSourceItem;

        if (itemData instanceof Element) {
          itemData = this._domElementToItemData(itemData);
        }

        // Dispatching the itemData event,
        // it's a legacy verion before filters were introduced
        const event = this.dispatch('itemData', {
          itemData: itemData || {},
          index
        });

        return this.applyFilters('itemData', event.itemData, index);
      }

      /**
       * Get array of gallery DOM elements,
       * based on childSelector and gallery element.
       *
       * @param {HTMLElement} galleryElement
       */
      _getGalleryDOMElements(galleryElement) {
        if (this.options.children || this.options.childSelector) {
          return getElementsFromOption$1(
            this.options.children,
            this.options.childSelector,
            galleryElement
          ) || [];
        }

        return [galleryElement];
      }

      /**
       * Converts DOM element to item data object.
       *
       * @param {HTMLElement} element DOM element
       */
      // eslint-disable-next-line class-methods-use-this
      _domElementToItemData(element) {
        /** @type {SlideData} */
        const itemData = {
          element
        };

        // eslint-disable-next-line max-len
        const linkEl = /** @type {HTMLAnchorElement} */ (element.tagName === 'A' ? element : element.querySelector('a'));

        if (linkEl) {
          // src comes from data-pswp-src attribute,
          // if it's empty link href is used
          itemData.src = linkEl.dataset.pswpSrc || linkEl.href;

          if (linkEl.dataset.pswpSrcset) {
            itemData.srcset = linkEl.dataset.pswpSrcset;
          }

          itemData.width = parseInt(linkEl.dataset.pswpWidth, 10);
          itemData.height = parseInt(linkEl.dataset.pswpHeight, 10);

          // support legacy w & h properties
          itemData.w = itemData.width;
          itemData.h = itemData.height;

          if (linkEl.dataset.pswpType) {
            itemData.type = linkEl.dataset.pswpType;
          }

          const thumbnailEl = element.querySelector('img');

          if (thumbnailEl) {
            // msrc is URL to placeholder image that's displayed before large image is loaded
            // by default it's displayed only for the first slide
            itemData.msrc = thumbnailEl.currentSrc || thumbnailEl.src;
            itemData.alt = thumbnailEl.getAttribute('alt');
          }

          if (linkEl.dataset.pswpCropped || linkEl.dataset.cropped) {
            itemData.thumbCropped = true;
          }
        }

        return this.applyFilters('domItemData', itemData, element, linkEl);
      }

      /**
       * Lazy-load by slide data
       *
       * @param {SlideData} itemData Data about the slide
       * @param {number} index
       * @returns Image that is being decoded or false.
       */
      lazyLoadData(itemData, index) {
        return lazyLoadData$1(itemData, this, index);
      }
    }

    /**
     * @template T
     * @typedef {import('../types.js').Type<T>} Type<T>
     */

    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../photoswipe.js').PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import('../photoswipe.js').DataSource} DataSource */
    /** @typedef {import('../slide/content.js').default} Content */
    /** @typedef {import('../core/eventable.js').PhotoSwipeEventsMap} PhotoSwipeEventsMap */
    /** @typedef {import('../core/eventable.js').PhotoSwipeFiltersMap} PhotoSwipeFiltersMap */

    /**
     * @template T
     * @typedef {import('../core/eventable.js').EventCallback<T>} EventCallback<T>
     */

    /**
     * PhotoSwipe Lightbox
     *
     * - If user has unsupported browser it falls back to default browser action (just opens URL)
     * - Binds click event to links that should open PhotoSwipe
     * - parses DOM strcture for PhotoSwipe (retrieves large image URLs and sizes)
     * - Initializes PhotoSwipe
     *
     *
     * Loader options use the same object as PhotoSwipe, and supports such options:
     *
     * gallery - Element | Element[] | NodeList | string selector for the gallery element
     * children - Element | Element[] | NodeList | string selector for the gallery children
     *
     */
    class PhotoSwipeLightbox extends PhotoSwipeBase$1 {
      /**
       * @param {PhotoSwipeOptions} options
       */
      constructor(options) {
        super();
        /** @type {PhotoSwipeOptions} */
        this.options = options || {};
        this._uid = 0;
      }

      /**
       * Initialize lightbox, should be called only once.
       * It's not included in the main constructor, so you may bind events before it.
       */
      init() {
        this.onThumbnailsClick = this.onThumbnailsClick.bind(this);

        // Bind click events to each gallery
        getElementsFromOption$1(this.options.gallery, this.options.gallerySelector)
          .forEach((galleryElement) => {
            galleryElement.addEventListener('click', this.onThumbnailsClick, false);
          });
      }

      /**
       * @param {MouseEvent} e
       */
      onThumbnailsClick(e) {
        // Exit and allow default browser action if:
        if (specialKeyUsed$1(e) // ... if clicked with a special key (ctrl/cmd...)
            || window.pswp // ... if PhotoSwipe is already open
            || window.navigator.onLine === false) { // ... if offline
          return;
        }

        // If both clientX and clientY are 0 or not defined,
        // the event is likely triggered by keyboard,
        // so we do not pass the initialPoint
        //
        // Note that some screen readers emulate the mouse position,
        // so it's not ideal way to detect them.
        //
        let initialPoint = { x: e.clientX, y: e.clientY };

        if (!initialPoint.x && !initialPoint.y) {
          initialPoint = null;
        }

        let clickedIndex = this.getClickedIndex(e);
        clickedIndex = this.applyFilters('clickedIndex', clickedIndex, e, this);
        const dataSource = {
          gallery: /** @type {HTMLElement} */ (e.currentTarget)
        };

        if (clickedIndex >= 0) {
          e.preventDefault();
          this.loadAndOpen(clickedIndex, dataSource, initialPoint);
        }
      }

      /**
       * Get index of gallery item that was clicked.
       *
       * @param {MouseEvent} e click event
       */
      getClickedIndex(e) {
        // legacy option
        if (this.options.getClickedIndexFn) {
          return this.options.getClickedIndexFn.call(this, e);
        }

        const clickedTarget = /** @type {HTMLElement} */ (e.target);
        const childElements = getElementsFromOption$1(
          this.options.children,
          this.options.childSelector,
          /** @type {HTMLElement} */ (e.currentTarget)
        );
        const clickedChildIndex = childElements.findIndex(
          child => child === clickedTarget || child.contains(clickedTarget)
        );

        if (clickedChildIndex !== -1) {
          return clickedChildIndex;
        } else if (this.options.children || this.options.childSelector) {
          // click wasn't on a child element
          return -1;
        }

        // There is only one item (which is the gallery)
        return 0;
      }

      /**
       * Load and open PhotoSwipe
       *
       * @param {number} index
       * @param {DataSource=} dataSource
       * @param {{ x?: number; y?: number }} [initialPoint]
       */
      loadAndOpen(index, dataSource, initialPoint) {
        // Check if the gallery is already open
        if (window.pswp) {
          return false;
        }

        // set initial index
        this.options.index = index;

        // define options for PhotoSwipe constructor
        this.options.initialPointerPos = initialPoint;

        this.shouldOpen = true;
        this.preload(index, dataSource);
        return true;
      }

      /**
       * Load the main module and the slide content by index
       *
       * @param {number} index
       * @param {DataSource=} dataSource
       */
      preload(index, dataSource) {
        const { options } = this;

        if (dataSource) {
          options.dataSource = dataSource;
        }

        // Add the main module
        /** @type {Promise<Type<PhotoSwipe>>[]} */
        const promiseArray = [];

        const pswpModuleType = typeof options.pswpModule;
        if (isPswpClass(options.pswpModule)) {
          promiseArray.push(Promise.resolve(/** @type {Type<PhotoSwipe>} */ (options.pswpModule)));
        } else if (pswpModuleType === 'string') {
          throw new Error('pswpModule as string is no longer supported');
        } else if (pswpModuleType === 'function') {
          promiseArray.push(/** @type {() => Promise<Type<PhotoSwipe>>} */ (options.pswpModule)());
        } else {
          throw new Error('pswpModule is not valid');
        }

        // Add custom-defined promise, if any
        if (typeof options.openPromise === 'function') {
          // allow developers to perform some task before opening
          promiseArray.push(options.openPromise());
        }

        if (options.preloadFirstSlide !== false && index >= 0) {
          this._preloadedContent = lazyLoadSlide$1(index, this);
        }

        // Wait till all promises resolve and open PhotoSwipe
        const uid = ++this._uid;
        Promise.all(promiseArray).then((iterableModules) => {
          if (this.shouldOpen) {
            const mainModule = iterableModules[0];
            this._openPhotoswipe(mainModule, uid);
          }
        });
      }

      /**
       * @private
       * @param {Type<PhotoSwipe> | { default: Type<PhotoSwipe> }} module
       * @param {number} uid
       */
      _openPhotoswipe(module, uid) {
        // Cancel opening if UID doesn't match the current one
        // (if user clicked on another gallery item before current was loaded).
        //
        // Or if shouldOpen flag is set to false
        // (developer may modify it via public API)
        if (uid !== this._uid && this.shouldOpen) {
          return;
        }

        this.shouldOpen = false;

        // PhotoSwipe is already open
        if (window.pswp) {
          return;
        }

        /**
         * Pass data to PhotoSwipe and open init
         *
         * @type {PhotoSwipe}
         */
        const pswp = typeof module === 'object'
            ? new module.default(this.options) // eslint-disable-line
            : new module(this.options); // eslint-disable-line

        this.pswp = pswp;
        window.pswp = pswp;

        // map listeners from Lightbox to PhotoSwipe Core
        /** @type {(keyof PhotoSwipeEventsMap)[]} */
        (Object.keys(this._listeners)).forEach((name) => {
          this._listeners[name].forEach((fn) => {
            pswp.on(name, /** @type {EventCallback<typeof name>} */(fn));
          });
        });

        // same with filters
        /** @type {(keyof PhotoSwipeFiltersMap)[]} */
        (Object.keys(this._filters)).forEach((name) => {
          this._filters[name].forEach((filter) => {
            pswp.addFilter(name, filter.fn, filter.priority);
          });
        });

        if (this._preloadedContent) {
          pswp.contentLoader.addToCache(this._preloadedContent);
          this._preloadedContent = null;
        }

        pswp.on('destroy', () => {
          // clean up public variables
          this.pswp = null;
          window.pswp = null;
        });

        pswp.init();
      }

      /**
       * Unbinds all events, closes PhotoSwipe if it's open.
       */
      destroy() {
        if (this.pswp) {
          this.pswp.destroy();
        }

        this.shouldOpen = false;
        this._listeners = null;

        getElementsFromOption$1(this.options.gallery, this.options.gallerySelector)
          .forEach((galleryElement) => {
            galleryElement.removeEventListener('click', this.onThumbnailsClick, false);
          });
      }
    }

    /*!
      * PhotoSwipe 5.3.3 - https://photoswipe.com
      * (c) 2022 Dmytro Semenov
      */
    /** @typedef {import('../photoswipe.js').Point} Point */

    /** @typedef {undefined | null | false | '' | 0} Falsy */
    /** @typedef {keyof HTMLElementTagNameMap} HTMLElementTagName */

    /**
     * @template {HTMLElementTagName | Falsy} [T="div"]
     * @template {Node | undefined} [NodeToAppendElementTo=undefined]
     * @param {string=} className
     * @param {T=} [tagName]
     * @param {NodeToAppendElementTo=} appendToEl
     * @returns {T extends HTMLElementTagName ? HTMLElementTagNameMap[T] : HTMLElementTagNameMap['div']}
     */
    function createElement(className, tagName, appendToEl) {
      const el = document.createElement(tagName || 'div');
      if (className) {
        el.className = className;
      }
      if (appendToEl) {
        appendToEl.appendChild(el);
      }
      // @ts-expect-error
      return el;
    }

    /**
     * @param {Point} p1
     * @param {Point} p2
     */
    function equalizePoints(p1, p2) {
      p1.x = p2.x;
      p1.y = p2.y;
      if (p2.id !== undefined) {
        p1.id = p2.id;
      }
      return p1;
    }

    /**
     * @param {Point} p
     */
    function roundPoint(p) {
      p.x = Math.round(p.x);
      p.y = Math.round(p.y);
    }

    /**
     * Returns distance between two points.
     *
     * @param {Point} p1
     * @param {Point} p2
     */
    function getDistanceBetween(p1, p2) {
      const x = Math.abs(p1.x - p2.x);
      const y = Math.abs(p1.y - p2.y);
      return Math.sqrt((x * x) + (y * y));
    }

    /**
     * Whether X and Y positions of points are qual
     *
     * @param {Point} p1
     * @param {Point} p2
     */
    function pointsEqual(p1, p2) {
      return p1.x === p2.x && p1.y === p2.y;
    }

    /**
     * The float result between the min and max values.
     *
     * @param {number} val
     * @param {number} min
     * @param {number} max
     */
    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }

    /**
     * Get transform string
     *
     * @param {number} x
     * @param {number=} y
     * @param {number=} scale
     */
    function toTransformString(x, y, scale) {
      let propValue = 'translate3d('
        + x + 'px,' + (y || 0) + 'px'
        + ',0)';

      if (scale !== undefined) {
        propValue += ' scale3d('
          + scale + ',' + scale
          + ',1)';
      }

      return propValue;
    }

    /**
     * Apply transform:translate(x, y) scale(scale) to element
     *
     * @param {HTMLElement} el
     * @param {number} x
     * @param {number=} y
     * @param {number=} scale
     */
    function setTransform(el, x, y, scale) {
      el.style.transform = toTransformString(x, y, scale);
    }

    const defaultCSSEasing = 'cubic-bezier(.4,0,.22,1)';

    /**
     * Apply CSS transition to element
     *
     * @param {HTMLElement} el
     * @param {string=} prop CSS property to animate
     * @param {number=} duration in ms
     * @param {string=} ease CSS easing function
     */
    function setTransitionStyle(el, prop, duration, ease) {
      // inOut: 'cubic-bezier(.4, 0, .22, 1)', // for "toggle state" transitions
      // out: 'cubic-bezier(0, 0, .22, 1)', // for "show" transitions
      // in: 'cubic-bezier(.4, 0, 1, 1)'// for "hide" transitions
      el.style.transition = prop
        ? (prop + ' ' + duration + 'ms ' + (ease || defaultCSSEasing))
        : 'none';
    }

    /**
     * Apply width and height CSS properties to element
     *
     * @param {HTMLElement} el
     * @param {string | number} w
     * @param {string | number} h
     */
    function setWidthHeight(el, w, h) {
      el.style.width = (typeof w === 'number') ? (w + 'px') : w;
      el.style.height = (typeof h === 'number') ? (h + 'px') : h;
    }

    /**
     * @param {HTMLElement} el
     */
    function removeTransitionStyle(el) {
      setTransitionStyle(el);
    }

    /**
     * @param {HTMLImageElement} img
     * @returns {Promise<HTMLImageElement | void>}
     */
    function decodeImage(img) {
      if ('decode' in img) {
        return img.decode().catch(() => {});
      }

      if (img.complete) {
        return Promise.resolve(img);
      }

      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    }

    /** @typedef {LOAD_STATE[keyof LOAD_STATE]} LoadState */
    /** @type {{ IDLE: 'idle'; LOADING: 'loading'; LOADED: 'loaded'; ERROR: 'error' }} */
    const LOAD_STATE = {
      IDLE: 'idle',
      LOADING: 'loading',
      LOADED: 'loaded',
      ERROR: 'error',
    };


    /**
     * Check if click or keydown event was dispatched
     * with a special key or via mouse wheel.
     *
     * @param {MouseEvent | KeyboardEvent} e
     */
    function specialKeyUsed(e) {
      if (e.which === 2 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return true;
      }
    }

    /**
     * Parse `gallery` or `children` options.
     *
     * @param {import('../photoswipe.js').ElementProvider} option
     * @param {string=} legacySelector
     * @param {HTMLElement | Document} [parent]
     * @returns HTMLElement[]
     */
    function getElementsFromOption(option, legacySelector, parent = document) {
      /** @type {HTMLElement[]} */
      let elements = [];

      if (option instanceof Element) {
        elements = [option];
      } else if (option instanceof NodeList || Array.isArray(option)) {
        elements = Array.from(option);
      } else {
        const selector = typeof option === 'string' ? option : legacySelector;
        if (selector) {
          elements = Array.from(parent.querySelectorAll(selector));
        }
      }

      return elements;
    }

    /**
     * Check if browser is Safari
     *
     * @returns {boolean}
     */
    function isSafari() {
      return !!(navigator.vendor && navigator.vendor.match(/apple/i));
    }

    // Detect passive event listener support
    let supportsPassive = false;
    /* eslint-disable */
    try {
      window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
        get: () => {
          supportsPassive = true;
        }
      }));
    } catch (e) {}
    /* eslint-enable */


    /**
     * @typedef {Object} PoolItem
     * @prop {HTMLElement | Window | Document} target
     * @prop {string} type
     * @prop {(e: any) => void} listener
     * @prop {boolean} passive
     */

    class DOMEvents {
      constructor() {
        /**
         * @type {PoolItem[]}
         * @private
         */
        this._pool = [];
      }

      /**
       * Adds event listeners
       *
       * @param {HTMLElement | Window | Document} target
       * @param {string} type Can be multiple, separated by space.
       * @param {(e: any) => void} listener
       * @param {boolean=} passive
       */
      add(target, type, listener, passive) {
        this._toggleListener(target, type, listener, passive);
      }

      /**
       * Removes event listeners
       *
       * @param {HTMLElement | Window | Document} target
       * @param {string} type
       * @param {(e: any) => void} listener
       * @param {boolean=} passive
       */
      remove(target, type, listener, passive) {
        this._toggleListener(target, type, listener, passive, true);
      }

      /**
       * Removes all bound events
       */
      removeAll() {
        this._pool.forEach((poolItem) => {
          this._toggleListener(
            poolItem.target,
            poolItem.type,
            poolItem.listener,
            poolItem.passive,
            true,
            true
          );
        });
        this._pool = [];
      }

      /**
       * Adds or removes event
       *
       * @param {HTMLElement | Window | Document} target
       * @param {string} type
       * @param {(e: any) => void} listener
       * @param {boolean} passive
       * @param {boolean=} unbind Whether the event should be added or removed
       * @param {boolean=} skipPool Whether events pool should be skipped
       */
      _toggleListener(target, type, listener, passive, unbind, skipPool) {
        if (!target) {
          return;
        }

        const methodName = unbind ? 'removeEventListener' : 'addEventListener';
        const types = type.split(' ');
        types.forEach((eType) => {
          if (eType) {
            // Events pool is used to easily unbind all events when PhotoSwipe is closed,
            // so developer doesn't need to do this manually
            if (!skipPool) {
              if (unbind) {
                // Remove from the events pool
                this._pool = this._pool.filter((poolItem) => {
                  return poolItem.type !== eType
                    || poolItem.listener !== listener
                    || poolItem.target !== target;
                });
              } else {
                // Add to the events pool
                this._pool.push({
                  target,
                  type: eType,
                  listener,
                  passive
                });
              }
            }


            // most PhotoSwipe events call preventDefault,
            // and we do not need browser to scroll the page
            const eventOptions = supportsPassive ? { passive: (passive || false) } : false;

            target[methodName](
              eType,
              listener,
              eventOptions
            );
          }
        });
      }
    }

    /** @typedef {import('../photoswipe.js').PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../slide/slide.js').SlideData} SlideData */

    /**
     * @param {PhotoSwipeOptions} options
     * @param {PhotoSwipe} pswp
     */
    function getViewportSize(options, pswp) {
      if (options.getViewportSizeFn) {
        const newViewportSize = options.getViewportSizeFn(options, pswp);
        if (newViewportSize) {
          return newViewportSize;
        }
      }

      return {
        x: document.documentElement.clientWidth,

        // TODO: height on mobile is very incosistent due to toolbar
        // find a way to improve this
        //
        // document.documentElement.clientHeight - doesn't seem to work well
        y: window.innerHeight
      };
    }

    /**
     * Parses padding option.
     * Supported formats:
     *
     * // Object
     * padding: {
     *  top: 0,
     *  bottom: 0,
     *  left: 0,
     *  right: 0
     * }
     *
     * // A function that returns the object
     * paddingFn: (viewportSize, itemData, index) => {
     *  return {
     *    top: 0,
     *    bottom: 0,
     *    left: 0,
     *    right: 0
     *  };
     * }
     *
     * // Legacy variant
     * paddingLeft: 0,
     * paddingRight: 0,
     * paddingTop: 0,
     * paddingBottom: 0,
     *
     * @param {'left' | 'top' | 'bottom' | 'right'} prop
     * @param {PhotoSwipeOptions} options PhotoSwipe options
     * @param {{ x?: number; y?: number }} viewportSize PhotoSwipe viewport size, for example: { x:800, y:600 }
     * @param {SlideData} itemData Data about the slide
     * @param {number} index Slide index
     * @returns {number}
     */
    function parsePaddingOption(prop, options, viewportSize, itemData, index) {
      /** @type {number} */
      let paddingValue;

      if (options.paddingFn) {
        paddingValue = options.paddingFn(viewportSize, itemData, index)[prop];
      } else if (options.padding) {
        paddingValue = options.padding[prop];
      } else {
        const legacyPropName = 'padding' + prop[0].toUpperCase() + prop.slice(1);
        // @ts-expect-error
        if (options[legacyPropName]) {
          // @ts-expect-error
          paddingValue = options[legacyPropName];
        }
      }

      return paddingValue || 0;
    }

    /**
     * @param {PhotoSwipeOptions} options
     * @param {{ x?: number; y?: number }} viewportSize
     * @param {SlideData} itemData
     * @param {number} index
     */
    function getPanAreaSize(options, viewportSize, itemData, index) {
      return {
        x: viewportSize.x
          - parsePaddingOption('left', options, viewportSize, itemData, index)
          - parsePaddingOption('right', options, viewportSize, itemData, index),
        y: viewportSize.y
          - parsePaddingOption('top', options, viewportSize, itemData, index)
          - parsePaddingOption('bottom', options, viewportSize, itemData, index)
      };
    }

    /** @typedef {import('./slide.js').default} Slide */
    /** @typedef {{ x?: number; y?: number }} Point */
    /** @typedef {'x' | 'y'} Axis */

    /**
     * Calculates minimum, maximum and initial (center) bounds of a slide
     */
    class PanBounds {
      /**
       * @param {Slide} slide
       */
      constructor(slide) {
        this.slide = slide;

        this.currZoomLevel = 1;

        /** @type {Point} */
        this.center = {};
        /** @type {Point} */
        this.max = {};
        /** @type {Point} */
        this.min = {};

        this.reset();
      }

      /**
       * _getItemBounds
       *
       * @param {number} currZoomLevel
       */
      update(currZoomLevel) {
        this.currZoomLevel = currZoomLevel;

        if (!this.slide.width) {
          this.reset();
        } else {
          this._updateAxis('x');
          this._updateAxis('y');
          this.slide.pswp.dispatch('calcBounds', { slide: this.slide });
        }
      }

      /**
       * _calculateItemBoundsForAxis
       *
       * @param {Axis} axis
       */
      _updateAxis(axis) {
        const { pswp } = this.slide;
        const elSize = this.slide[axis === 'x' ? 'width' : 'height'] * this.currZoomLevel;
        const paddingProp = axis === 'x' ? 'left' : 'top';
        const padding = parsePaddingOption(
          paddingProp,
          pswp.options,
          pswp.viewportSize,
          this.slide.data,
          this.slide.index
        );

        const panAreaSize = this.slide.panAreaSize[axis];

        // Default position of element.
        // By defaul it is center of viewport:
        this.center[axis] = Math.round((panAreaSize - elSize) / 2) + padding;

        // maximum pan position
        this.max[axis] = (elSize > panAreaSize)
          ? Math.round(panAreaSize - elSize) + padding
          : this.center[axis];

        // minimum pan position
        this.min[axis] = (elSize > panAreaSize)
          ? padding
          : this.center[axis];
      }

      // _getZeroBounds
      reset() {
        this.center.x = 0;
        this.center.y = 0;
        this.max.x = 0;
        this.max.y = 0;
        this.min.x = 0;
        this.min.y = 0;
      }

      /**
       * Correct pan position if it's beyond the bounds
       *
       * @param {Axis} axis x or y
       * @param {number} panOffset
       */
      correctPan(axis, panOffset) { // checkPanBounds
        return clamp(panOffset, this.max[axis], this.min[axis]);
      }
    }

    const MAX_IMAGE_WIDTH = 4000;

    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../photoswipe.js').PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import('../slide/slide.js').SlideData} SlideData */

    /** @typedef {'fit' | 'fill' | number | ((zoomLevelObject: ZoomLevel) => number)} ZoomLevelOption */

    /**
     * Calculates zoom levels for specific slide.
     * Depends on viewport size and image size.
     */
    class ZoomLevel {
      /**
       * @param {PhotoSwipeOptions} options PhotoSwipe options
       * @param {SlideData} itemData Slide data
       * @param {number} index Slide index
       * @param {PhotoSwipe=} pswp PhotoSwipe instance, can be undefined if not initialized yet
       */
      constructor(options, itemData, index, pswp) {
        this.pswp = pswp;
        this.options = options;
        this.itemData = itemData;
        this.index = index;
      }

      /**
       * Calculate initial, secondary and maximum zoom level for the specified slide.
       *
       * It should be called when either image or viewport size changes.
       *
       * @param {number} maxWidth
       * @param {number} maxHeight
       * @param {{ x?: number; y?: number }} panAreaSize
       */
      update(maxWidth, maxHeight, panAreaSize) {
        this.elementSize = {
          x: maxWidth,
          y: maxHeight
        };

        this.panAreaSize = panAreaSize;

        const hRatio = this.panAreaSize.x / this.elementSize.x;
        const vRatio = this.panAreaSize.y / this.elementSize.y;

        this.fit = Math.min(1, hRatio < vRatio ? hRatio : vRatio);
        this.fill = Math.min(1, hRatio > vRatio ? hRatio : vRatio);

        // zoom.vFill defines zoom level of the image
        // when it has 100% of viewport vertical space (height)
        this.vFill = Math.min(1, vRatio);

        this.initial = this._getInitial();
        this.secondary = this._getSecondary();
        this.max = Math.max(
          this.initial,
          this.secondary,
          this._getMax()
        );

        this.min = Math.min(
          this.fit,
          this.initial,
          this.secondary
        );

        if (this.pswp) {
          this.pswp.dispatch('zoomLevelsUpdate', { zoomLevels: this, slideData: this.itemData });
        }
      }

      /**
       * Parses user-defined zoom option.
       *
       * @private
       * @param {'initial' | 'secondary' | 'max'} optionPrefix Zoom level option prefix (initial, secondary, max)
       */
      _parseZoomLevelOption(optionPrefix) {
        // eslint-disable-next-line max-len
        const optionName = /** @type {'initialZoomLevel' | 'secondaryZoomLevel' | 'maxZoomLevel'} */ (optionPrefix + 'ZoomLevel');
        const optionValue = this.options[optionName];

        if (!optionValue) {
          return;
        }

        if (typeof optionValue === 'function') {
          return optionValue(this);
        }

        if (optionValue === 'fill') {
          return this.fill;
        }

        if (optionValue === 'fit') {
          return this.fit;
        }

        return Number(optionValue);
      }

      /**
       * Get zoom level to which image will be zoomed after double-tap gesture,
       * or when user clicks on zoom icon,
       * or mouse-click on image itself.
       * If you return 1 image will be zoomed to its original size.
       *
       * @private
       * @return {number}
       */
      _getSecondary() {
        let currZoomLevel = this._parseZoomLevelOption('secondary');

        if (currZoomLevel) {
          return currZoomLevel;
        }

        // 3x of "fit" state, but not larger than original
        currZoomLevel = Math.min(1, this.fit * 3);

        if (currZoomLevel * this.elementSize.x > MAX_IMAGE_WIDTH) {
          currZoomLevel = MAX_IMAGE_WIDTH / this.elementSize.x;
        }

        return currZoomLevel;
      }

      /**
       * Get initial image zoom level.
       *
       * @private
       * @return {number}
       */
      _getInitial() {
        return this._parseZoomLevelOption('initial') || this.fit;
      }

      /**
       * Maximum zoom level when user zooms
       * via zoom/pinch gesture,
       * via cmd/ctrl-wheel or via trackpad.
       *
       * @private
       * @return {number}
       */
      _getMax() {
        const currZoomLevel = this._parseZoomLevelOption('max');

        if (currZoomLevel) {
          return currZoomLevel;
        }

        // max zoom level is x4 from "fit state",
        // used for zoom gesture and ctrl/trackpad zoom
        return Math.max(1, this.fit * 4);
      }
    }

    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */

    /**
     * Renders and allows to control a single slide
     */
    class Slide {
      /**
       * @param {SlideData} data
       * @param {number} index
       * @param {PhotoSwipe} pswp
       */
      constructor(data, index, pswp) {
        this.data = data;
        this.index = index;
        this.pswp = pswp;
        this.isActive = (index === pswp.currIndex);
        this.currentResolution = 0;
        /** @type {Point} */
        this.panAreaSize = {};

        this.isFirstSlide = (this.isActive && !pswp.opener.isOpen);

        this.zoomLevels = new ZoomLevel(pswp.options, data, index, pswp);

        this.pswp.dispatch('gettingData', {
          slide: this,
          data: this.data,
          index
        });

        this.pan = {
          x: 0,
          y: 0
        };

        this.content = this.pswp.contentLoader.getContentBySlide(this);
        this.container = createElement('pswp__zoom-wrap');

        this.currZoomLevel = 1;
        /** @type {number} */
        this.width = this.content.width;
        /** @type {number} */
        this.height = this.content.height;

        this.bounds = new PanBounds(this);

        this.prevDisplayedWidth = -1;
        this.prevDisplayedHeight = -1;

        this.pswp.dispatch('slideInit', { slide: this });
      }

      /**
       * If this slide is active/current/visible
       *
       * @param {boolean} isActive
       */
      setIsActive(isActive) {
        if (isActive && !this.isActive) {
          // slide just became active
          this.activate();
        } else if (!isActive && this.isActive) {
          // slide just became non-active
          this.deactivate();
        }
      }

      /**
       * Appends slide content to DOM
       *
       * @param {HTMLElement} holderElement
       */
      append(holderElement) {
        this.holderElement = holderElement;

        this.container.style.transformOrigin = '0 0';

        // Slide appended to DOM
        if (!this.data) {
          return;
        }

        this.calculateSize();

        this.load();
        this.updateContentSize();
        this.appendHeavy();

        this.holderElement.appendChild(this.container);

        this.zoomAndPanToInitial();

        this.pswp.dispatch('firstZoomPan', { slide: this });

        this.applyCurrentZoomPan();

        this.pswp.dispatch('afterSetContent', { slide: this });

        if (this.isActive) {
          this.activate();
        }
      }

      load() {
        this.content.load();
        this.pswp.dispatch('slideLoad', { slide: this });
      }

      /**
       * Append "heavy" DOM elements
       *
       * This may depend on a type of slide,
       * but generally these are large images.
       */
      appendHeavy() {
        const { pswp } = this;
        const appendHeavyNearby = true; // todo

        // Avoid appending heavy elements during animations
        if (this.heavyAppended
            || !pswp.opener.isOpen
            || pswp.mainScroll.isShifted()
            || (!this.isActive && !appendHeavyNearby)) {
          return;
        }

        if (this.pswp.dispatch('appendHeavy', { slide: this }).defaultPrevented) {
          return;
        }

        this.heavyAppended = true;

        this.content.append();

        this.pswp.dispatch('appendHeavyContent', { slide: this });
      }

      /**
       * Triggered when this slide is active (selected).
       *
       * If it's part of opening/closing transition -
       * activate() will trigger after the transition is ended.
       */
      activate() {
        this.isActive = true;
        this.appendHeavy();
        this.content.activate();
        this.pswp.dispatch('slideActivate', { slide: this });
      }

      /**
       * Triggered when this slide becomes inactive.
       *
       * Slide can become inactive only after it was active.
       */
      deactivate() {
        this.isActive = false;
        this.content.deactivate();

        if (this.currZoomLevel !== this.zoomLevels.initial) {
          // allow filtering
          this.calculateSize();
        }

        // reset zoom level
        this.currentResolution = 0;
        this.zoomAndPanToInitial();
        this.applyCurrentZoomPan();
        this.updateContentSize();

        this.pswp.dispatch('slideDeactivate', { slide: this });
      }

      /**
       * The slide should destroy itself, it will never be used again.
       * (unbind all events and destroy internal components)
       */
      destroy() {
        this.content.hasSlide = false;
        this.content.remove();
        this.container.remove();
        this.pswp.dispatch('slideDestroy', { slide: this });
      }

      resize() {
        if (this.currZoomLevel === this.zoomLevels.initial || !this.isActive) {
          // Keep initial zoom level if it was before the resize,
          // as well as when this slide is not active

          // Reset position and scale to original state
          this.calculateSize();
          this.currentResolution = 0;
          this.zoomAndPanToInitial();
          this.applyCurrentZoomPan();
          this.updateContentSize();
        } else {
          // readjust pan position if it's beyond the bounds
          this.calculateSize();
          this.bounds.update(this.currZoomLevel);
          this.panTo(this.pan.x, this.pan.y);
        }
      }


      /**
       * Apply size to current slide content,
       * based on the current resolution and scale.
       *
       * @param {boolean=} force if size should be updated even if dimensions weren't changed
       */
      updateContentSize(force) {
        // Use initial zoom level
        // if resolution is not defined (user didn't zoom yet)
        const scaleMultiplier = this.currentResolution || this.zoomLevels.initial;

        if (!scaleMultiplier) {
          return;
        }

        const width = Math.round(this.width * scaleMultiplier) || this.pswp.viewportSize.x;
        const height = Math.round(this.height * scaleMultiplier) || this.pswp.viewportSize.y;

        if (!this.sizeChanged(width, height) && !force) {
          return;
        }
        this.content.setDisplayedSize(width, height);
      }

      /**
       * @param {number} width
       * @param {number} height
       */
      sizeChanged(width, height) {
        if (width !== this.prevDisplayedWidth
            || height !== this.prevDisplayedHeight) {
          this.prevDisplayedWidth = width;
          this.prevDisplayedHeight = height;
          return true;
        }

        return false;
      }

      getPlaceholderElement() {
        if (this.content.placeholder) {
          return this.content.placeholder.element;
        }
      }

      /**
       * Zoom current slide image to...
       *
       * @param {number} destZoomLevel Destination zoom level.
       * @param {{ x?: number; y?: number }} centerPoint
       * Transform origin center point, or false if viewport center should be used.
       * @param {number | false} [transitionDuration] Transition duration, may be set to 0.
       * @param {boolean=} ignoreBounds Minimum and maximum zoom levels will be ignored.
       * @return {boolean=} Returns true if animated.
       */
      zoomTo(destZoomLevel, centerPoint, transitionDuration, ignoreBounds) {
        const { pswp } = this;
        if (!this.isZoomable()
            || pswp.mainScroll.isShifted()) {
          return;
        }

        pswp.dispatch('beforeZoomTo', {
          destZoomLevel, centerPoint, transitionDuration
        });

        // stop all pan and zoom transitions
        pswp.animations.stopAllPan();

        // if (!centerPoint) {
        //   centerPoint = pswp.getViewportCenterPoint();
        // }

        const prevZoomLevel = this.currZoomLevel;

        if (!ignoreBounds) {
          destZoomLevel = clamp(destZoomLevel, this.zoomLevels.min, this.zoomLevels.max);
        }

        // if (transitionDuration === undefined) {
        //   transitionDuration = this.pswp.options.zoomAnimationDuration;
        // }

        this.setZoomLevel(destZoomLevel);
        this.pan.x = this.calculateZoomToPanOffset('x', centerPoint, prevZoomLevel);
        this.pan.y = this.calculateZoomToPanOffset('y', centerPoint, prevZoomLevel);
        roundPoint(this.pan);

        const finishTransition = () => {
          this._setResolution(destZoomLevel);
          this.applyCurrentZoomPan();
        };

        if (!transitionDuration) {
          finishTransition();
        } else {
          pswp.animations.startTransition({
            isPan: true,
            name: 'zoomTo',
            target: this.container,
            transform: this.getCurrentTransform(),
            onComplete: finishTransition,
            duration: transitionDuration,
            easing: pswp.options.easing
          });
        }
      }

      /**
       * @param {{ x?: number, y?: number }} [centerPoint]
       */
      toggleZoom(centerPoint) {
        this.zoomTo(
          this.currZoomLevel === this.zoomLevels.initial
            ? this.zoomLevels.secondary : this.zoomLevels.initial,
          centerPoint,
          this.pswp.options.zoomAnimationDuration
        );
      }

      /**
       * Updates zoom level property and recalculates new pan bounds,
       * unlike zoomTo it does not apply transform (use applyCurrentZoomPan)
       *
       * @param {number} currZoomLevel
       */
      setZoomLevel(currZoomLevel) {
        this.currZoomLevel = currZoomLevel;
        this.bounds.update(this.currZoomLevel);
      }

      /**
       * Get pan position after zoom at a given `point`.
       *
       * Always call setZoomLevel(newZoomLevel) beforehand to recalculate
       * pan bounds according to the new zoom level.
       *
       * @param {'x' | 'y'} axis
       * @param {{ x?: number; y?: number }} [point]
       * point based on which zoom is performed, usually refers to the current mouse position,
       * if false - viewport center will be used.
       * @param {number=} prevZoomLevel Zoom level before new zoom was applied.
       */
      calculateZoomToPanOffset(axis, point, prevZoomLevel) {
        const totalPanDistance = this.bounds.max[axis] - this.bounds.min[axis];
        if (totalPanDistance === 0) {
          return this.bounds.center[axis];
        }

        if (!point) {
          point = this.pswp.getViewportCenterPoint();
        }

        const zoomFactor = this.currZoomLevel / prevZoomLevel;
        return this.bounds.correctPan(
          axis,
          (this.pan[axis] - point[axis]) * zoomFactor + point[axis]
        );
      }

      /**
       * Apply pan and keep it within bounds.
       *
       * @param {number} panX
       * @param {number} panY
       */
      panTo(panX, panY) {
        this.pan.x = this.bounds.correctPan('x', panX);
        this.pan.y = this.bounds.correctPan('y', panY);
        this.applyCurrentZoomPan();
      }

      /**
       * If the slide in the current state can be panned by the user
       */
      isPannable() {
        return this.width && (this.currZoomLevel > this.zoomLevels.fit);
      }

      /**
       * If the slide can be zoomed
       */
      isZoomable() {
        return this.width && this.content.isZoomable();
      }

      /**
       * Apply transform and scale based on
       * the current pan position (this.pan) and zoom level (this.currZoomLevel)
       */
      applyCurrentZoomPan() {
        this._applyZoomTransform(this.pan.x, this.pan.y, this.currZoomLevel);
        if (this === this.pswp.currSlide) {
          this.pswp.dispatch('zoomPanUpdate', { slide: this });
        }
      }

      zoomAndPanToInitial() {
        this.currZoomLevel = this.zoomLevels.initial;

        // pan according to the zoom level
        this.bounds.update(this.currZoomLevel);
        equalizePoints(this.pan, this.bounds.center);
        this.pswp.dispatch('initialZoomPan', { slide: this });
      }

      /**
       * Set translate and scale based on current resolution
       *
       * @param {number} x
       * @param {number} y
       * @param {number} zoom
       */
      _applyZoomTransform(x, y, zoom) {
        zoom /= this.currentResolution || this.zoomLevels.initial;
        setTransform(this.container, x, y, zoom);
      }

      calculateSize() {
        const { pswp } = this;

        equalizePoints(
          this.panAreaSize,
          getPanAreaSize(pswp.options, pswp.viewportSize, this.data, this.index)
        );

        this.zoomLevels.update(this.width, this.height, this.panAreaSize);

        pswp.dispatch('calcSlideSize', {
          slide: this
        });
      }

      getCurrentTransform() {
        const scale = this.currZoomLevel / (this.currentResolution || this.zoomLevels.initial);
        return toTransformString(this.pan.x, this.pan.y, scale);
      }

      /**
       * Set resolution and re-render the image.
       *
       * For example, if the real image size is 2000x1500,
       * and resolution is 0.5 - it will be rendered as 1000x750.
       *
       * Image with zoom level 2 and resolution 0.5 is
       * the same as image with zoom level 1 and resolution 1.
       *
       * Used to optimize animations and make
       * sure that browser renders image in highest quality.
       * Also used by responsive images to load the correct one.
       *
       * @param {number} newResolution
       */
      _setResolution(newResolution) {
        if (newResolution === this.currentResolution) {
          return;
        }

        this.currentResolution = newResolution;
        this.updateContentSize();

        this.pswp.dispatch('resolutionChanged');
      }
    }

    /** @typedef {import('../photoswipe.js').Point} Point */
    /** @typedef {import('./gestures.js').default} Gestures */

    const PAN_END_FRICTION = 0.35;
    const VERTICAL_DRAG_FRICTION = 0.6;

    // 1 corresponds to the third of viewport height
    const MIN_RATIO_TO_CLOSE = 0.4;

    // Minimum speed required to navigate
    // to next or previous slide
    const MIN_NEXT_SLIDE_SPEED = 0.5;

    /**
     * @param {number} initialVelocity
     * @param {number} decelerationRate
     */
    function project(initialVelocity, decelerationRate) {
      return initialVelocity * decelerationRate / (1 - decelerationRate);
    }

    /**
     * Handles single pointer dragging
     */
    class DragHandler {
      /**
       * @param {Gestures} gestures
       */
      constructor(gestures) {
        this.gestures = gestures;
        this.pswp = gestures.pswp;
        /** @type {Point} */
        this.startPan = {};
      }

      start() {
        equalizePoints(this.startPan, this.pswp.currSlide.pan);
        this.pswp.animations.stopAll();
      }

      change() {
        const { p1, prevP1, dragAxis, pswp } = this.gestures;
        const { currSlide } = pswp;

        if (dragAxis === 'y'
            && pswp.options.closeOnVerticalDrag
            && currSlide.currZoomLevel <= currSlide.zoomLevels.fit
            && !this.gestures.isMultitouch) {
          // Handle vertical drag to close
          const panY = currSlide.pan.y + (p1.y - prevP1.y);
          if (!pswp.dispatch('verticalDrag', { panY }).defaultPrevented) {
            this._setPanWithFriction('y', panY, VERTICAL_DRAG_FRICTION);
            const bgOpacity = 1 - Math.abs(this._getVerticalDragRatio(currSlide.pan.y));
            pswp.applyBgOpacity(bgOpacity);
            currSlide.applyCurrentZoomPan();
          }
        } else {
          const mainScrollChanged = this._panOrMoveMainScroll('x');
          if (!mainScrollChanged) {
            this._panOrMoveMainScroll('y');

            roundPoint(currSlide.pan);
            currSlide.applyCurrentZoomPan();
          }
        }
      }

      end() {
        const { pswp, velocity } = this.gestures;
        const { mainScroll } = pswp;
        let indexDiff = 0;

        pswp.animations.stopAll();

        // Handle main scroll if it's shifted
        if (mainScroll.isShifted()) {
          // Position of the main scroll relative to the viewport
          const mainScrollShiftDiff = mainScroll.x - mainScroll.getCurrSlideX();

          // Ratio between 0 and 1:
          // 0 - slide is not visible at all,
          // 0.5 - half of the slide is vicible
          // 1 - slide is fully visible
          const currentSlideVisibilityRatio = (mainScrollShiftDiff / pswp.viewportSize.x);

          // Go next slide.
          //
          // - if velocity and its direction is matched
          //   and we see at least tiny part of the next slide
          //
          // - or if we see less than 50% of the current slide
          //   and velocity is close to 0
          //
          if ((velocity.x < -MIN_NEXT_SLIDE_SPEED && currentSlideVisibilityRatio < 0)
              || (velocity.x < 0.1 && currentSlideVisibilityRatio < -0.5)) {
            // Go to next slide
            indexDiff = 1;
            velocity.x = Math.min(velocity.x, 0);
          } else if ((velocity.x > MIN_NEXT_SLIDE_SPEED && currentSlideVisibilityRatio > 0)
              || (velocity.x > -0.1 && currentSlideVisibilityRatio > 0.5)) {
            // Go to prev slide
            indexDiff = -1;
            velocity.x = Math.max(velocity.x, 0);
          }

          mainScroll.moveIndexBy(indexDiff, true, velocity.x);
        }

        // Restore zoom level
        if (pswp.currSlide.currZoomLevel > pswp.currSlide.zoomLevels.max
            || this.gestures.isMultitouch) {
          this.gestures.zoomLevels.correctZoomPan(true);
        } else {
          // we run two animations instead of one,
          // as each axis has own pan boundaries and thus different spring function
          // (correctZoomPan does not have this functionality,
          //  it animates all properties with single timing function)
          this._finishPanGestureForAxis('x');
          this._finishPanGestureForAxis('y');
        }
      }

      /**
       * @private
       * @param {'x' | 'y'} axis
       */
      _finishPanGestureForAxis(axis) {
        const { pswp } = this;
        const { currSlide } = pswp;
        const { velocity } = this.gestures;
        const { pan, bounds } = currSlide;
        const panPos = pan[axis];
        const restoreBgOpacity = (pswp.bgOpacity < 1 && axis === 'y');

        // 0.995 means - scroll view loses 0.5% of its velocity per millisecond
        // Inceasing this number will reduce travel distance
        const decelerationRate = 0.995; // 0.99

        // Pan position if there is no bounds
        const projectedPosition = panPos + project(velocity[axis], decelerationRate);

        if (restoreBgOpacity) {
          const vDragRatio = this._getVerticalDragRatio(panPos);
          const projectedVDragRatio = this._getVerticalDragRatio(projectedPosition);

          // If we are above and moving upwards,
          // or if we are below and moving downwards
          if ((vDragRatio < 0 && projectedVDragRatio < -MIN_RATIO_TO_CLOSE)
              || (vDragRatio > 0 && projectedVDragRatio > MIN_RATIO_TO_CLOSE)) {
            pswp.close();
            return;
          }
        }

        // Pan position with corrected bounds
        const correctedPanPosition = bounds.correctPan(axis, projectedPosition);

        // Exit if pan position should not be changed
        // or if speed it too low
        if (panPos === correctedPanPosition) {
          return;
        }

        // Overshoot if the final position is out of pan bounds
        const dampingRatio = (correctedPanPosition === projectedPosition) ? 1 : 0.82;

        const initialBgOpacity = pswp.bgOpacity;
        const totalPanDist = correctedPanPosition - panPos;

        pswp.animations.startSpring({
          name: 'panGesture' + axis,
          isPan: true,
          start: panPos,
          end: correctedPanPosition,
          velocity: velocity[axis],
          dampingRatio,
          onUpdate: (pos) => {
            // Animate opacity of background relative to Y pan position of an image
            if (restoreBgOpacity && pswp.bgOpacity < 1) {
              // 0 - start of animation, 1 - end of animation
              const animationProgressRatio = 1 - (correctedPanPosition - pos) / totalPanDist;

              // We clamp opacity to keep it between 0 and 1.
              // As progress ratio can be larger than 1 due to overshoot,
              // and we do not want to bounce opacity.
              pswp.applyBgOpacity(clamp(
                initialBgOpacity + (1 - initialBgOpacity) * animationProgressRatio,
                0,
                1
              ));
            }

            pan[axis] = Math.floor(pos);
            currSlide.applyCurrentZoomPan();
          },
        });
      }

      /**
       * Update position of the main scroll,
       * or/and update pan position of the current slide.
       *
       * Should return true if it changes (or can change) main scroll.
       *
       * @private
       * @param {'x' | 'y'} axis
       */
      _panOrMoveMainScroll(axis) {
        const { p1, pswp, dragAxis, prevP1, isMultitouch } = this.gestures;
        const { currSlide, mainScroll } = pswp;
        const delta = (p1[axis] - prevP1[axis]);
        const newMainScrollX = mainScroll.x + delta;

        if (!delta) {
          return;
        }

        // Always move main scroll if image can not be panned
        if (axis === 'x' && !currSlide.isPannable() && !isMultitouch) {
          mainScroll.moveTo(newMainScrollX, true);
          return true; // changed main scroll
        }

        const { bounds } = currSlide;
        const newPan = currSlide.pan[axis] + delta;

        if (pswp.options.allowPanToNext
            && dragAxis === 'x'
            && axis === 'x'
            && !isMultitouch) {
          const currSlideMainScrollX = mainScroll.getCurrSlideX();

          // Position of the main scroll relative to the viewport
          const mainScrollShiftDiff = mainScroll.x - currSlideMainScrollX;

          const isLeftToRight = delta > 0;
          const isRightToLeft = !isLeftToRight;

          if (newPan > bounds.min[axis] && isLeftToRight) {
            // Panning from left to right, beyond the left edge

            // Wether the image was at minimum pan position (or less)
            // when this drag gesture started.
            // Minimum pan position refers to the left edge of the image.
            const wasAtMinPanPosition = (bounds.min[axis] <= this.startPan[axis]);

            if (wasAtMinPanPosition) {
              mainScroll.moveTo(newMainScrollX, true);
              return true;
            } else {
              this._setPanWithFriction(axis, newPan);
              //currSlide.pan[axis] = newPan;
            }
          } else if (newPan < bounds.max[axis] && isRightToLeft) {
            // Paning from right to left, beyond the right edge

            // Maximum pan position refers to the right edge of the image.
            const wasAtMaxPanPosition = (this.startPan[axis] <= bounds.max[axis]);

            if (wasAtMaxPanPosition) {
              mainScroll.moveTo(newMainScrollX, true);
              return true;
            } else {
              this._setPanWithFriction(axis, newPan);
              //currSlide.pan[axis] = newPan;
            }
          } else {
            // If main scroll is shifted
            if (mainScrollShiftDiff !== 0) {
              // If main scroll is shifted right
              if (mainScrollShiftDiff > 0 /*&& isRightToLeft*/) {
                mainScroll.moveTo(Math.max(newMainScrollX, currSlideMainScrollX), true);
                return true;
              } else if (mainScrollShiftDiff < 0 /*&& isLeftToRight*/) {
                // Main scroll is shifted left (Position is less than 0 comparing to the viewport 0)
                mainScroll.moveTo(Math.min(newMainScrollX, currSlideMainScrollX), true);
                return true;
              }
            } else {
              // We are within pan bounds, so just pan
              this._setPanWithFriction(axis, newPan);
            }
          }
        } else {
          if (axis === 'y') {
            // Do not pan vertically if main scroll is shifted o
            if (!mainScroll.isShifted() && bounds.min.y !== bounds.max.y) {
              this._setPanWithFriction(axis, newPan);
            }
          } else {
            this._setPanWithFriction(axis, newPan);
          }
        }
      }
      //
      // If we move above - the ratio is negative
      // If we move below the ratio is positive

      /**
       * Relation between pan Y position and third of viewport height.
       *
       * When we are at initial position (center bounds) - the ratio is 0,
       * if position is shifted upwards - the ratio is negative,
       * if position is shifted downwards - the ratio is positive.
       *
       * @private
       * @param {number} panY The current pan Y position.
       */
      _getVerticalDragRatio(panY) {
        return (panY - this.pswp.currSlide.bounds.center.y)
                / (this.pswp.viewportSize.y / 3);
      }

      /**
       * Set pan position of the current slide.
       * Apply friction if the position is beyond the pan bounds,
       * or if custom friction is defined.
       *
       * @private
       * @param {'x' | 'y'} axis
       * @param {number} potentialPan
       * @param {number=} customFriction (0.1 - 1)
       */
      _setPanWithFriction(axis, potentialPan, customFriction) {
        const { pan, bounds } = this.pswp.currSlide;
        const correctedPan = bounds.correctPan(axis, potentialPan);
        // If we are out of pan bounds
        if (correctedPan !== potentialPan || customFriction) {
          const delta = Math.round(potentialPan - pan[axis]);
          pan[axis] += delta * (customFriction || PAN_END_FRICTION);
        } else {
          pan[axis] = potentialPan;
        }
      }
    }

    /** @typedef {import('../photoswipe.js').Point} Point */
    /** @typedef {import('./gestures.js').default} Gestures */

    const UPPER_ZOOM_FRICTION = 0.05;
    const LOWER_ZOOM_FRICTION = 0.15;


    /**
     * Get center point between two points
     *
     * @param {Point} p
     * @param {Point} p1
     * @param {Point} p2
     */
    function getZoomPointsCenter(p, p1, p2) {
      p.x = (p1.x + p2.x) / 2;
      p.y = (p1.y + p2.y) / 2;
      return p;
    }

    class ZoomHandler {
      /**
       * @param {Gestures} gestures
       */
      constructor(gestures) {
        this.gestures = gestures;
        this.pswp = this.gestures.pswp;
        /** @type {Point} */
        this._startPan = {};

        /** @type {Point} */
        this._startZoomPoint = {};
        /** @type {Point} */
        this._zoomPoint = {};
      }

      start() {
        this._startZoomLevel = this.pswp.currSlide.currZoomLevel;
        equalizePoints(this._startPan, this.pswp.currSlide.pan);
        this.pswp.animations.stopAllPan();
        this._wasOverFitZoomLevel = false;
      }

      change() {
        const { p1, startP1, p2, startP2, pswp } = this.gestures;
        const { currSlide } = pswp;
        const minZoomLevel = currSlide.zoomLevels.min;
        const maxZoomLevel = currSlide.zoomLevels.max;

        if (!currSlide.isZoomable() || pswp.mainScroll.isShifted()) {
          return;
        }

        getZoomPointsCenter(this._startZoomPoint, startP1, startP2);
        getZoomPointsCenter(this._zoomPoint, p1, p2);

        let currZoomLevel = (1 / getDistanceBetween(startP1, startP2))
                          * getDistanceBetween(p1, p2)
                          * this._startZoomLevel;

        // slightly over the zoom.fit
        if (currZoomLevel > currSlide.zoomLevels.initial + (currSlide.zoomLevels.initial / 15)) {
          this._wasOverFitZoomLevel = true;
        }

        if (currZoomLevel < minZoomLevel) {
          if (pswp.options.pinchToClose
              && !this._wasOverFitZoomLevel
              && this._startZoomLevel <= currSlide.zoomLevels.initial) {
            // fade out background if zooming out
            const bgOpacity = 1 - ((minZoomLevel - currZoomLevel) / (minZoomLevel / 1.2));
            if (!pswp.dispatch('pinchClose', { bgOpacity }).defaultPrevented) {
              pswp.applyBgOpacity(bgOpacity);
            }
          } else {
            // Apply the friction if zoom level is below the min
            currZoomLevel = minZoomLevel - (minZoomLevel - currZoomLevel) * LOWER_ZOOM_FRICTION;
          }
        } else if (currZoomLevel > maxZoomLevel) {
          // Apply the friction if zoom level is above the max
          currZoomLevel = maxZoomLevel + (currZoomLevel - maxZoomLevel) * UPPER_ZOOM_FRICTION;
        }

        currSlide.pan.x = this._calculatePanForZoomLevel('x', currZoomLevel);
        currSlide.pan.y = this._calculatePanForZoomLevel('y', currZoomLevel);

        currSlide.setZoomLevel(currZoomLevel);
        currSlide.applyCurrentZoomPan();
      }

      end() {
        const { pswp } = this;
        const { currSlide } = pswp;
        if (currSlide.currZoomLevel < currSlide.zoomLevels.initial
            && !this._wasOverFitZoomLevel
            && pswp.options.pinchToClose) {
          pswp.close();
        } else {
          this.correctZoomPan();
        }
      }

      /**
       * @private
       * @param {'x' | 'y'} axis
       * @param {number} currZoomLevel
       */
      _calculatePanForZoomLevel(axis, currZoomLevel) {
        const zoomFactor = currZoomLevel / this._startZoomLevel;
        return this._zoomPoint[axis]
                - ((this._startZoomPoint[axis] - this._startPan[axis]) * zoomFactor);
      }

      /**
       * Correct currZoomLevel and pan if they are
       * beyond minimum or maximum values.
       * With animation.
       *
       * @param {boolean=} ignoreGesture
       * Wether gesture coordinates should be ignored when calculating destination pan position.
       */
      correctZoomPan(ignoreGesture) {
        const { pswp } = this;
        const { currSlide } = pswp;

        if (!currSlide.isZoomable()) {
          return;
        }

        if (this._zoomPoint.x === undefined) {
          ignoreGesture = true;
        }

        const prevZoomLevel = currSlide.currZoomLevel;

        /** @type {number} */
        let destinationZoomLevel;
        let currZoomLevelNeedsChange = true;

        if (prevZoomLevel < currSlide.zoomLevels.initial) {
          destinationZoomLevel = currSlide.zoomLevels.initial;
          // zoom to min
        } else if (prevZoomLevel > currSlide.zoomLevels.max) {
          destinationZoomLevel = currSlide.zoomLevels.max;
          // zoom to max
        } else {
          currZoomLevelNeedsChange = false;
          destinationZoomLevel = prevZoomLevel;
        }

        const initialBgOpacity = pswp.bgOpacity;
        const restoreBgOpacity = pswp.bgOpacity < 1;

        const initialPan = equalizePoints({}, currSlide.pan);
        let destinationPan = equalizePoints({}, initialPan);

        if (ignoreGesture) {
          this._zoomPoint.x = 0;
          this._zoomPoint.y = 0;
          this._startZoomPoint.x = 0;
          this._startZoomPoint.y = 0;
          this._startZoomLevel = prevZoomLevel;
          equalizePoints(this._startPan, initialPan);
        }

        if (currZoomLevelNeedsChange) {
          destinationPan = {
            x: this._calculatePanForZoomLevel('x', destinationZoomLevel),
            y: this._calculatePanForZoomLevel('y', destinationZoomLevel)
          };
        }

        // set zoom level, so pan bounds are updated according to it
        currSlide.setZoomLevel(destinationZoomLevel);

        destinationPan = {
          x: currSlide.bounds.correctPan('x', destinationPan.x),
          y: currSlide.bounds.correctPan('y', destinationPan.y)
        };

        // return zoom level and its bounds to initial
        currSlide.setZoomLevel(prevZoomLevel);

        let panNeedsChange = true;
        if (pointsEqual(destinationPan, initialPan)) {
          panNeedsChange = false;
        }

        if (!panNeedsChange && !currZoomLevelNeedsChange && !restoreBgOpacity) {
          // update resolution after gesture
          currSlide._setResolution(destinationZoomLevel);
          currSlide.applyCurrentZoomPan();

          // nothing to animate
          return;
        }

        pswp.animations.stopAllPan();

        pswp.animations.startSpring({
          isPan: true,
          start: 0,
          end: 1000,
          velocity: 0,
          dampingRatio: 1,
          naturalFrequency: 40,
          onUpdate: (now) => {
            now /= 1000; // 0 - start, 1 - end

            if (panNeedsChange || currZoomLevelNeedsChange) {
              if (panNeedsChange) {
                currSlide.pan.x = initialPan.x + (destinationPan.x - initialPan.x) * now;
                currSlide.pan.y = initialPan.y + (destinationPan.y - initialPan.y) * now;
              }

              if (currZoomLevelNeedsChange) {
                const newZoomLevel = prevZoomLevel
                            + (destinationZoomLevel - prevZoomLevel) * now;
                currSlide.setZoomLevel(newZoomLevel);
              }

              currSlide.applyCurrentZoomPan();
            }

            // Restore background opacity
            if (restoreBgOpacity && pswp.bgOpacity < 1) {
              // We clamp opacity to keep it between 0 and 1.
              // As progress ratio can be larger than 1 due to overshoot,
              // and we do not want to bounce opacity.
              pswp.applyBgOpacity(clamp(
                initialBgOpacity + (1 - initialBgOpacity) * now, 0, 1
              ));
            }
          },
          onComplete: () => {
            // update resolution after transition ends
            currSlide._setResolution(destinationZoomLevel);
            currSlide.applyCurrentZoomPan();
          }
        });
      }
    }

    /**
     * @template T
     * @template P
     * @typedef {import('../types.js').AddPostfix<T, P>} AddPostfix<T, P>
     */

    /** @typedef {import('./gestures.js').default} Gestures */

    /** @typedef {'imageClick' | 'bgClick' | 'tap' | 'doubleTap'} Actions */
    /** @typedef {{ x?: number; y?: number }} Point */

    /**
     * Whether the tap was performed on the main slide
     * (rather than controls or caption).
     *
     * @param {PointerEvent} event
     */
    function didTapOnMainContent(event) {
      return !!(/** @type {HTMLElement} */ (event.target).closest('.pswp__container'));
    }

    /**
     * Tap, double-tap handler.
     */
    class TapHandler {
      /**
       * @param {Gestures} gestures
       */
      constructor(gestures) {
        this.gestures = gestures;
      }

      /**
       * @param {Point} point
       * @param {PointerEvent} originalEvent
       */
      click(point, originalEvent) {
        const targetClassList = /** @type {HTMLElement} */ (originalEvent.target).classList;
        const isImageClick = targetClassList.contains('pswp__img');
        const isBackgroundClick = targetClassList.contains('pswp__item')
                                  || targetClassList.contains('pswp__zoom-wrap');

        if (isImageClick) {
          this._doClickOrTapAction('imageClick', point, originalEvent);
        } else if (isBackgroundClick) {
          this._doClickOrTapAction('bgClick', point, originalEvent);
        }
      }

      /**
       * @param {Point} point
       * @param {PointerEvent} originalEvent
       */
      tap(point, originalEvent) {
        if (didTapOnMainContent(originalEvent)) {
          this._doClickOrTapAction('tap', point, originalEvent);
        }
      }

      /**
       * @param {Point} point
       * @param {PointerEvent} originalEvent
       */
      doubleTap(point, originalEvent) {
        if (didTapOnMainContent(originalEvent)) {
          this._doClickOrTapAction('doubleTap', point, originalEvent);
        }
      }

      /**
       * @param {Actions} actionName
       * @param {Point} point
       * @param {PointerEvent} originalEvent
       */
      _doClickOrTapAction(actionName, point, originalEvent) {
        const { pswp } = this.gestures;
        const { currSlide } = pswp;
        const actionFullName = /** @type {AddPostfix<Actions, 'Action'>} */ (actionName + 'Action');
        const optionValue = pswp.options[actionFullName];

        if (pswp.dispatch(actionFullName, { point, originalEvent }).defaultPrevented) {
          return;
        }

        if (typeof optionValue === 'function') {
          optionValue.call(pswp, point, originalEvent);
          return;
        }

        switch (optionValue) {
          case 'close':
          case 'next':
            pswp[optionValue]();
            break;
          case 'zoom':
            currSlide.toggleZoom(point);
            break;
          case 'zoom-or-close':
            // by default click zooms current image,
            // if it can not be zoomed - gallery will be closed
            if (currSlide.isZoomable()
                && currSlide.zoomLevels.secondary !== currSlide.zoomLevels.initial) {
              currSlide.toggleZoom(point);
            } else if (pswp.options.clickToCloseNonZoomable) {
              pswp.close();
            }
            break;
          case 'toggle-controls':
            this.gestures.pswp.element.classList.toggle('pswp--ui-visible');
            // if (_controlsVisible) {
            //   _ui.hideControls();
            // } else {
            //   _ui.showControls();
            // }
            break;
        }
      }
    }

    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../photoswipe.js').Point} Point */

    // How far should user should drag
    // until we can determine that the gesture is swipe and its direction
    const AXIS_SWIPE_HYSTERISIS = 10;
    //const PAN_END_FRICTION = 0.35;

    const DOUBLE_TAP_DELAY = 300; // ms
    const MIN_TAP_DISTANCE = 25; // px

    /**
     * Gestures class bind touch, pointer or mouse events
     * and emits drag to drag-handler and zoom events zoom-handler.
     *
     * Drag and zoom events are emited in requestAnimationFrame,
     * and only when one of pointers was actually changed.
     */
    class Gestures {
      /**
       * @param {PhotoSwipe} pswp
       */
      constructor(pswp) {
        this.pswp = pswp;

        /** @type {'x' | 'y'} */
        this.dragAxis = undefined;

        // point objects are defined once and reused
        // PhotoSwipe keeps track only of two pointers, others are ignored
        /** @type {Point} */
        this.p1 = {}; // the first pressed pointer
        /** @type {Point} */
        this.p2 = {}; // the second pressed pointer
        /** @type {Point} */
        this.prevP1 = {};
        /** @type {Point} */
        this.prevP2 = {};
        /** @type {Point} */
        this.startP1 = {};
        /** @type {Point} */
        this.startP2 = {};
        /** @type {Point} */
        this.velocity = {};

        /** @type {Point} */
        this._lastStartP1 = {};
        /** @type {Point} */
        this._intervalP1 = {};
        this._numActivePoints = 0;
        /** @type {Point[]} */
        this._ongoingPointers = [];

        this._touchEventEnabled = 'ontouchstart' in window;
        this._pointerEventEnabled = !!(window.PointerEvent);
        this.supportsTouch = this._touchEventEnabled
                              || (this._pointerEventEnabled && navigator.maxTouchPoints > 1);

        if (!this.supportsTouch) {
          // disable pan to next slide for non-touch devices
          pswp.options.allowPanToNext = false;
        }

        this.drag = new DragHandler(this);
        this.zoomLevels = new ZoomHandler(this);
        this.tapHandler = new TapHandler(this);

        pswp.on('bindEvents', () => {
          pswp.events.add(pswp.scrollWrap, 'click', e => this._onClick(e));

          if (this._pointerEventEnabled) {
            this._bindEvents('pointer', 'down', 'up', 'cancel');
          } else if (this._touchEventEnabled) {
            this._bindEvents('touch', 'start', 'end', 'cancel');

            // In previous versions we also bound mouse event here,
            // in case device supports both touch and mouse events,
            // but newer versions of browsers now support PointerEvent.

            // on iOS10 if you bind touchmove/end after touchstart,
            // and you don't preventDefault touchstart (which PhotoSwipe does),
            // preventDefault will have no effect on touchmove and touchend.
            // Unless you bind it previously.
            pswp.scrollWrap.ontouchmove = () => {}; // eslint-disable-line
            pswp.scrollWrap.ontouchend = () => {}; // eslint-disable-line
          } else {
            this._bindEvents('mouse', 'down', 'up');
          }
        });
      }

      /**
       *
       * @param {'mouse' | 'touch' | 'pointer'} pref
       * @param {'down' | 'start'} down
       * @param {'up' | 'end'} up
       * @param {'cancel'} [cancel]
       */
      _bindEvents(pref, down, up, cancel) {
        const { pswp } = this;
        const { events } = pswp;

        const cancelEvent = cancel ? pref + cancel : '';

        events.add(pswp.scrollWrap, pref + down, this.onPointerDown.bind(this));
        events.add(window, pref + 'move', this.onPointerMove.bind(this));
        events.add(window, pref + up, this.onPointerUp.bind(this));
        if (cancelEvent) {
          events.add(pswp.scrollWrap, cancelEvent, this.onPointerUp.bind(this));
        }
      }

      /**
       * @param {PointerEvent} e
       */
      onPointerDown(e) {
        // We do not call preventDefault for touch events
        // to allow browser to show native dialog on longpress
        // (the one that allows to save image or open it in new tab).
        //
        // Desktop Safari allows to drag images when preventDefault isn't called on mousedown,
        // even though preventDefault IS called on mousemove. That's why we preventDefault mousedown.
        let isMousePointer;
        if (e.type === 'mousedown' || e.pointerType === 'mouse') {
          isMousePointer = true;
        }

        // Allow dragging only via left mouse button.
        // http://www.quirksmode.org/js/events_properties.html
        // https://developer.mozilla.org/en-US/docs/Web/API/event.button
        if (isMousePointer && e.button > 0) {
          return;
        }

        const { pswp } = this;

        // if PhotoSwipe is opening or closing
        if (!pswp.opener.isOpen) {
          e.preventDefault();
          return;
        }

        if (pswp.dispatch('pointerDown', { originalEvent: e }).defaultPrevented) {
          return;
        }

        if (isMousePointer) {
          pswp.mouseDetected();

          // preventDefault mouse event to prevent
          // browser image drag feature
          this._preventPointerEventBehaviour(e);
        }

        pswp.animations.stopAll();

        this._updatePoints(e, 'down');

        this.pointerDown = true;

        if (this._numActivePoints === 1) {
          this.dragAxis = null;
          // we need to store initial point to determine the main axis,
          // drag is activated only after the axis is determined
          equalizePoints(this.startP1, this.p1);
        }

        if (this._numActivePoints > 1) {
          // Tap or double tap should not trigger if more than one pointer
          this._clearTapTimer();
          this.isMultitouch = true;
        } else {
          this.isMultitouch = false;
        }
      }

      /**
       * @param {PointerEvent} e
       */
      onPointerMove(e) {
        e.preventDefault(); // always preventDefault move event

        if (!this._numActivePoints) {
          return;
        }

        this._updatePoints(e, 'move');

        if (this.pswp.dispatch('pointerMove', { originalEvent: e }).defaultPrevented) {
          return;
        }

        if (this._numActivePoints === 1 && !this.isDragging) {
          if (!this.dragAxis) {
            this._calculateDragDirection();
          }

          // Drag axis was detected, emit drag.start
          if (this.dragAxis && !this.isDragging) {
            if (this.isZooming) {
              this.isZooming = false;
              this.zoomLevels.end();
            }

            this.isDragging = true;
            this._clearTapTimer(); // Tap can not trigger after drag

            // Adjust starting point
            this._updateStartPoints();
            this._intervalTime = Date.now();
            //this._startTime = this._intervalTime;
            this._velocityCalculated = false;
            equalizePoints(this._intervalP1, this.p1);
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.drag.start();

            this._rafStopLoop();
            this._rafRenderLoop();
          }
        } else if (this._numActivePoints > 1 && !this.isZooming) {
          this._finishDrag();

          this.isZooming = true;

          // Adjust starting points
          this._updateStartPoints();

          this.zoomLevels.start();

          this._rafStopLoop();
          this._rafRenderLoop();
        }
      }

      /**
       * @private
       */
      _finishDrag() {
        if (this.isDragging) {
          this.isDragging = false;

          // Try to calculate velocity,
          // if it wasn't calculated yet in drag.change
          if (!this._velocityCalculated) {
            this._updateVelocity(true);
          }

          this.drag.end();
          this.dragAxis = null;
        }
      }

      /**
       * @param {PointerEvent} e
       */
      onPointerUp(e) {
        if (!this._numActivePoints) {
          return;
        }

        this._updatePoints(e, 'up');

        if (this.pswp.dispatch('pointerUp', { originalEvent: e }).defaultPrevented) {
          return;
        }

        if (this._numActivePoints === 0) {
          this.pointerDown = false;
          this._rafStopLoop();

          if (this.isDragging) {
            this._finishDrag();
          } else if (!this.isZooming && !this.isMultitouch) {
            //this.zoomLevels.correctZoomPan();
            this._finishTap(e);
          }
        }

        if (this._numActivePoints < 2 && this.isZooming) {
          this.isZooming = false;
          this.zoomLevels.end();

          if (this._numActivePoints === 1) {
            // Since we have 1 point left, we need to reinitiate drag
            this.dragAxis = null;
            this._updateStartPoints();
          }
        }
      }

      /**
       * @private
       */
      _rafRenderLoop() {
        if (this.isDragging || this.isZooming) {
          this._updateVelocity();

          if (this.isDragging) {
            // make sure that pointer moved since the last update
            if (!pointsEqual(this.p1, this.prevP1)) {
              this.drag.change();
            }
          } else /* if (this.isZooming) */ {
            if (!pointsEqual(this.p1, this.prevP1)
                || !pointsEqual(this.p2, this.prevP2)) {
              this.zoomLevels.change();
            }
          }

          this._updatePrevPoints();
          this.raf = requestAnimationFrame(this._rafRenderLoop.bind(this));
        }
      }

      /**
       * Update velocity at 50ms interval
       *
       * @param {boolean=} force
       */
      _updateVelocity(force) {
        const time = Date.now();
        const duration = time - this._intervalTime;

        if (duration < 50 && !force) {
          return;
        }


        this.velocity.x = this._getVelocity('x', duration);
        this.velocity.y = this._getVelocity('y', duration);

        this._intervalTime = time;
        equalizePoints(this._intervalP1, this.p1);
        this._velocityCalculated = true;
      }

      /**
       * @private
       * @param {PointerEvent} e
       */
      _finishTap(e) {
        const { mainScroll } = this.pswp;

        // Do not trigger tap events if main scroll is shifted
        if (mainScroll.isShifted()) {
          // restore main scroll position
          // (usually happens if stopped in the middle of animation)
          mainScroll.moveIndexBy(0, true);
          return;
        }

        // Do not trigger tap for touchcancel or pointercancel
        if (e.type.indexOf('cancel') > 0) {
          return;
        }

        // Trigger click instead of tap for mouse events
        if (e.type === 'mouseup' || e.pointerType === 'mouse') {
          this.tapHandler.click(this.startP1, e);
          return;
        }

        // Disable delay if there is no doubleTapAction
        const tapDelay = this.pswp.options.doubleTapAction ? DOUBLE_TAP_DELAY : 0;

        // If tapTimer is defined - we tapped recently,
        // check if the current tap is close to the previous one,
        // if yes - trigger double tap
        if (this._tapTimer) {
          this._clearTapTimer();
          // Check if two taps were more or less on the same place
          if (getDistanceBetween(this._lastStartP1, this.startP1) < MIN_TAP_DISTANCE) {
            this.tapHandler.doubleTap(this.startP1, e);
          }
        } else {
          equalizePoints(this._lastStartP1, this.startP1);
          this._tapTimer = setTimeout(() => {
            this.tapHandler.tap(this.startP1, e);
            this._clearTapTimer();
          }, tapDelay);
        }
      }

      /**
       * @private
       */
      _clearTapTimer() {
        if (this._tapTimer) {
          clearTimeout(this._tapTimer);
          this._tapTimer = null;
        }
      }

      /**
       * Get velocity for axis
       *
       * @private
       * @param {'x' | 'y'} axis
       * @param {number} duration
       */
      _getVelocity(axis, duration) {
        // displacement is like distance, but can be negative.
        const displacement = this.p1[axis] - this._intervalP1[axis];

        if (Math.abs(displacement) > 1 && duration > 5) {
          return displacement / duration;
        }

        return 0;
      }

      /**
       * @private
       */
      _rafStopLoop() {
        if (this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = null;
        }
      }

      /**
       * @private
       * @param {PointerEvent} e
       */
      _preventPointerEventBehaviour(e) {
        // TODO find a way to disable e.preventDefault on some elements
        //      via event or some class or something
        e.preventDefault();
        return true;
      }

      /**
       * Parses and normalizes points from the touch, mouse or pointer event.
       * Updates p1 and p2.
       *
       * @private
       * @param {PointerEvent | TouchEvent} e
       * @param {'up' | 'down' | 'move'} pointerType Normalized pointer type
       */
      _updatePoints(e, pointerType) {
        if (this._pointerEventEnabled) {
          const pointerEvent = /** @type {PointerEvent} */ (e);
          // Try to find the current pointer in ongoing pointers by its ID
          const pointerIndex = this._ongoingPointers.findIndex((ongoingPoiner) => {
            return ongoingPoiner.id === pointerEvent.pointerId;
          });

          if (pointerType === 'up' && pointerIndex > -1) {
            // release the pointer - remove it from ongoing
            this._ongoingPointers.splice(pointerIndex, 1);
          } else if (pointerType === 'down' && pointerIndex === -1) {
            // add new pointer
            this._ongoingPointers.push(this._convertEventPosToPoint(pointerEvent, {}));
          } else if (pointerIndex > -1) {
            // update existing pointer
            this._convertEventPosToPoint(pointerEvent, this._ongoingPointers[pointerIndex]);
          }

          this._numActivePoints = this._ongoingPointers.length;

          // update points that PhotoSwipe uses
          // to calculate position and scale
          if (this._numActivePoints > 0) {
            equalizePoints(this.p1, this._ongoingPointers[0]);
          }

          if (this._numActivePoints > 1) {
            equalizePoints(this.p2, this._ongoingPointers[1]);
          }
        } else {
          const touchEvent = /** @type {TouchEvent} */ (e);

          this._numActivePoints = 0;
          if (touchEvent.type.indexOf('touch') > -1) {
            // Touch Event
            // https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
            if (touchEvent.touches && touchEvent.touches.length > 0) {
              this._convertEventPosToPoint(touchEvent.touches[0], this.p1);
              this._numActivePoints++;
              if (touchEvent.touches.length > 1) {
                this._convertEventPosToPoint(touchEvent.touches[1], this.p2);
                this._numActivePoints++;
              }
            }
          } else {
            // Mouse Event
            this._convertEventPosToPoint(/** @type {PointerEvent} */ (e), this.p1);
            if (pointerType === 'up') {
              // clear all points on mouseup
              this._numActivePoints = 0;
            } else {
              this._numActivePoints++;
            }
          }
        }
      }

      // update points that were used during previous rAF tick
      _updatePrevPoints() {
        equalizePoints(this.prevP1, this.p1);
        equalizePoints(this.prevP2, this.p2);
      }

      // update points at the start of gesture
      _updateStartPoints() {
        equalizePoints(this.startP1, this.p1);
        equalizePoints(this.startP2, this.p2);
        this._updatePrevPoints();
      }

      _calculateDragDirection() {
        if (this.pswp.mainScroll.isShifted()) {
          // if main scroll position is shifted – direction is always horizontal
          this.dragAxis = 'x';
        } else {
          // calculate delta of the last touchmove tick
          const diff = Math.abs(this.p1.x - this.startP1.x) - Math.abs(this.p1.y - this.startP1.y);

          if (diff !== 0) {
            // check if pointer was shifted horizontally or vertically
            const axisToCheck = diff > 0 ? 'x' : 'y';

            if (Math.abs(this.p1[axisToCheck] - this.startP1[axisToCheck]) >= AXIS_SWIPE_HYSTERISIS) {
              this.dragAxis = axisToCheck;
            }
          }
        }
      }

      /**
       * Converts touch, pointer or mouse event
       * to PhotoSwipe point.
       *
       * @private
       * @param {Touch | PointerEvent} e
       * @param {Point} p
       */
      _convertEventPosToPoint(e, p) {
        p.x = e.pageX - this.pswp.offset.x;
        p.y = e.pageY - this.pswp.offset.y;

        if ('pointerId' in e) {
          p.id = e.pointerId;
        } else if (e.identifier !== undefined) {
          p.id = e.identifier;
        }

        return p;
      }

      /**
       * @private
       * @param {PointerEvent} e
       */
      _onClick(e) {
        // Do not allow click event to pass through after drag
        if (this.pswp.mainScroll.isShifted()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }

    /** @typedef {import('./photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('./slide/slide.js').default} Slide */

    /** @typedef {{ el: HTMLDivElement; slide?: Slide }} ItemHolder */

    const MAIN_SCROLL_END_FRICTION = 0.35;


    // const MIN_SWIPE_TRANSITION_DURATION = 250;
    // const MAX_SWIPE_TRABSITION_DURATION = 500;
    // const DEFAULT_SWIPE_TRANSITION_DURATION = 333;

    /**
     * Handles movement of the main scrolling container
     * (for example, it repositions when user swipes left or right).
     *
     * Also stores its state.
     */
    class MainScroll {
      /**
       * @param {PhotoSwipe} pswp
       */
      constructor(pswp) {
        this.pswp = pswp;
        this.x = 0;

        /** @type {number} */
        this.slideWidth = undefined;

        /** @type {ItemHolder[]} */
        this.itemHolders = undefined;

        this.resetPosition();
      }

      /**
       * Position the scroller and slide containers
       * according to viewport size.
       *
       * @param {boolean=} resizeSlides Whether slides content should resized
       */
      resize(resizeSlides) {
        const { pswp } = this;
        const newSlideWidth = Math.round(
          pswp.viewportSize.x + pswp.viewportSize.x * pswp.options.spacing
        );
        // Mobile browsers might trigger a resize event during a gesture.
        // (due to toolbar appearing or hiding).
        // Avoid re-adjusting main scroll position if width wasn't changed
        const slideWidthChanged = (newSlideWidth !== this.slideWidth);

        if (slideWidthChanged) {
          this.slideWidth = newSlideWidth;
          this.moveTo(this.getCurrSlideX());
        }

        this.itemHolders.forEach((itemHolder, index) => {
          if (slideWidthChanged) {
            setTransform(itemHolder.el, (index + this._containerShiftIndex)
                                        * this.slideWidth);
          }

          if (resizeSlides && itemHolder.slide) {
            itemHolder.slide.resize();
          }
        });
      }

      /**
       * Reset X position of the main scroller to zero
       */
      resetPosition() {
        // Position on the main scroller (offset)
        // it is independent from slide index
        this._currPositionIndex = 0;
        this._prevPositionIndex = 0;

        // This will force recalculation of size on next resize()
        this.slideWidth = 0;

        // _containerShiftIndex*viewportSize will give you amount of transform of the current slide
        this._containerShiftIndex = -1;
      }

      /**
       * Create and append array of three items
       * that hold data about slides in DOM
       */
      appendHolders() {
        this.itemHolders = [];

        // append our three slide holders -
        // previous, current, and next
        for (let i = 0; i < 3; i++) {
          const el = createElement('pswp__item', false, this.pswp.container);

          // hide nearby item holders until initial zoom animation finishes (to avoid extra Paints)
          el.style.display = (i === 1) ? 'block' : 'none';

          this.itemHolders.push({
            el,
            //index: -1
          });
        }
      }

      /**
       * Whether the main scroll can be horizontally swiped to the next or previous slide.
       */
      canBeSwiped() {
        return this.pswp.getNumItems() > 1;
      }

      /**
       * Move main scroll by X amount of slides.
       * For example:
       *   `-1` will move to the previous slide,
       *    `0` will reset the scroll position of the current slide,
       *    `3` will move three slides forward
       *
       * If loop option is enabled - index will be automatically looped too,
       * (for example `-1` will move to the last slide of the gallery).
       *
       * @param {number} diff
       * @param {boolean=} animate
       * @param {number=} velocityX
       * @returns {boolean} whether index was changed or not
       */
      moveIndexBy(diff, animate, velocityX) {
        const { pswp } = this;
        let newIndex = pswp.potentialIndex + diff;
        const numSlides = pswp.getNumItems();

        if (pswp.canLoop()) {
          newIndex = pswp.getLoopedIndex(newIndex);
          const distance = (diff + numSlides) % numSlides;
          if (distance <= numSlides / 2) {
            // go forward
            diff = distance;
          } else {
            // go backwards
            diff = distance - numSlides;
          }
        } else {
          if (newIndex < 0) {
            newIndex = 0;
          } else if (newIndex >= numSlides) {
            newIndex = numSlides - 1;
          }
          diff = newIndex - pswp.potentialIndex;
        }

        pswp.potentialIndex = newIndex;
        this._currPositionIndex -= diff;

        pswp.animations.stopMainScroll();

        const destinationX = this.getCurrSlideX();
        if (!animate) {
          this.moveTo(destinationX);
          this.updateCurrItem();
        } else {
          pswp.animations.startSpring({
            isMainScroll: true,
            start: this.x,
            end: destinationX,
            velocity: velocityX || 0,
            naturalFrequency: 30,
            dampingRatio: 1, //0.7,
            onUpdate: (x) => {
              this.moveTo(x);
            },
            onComplete: () => {
              this.updateCurrItem();
              pswp.appendHeavy();
            }
          });

          let currDiff = pswp.potentialIndex - pswp.currIndex;
          if (pswp.canLoop()) {
            const currDistance = (currDiff + numSlides) % numSlides;
            if (currDistance <= numSlides / 2) {
              // go forward
              currDiff = currDistance;
            } else {
              // go backwards
              currDiff = currDistance - numSlides;
            }
          }

          // Force-append new slides during transition
          // if difference between slides is more than 1
          if (Math.abs(currDiff) > 1) {
            this.updateCurrItem();
          }
        }

        if (diff) {
          return true;
        }
      }

      /**
       * X position of the main scroll for the current slide
       * (ignores position during dragging)
       */
      getCurrSlideX() {
        return this.slideWidth * this._currPositionIndex;
      }

      /**
       * Whether scroll position is shifted.
       * For example, it will return true if the scroll is being dragged or animated.
       */
      isShifted() {
        return this.x !== this.getCurrSlideX();
      }

      /**
       * Update slides X positions and set their content
       */
      updateCurrItem() {
        const { pswp } = this;
        const positionDifference = this._prevPositionIndex - this._currPositionIndex;

        if (!positionDifference) {
          return;
        }

        this._prevPositionIndex = this._currPositionIndex;

        pswp.currIndex = pswp.potentialIndex;

        let diffAbs = Math.abs(positionDifference);
        let tempHolder;

        if (diffAbs >= 3) {
          this._containerShiftIndex += positionDifference + (positionDifference > 0 ? -3 : 3);
          diffAbs = 3;
        }

        for (let i = 0; i < diffAbs; i++) {
          if (positionDifference > 0) {
            tempHolder = this.itemHolders.shift();
            this.itemHolders[2] = tempHolder; // move first to last

            this._containerShiftIndex++;

            setTransform(tempHolder.el, (this._containerShiftIndex + 2) * this.slideWidth);

            pswp.setContent(tempHolder, (pswp.currIndex - diffAbs) + i + 2);
          } else {
            tempHolder = this.itemHolders.pop();
            this.itemHolders.unshift(tempHolder); // move last to first

            this._containerShiftIndex--;

            setTransform(tempHolder.el, this._containerShiftIndex * this.slideWidth);

            pswp.setContent(tempHolder, (pswp.currIndex + diffAbs) - i - 2);
          }
        }

        // Reset transfrom every 50ish navigations in one direction.
        //
        // Otherwise transform will keep growing indefinitely,
        // which might cause issues as browsers have a maximum transform limit.
        // I wasn't able to reach it, but just to be safe.
        // This should not cause noticable lag.
        if (Math.abs(this._containerShiftIndex) > 50 && !this.isShifted()) {
          this.resetPosition();
          this.resize();
        }

        // Pan transition might be running (and consntantly updating pan position)
        pswp.animations.stopAllPan();

        this.itemHolders.forEach((itemHolder, i) => {
          if (itemHolder.slide) {
            // Slide in the 2nd holder is always active
            itemHolder.slide.setIsActive(i === 1);
          }
        });

        pswp.currSlide = this.itemHolders[1].slide;
        pswp.contentLoader.updateLazy(positionDifference);

        if (pswp.currSlide) {
          pswp.currSlide.applyCurrentZoomPan();
        }

        pswp.dispatch('change');
      }

      /**
       * Move the X position of the main scroll container
       *
       * @param {number} x
       * @param {boolean=} dragging
       */
      moveTo(x, dragging) {
        /** @type {number} */
        let newSlideIndexOffset;
        /** @type {number} */
        let delta;

        if (!this.pswp.canLoop() && dragging) {
          // Apply friction
          newSlideIndexOffset = ((this.slideWidth * this._currPositionIndex) - x) / this.slideWidth;
          newSlideIndexOffset += this.pswp.currIndex;
          delta = Math.round(x - this.x);

          if ((newSlideIndexOffset < 0 && delta > 0)
              || (newSlideIndexOffset >= this.pswp.getNumItems() - 1 && delta < 0)) {
            x = this.x + (delta * MAIN_SCROLL_END_FRICTION);
          }
        }

        this.x = x;
        setTransform(this.pswp.container, x);

        this.pswp.dispatch('moveMainScroll', { x, dragging });
      }
    }

    /** @typedef {import('./photoswipe.js').default} PhotoSwipe */

    /**
     * @template T
     * @typedef {import('./types.js').Methods<T>} Methods<T>
     */

    /**
     * - Manages keyboard shortcuts.
     * - Heps trap focus within photoswipe.
     */
    class Keyboard {
      /**
       * @param {PhotoSwipe} pswp
       */
      constructor(pswp) {
        this.pswp = pswp;

        pswp.on('bindEvents', () => {
          // Dialog was likely opened by keyboard if initial point is not defined
          if (!pswp.options.initialPointerPos) {
            // focus causes layout,
            // which causes lag during the animation,
            // that's why we delay it until the opener transition ends
            this._focusRoot();
          }

          pswp.events.add(document, 'focusin', this._onFocusIn.bind(this));
          pswp.events.add(document, 'keydown', this._onKeyDown.bind(this));
        });

        const lastActiveElement = /** @type {HTMLElement} */ (document.activeElement);
        pswp.on('destroy', () => {
          if (pswp.options.returnFocus
              && lastActiveElement
              && this._wasFocused) {
            lastActiveElement.focus();
          }
        });
      }

      _focusRoot() {
        if (!this._wasFocused) {
          this.pswp.element.focus();
          this._wasFocused = true;
        }
      }

      /**
       * @param {KeyboardEvent} e
       */
      _onKeyDown(e) {
        const { pswp } = this;

        if (pswp.dispatch('keydown', { originalEvent: e }).defaultPrevented) {
          return;
        }

        if (specialKeyUsed(e)) {
          // don't do anything if special key pressed
          // to prevent from overriding default browser actions
          // for example, in Chrome on Mac cmd+arrow-left returns to previous page
          return;
        }

        /** @type {Methods<PhotoSwipe>} */
        let keydownAction;
        /** @type {'x' | 'y'} */
        let axis;
        let isForward;

        switch (e.keyCode) {
          case 27: // esc
            if (pswp.options.escKey) {
              keydownAction = 'close';
            }
            break;
          case 90: // z key
            keydownAction = 'toggleZoom';
            break;
          case 37: // left
            axis = 'x';
            break;
          case 38: // top
            axis = 'y';
            break;
          case 39: // right
            axis = 'x';
            isForward = true;
            break;
          case 40: // bottom
            isForward = true;
            axis = 'y';
            break;
          case 9: // tab
            this._focusRoot();
            break;
        }

        // if left/right/top/bottom key
        if (axis) {
          // prevent page scroll
          e.preventDefault();

          const { currSlide } = pswp;

          if (pswp.options.arrowKeys
              && axis === 'x'
              && pswp.getNumItems() > 1) {
            keydownAction = isForward ? 'next' : 'prev';
          } else if (currSlide && currSlide.currZoomLevel > currSlide.zoomLevels.fit) {
            // up/down arrow keys pan the image vertically
            // left/right arrow keys pan horizontally.
            // Unless there is only one image,
            // or arrowKeys option is disabled
            currSlide.pan[axis] += isForward ? -80 : 80;
            currSlide.panTo(currSlide.pan.x, currSlide.pan.y);
          }
        }

        if (keydownAction) {
          e.preventDefault();
          pswp[keydownAction]();
        }
      }

      /**
       * Trap focus inside photoswipe
       *
       * @param {FocusEvent} e
       */
      _onFocusIn(e) {
        const { template } = this.pswp;
        if (document !== e.target
            && template !== e.target
            && !template.contains(/** @type {Node} */ (e.target))) {
          // focus root element
          template.focus();
        }
      }
    }

    const DEFAULT_EASING = 'cubic-bezier(.4,0,.22,1)';

    /** @typedef {import('./animations.js').AnimationProps} AnimationProps */

    /**
     * Runs CSS transition.
     */
    class CSSAnimation {
      /**
       * onComplete can be unpredictable, be careful about current state
       *
       * @param {AnimationProps} props
       */
      constructor(props) {
        this.props = props;
        const {
          target,
          onComplete,
          transform,
          onFinish
          // opacity
        } = props;

        let {
          duration,
          easing,
        } = props;

        /** @type {() => void} */
        this.onFinish = onFinish;

        // support only transform and opacity
        const prop = transform ? 'transform' : 'opacity';
        const propValue = props[prop];

        /** @private */
        this._target = target;
        /** @private */
        this._onComplete = onComplete;

        duration = duration || 333;
        easing = easing || DEFAULT_EASING;

        /** @private */
        this._onTransitionEnd = this._onTransitionEnd.bind(this);

        // Using timeout hack to make sure that animation
        // starts even if the animated property was changed recently,
        // otherwise transitionend might not fire or transiton won't start.
        // https://drafts.csswg.org/css-transitions/#starting
        //
        // ¯\_(ツ)_/¯
        /** @private */
        this._helperTimeout = setTimeout(() => {
          setTransitionStyle(target, prop, duration, easing);
          this._helperTimeout = setTimeout(() => {
            target.addEventListener('transitionend', this._onTransitionEnd, false);
            target.addEventListener('transitioncancel', this._onTransitionEnd, false);

            // Safari occasionally does not emit transitionend event
            // if element propery was modified during the transition,
            // which may be caused by resize or third party component,
            // using timeout as a safety fallback
            this._helperTimeout = setTimeout(() => {
              this._finalizeAnimation();
            }, duration + 500);
            target.style[prop] = propValue;
          }, 30); // Do not reduce this number
        }, 0);
      }

      /**
       * @private
       * @param {TransitionEvent} e
       */
      _onTransitionEnd(e) {
        if (e.target === this._target) {
          this._finalizeAnimation();
        }
      }

      /**
       * @private
       */
      _finalizeAnimation() {
        if (!this._finished) {
          this._finished = true;
          this.onFinish();
          if (this._onComplete) {
            this._onComplete();
          }
        }
      }

      // Destroy is called automatically onFinish
      destroy() {
        if (this._helperTimeout) {
          clearTimeout(this._helperTimeout);
        }
        removeTransitionStyle(this._target);
        this._target.removeEventListener('transitionend', this._onTransitionEnd, false);
        this._target.removeEventListener('transitioncancel', this._onTransitionEnd, false);
        if (!this._finished) {
          this._finalizeAnimation();
        }
      }
    }

    const DEFAULT_NATURAL_FREQUENCY = 12;
    const DEFAULT_DAMPING_RATIO = 0.75;

    /**
     * Spring easing helper
     */
    class SpringEaser {
      /**
       * @param {number} initialVelocity Initial velocity, px per ms.
       *
       * @param {number} dampingRatio
       * Determines how bouncy animation will be.
       * From 0 to 1, 0 - always overshoot, 1 - do not overshoot.
       * "overshoot" refers to part of animation that
       * goes beyond the final value.
       *
       * @param {number} naturalFrequency
       * Determines how fast animation will slow down.
       * The higher value - the stiffer the transition will be,
       * and the faster it will slow down.
       * Recommended value from 10 to 50
       */
      constructor(initialVelocity, dampingRatio, naturalFrequency) {
        this.velocity = initialVelocity * 1000; // convert to "pixels per second"

        // https://en.wikipedia.org/wiki/Damping_ratio
        this._dampingRatio = dampingRatio || DEFAULT_DAMPING_RATIO;

        // https://en.wikipedia.org/wiki/Natural_frequency
        this._naturalFrequency = naturalFrequency || DEFAULT_NATURAL_FREQUENCY;

        if (this._dampingRatio < 1) {
          this._dampedFrequency = this._naturalFrequency
                             * Math.sqrt(1 - this._dampingRatio * this._dampingRatio);
        }
      }

      /**
       * @param {number} deltaPosition Difference between current and end position of the animation
       * @param {number} deltaTime Frame duration in milliseconds
       *
       * @returns {number} Displacement, relative to the end position.
       */
      easeFrame(deltaPosition, deltaTime) {
        // Inspired by Apple Webkit and Android spring function implementation
        // https://en.wikipedia.org/wiki/Oscillation
        // https://en.wikipedia.org/wiki/Damping_ratio
        // we ignore mass (assume that it's 1kg)

        let displacement = 0;
        let coeff;

        deltaTime /= 1000;

        const naturalDumpingPow = Math.E ** (-this._dampingRatio * this._naturalFrequency * deltaTime);

        if (this._dampingRatio === 1) {
          coeff = this.velocity + this._naturalFrequency * deltaPosition;

          displacement = (deltaPosition + coeff * deltaTime) * naturalDumpingPow;

          this.velocity = displacement
                            * (-this._naturalFrequency) + coeff
                            * naturalDumpingPow;
        } else if (this._dampingRatio < 1) {
          coeff = (1 / this._dampedFrequency)
                    * (this._dampingRatio * this._naturalFrequency * deltaPosition + this.velocity);

          const dumpedFCos = Math.cos(this._dampedFrequency * deltaTime);
          const dumpedFSin = Math.sin(this._dampedFrequency * deltaTime);

          displacement = naturalDumpingPow
                           * (deltaPosition * dumpedFCos + coeff * dumpedFSin);

          this.velocity = displacement
                            * (-this._naturalFrequency)
                            * this._dampingRatio
                            + naturalDumpingPow
                            * (-this._dampedFrequency * deltaPosition * dumpedFSin
                            + this._dampedFrequency * coeff * dumpedFCos);
        }

        // Overdamped (>1) damping ratio is not supported

        return displacement;
      }
    }

    /** @typedef {import('./animations.js').AnimationProps} AnimationProps */

    class SpringAnimation {
      /**
       * @param {AnimationProps} props
       */
      constructor(props) {
        this.props = props;

        const {
          start,
          end,
          velocity,
          onUpdate,
          onComplete,
          onFinish,
          dampingRatio,
          naturalFrequency
        } = props;

        /** @type {() => void} */
        this.onFinish = onFinish;

        const easer = new SpringEaser(velocity, dampingRatio, naturalFrequency);
        let prevTime = Date.now();
        let deltaPosition = start - end;

        const animationLoop = () => {
          if (this._raf) {
            deltaPosition = easer.easeFrame(deltaPosition, Date.now() - prevTime);

            // Stop the animation if velocity is low and position is close to end
            if (Math.abs(deltaPosition) < 1 && Math.abs(easer.velocity) < 50) {
              // Finalize the animation
              onUpdate(end);
              if (onComplete) {
                onComplete();
              }
              this.onFinish();
            } else {
              prevTime = Date.now();
              onUpdate(deltaPosition + end);
              this._raf = requestAnimationFrame(animationLoop);
            }
          }
        };

        this._raf = requestAnimationFrame(animationLoop);
      }

      // Destroy is called automatically onFinish
      destroy() {
        if (this._raf >= 0) {
          cancelAnimationFrame(this._raf);
        }
        this._raf = null;
      }
    }

    /** @typedef {SpringAnimation | CSSAnimation} Animation */

    /**
     * @typedef {Object} AnimationProps
     *
     * @prop {HTMLElement=} target
     *
     * @prop {string=} name
     *
     * @prop {number=} start
     * @prop {number=} end
     * @prop {number=} duration
     * @prop {number=} velocity
     * @prop {number=} dampingRatio
     * @prop {number=} naturalFrequency
     *
     * @prop {(end: number) => void} [onUpdate]
     * @prop {() => void} [onComplete]
     * @prop {() => void} [onFinish]
     *
     * @prop {string=} transform
     * @prop {string=} opacity
     * @prop {string=} easing
     *
     * @prop {boolean=} isPan
     * @prop {boolean=} isMainScroll
     */

    /**
     * Manages animations
     */
    class Animations {
      constructor() {
        /** @type {Animation[]} */
        this.activeAnimations = [];
      }

      /**
       * @param {AnimationProps} props
       */
      startSpring(props) {
        this._start(props, true);
      }

      /**
       * @param {AnimationProps} props
       */
      startTransition(props) {
        this._start(props);
      }

      /**
       * @param {AnimationProps} props
       * @param {boolean=} isSpring
       */
      _start(props, isSpring) {
        /** @type {Animation} */
        let animation;
        if (isSpring) {
          animation = new SpringAnimation(props);
        } else {
          animation = new CSSAnimation(props);
        }

        this.activeAnimations.push(animation);
        animation.onFinish = () => this.stop(animation);

        return animation;
      }

      /**
       * @param {Animation} animation
       */
      stop(animation) {
        animation.destroy();
        const index = this.activeAnimations.indexOf(animation);
        if (index > -1) {
          this.activeAnimations.splice(index, 1);
        }
      }

      stopAll() { // _stopAllAnimations
        this.activeAnimations.forEach((animation) => {
          animation.destroy();
        });
        this.activeAnimations = [];
      }

      /**
       * Stop all pan or zoom transitions
       */
      stopAllPan() {
        this.activeAnimations = this.activeAnimations.filter((animation) => {
          if (animation.props.isPan) {
            animation.destroy();
            return false;
          }

          return true;
        });
      }

      stopMainScroll() {
        this.activeAnimations = this.activeAnimations.filter((animation) => {
          if (animation.props.isMainScroll) {
            animation.destroy();
            return false;
          }

          return true;
        });
      }

      /**
       * Returns true if main scroll transition is running
       */
      // isMainScrollRunning() {
      //   return this.activeAnimations.some((animation) => {
      //     return animation.props.isMainScroll;
      //   });
      // }

      /**
       * Returns true if any pan or zoom transition is running
       */
      isPanRunning() {
        return this.activeAnimations.some((animation) => {
          return animation.props.isPan;
        });
      }
    }

    /** @typedef {import('./photoswipe.js').default} PhotoSwipe */

    /**
     * Handles scroll wheel.
     * Can pan and zoom current slide image.
     */
    class ScrollWheel {
      /**
       * @param {PhotoSwipe} pswp
       */
      constructor(pswp) {
        this.pswp = pswp;
        pswp.events.add(pswp.element, 'wheel', this._onWheel.bind(this));
      }

      /**
       * @private
       * @param {WheelEvent} e
       */
      _onWheel(e) {
        e.preventDefault();
        const { currSlide } = this.pswp;
        let { deltaX, deltaY } = e;

        if (!currSlide) {
          return;
        }

        if (this.pswp.dispatch('wheel', { originalEvent: e }).defaultPrevented) {
          return;
        }

        if (e.ctrlKey || this.pswp.options.wheelToZoom) {
          // zoom
          if (currSlide.isZoomable()) {
            let zoomFactor = -deltaY;
            if (e.deltaMode === 1 /* DOM_DELTA_LINE */) {
              zoomFactor *= 0.05;
            } else {
              zoomFactor *= e.deltaMode ? 1 : 0.002;
            }
            zoomFactor = 2 ** zoomFactor;

            const destZoomLevel = currSlide.currZoomLevel * zoomFactor;
            currSlide.zoomTo(destZoomLevel, {
              x: e.clientX,
              y: e.clientY
            });
          }
        } else {
          // pan
          if (currSlide.isPannable()) {
            if (e.deltaMode === 1 /* DOM_DELTA_LINE */) {
              // 18 - average line height
              deltaX *= 18;
              deltaY *= 18;
            }

            currSlide.panTo(
              currSlide.pan.x - deltaX,
              currSlide.pan.y - deltaY
            );
          }
        }
      }
    }

    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */

    /**
     * @template T
     * @typedef {import('../types.js').Methods<T>} Methods<T>
     */

    /**
     * @typedef {Object} UIElementMarkupProps
     * @prop {boolean=} isCustomSVG
     * @prop {string} inner
     * @prop {string=} outlineID
     * @prop {number | string} [size]
     */

    /**
     * @typedef {Object} UIElementData
     * @prop {DefaultUIElements | string} [name]
     * @prop {string=} className
     * @prop {UIElementMarkup=} html
     * @prop {boolean=} isButton
     * @prop {keyof HTMLElementTagNameMap} [tagName]
     * @prop {string=} title
     * @prop {string=} ariaLabel
     * @prop {(element: HTMLElement, pswp: PhotoSwipe) => void} [onInit]
     * @prop {Methods<PhotoSwipe> | ((e: MouseEvent, element: HTMLElement, pswp: PhotoSwipe) => void)} [onClick]
     * @prop {'bar' | 'wrapper' | 'root'} [appendTo]
     * @prop {number=} order
     */

    /** @typedef {'arrowPrev' | 'arrowNext' | 'close' | 'zoom' | 'counter'} DefaultUIElements */

    /** @typedef {string | UIElementMarkupProps} UIElementMarkup */

    /**
     * @param {UIElementMarkup} [htmlData]
     */
    function addElementHTML(htmlData) {
      if (typeof htmlData === 'string') {
        // Allow developers to provide full svg,
        // For example:
        // <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" class="pswp__icn">
        //   <path d="..." />
        //   <circle ... />
        // </svg>
        // Can also be any HTML string.
        return htmlData;
      }

      if (!htmlData || !htmlData.isCustomSVG) {
        return '';
      }

      const svgData = htmlData;
      let out = '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 %d %d" width="%d" height="%d">';
      // replace all %d with size
      out = out.split('%d').join(/** @type {string} */ (svgData.size || 32));

      // Icons may contain outline/shadow,
      // to make it we "clone" base icon shape and add border to it.
      // Icon itself and border are styled via CSS.
      //
      // Property shadowID defines ID of element that should be cloned.
      if (svgData.outlineID) {
        out += '<use class="pswp__icn-shadow" xlink:href="#' + svgData.outlineID + '"/>';
      }

      out += svgData.inner;

      out += '</svg>';

      return out;
    }

    class UIElement {
      /**
       * @param {PhotoSwipe} pswp
       * @param {UIElementData} data
       */
      constructor(pswp, data) {
        const name = data.name || data.className;
        let elementHTML = data.html;

        // @ts-expect-error lookup only by `data.name` maybe?
        if (pswp.options[name] === false) {
          // exit if element is disabled from options
          return;
        }

        // Allow to override SVG icons from options
        // @ts-expect-error lookup only by `data.name` maybe?
        if (typeof pswp.options[name + 'SVG'] === 'string') {
          // arrowPrevSVG
          // arrowNextSVG
          // closeSVG
          // zoomSVG
          // @ts-expect-error lookup only by `data.name` maybe?
          elementHTML = pswp.options[name + 'SVG'];
        }

        pswp.dispatch('uiElementCreate', { data });

        let className = '';
        if (data.isButton) {
          className += 'pswp__button ';
          className += (data.className || `pswp__button--${data.name}`);
        } else {
          className += (data.className || `pswp__${data.name}`);
        }

        /** @type {HTMLElement} */
        let element;
        let tagName = data.isButton ? (data.tagName || 'button') : (data.tagName || 'div');
        tagName = /** @type {keyof HTMLElementTagNameMap} */ (tagName.toLowerCase());
        element = createElement(className, tagName);

        if (data.isButton) {
          // create button element
          element = createElement(className, tagName);
          if (tagName === 'button') {
            /** @type {HTMLButtonElement} */ (element).type = 'button';
          }

          let { title } = data;
          const { ariaLabel } = data;

          // @ts-expect-error lookup only by `data.name` maybe?
          if (typeof pswp.options[name + 'Title'] === 'string') {
            // @ts-expect-error lookup only by `data.name` maybe?
            title = pswp.options[name + 'Title'];
          }

          if (title) {
            element.title = title;
          }

          if (ariaLabel || title) {
            /** @type {HTMLElement} */ (element).setAttribute('aria-label', ariaLabel || title);
          }
        }

        element.innerHTML = addElementHTML(elementHTML);

        if (data.onInit) {
          data.onInit(element, pswp);
        }

        if (data.onClick) {
          element.onclick = (e) => {
            if (typeof data.onClick === 'string') {
              pswp[data.onClick]();
            } else {
              data.onClick(e, element, pswp);
            }
          };
        }

        // Top bar is default position
        const appendTo = data.appendTo || 'bar';
        let container;
        if (appendTo === 'bar') {
          if (!pswp.topBar) {
            pswp.topBar = createElement('pswp__top-bar pswp__hide-on-close', 'div', pswp.scrollWrap);
          }
          container = pswp.topBar;
        } else {
          // element outside of top bar gets a secondary class
          // that makes element fade out on close
          element.classList.add('pswp__hide-on-close');

          if (appendTo === 'wrapper') {
            container = pswp.scrollWrap;
          } else {
            // root element
            container = pswp.element;
          }
        }

        container.appendChild(pswp.applyFilters('uiElement', element, data));
      }
    }

    /*
      Backward and forward arrow buttons
     */

    /** @typedef {import('./ui-element.js').UIElementData} UIElementData */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */

    /**
     *
     * @param {HTMLElement} element
     * @param {PhotoSwipe} pswp
     * @param {boolean=} isNextButton
     */
    function initArrowButton(element, pswp, isNextButton) {
      element.classList.add('pswp__button--arrow');
      pswp.on('change', () => {
        if (!pswp.options.loop) {
          if (isNextButton) {
            /** @type {HTMLButtonElement} */
            (element).disabled = !(pswp.currIndex < pswp.getNumItems() - 1);
          } else {
            /** @type {HTMLButtonElement} */
            (element).disabled = !(pswp.currIndex > 0);
          }
        }
      });
    }

    /** @type {UIElementData} */
    const arrowPrev = {
      name: 'arrowPrev',
      className: 'pswp__button--arrow--prev',
      title: 'Previous',
      order: 10,
      isButton: true,
      appendTo: 'wrapper',
      html: {
        isCustomSVG: true,
        size: 60,
        inner: '<path d="M29 43l-3 3-16-16 16-16 3 3-13 13 13 13z" id="pswp__icn-arrow"/>',
        outlineID: 'pswp__icn-arrow'
      },
      onClick: 'prev',
      onInit: initArrowButton
    };

    /** @type {UIElementData} */
    const arrowNext = {
      name: 'arrowNext',
      className: 'pswp__button--arrow--next',
      title: 'Next',
      order: 11,
      isButton: true,
      appendTo: 'wrapper',
      html: {
        isCustomSVG: true,
        size: 60,
        inner: '<use xlink:href="#pswp__icn-arrow"/>',
        outlineID: 'pswp__icn-arrow'
      },
      onClick: 'next',
      onInit: (el, pswp) => {
        initArrowButton(el, pswp, true);
      }
    };

    /** @type {import('./ui-element.js').UIElementData} UIElementData */
    const closeButton = {
      name: 'close',
      title: 'Close',
      order: 20,
      isButton: true,
      html: {
        isCustomSVG: true,
        inner: '<path d="M24 10l-2-2-6 6-6-6-2 2 6 6-6 6 2 2 6-6 6 6 2-2-6-6z" id="pswp__icn-close"/>',
        outlineID: 'pswp__icn-close'
      },
      onClick: 'close'
    };

    /** @type {import('./ui-element.js').UIElementData} UIElementData */
    const zoomButton = {
      name: 'zoom',
      title: 'Zoom',
      order: 10,
      isButton: true,
      html: {
        isCustomSVG: true,
        // eslint-disable-next-line max-len
        inner: '<path d="M17.426 19.926a6 6 0 1 1 1.5-1.5L23 22.5 21.5 24l-4.074-4.074z" id="pswp__icn-zoom"/>'
              + '<path fill="currentColor" class="pswp__zoom-icn-bar-h" d="M11 16v-2h6v2z"/>'
              + '<path fill="currentColor" class="pswp__zoom-icn-bar-v" d="M13 12h2v6h-2z"/>',
        outlineID: 'pswp__icn-zoom'
      },
      onClick: 'toggleZoom'
    };

    /** @type {import('./ui-element.js').UIElementData} UIElementData */
    const loadingIndicator = {
      name: 'preloader',
      appendTo: 'bar',
      order: 7,
      html: {
        isCustomSVG: true,
        // eslint-disable-next-line max-len
        inner: '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.2 16a5.2 5.2 0 1 1-5.2-5.2V8a8 8 0 1 0 8 8h-2.8Z" id="pswp__icn-loading"/>',
        outlineID: 'pswp__icn-loading'
      },
      onInit: (indicatorElement, pswp) => {
        /** @type {boolean} */
        let isVisible;
        /** @type {NodeJS.Timeout} */
        let delayTimeout;

        /**
         * @param {string} className
         * @param {boolean} add
         */
        const toggleIndicatorClass = (className, add) => {
          indicatorElement.classList[add ? 'add' : 'remove']('pswp__preloader--' + className);
        };

        /**
         * @param {boolean} visible
         */
        const setIndicatorVisibility = (visible) => {
          if (isVisible !== visible) {
            isVisible = visible;
            toggleIndicatorClass('active', visible);
          }
        };

        const updatePreloaderVisibility = () => {
          if (!pswp.currSlide.content.isLoading()) {
            setIndicatorVisibility(false);
            if (delayTimeout) {
              clearTimeout(delayTimeout);
              delayTimeout = null;
            }
            return;
          }

          if (!delayTimeout) {
            // display loading indicator with delay
            delayTimeout = setTimeout(() => {
              setIndicatorVisibility(pswp.currSlide.content.isLoading());
              delayTimeout = null;
            }, pswp.options.preloaderDelay);
          }
        };

        pswp.on('change', updatePreloaderVisibility);

        pswp.on('loadComplete', (e) => {
          if (pswp.currSlide === e.slide) {
            updatePreloaderVisibility();
          }
        });

        // expose the method
        pswp.ui.updatePreloaderVisibility = updatePreloaderVisibility;
      }
    };

    /** @type {import('./ui-element.js').UIElementData} UIElementData */
    const counterIndicator = {
      name: 'counter',
      order: 5,
      onInit: (counterElement, pswp) => {
        pswp.on('change', () => {
          counterElement.innerText = (pswp.currIndex + 1)
                                      + pswp.options.indexIndicatorSep
                                      + pswp.getNumItems();
        });
      }
    };

    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('./ui-element.js').UIElementData} UIElementData */

    /**
     * Set special class on element when image is zoomed.
     *
     * By default it is used to adjust
     * zoom icon and zoom cursor via CSS.
     *
     * @param {HTMLElement} el
     * @param {boolean} isZoomedIn
     */
    function setZoomedIn(el, isZoomedIn) {
      el.classList[isZoomedIn ? 'add' : 'remove']('pswp--zoomed-in');
    }

    class UI {
      /**
       * @param {PhotoSwipe} pswp
       */
      constructor(pswp) {
        this.pswp = pswp;

        /** @type {() => void} */
        this.updatePreloaderVisibility = undefined;

        /** @type {number} */
        this._lastUpdatedZoomLevel = undefined;
      }

      init() {
        const { pswp } = this;
        this.isRegistered = false;
        /** @type {UIElementData[]} */
        this.uiElementsData = [
          closeButton,
          arrowPrev,
          arrowNext,
          zoomButton,
          loadingIndicator,
          counterIndicator
        ];

        pswp.dispatch('uiRegister');

        // sort by order
        this.uiElementsData.sort((a, b) => {
          // default order is 0
          return (a.order || 0) - (b.order || 0);
        });

        /** @type {(UIElement | UIElementData)[]} */
        this.items = [];

        this.isRegistered = true;
        this.uiElementsData.forEach((uiElementData) => {
          this.registerElement(uiElementData);
        });

        pswp.on('change', () => {
          pswp.element.classList[pswp.getNumItems() === 1 ? 'add' : 'remove']('pswp--one-slide');
        });

        pswp.on('zoomPanUpdate', () => this._onZoomPanUpdate());
      }

      /**
       * @param {UIElementData} elementData
       */
      registerElement(elementData) {
        if (this.isRegistered) {
          this.items.push(
            new UIElement(this.pswp, elementData)
          );
        } else {
          this.uiElementsData.push(elementData);
        }
      }

      /**
       * Fired each time zoom or pan position is changed.
       * Update classes that control visibility of zoom button and cursor icon.
       */
      _onZoomPanUpdate() {
        const { template, currSlide, options } = this.pswp;
        let { currZoomLevel } = currSlide;

        if (this.pswp.opener.isClosing) {
          return;
        }

        // if not open yet - check against initial zoom level
        if (!this.pswp.opener.isOpen) {
          currZoomLevel = currSlide.zoomLevels.initial;
        }

        if (currZoomLevel === this._lastUpdatedZoomLevel) {
          return;
        }
        this._lastUpdatedZoomLevel = currZoomLevel;

        const currZoomLevelDiff = currSlide.zoomLevels.initial - currSlide.zoomLevels.secondary;

        // Initial and secondary zoom levels are almost equal
        if (Math.abs(currZoomLevelDiff) < 0.01 || !currSlide.isZoomable()) {
          // disable zoom
          setZoomedIn(template, false);
          template.classList.remove('pswp--zoom-allowed');
          return;
        }

        template.classList.add('pswp--zoom-allowed');

        const potentialZoomLevel = currZoomLevel === currSlide.zoomLevels.initial
          ? currSlide.zoomLevels.secondary : currSlide.zoomLevels.initial;

        setZoomedIn(template, potentialZoomLevel <= currZoomLevel);

        if (options.imageClickAction === 'zoom'
            || options.imageClickAction === 'zoom-or-close') {
          template.classList.add('pswp--click-to-zoom');
        }
      }
    }

    /** @typedef {import('./slide.js').SlideData} SlideData */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */

    /** @typedef {{ x: number; y: number; w: number; innerRect?: { w: number; h: number; x: number; y: number } }} Bounds */

    /**
     * @param {HTMLElement} el
     */
    function getBoundsByElement(el) {
      const thumbAreaRect = el.getBoundingClientRect();
      return {
        x: thumbAreaRect.left,
        y: thumbAreaRect.top,
        w: thumbAreaRect.width
      };
    }

    /**
     * @param {HTMLElement} el
     * @param {number} imageWidth
     * @param {number} imageHeight
     */
    function getCroppedBoundsByElement(el, imageWidth, imageHeight) {
      const thumbAreaRect = el.getBoundingClientRect();

      // fill image into the area
      // (do they same as object-fit:cover does to retrieve coordinates)
      const hRatio = thumbAreaRect.width / imageWidth;
      const vRatio = thumbAreaRect.height / imageHeight;
      const fillZoomLevel = hRatio > vRatio ? hRatio : vRatio;

      const offsetX = (thumbAreaRect.width - imageWidth * fillZoomLevel) / 2;
      const offsetY = (thumbAreaRect.height - imageHeight * fillZoomLevel) / 2;

      /**
       * Coordinates of the image,
       * as if it was not cropped,
       * height is calculated automatically
       *
       * @type {Bounds}
       */
      const bounds = {
        x: thumbAreaRect.left + offsetX,
        y: thumbAreaRect.top + offsetY,
        w: imageWidth * fillZoomLevel
      };

      // Coordinates of inner crop area
      // relative to the image
      bounds.innerRect = {
        w: thumbAreaRect.width,
        h: thumbAreaRect.height,
        x: offsetX,
        y: offsetY
      };

      return bounds;
    }

    /**
     * Get dimensions of thumbnail image
     * (click on which opens photoswipe or closes photoswipe to)
     *
     * @param {number} index
     * @param {SlideData} itemData
     * @param {PhotoSwipe} instance PhotoSwipe instance
     * @returns {Bounds | undefined}
     */
    function getThumbBounds(index, itemData, instance) {
      // legacy event, before filters were introduced
      const event = instance.dispatch('thumbBounds', {
        index,
        itemData,
        instance
      });
      // @ts-expect-error
      if (event.thumbBounds) {
        // @ts-expect-error
        return event.thumbBounds;
      }

      const { element } = itemData;
      let thumbBounds;
      /** @type {HTMLElement} */
      let thumbnail;

      if (element && instance.options.thumbSelector !== false) {
        const thumbSelector = instance.options.thumbSelector || 'img';
        thumbnail = element.matches(thumbSelector)
          ? element : element.querySelector(thumbSelector);
      }

      thumbnail = instance.applyFilters('thumbEl', thumbnail, itemData, index);

      if (thumbnail) {
        if (!itemData.thumbCropped) {
          thumbBounds = getBoundsByElement(thumbnail);
        } else {
          thumbBounds = getCroppedBoundsByElement(
            thumbnail,
            itemData.width || itemData.w,
            itemData.height || itemData.h
          );
        }
      }

      return instance.applyFilters('thumbBounds', thumbBounds, itemData, index);
    }

    /** @typedef {import('../lightbox/lightbox.js').default} PhotoSwipeLightbox */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../photoswipe.js').PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import('../photoswipe.js').DataSource} DataSource */
    /** @typedef {import('../ui/ui-element.js').UIElementData} UIElementData */
    /** @typedef {import('../slide/content.js').default} ContentDefault */
    /** @typedef {import('../slide/slide.js').default} Slide */
    /** @typedef {import('../slide/slide.js').SlideData} SlideData */
    /** @typedef {import('../slide/zoom-level.js').default} ZoomLevel */
    /** @typedef {import('../slide/get-thumb-bounds.js').Bounds} Bounds */

    /**
     * Allow adding an arbitrary props to the Content
     * https://photoswipe.com/custom-content/#using-webp-image-format
     * @typedef {ContentDefault & Record<string, any>} Content
     */
    /** @typedef {{ x?: number; y?: number }} Point */

    /**
     * @typedef {Object} PhotoSwipeEventsMap https://photoswipe.com/events/
     *
     *
     * https://photoswipe.com/adding-ui-elements/
     *
     * @prop {undefined} uiRegister
     * @prop {{ data: UIElementData }} uiElementCreate
     *
     *
     * https://photoswipe.com/events/#initialization-events
     *
     * @prop {undefined} beforeOpen
     * @prop {undefined} firstUpdate
     * @prop {undefined} initialLayout
     * @prop {undefined} change
     * @prop {undefined} afterInit
     * @prop {undefined} bindEvents
     *
     *
     * https://photoswipe.com/events/#opening-or-closing-transition-events
     *
     * @prop {undefined} openingAnimationStart
     * @prop {undefined} openingAnimationEnd
     * @prop {undefined} closingAnimationStart
     * @prop {undefined} closingAnimationEnd
     *
     *
     * https://photoswipe.com/events/#closing-events
     *
     * @prop {undefined} close
     * @prop {undefined} destroy
     *
     *
     * https://photoswipe.com/events/#pointer-and-gesture-events
     *
     * @prop {{ originalEvent: PointerEvent }} pointerDown
     * @prop {{ originalEvent: PointerEvent }} pointerMove
     * @prop {{ originalEvent: PointerEvent }} pointerUp
     * @prop {{ bgOpacity: number }} pinchClose can be default prevented
     * @prop {{ panY: number }} verticalDrag can be default prevented
     *
     *
     * https://photoswipe.com/events/#slide-content-events
     *
     * @prop {{ content: Content }} contentInit
     * @prop {{ content: Content; isLazy: boolean }} contentLoad can be default prevented
     * @prop {{ content: Content; isLazy: boolean }} contentLoadImage can be default prevented
     * @prop {{ content: Content; slide: Slide; isError?: boolean }} loadComplete
     * @prop {{ content: Content; slide: Slide }} loadError
     * @prop {{ content: Content; width: number; height: number }} contentResize can be default prevented
     * @prop {{ content: Content; width: number; height: number; slide: Slide }} imageSizeChange
     * @prop {{ content: Content }} contentLazyLoad can be default prevented
     * @prop {{ content: Content }} contentAppend can be default prevented
     * @prop {{ content: Content }} contentActivate can be default prevented
     * @prop {{ content: Content }} contentDeactivate can be default prevented
     * @prop {{ content: Content }} contentRemove can be default prevented
     * @prop {{ content: Content }} contentDestroy can be default prevented
     *
     *
     * undocumented
     *
     * @prop {{ point: Point; originalEvent: PointerEvent }} imageClickAction can be default prevented
     * @prop {{ point: Point; originalEvent: PointerEvent }} bgClickAction can be default prevented
     * @prop {{ point: Point; originalEvent: PointerEvent }} tapAction can be default prevented
     * @prop {{ point: Point; originalEvent: PointerEvent }} doubleTapAction can be default prevented
     *
     * @prop {{ originalEvent: KeyboardEvent }} keydown can be default prevented
     * @prop {{ x: number; dragging: boolean }} moveMainScroll
     * @prop {{ slide: Slide }} firstZoomPan
     * @prop {{ slide: Slide, data: SlideData, index: number }} gettingData
     * @prop {undefined} beforeResize
     * @prop {undefined} resize
     * @prop {undefined} viewportSize
     * @prop {undefined} updateScrollOffset
     * @prop {{ slide: Slide }} slideInit
     * @prop {{ slide: Slide }} afterSetContent
     * @prop {{ slide: Slide }} slideLoad
     * @prop {{ slide: Slide }} appendHeavy can be default prevented
     * @prop {{ slide: Slide }} appendHeavyContent
     * @prop {{ slide: Slide }} slideActivate
     * @prop {{ slide: Slide }} slideDeactivate
     * @prop {{ slide: Slide }} slideDestroy
     * @prop {{ destZoomLevel: number, centerPoint: Point, transitionDuration: number | false }} beforeZoomTo
     * @prop {{ slide: Slide }} zoomPanUpdate
     * @prop {{ slide: Slide }} initialZoomPan
     * @prop {{ slide: Slide }} calcSlideSize
     * @prop {undefined} resolutionChanged
     * @prop {{ originalEvent: WheelEvent }} wheel can be default prevented
     * @prop {{ content: Content }} contentAppendImage can be default prevented
     * @prop {{ index: number; itemData: SlideData }} lazyLoadSlide can be default prevented
     * @prop {undefined} lazyLoad
     * @prop {{ slide: Slide }} calcBounds
     * @prop {{ zoomLevels: ZoomLevel, slideData: SlideData }} zoomLevelsUpdate
     *
     *
     * legacy
     *
     * @prop {undefined} init
     * @prop {undefined} initialZoomIn
     * @prop {undefined} initialZoomOut
     * @prop {undefined} initialZoomInEnd
     * @prop {undefined} initialZoomOutEnd
     * @prop {{ dataSource: DataSource, numItems: number }} numItems
     * @prop {{ itemData: SlideData; index: number }} itemData
     * @prop {{ index: number, itemData: SlideData, instance: PhotoSwipe }} thumbBounds
     */

    /**
     * @typedef {Object} PhotoSwipeFiltersMap https://photoswipe.com/filters/
     *
     * @prop {(numItems: number, dataSource: DataSource) => number} numItems
     * Modify the total amount of slides. Example on Data sources page.
     * https://photoswipe.com/filters/#numitems
     *
     * @prop {(itemData: SlideData, index: number) => SlideData} itemData
     * Modify slide item data. Example on Data sources page.
     * https://photoswipe.com/filters/#itemdata
     *
     * @prop {(itemData: SlideData, element: HTMLElement, linkEl: HTMLAnchorElement) => SlideData} domItemData
     * Modify item data when it's parsed from DOM element. Example on Data sources page.
     * https://photoswipe.com/filters/#domitemdata
     *
     * @prop {(clickedIndex: number, e: MouseEvent, instance: PhotoSwipeLightbox) => number} clickedIndex
     * Modify clicked gallery item index.
     * https://photoswipe.com/filters/#clickedindex
     *
     * @prop {(placeholderSrc: string | false, content: Content) => string | false} placeholderSrc
     * Modify placeholder image source.
     * https://photoswipe.com/filters/#placeholdersrc
     *
     * @prop {(isContentLoading: boolean, content: Content) => boolean} isContentLoading
     * Modify if the content is currently loading.
     * https://photoswipe.com/filters/#iscontentloading
     *
     * @prop {(isContentZoomable: boolean, content: Content) => boolean} isContentZoomable
     * Modify if the content can be zoomed.
     * https://photoswipe.com/filters/#iscontentzoomable
     *
     * @prop {(useContentPlaceholder: boolean, content: Content) => boolean} useContentPlaceholder
     * Modify if the placeholder should be used for the content.
     * https://photoswipe.com/filters/#usecontentplaceholder
     *
     * @prop {(isKeepingPlaceholder: boolean, content: Content) => boolean} isKeepingPlaceholder
     * Modify if the placeholder should be kept after the content is loaded.
     * https://photoswipe.com/filters/#iskeepingplaceholder
     *
     *
     * @prop {(contentErrorElement: HTMLElement, content: Content) => HTMLElement} contentErrorElement
     * Modify an element when the content has error state (for example, if image cannot be loaded).
     * https://photoswipe.com/filters/#contenterrorelement
     *
     * @prop {(element: HTMLElement, data: UIElementData) => HTMLElement} uiElement
     * Modify a UI element that's being created.
     * https://photoswipe.com/filters/#uielement
     *
     * @prop {(thumbnail: HTMLElement, itemData: SlideData, index: number) => HTMLElement} thumbEl
     * Modify the thubmnail element from which opening zoom animation starts or ends.
     * https://photoswipe.com/filters/#thumbel
     *
     * @prop {(thumbBounds: Bounds, itemData: SlideData, index: number) => Bounds} thumbBounds
     * Modify the thubmnail bounds from which opening zoom animation starts or ends.
     * https://photoswipe.com/filters/#thumbbounds
     *
     * @prop {(srcsetSizesWidth: number, content: Content) => number} srcsetSizesWidth
     *
     */

    /**
     * @template {keyof PhotoSwipeFiltersMap} T
     * @typedef {{ fn: PhotoSwipeFiltersMap[T], priority: number }} Filter<T>
     */

    /**
     * @template {keyof PhotoSwipeEventsMap} T
     * @typedef {PhotoSwipeEventsMap[T] extends undefined ? PhotoSwipeEvent<T> : PhotoSwipeEvent<T> & PhotoSwipeEventsMap[T]} AugmentedEvent
     */

    /**
     * @template {keyof PhotoSwipeEventsMap} T
     * @typedef {(event: AugmentedEvent<T>) => void} EventCallback<T>
     */

    /**
     * Base PhotoSwipe event object
     *
     * @template {keyof PhotoSwipeEventsMap} T
     */
    class PhotoSwipeEvent {
      /**
       * @param {T} type
       * @param {PhotoSwipeEventsMap[T]} [details]
       */
      constructor(type, details) {
        this.type = type;
        if (details) {
          Object.assign(this, details);
        }
      }

      preventDefault() {
        this.defaultPrevented = true;
      }
    }

    /**
     * PhotoSwipe base class that can listen and dispatch for events.
     * Shared by PhotoSwipe Core and PhotoSwipe Lightbox, extended by base.js
     */
    class Eventable {
      constructor() {
        /**
         * @type {{ [T in keyof PhotoSwipeEventsMap]?: ((event: AugmentedEvent<T>) => void)[] }}
         */
        this._listeners = {};

        /**
         * @type {{ [T in keyof PhotoSwipeFiltersMap]?: Filter<T>[] }}
         */
        this._filters = {};

        /** @type {PhotoSwipe=} */
        this.pswp = undefined;

        /** @type {PhotoSwipeOptions} */
        this.options = undefined;
      }

      /**
       * @template {keyof PhotoSwipeFiltersMap} T
       * @param {T} name
       * @param {PhotoSwipeFiltersMap[T]} fn
       * @param {number} priority
       */
      addFilter(name, fn, priority = 100) {
        if (!this._filters[name]) {
          this._filters[name] = [];
        }

        this._filters[name].push({ fn, priority });
        this._filters[name].sort((f1, f2) => f1.priority - f2.priority);

        if (this.pswp) {
          this.pswp.addFilter(name, fn, priority);
        }
      }

      /**
       * @template {keyof PhotoSwipeFiltersMap} T
       * @param {T} name
       * @param {PhotoSwipeFiltersMap[T]} fn
       */
      removeFilter(name, fn) {
        if (this._filters[name]) {
          // @ts-expect-error
          this._filters[name] = this._filters[name].filter(filter => (filter.fn !== fn));
        }

        if (this.pswp) {
          this.pswp.removeFilter(name, fn);
        }
      }

      /**
       * @template {keyof PhotoSwipeFiltersMap} T
       * @param {T} name
       * @param {Parameters<PhotoSwipeFiltersMap[T]>} args
       * @returns {Parameters<PhotoSwipeFiltersMap[T]>[0]}
       */
      applyFilters(name, ...args) {
        if (this._filters[name]) {
          this._filters[name].forEach((filter) => {
            // @ts-expect-error
            args[0] = filter.fn.apply(this, args);
          });
        }
        return args[0];
      }

      /**
       * @template {keyof PhotoSwipeEventsMap} T
       * @param {T} name
       * @param {EventCallback<T>} fn
       */
      on(name, fn) {
        if (!this._listeners[name]) {
          this._listeners[name] = [];
        }
        this._listeners[name].push(fn);

        // When binding events to lightbox,
        // also bind events to PhotoSwipe Core,
        // if it's open.
        if (this.pswp) {
          this.pswp.on(name, fn);
        }
      }

      /**
       * @template {keyof PhotoSwipeEventsMap} T
       * @param {T} name
       * @param {EventCallback<T>} fn
       */
      off(name, fn) {
        if (this._listeners[name]) {
          // @ts-expect-error
          this._listeners[name] = this._listeners[name].filter(listener => (fn !== listener));
        }

        if (this.pswp) {
          this.pswp.off(name, fn);
        }
      }

      /**
       * @template {keyof PhotoSwipeEventsMap} T
       * @param {T} name
       * @param {PhotoSwipeEventsMap[T]} [details]
       * @returns {AugmentedEvent<T>}
       */
      dispatch(name, details) {
        if (this.pswp) {
          return this.pswp.dispatch(name, details);
        }

        const event = /** @type {AugmentedEvent<T>} */ (new PhotoSwipeEvent(name, details));

        if (!this._listeners) {
          return event;
        }

        if (this._listeners[name]) {
          this._listeners[name].forEach((listener) => {
            listener.call(this, event);
          });
        }

        return event;
      }
    }

    class Placeholder {
      /**
       * @param {string | false} imageSrc
       * @param {HTMLElement} container
       */
      constructor(imageSrc, container) {
        // Create placeholder
        // (stretched thumbnail or simple div behind the main image)
        this.element = createElement(
          'pswp__img pswp__img--placeholder',
          imageSrc ? 'img' : '',
          container
        );

        if (imageSrc) {
          /** @type {HTMLImageElement} */
          (this.element).decoding = 'async';
          /** @type {HTMLImageElement} */
          (this.element).alt = '';
          /** @type {HTMLImageElement} */
          (this.element).src = imageSrc;
          this.element.setAttribute('role', 'presentation');
        }

        this.element.setAttribute('aria-hidden', 'true');
      }

      /**
       * @param {number} width
       * @param {number} height
       */
      setDisplayedSize(width, height) {
        if (!this.element) {
          return;
        }

        if (this.element.tagName === 'IMG') {
          // Use transform scale() to modify img placeholder size
          // (instead of changing width/height directly).
          // This helps with performance, specifically in iOS15 Safari.
          setWidthHeight(this.element, 250, 'auto');
          this.element.style.transformOrigin = '0 0';
          this.element.style.transform = toTransformString(0, 0, width / 250);
        } else {
          setWidthHeight(this.element, width, height);
        }
      }

      destroy() {
        if (this.element.parentNode) {
          this.element.remove();
        }
        this.element = null;
      }
    }

    /** @typedef {import('./slide.js').default} Slide */
    /** @typedef {import('./slide.js').SlideData} SlideData */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../util/util.js').LoadState} LoadState */

    class Content {
      /**
       * @param {SlideData} itemData Slide data
       * @param {PhotoSwipe} instance PhotoSwipe or PhotoSwipeLightbox instance
       * @param {number} index
       */
      constructor(itemData, instance, index) {
        this.instance = instance;
        this.data = itemData;
        this.index = index;

        /** @type {HTMLImageElement | HTMLDivElement} */
        this.element = undefined;

        this.displayedImageWidth = 0;
        this.displayedImageHeight = 0;

        this.width = Number(this.data.w) || Number(this.data.width) || 0;
        this.height = Number(this.data.h) || Number(this.data.height) || 0;

        this.isAttached = false;
        this.hasSlide = false;
        /** @type {LoadState} */
        this.state = LOAD_STATE.IDLE;

        if (this.data.type) {
          this.type = this.data.type;
        } else if (this.data.src) {
          this.type = 'image';
        } else {
          this.type = 'html';
        }

        this.instance.dispatch('contentInit', { content: this });
      }

      removePlaceholder() {
        if (this.placeholder && !this.keepPlaceholder()) {
          // With delay, as image might be loaded, but not rendered
          setTimeout(() => {
            if (this.placeholder) {
              this.placeholder.destroy();
              this.placeholder = null;
            }
          }, 1000);
        }
      }

      /**
       * Preload content
       *
       * @param {boolean=} isLazy
       * @param {boolean=} reload
       */
      load(isLazy, reload) {
        if (this.slide && this.usePlaceholder()) {
          if (!this.placeholder) {
            const placeholderSrc = this.instance.applyFilters(
              'placeholderSrc',
              // use  image-based placeholder only for the first slide,
              // as rendering (even small stretched thumbnail) is an expensive operation
              (this.data.msrc && this.slide.isFirstSlide) ? this.data.msrc : false,
              this
            );
            this.placeholder = new Placeholder(
              placeholderSrc,
              this.slide.container
            );
          } else {
            const placeholderEl = this.placeholder.element;
            // Add placeholder to DOM if it was already created
            if (placeholderEl && !placeholderEl.parentElement) {
              this.slide.container.prepend(placeholderEl);
            }
          }
        }

        if (this.element && !reload) {
          return;
        }

        if (this.instance.dispatch('contentLoad', { content: this, isLazy }).defaultPrevented) {
          return;
        }

        if (this.isImageContent()) {
          this.element = createElement('pswp__img', 'img');
          // Start loading only after width is defined, as sizes might depend on it.
          // Due to Safari feature, we must define sizes before srcset.
          if (this.displayedImageWidth) {
            this.loadImage(isLazy);
          }
        } else {
          this.element = createElement('pswp__content');
          this.element.innerHTML = this.data.html || '';
        }

        if (reload && this.slide) {
          this.slide.updateContentSize(true);
        }
      }

      /**
       * Preload image
       *
       * @param {boolean} isLazy
       */
      loadImage(isLazy) {
        const imageElement = /** @type HTMLImageElement */ (this.element);

        if (this.instance.dispatch('contentLoadImage', { content: this, isLazy }).defaultPrevented) {
          return;
        }

        this.updateSrcsetSizes();

        if (this.data.srcset) {
          imageElement.srcset = this.data.srcset;
        }

        imageElement.src = this.data.src;

        imageElement.alt = this.data.alt || '';

        this.state = LOAD_STATE.LOADING;

        if (imageElement.complete) {
          this.onLoaded();
        } else {
          imageElement.onload = () => {
            this.onLoaded();
          };

          imageElement.onerror = () => {
            this.onError();
          };
        }
      }

      /**
       * Assign slide to content
       *
       * @param {Slide} slide
       */
      setSlide(slide) {
        this.slide = slide;
        this.hasSlide = true;
        this.instance = slide.pswp;

        // todo: do we need to unset slide?
      }

      /**
       * Content load success handler
       */
      onLoaded() {
        this.state = LOAD_STATE.LOADED;

        if (this.slide) {
          this.instance.dispatch('loadComplete', { slide: this.slide, content: this });

          // if content is reloaded
          if (this.slide.isActive
              && this.slide.heavyAppended
              && !this.element.parentNode) {
            this.append();
            this.slide.updateContentSize(true);
          }

          if (this.state === LOAD_STATE.LOADED || this.state === LOAD_STATE.ERROR) {
            this.removePlaceholder();
          }
        }
      }

      /**
       * Content load error handler
       */
      onError() {
        this.state = LOAD_STATE.ERROR;

        if (this.slide) {
          this.displayError();
          this.instance.dispatch('loadComplete', { slide: this.slide, isError: true, content: this });
          this.instance.dispatch('loadError', { slide: this.slide, content: this });
        }
      }

      /**
       * @returns {Boolean} If the content is currently loading
       */
      isLoading() {
        return this.instance.applyFilters(
          'isContentLoading',
          this.state === LOAD_STATE.LOADING,
          this
        );
      }

      isError() {
        return this.state === LOAD_STATE.ERROR;
      }

      /**
       * @returns {boolean} If the content is image
       */
      isImageContent() {
        return this.type === 'image';
      }

      /**
       * Update content size
       *
       * @param {Number} width
       * @param {Number} height
       */
      setDisplayedSize(width, height) {
        if (!this.element) {
          return;
        }

        if (this.placeholder) {
          this.placeholder.setDisplayedSize(width, height);
        }

        // eslint-disable-next-line max-len
        if (this.instance.dispatch('contentResize', { content: this, width, height }).defaultPrevented) {
          return;
        }

        setWidthHeight(this.element, width, height);

        if (this.isImageContent() && !this.isError()) {
          const isInitialSizeUpdate = (!this.displayedImageWidth && width);

          this.displayedImageWidth = width;
          this.displayedImageHeight = height;

          if (isInitialSizeUpdate) {
            this.loadImage(false);
          } else {
            this.updateSrcsetSizes();
          }

          if (this.slide) {
            // eslint-disable-next-line max-len
            this.instance.dispatch('imageSizeChange', { slide: this.slide, width, height, content: this });
          }
        }
      }

      /**
       * @returns {boolean} If the content can be zoomed
       */
      isZoomable() {
        return this.instance.applyFilters(
          'isContentZoomable',
          this.isImageContent() && (this.state !== LOAD_STATE.ERROR),
          this
        );
      }

      /**
       * Update image srcset sizes attribute based on width and height
       */
      updateSrcsetSizes() {
        // Handle srcset sizes attribute.
        //
        // Never lower quality, if it was increased previously.
        // Chrome does this automatically, Firefox and Safari do not,
        // so we store largest used size in dataset.
        // Handle srcset sizes attribute.
        //
        // Never lower quality, if it was increased previously.
        // Chrome does this automatically, Firefox and Safari do not,
        // so we store largest used size in dataset.
        if (this.data.srcset) {
          const image = /** @type HTMLImageElement */ (this.element);
          const sizesWidth = this.instance.applyFilters(
            'srcsetSizesWidth',
            this.displayedImageWidth,
            this
          );

          if (!image.dataset.largestUsedSize
              || sizesWidth > parseInt(image.dataset.largestUsedSize, 10)) {
            image.sizes = sizesWidth + 'px';
            image.dataset.largestUsedSize = String(sizesWidth);
          }
        }
      }

      /**
       * @returns {boolean} If content should use a placeholder (from msrc by default)
       */
      usePlaceholder() {
        return this.instance.applyFilters(
          'useContentPlaceholder',
          this.isImageContent(),
          this
        );
      }

      /**
       * Preload content with lazy-loading param
       */
      lazyLoad() {
        if (this.instance.dispatch('contentLazyLoad', { content: this }).defaultPrevented) {
          return;
        }

        this.load(true);
      }

      /**
       * @returns {boolean} If placeholder should be kept after content is loaded
       */
      keepPlaceholder() {
        return this.instance.applyFilters(
          'isKeepingPlaceholder',
          this.isLoading(),
          this
        );
      }

      /**
       * Destroy the content
       */
      destroy() {
        this.hasSlide = false;
        this.slide = null;

        if (this.instance.dispatch('contentDestroy', { content: this }).defaultPrevented) {
          return;
        }

        this.remove();

        if (this.placeholder) {
          this.placeholder.destroy();
          this.placeholder = null;
        }

        if (this.isImageContent() && this.element) {
          this.element.onload = null;
          this.element.onerror = null;
          this.element = null;
        }
      }

      /**
       * Display error message
       */
      displayError() {
        if (this.slide) {
          /** @type {HTMLElement} */
          let errorMsgEl = createElement('pswp__error-msg');
          errorMsgEl.innerText = this.instance.options.errorMsg;
          errorMsgEl = this.instance.applyFilters(
            'contentErrorElement',
            errorMsgEl,
            this
          );
          this.element = createElement('pswp__content pswp__error-msg-container');
          this.element.appendChild(errorMsgEl);
          this.slide.container.innerText = '';
          this.slide.container.appendChild(this.element);
          this.slide.updateContentSize(true);
          this.removePlaceholder();
        }
      }

      /**
       * Append the content
       */
      append() {
        if (this.isAttached) {
          return;
        }

        this.isAttached = true;

        if (this.state === LOAD_STATE.ERROR) {
          this.displayError();
          return;
        }

        if (this.instance.dispatch('contentAppend', { content: this }).defaultPrevented) {
          return;
        }

        const supportsDecode = ('decode' in this.element);

        if (this.isImageContent()) {
          // Use decode() on nearby slides
          //
          // Nearby slide images are in DOM and not hidden via display:none.
          // However, they are placed offscreen (to the left and right side).
          //
          // Some browsers do not composite the image until it's actually visible,
          // using decode() helps.
          //
          // You might ask "why dont you just decode() and then append all images",
          // that's because I want to show image before it's fully loaded,
          // as browser can render parts of image while it is loading.
          // We do not do this in Safari due to partial loading bug.
          if (supportsDecode && this.slide && (!this.slide.isActive || isSafari())) {
            this.isDecoding = true;
            // purposefully using finally instead of then,
            // as if srcset sizes changes dynamically - it may cause decode error
            /** @type {HTMLImageElement} */
            (this.element).decode().catch(() => {}).finally(() => {
              this.isDecoding = false;
              this.appendImage();
            });
          } else {
            this.appendImage();
          }
        } else if (this.element && !this.element.parentNode) {
          this.slide.container.appendChild(this.element);
        }
      }

      /**
       * Activate the slide,
       * active slide is generally the current one,
       * meaning the user can see it.
       */
      activate() {
        if (this.instance.dispatch('contentActivate', { content: this }).defaultPrevented) {
          return;
        }

        if (this.slide) {
          if (this.isImageContent() && this.isDecoding && !isSafari()) {
            // add image to slide when it becomes active,
            // even if it's not finished decoding
            this.appendImage();
          } else if (this.isError()) {
            this.load(false, true); // try to reload
          }
        }
      }

      /**
       * Deactivate the content
       */
      deactivate() {
        this.instance.dispatch('contentDeactivate', { content: this });
      }


      /**
       * Remove the content from DOM
       */
      remove() {
        this.isAttached = false;

        if (this.instance.dispatch('contentRemove', { content: this }).defaultPrevented) {
          return;
        }

        if (this.element && this.element.parentNode) {
          this.element.remove();
        }

        if (this.placeholder && this.placeholder.element) {
          this.placeholder.element.remove();
        }
      }

      /**
       * Append the image content to slide container
       */
      appendImage() {
        if (!this.isAttached) {
          return;
        }

        if (this.instance.dispatch('contentAppendImage', { content: this }).defaultPrevented) {
          return;
        }

        // ensure that element exists and is not already appended
        if (this.slide && this.element && !this.element.parentNode) {
          this.slide.container.appendChild(this.element);
        }

        if (this.state === LOAD_STATE.LOADED || this.state === LOAD_STATE.ERROR) {
          this.removePlaceholder();
        }
      }
    }

    /** @typedef {import('./content.js').default} Content */
    /** @typedef {import('./slide.js').default} Slide */
    /** @typedef {import('./slide.js').SlideData} SlideData */
    /** @typedef {import('../core/base.js').default} PhotoSwipeBase */
    /** @typedef {import('../photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('../lightbox/lightbox.js').default} PhotoSwipeLightbox */

    const MIN_SLIDES_TO_CACHE = 5;

    /**
     * Lazy-load an image
     * This function is used both by Lightbox and PhotoSwipe core,
     * thus it can be called before dialog is opened.
     *
     * @param {SlideData} itemData Data about the slide
     * @param {PhotoSwipe | PhotoSwipeLightbox | PhotoSwipeBase} instance PhotoSwipe instance
     * @param {number} index
     * @returns Image that is being decoded or false.
     */
    function lazyLoadData(itemData, instance, index) {
      // src/slide/content/content.js
      const content = instance.createContentFromData(itemData, index);

      if (!content || !content.lazyLoad) {
        return;
      }

      const { options } = instance;

      // We need to know dimensions of the image to preload it,
      // as it might use srcset and we need to define sizes
      // @ts-expect-error should provide pswp instance?
      const viewportSize = instance.viewportSize || getViewportSize(options, instance);
      const panAreaSize = getPanAreaSize(options, viewportSize, itemData, index);

      const zoomLevel = new ZoomLevel(options, itemData, -1);
      zoomLevel.update(content.width, content.height, panAreaSize);

      content.lazyLoad();
      content.setDisplayedSize(
        Math.ceil(content.width * zoomLevel.initial),
        Math.ceil(content.height * zoomLevel.initial)
      );

      return content;
    }


    /**
     * Lazy-loads specific slide.
     * This function is used both by Lightbox and PhotoSwipe core,
     * thus it can be called before dialog is opened.
     *
     * By default it loads image based on viewport size and initial zoom level.
     *
     * @param {number} index Slide index
     * @param {PhotoSwipe | PhotoSwipeLightbox} instance PhotoSwipe or PhotoSwipeLightbox eventable instance
     */
    function lazyLoadSlide(index, instance) {
      const itemData = instance.getItemData(index);

      if (instance.dispatch('lazyLoadSlide', { index, itemData }).defaultPrevented) {
        return;
      }

      return lazyLoadData(itemData, instance, index);
    }


    class ContentLoader {
      /**
       * @param {PhotoSwipe} pswp
       */
      constructor(pswp) {
        this.pswp = pswp;
        // Total amount of cached images
        this.limit = Math.max(
          pswp.options.preload[0] + pswp.options.preload[1] + 1,
          MIN_SLIDES_TO_CACHE
        );
        /** @type {Content[]} */
        this._cachedItems = [];
      }

      /**
       * Lazy load nearby slides based on `preload` option.
       *
       * @param {number=} diff Difference between slide indexes that was changed recently, or 0.
       */
      updateLazy(diff) {
        const { pswp } = this;

        if (pswp.dispatch('lazyLoad').defaultPrevented) {
          return;
        }

        const { preload } = pswp.options;
        const isForward = diff === undefined ? true : (diff >= 0);
        let i;

        // preload[1] - num items to preload in forward direction
        for (i = 0; i <= preload[1]; i++) {
          this.loadSlideByIndex(pswp.currIndex + (isForward ? i : (-i)));
        }

        // preload[0] - num items to preload in backward direction
        for (i = 1; i <= preload[0]; i++) {
          this.loadSlideByIndex(pswp.currIndex + (isForward ? (-i) : i));
        }
      }

      /**
       * @param {number} index
       */
      loadSlideByIndex(index) {
        index = this.pswp.getLoopedIndex(index);
        // try to get cached content
        let content = this.getContentByIndex(index);
        if (!content) {
          // no cached content, so try to load from scratch:
          content = lazyLoadSlide(index, this.pswp);
          // if content can be loaded, add it to cache:
          if (content) {
            this.addToCache(content);
          }
        }
      }

      /**
       * @param {Slide} slide
       */
      getContentBySlide(slide) {
        let content = this.getContentByIndex(slide.index);
        if (!content) {
          // create content if not found in cache
          content = this.pswp.createContentFromData(slide.data, slide.index);
          if (content) {
            this.addToCache(content);
          }
        }

        if (content) {
          // assign slide to content
          content.setSlide(slide);
        }
        return content;
      }

      /**
       * @param {Content} content
       */
      addToCache(content) {
        // move to the end of array
        this.removeByIndex(content.index);
        this._cachedItems.push(content);

        if (this._cachedItems.length > this.limit) {
          // Destroy the first content that's not attached
          const indexToRemove = this._cachedItems.findIndex((item) => {
            return !item.isAttached && !item.hasSlide;
          });
          if (indexToRemove !== -1) {
            const removedItem = this._cachedItems.splice(indexToRemove, 1)[0];
            removedItem.destroy();
          }
        }
      }

      /**
       * Removes an image from cache, does not destroy() it, just removes.
       *
       * @param {number} index
       */
      removeByIndex(index) {
        const indexToRemove = this._cachedItems.findIndex(item => item.index === index);
        if (indexToRemove !== -1) {
          this._cachedItems.splice(indexToRemove, 1);
        }
      }

      /**
       * @param {number} index
       */
      getContentByIndex(index) {
        return this._cachedItems.find(content => content.index === index);
      }

      destroy() {
        this._cachedItems.forEach(content => content.destroy());
        this._cachedItems = null;
      }
    }

    /** @typedef {import("../photoswipe.js").default} PhotoSwipe */
    /** @typedef {import("../photoswipe.js").PhotoSwipeOptions} PhotoSwipeOptions */
    /** @typedef {import("../slide/slide.js").SlideData} SlideData */

    /**
     * PhotoSwipe base class that can retrieve data about every slide.
     * Shared by PhotoSwipe Core and PhotoSwipe Lightbox
     */
    class PhotoSwipeBase extends Eventable {
      /**
       * Get total number of slides
       *
       * @returns {number}
       */
      getNumItems() {
        let numItems;
        const { dataSource } = this.options;
        if (!dataSource) {
          numItems = 0;
        } else if ('length' in dataSource) {
          // may be an array or just object with length property
          numItems = dataSource.length;
        } else if ('gallery' in dataSource) {
          // query DOM elements
          if (!dataSource.items) {
            dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
          }

          if (dataSource.items) {
            numItems = dataSource.items.length;
          }
        }

        // legacy event, before filters were introduced
        const event = this.dispatch('numItems', {
          dataSource,
          numItems
        });
        return this.applyFilters('numItems', event.numItems, dataSource);
      }

      /**
       * @param {SlideData} slideData
       * @param {number} index
       */
      createContentFromData(slideData, index) {
        // @ts-expect-error
        return new Content(slideData, this, index);
      }

      /**
       * Get item data by index.
       *
       * "item data" should contain normalized information that PhotoSwipe needs to generate a slide.
       * For example, it may contain properties like
       * `src`, `srcset`, `w`, `h`, which will be used to generate a slide with image.
       *
       * @param {number} index
       */
      getItemData(index) {
        const { dataSource } = this.options;
        let dataSourceItem;
        if (Array.isArray(dataSource)) {
          // Datasource is an array of elements
          dataSourceItem = dataSource[index];
        } else if (dataSource && dataSource.gallery) {
          // dataSource has gallery property,
          // thus it was created by Lightbox, based on
          // gallery and children options

          // query DOM elements
          if (!dataSource.items) {
            dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
          }

          dataSourceItem = dataSource.items[index];
        }

        let itemData = dataSourceItem;

        if (itemData instanceof Element) {
          itemData = this._domElementToItemData(itemData);
        }

        // Dispatching the itemData event,
        // it's a legacy verion before filters were introduced
        const event = this.dispatch('itemData', {
          itemData: itemData || {},
          index
        });

        return this.applyFilters('itemData', event.itemData, index);
      }

      /**
       * Get array of gallery DOM elements,
       * based on childSelector and gallery element.
       *
       * @param {HTMLElement} galleryElement
       */
      _getGalleryDOMElements(galleryElement) {
        if (this.options.children || this.options.childSelector) {
          return getElementsFromOption(
            this.options.children,
            this.options.childSelector,
            galleryElement
          ) || [];
        }

        return [galleryElement];
      }

      /**
       * Converts DOM element to item data object.
       *
       * @param {HTMLElement} element DOM element
       */
      // eslint-disable-next-line class-methods-use-this
      _domElementToItemData(element) {
        /** @type {SlideData} */
        const itemData = {
          element
        };

        // eslint-disable-next-line max-len
        const linkEl = /** @type {HTMLAnchorElement} */ (element.tagName === 'A' ? element : element.querySelector('a'));

        if (linkEl) {
          // src comes from data-pswp-src attribute,
          // if it's empty link href is used
          itemData.src = linkEl.dataset.pswpSrc || linkEl.href;

          if (linkEl.dataset.pswpSrcset) {
            itemData.srcset = linkEl.dataset.pswpSrcset;
          }

          itemData.width = parseInt(linkEl.dataset.pswpWidth, 10);
          itemData.height = parseInt(linkEl.dataset.pswpHeight, 10);

          // support legacy w & h properties
          itemData.w = itemData.width;
          itemData.h = itemData.height;

          if (linkEl.dataset.pswpType) {
            itemData.type = linkEl.dataset.pswpType;
          }

          const thumbnailEl = element.querySelector('img');

          if (thumbnailEl) {
            // msrc is URL to placeholder image that's displayed before large image is loaded
            // by default it's displayed only for the first slide
            itemData.msrc = thumbnailEl.currentSrc || thumbnailEl.src;
            itemData.alt = thumbnailEl.getAttribute('alt');
          }

          if (linkEl.dataset.pswpCropped || linkEl.dataset.cropped) {
            itemData.thumbCropped = true;
          }
        }

        return this.applyFilters('domItemData', itemData, element, linkEl);
      }

      /**
       * Lazy-load by slide data
       *
       * @param {SlideData} itemData Data about the slide
       * @param {number} index
       * @returns Image that is being decoded or false.
       */
      lazyLoadData(itemData, index) {
        return lazyLoadData(itemData, this, index);
      }
    }

    /** @typedef {import('./photoswipe.js').default} PhotoSwipe */
    /** @typedef {import('./slide/get-thumb-bounds.js').Bounds} Bounds */
    /** @typedef {import('./util/animations.js').AnimationProps} AnimationProps */

    // some browsers do not paint
    // elements which opacity is set to 0,
    // since we need to pre-render elements for the animation -
    // we set it to the minimum amount
    const MIN_OPACITY = 0.003;

    /**
     * Manages opening and closing transitions of the PhotoSwipe.
     *
     * It can perform zoom, fade or no transition.
     */
    class Opener {
      /**
       * @param {PhotoSwipe} pswp
       */
      constructor(pswp) {
        this.pswp = pswp;
        this.isClosed = true;
        this._prepareOpen = this._prepareOpen.bind(this);

        /** @type {false | Bounds} */
        this._thumbBounds = undefined;

        // Override initial zoom and pan position
        pswp.on('firstZoomPan', this._prepareOpen);
      }

      open() {
        this._prepareOpen();
        this._start();
      }

      close() {
        if (this.isClosed || this.isClosing || this.isOpening) {
          // if we close during opening animation
          // for now do nothing,
          // browsers aren't good at changing the direction of the CSS transition
          return false;
        }

        const slide = this.pswp.currSlide;

        this.isOpen = false;
        this.isOpening = false;
        this.isClosing = true;
        this._duration = this.pswp.options.hideAnimationDuration;

        if (slide && slide.currZoomLevel * slide.width >= this.pswp.options.maxWidthToAnimate) {
          this._duration = 0;
        }

        this._applyStartProps();
        setTimeout(() => {
          this._start();
        }, this._croppedZoom ? 30 : 0);

        return true;
      }

      _prepareOpen() {
        this.pswp.off('firstZoomPan', this._prepareOpen);
        if (!this.isOpening) {
          const slide = this.pswp.currSlide;
          this.isOpening = true;
          this.isClosing = false;
          this._duration = this.pswp.options.showAnimationDuration;
          if (slide && slide.zoomLevels.initial * slide.width >= this.pswp.options.maxWidthToAnimate) {
            this._duration = 0;
          }
          this._applyStartProps();
        }
      }

      _applyStartProps() {
        const { pswp } = this;
        const slide = this.pswp.currSlide;
        const { options } = pswp;

        if (options.showHideAnimationType === 'fade') {
          options.showHideOpacity = true;
          this._thumbBounds = false;
        } else if (options.showHideAnimationType === 'none') {
          options.showHideOpacity = false;
          this._duration = 0;
          this._thumbBounds = false;
        } else if (this.isOpening && pswp._initialThumbBounds) {
          // Use initial bounds if defined
          this._thumbBounds = pswp._initialThumbBounds;
        } else {
          this._thumbBounds = this.pswp.getThumbBounds();
        }

        this._placeholder = slide.getPlaceholderElement();

        pswp.animations.stopAll();

        // Discard animations when duration is less than 50ms
        this._useAnimation = (this._duration > 50);
        this._animateZoom = Boolean(this._thumbBounds)
                            && (slide.content && slide.content.usePlaceholder())
                            && (!this.isClosing || !pswp.mainScroll.isShifted());
        if (!this._animateZoom) {
          this._animateRootOpacity = true;

          if (this.isOpening) {
            slide.zoomAndPanToInitial();
            slide.applyCurrentZoomPan();
          }
        } else {
          this._animateRootOpacity = options.showHideOpacity;
        }
        this._animateBgOpacity = !this._animateRootOpacity && this.pswp.options.bgOpacity > MIN_OPACITY;
        this._opacityElement = this._animateRootOpacity ? pswp.element : pswp.bg;

        if (!this._useAnimation) {
          this._duration = 0;
          this._animateZoom = false;
          this._animateBgOpacity = false;
          this._animateRootOpacity = true;
          if (this.isOpening) {
            pswp.element.style.opacity = String(MIN_OPACITY);
            pswp.applyBgOpacity(1);
          }
          return;
        }

        if (this._animateZoom && this._thumbBounds && this._thumbBounds.innerRect) {
          // Properties are used when animation from cropped thumbnail
          this._croppedZoom = true;
          this._cropContainer1 = this.pswp.container;
          this._cropContainer2 = this.pswp.currSlide.holderElement;

          pswp.container.style.overflow = 'hidden';
          pswp.container.style.width = pswp.viewportSize.x + 'px';
        } else {
          this._croppedZoom = false;
        }

        if (this.isOpening) {
          // Apply styles before opening transition
          if (this._animateRootOpacity) {
            pswp.element.style.opacity = String(MIN_OPACITY);
            pswp.applyBgOpacity(1);
          } else {
            if (this._animateBgOpacity) {
              pswp.bg.style.opacity = String(MIN_OPACITY);
            }
            pswp.element.style.opacity = '1';
          }

          if (this._animateZoom) {
            this._setClosedStateZoomPan();
            if (this._placeholder) {
              // tell browser that we plan to animate the placeholder
              this._placeholder.style.willChange = 'transform';

              // hide placeholder to allow hiding of
              // elements that overlap it (such as icons over the thumbnail)
              this._placeholder.style.opacity = String(MIN_OPACITY);
            }
          }
        } else if (this.isClosing) {
          // hide nearby slides to make sure that
          // they are not painted during the transition
          pswp.mainScroll.itemHolders[0].el.style.display = 'none';
          pswp.mainScroll.itemHolders[2].el.style.display = 'none';

          if (this._croppedZoom) {
            if (pswp.mainScroll.x !== 0) {
              // shift the main scroller to zero position
              pswp.mainScroll.resetPosition();
              pswp.mainScroll.resize();
            }
          }
        }
      }

      _start() {
        if (this.isOpening
            && this._useAnimation
            && this._placeholder
            && this._placeholder.tagName === 'IMG') {
          // To ensure smooth animation
          // we wait till the current slide image placeholder is decoded,
          // but no longer than 250ms,
          // and no shorter than 50ms
          // (just using requestanimationframe is not enough in Firefox,
          // for some reason)
          new Promise((resolve) => {
            let decoded = false;
            let isDelaying = true;
            decodeImage(/** @type {HTMLImageElement} */ (this._placeholder)).finally(() => {
              decoded = true;
              if (!isDelaying) {
                resolve();
              }
            });
            setTimeout(() => {
              isDelaying = false;
              if (decoded) {
                resolve();
              }
            }, 50);
            setTimeout(resolve, 250);
          }).finally(() => this._initiate());
        } else {
          this._initiate();
        }
      }

      _initiate() {
        this.pswp.element.style.setProperty('--pswp-transition-duration', this._duration + 'ms');

        this.pswp.dispatch(
          this.isOpening ? 'openingAnimationStart' : 'closingAnimationStart'
        );

        // legacy event
        this.pswp.dispatch(
          /** @type {'initialZoomIn' | 'initialZoomOut'} */
          ('initialZoom' + (this.isOpening ? 'In' : 'Out'))
        );

        this.pswp.element.classList[this.isOpening ? 'add' : 'remove']('pswp--ui-visible');

        if (this.isOpening) {
          if (this._placeholder) {
            // unhide the placeholder
            this._placeholder.style.opacity = '1';
          }
          this._animateToOpenState();
        } else if (this.isClosing) {
          this._animateToClosedState();
        }

        if (!this._useAnimation) {
          this._onAnimationComplete();
        }
      }

      _onAnimationComplete() {
        const { pswp } = this;
        this.isOpen = this.isOpening;
        this.isClosed = this.isClosing;
        this.isOpening = false;
        this.isClosing = false;

        pswp.dispatch(
          this.isOpen ? 'openingAnimationEnd' : 'closingAnimationEnd'
        );

        // legacy event
        pswp.dispatch(
          /** @type {'initialZoomInEnd' | 'initialZoomOutEnd'} */
          ('initialZoom' + (this.isOpen ? 'InEnd' : 'OutEnd'))
        );

        if (this.isClosed) {
          pswp.destroy();
        } else if (this.isOpen) {
          if (this._animateZoom) {
            pswp.container.style.overflow = 'visible';
            pswp.container.style.width = '100%';
          }
          pswp.currSlide.applyCurrentZoomPan();
        }
      }

      _animateToOpenState() {
        const { pswp } = this;
        if (this._animateZoom) {
          if (this._croppedZoom) {
            this._animateTo(this._cropContainer1, 'transform', 'translate3d(0,0,0)');
            this._animateTo(this._cropContainer2, 'transform', 'none');
          }

          pswp.currSlide.zoomAndPanToInitial();
          this._animateTo(
            pswp.currSlide.container,
            'transform',
            pswp.currSlide.getCurrentTransform()
          );
        }

        if (this._animateBgOpacity) {
          this._animateTo(pswp.bg, 'opacity', String(pswp.options.bgOpacity));
        }

        if (this._animateRootOpacity) {
          this._animateTo(pswp.element, 'opacity', '1');
        }
      }

      _animateToClosedState() {
        const { pswp } = this;

        if (this._animateZoom) {
          this._setClosedStateZoomPan(true);
        }

        if (this._animateBgOpacity
            && pswp.bgOpacity > 0.01) { // do not animate opacity if it's already at 0
          this._animateTo(pswp.bg, 'opacity', '0');
        }

        if (this._animateRootOpacity) {
          this._animateTo(pswp.element, 'opacity', '0');
        }
      }

      /**
       * @param {boolean=} animate
       */
      _setClosedStateZoomPan(animate) {
        if (!this._thumbBounds) return;

        const { pswp } = this;
        const { innerRect } = this._thumbBounds;
        const { currSlide, viewportSize } = pswp;

        if (this._croppedZoom) {
          const containerOnePanX = -viewportSize.x + (this._thumbBounds.x - innerRect.x) + innerRect.w;
          const containerOnePanY = -viewportSize.y + (this._thumbBounds.y - innerRect.y) + innerRect.h;
          const containerTwoPanX = viewportSize.x - innerRect.w;
          const containerTwoPanY = viewportSize.y - innerRect.h;


          if (animate) {
            this._animateTo(
              this._cropContainer1,
              'transform',
              toTransformString(containerOnePanX, containerOnePanY)
            );

            this._animateTo(
              this._cropContainer2,
              'transform',
              toTransformString(containerTwoPanX, containerTwoPanY)
            );
          } else {
            setTransform(this._cropContainer1, containerOnePanX, containerOnePanY);
            setTransform(this._cropContainer2, containerTwoPanX, containerTwoPanY);
          }
        }

        equalizePoints(currSlide.pan, innerRect || this._thumbBounds);
        currSlide.currZoomLevel = this._thumbBounds.w / currSlide.width;

        if (animate) {
          this._animateTo(currSlide.container, 'transform', currSlide.getCurrentTransform());
        } else {
          currSlide.applyCurrentZoomPan();
        }
      }

      /**
       * @param {HTMLElement} target
       * @param {'transform' | 'opacity'} prop
       * @param {string} propValue
       */
      _animateTo(target, prop, propValue) {
        if (!this._duration) {
          target.style[prop] = propValue;
          return;
        }

        const { animations } = this.pswp;
        /** @type {AnimationProps} */
        const animProps = {
          duration: this._duration,
          easing: this.pswp.options.easing,
          onComplete: () => {
            if (!animations.activeAnimations.length) {
              this._onAnimationComplete();
            }
          },
          target,
        };
        animProps[prop] = propValue;
        animations.startTransition(animProps);
      }
    }

    /**
     * @template T
     * @typedef {import('./types.js').Type<T>} Type<T>
     */

    /** @typedef {import('./slide/slide.js').SlideData} SlideData */
    /** @typedef {import('./slide/zoom-level.js').ZoomLevelOption} ZoomLevelOption */
    /** @typedef {import('./ui/ui-element.js').UIElementData} UIElementData */
    /** @typedef {import('./main-scroll.js').ItemHolder} ItemHolder */
    /** @typedef {import('./core/eventable.js').PhotoSwipeEventsMap} PhotoSwipeEventsMap */
    /** @typedef {import('./core/eventable.js').PhotoSwipeFiltersMap} PhotoSwipeFiltersMap */
    /**
     * @template T
     * @typedef {import('./core/eventable.js').EventCallback<T>} EventCallback<T>
     */
    /**
     * @template T
     * @typedef {import('./core/eventable.js').AugmentedEvent<T>} AugmentedEvent<T>
     */

    /** @typedef {{ x?: number; y?: number; id?: string | number }} Point */
    /** @typedef {{ x?: number; y?: number }} Size */
    /** @typedef {{ top: number; bottom: number; left: number; right: number }} Padding */
    /** @typedef {SlideData[]} DataSourceArray */
    /** @typedef {{ gallery: HTMLElement; items?: HTMLElement[] }} DataSourceObject */
    /** @typedef {DataSourceArray | DataSourceObject} DataSource */
    /** @typedef {(point: Point, originalEvent: PointerEvent) => void} ActionFn */
    /** @typedef {'close' | 'next' | 'zoom' | 'zoom-or-close' | 'toggle-controls'} ActionType */
    /** @typedef {Type<PhotoSwipe> | { default: Type<PhotoSwipe> }} PhotoSwipeModule */
    /** @typedef {PhotoSwipeModule | Promise<PhotoSwipeModule> | (() => Promise<PhotoSwipeModule>)} PhotoSwipeModuleOption */

    /**
     * @typedef {string | NodeListOf<HTMLElement> | HTMLElement[] | HTMLElement} ElementProvider
     */

    /**
     * @typedef {Object} PhotoSwipeOptions https://photoswipe.com/options/
     *
     * @prop {DataSource=} dataSource
     * Pass an array of any items via dataSource option. Its length will determine amount of slides
     * (which may be modified further from numItems event).
     *
     * Each item should contain data that you need to generate slide
     * (for image slide it would be src (image URL), width (image width), height, srcset, alt).
     *
     * If these properties are not present in your initial array, you may "pre-parse" each item from itemData filter.
     *
     * @prop {number=} bgOpacity
     * Background backdrop opacity, always define it via this option and not via CSS rgba color.
     *
     * @prop {number=} spacing
     * Spacing between slides. Defined as ratio relative to the viewport width (0.1 = 10% of viewport).
     *
     * @prop {boolean=} allowPanToNext
     * Allow swipe navigation to the next slide when the current slide is zoomed. Does not apply to mouse events.
     *
     * @prop {boolean=} loop
     * If set to true you'll be able to swipe from the last to the first image.
     * Option is always false when there are less than 3 slides.
     *
     * @prop {boolean=} wheelToZoom
     * By default PhotoSwipe zooms image with ctrl-wheel, if you enable this option - image will zoom just via wheel.
     *
     * @prop {boolean=} pinchToClose
     * Pinch touch gesture to close the gallery.
     *
     * @prop {boolean=} closeOnVerticalDrag
     * Vertical drag gesture to close the PhotoSwipe.
     *
     * @prop {Padding=} padding
     * Slide area padding (in pixels).
     *
     * @prop {(viewportSize: Size, itemData: SlideData, index: number) => Padding} [paddingFn]
     * The option is checked frequently, so make sure it's performant. Overrides padding option if defined. For example:
     *
     * @prop {number | false} [hideAnimationDuration]
     * Transition duration in milliseconds, can be 0.
     *
     * @prop {number | false} [showAnimationDuration]
     * Transition duration in milliseconds, can be 0.
     *
     * @prop {number | false} [zoomAnimationDuration]
     * Transition duration in milliseconds, can be 0.
     *
     * @prop {string=} easing
     * String, 'cubic-bezier(.4,0,.22,1)'. CSS easing function for open/close/zoom transitions.
     *
     * @prop {boolean=} escKey
     * Esc key to close.
     *
     * @prop {boolean=} arrowKeys
     * Left/right arrow keys for navigation.
     *
     * @prop {boolean=} returnFocus
     * Restore focus the last active element after PhotoSwipe is closed.
     *
     * @prop {boolean=} clickToCloseNonZoomable
     * If image is not zoomable (for example, smaller than viewport) it can be closed by clicking on it.
     *
     * @prop {ActionType | ActionFn | false} [imageClickAction]
     * Refer to click and tap actions page.
     *
     * @prop {ActionType | ActionFn | false} [bgClickAction]
     * Refer to click and tap actions page.
     *
     * @prop {ActionType | ActionFn | false} [tapAction]
     * Refer to click and tap actions page.
     *
     * @prop {ActionType | ActionFn | false} [doubleTapAction]
     * Refer to click and tap actions page.
     *
     * @prop {number=} preloaderDelay
     * Delay before the loading indicator will be displayed,
     * if image is loaded during it - the indicator will not be displayed at all. Can be zero.
     *
     * @prop {string=} indexIndicatorSep
     * Used for slide count indicator ("1 of 10 ").
     *
     * @prop {(options: PhotoSwipeOptions, pswp: PhotoSwipe) => { x: number; y: number }} [getViewportSizeFn]
     * A function that should return slide viewport width and height, in format {x: 100, y: 100}.
     *
     * @prop {string=} errorMsg
     * Message to display when the image wasn't able to load. If you need to display HTML - use contentErrorElement filter.
     *
     * @prop {[number, number]=} preload
     * Lazy loading of nearby slides based on direction of movement. Should be an array with two integers,
     * first one - number of items to preload before the current image, second one - after the current image.
     * Two nearby images are always loaded.
     *
     * @prop {string=} mainClass
     * Class that will be added to the root element of PhotoSwipe, may contain multiple separated by space.
     * Example on Styling page.
     *
     * @prop {HTMLElement=} appendToEl
     * Element to which PhotoSwipe dialog will be appended when it opens.
     *
     * @prop {number=} maxWidthToAnimate
     * Maximum width of image to animate, if initial rendered image width
     * is larger than this value - the opening/closing transition will be automatically disabled.
     *
     * @prop {string=} closeTitle
     * Translating
     *
     * @prop {string=} zoomTitle
     * Translating
     *
     * @prop {string=} arrowPrevTitle
     * Translating
     *
     * @prop {string=} arrowNextTitle
     * Translating
     *
     * @prop {'zoom' | 'fade' | 'none'} [showHideAnimationType]
     * To adjust opening or closing transition type use lightbox option `showHideAnimationType` (`String`).
     * It supports three values - `zoom` (default), `fade` (default if there is no thumbnail) and `none`.
     *
     * Animations are automatically disabled if user `(prefers-reduced-motion: reduce)`.
     *
     * @prop {number=} index
     * Defines start slide index.
     *
     * @prop {(e: MouseEvent) => number} [getClickedIndexFn]
     *
     * @prop {boolean=} arrowPrev
     * @prop {boolean=} arrowNext
     * @prop {boolean=} zoom
     * @prop {boolean=} close
     * @prop {boolean=} counter
     *
     * @prop {string=} arrowPrevSVG
     * @prop {string=} arrowNextSVG
     * @prop {string=} zoomSVG
     * @prop {string=} closeSVG
     * @prop {string=} counterSVG
     *
     * @prop {string=} arrowPrevTitle
     * @prop {string=} arrowNextTitle
     * @prop {string=} zoomTitle
     * @prop {string=} closeTitle
     * @prop {string=} counterTitle
     *
     * @prop {ZoomLevelOption=} initialZoomLevel
     * @prop {ZoomLevelOption=} secondaryZoomLevel
     * @prop {ZoomLevelOption=} maxZoomLevel
     *
     * @prop {boolean=} mouseMovePan
     * @prop {Point | null} [initialPointerPos]
     * @prop {boolean=} showHideOpacity
     *
     * @prop {PhotoSwipeModuleOption} [pswpModule]
     * @prop {() => Promise<any>} [openPromise]
     * @prop {boolean=} preloadFirstSlide
     * @prop {ElementProvider=} gallery
     * @prop {string=} gallerySelector
     * @prop {ElementProvider=} children
     * @prop {string=} childSelector
     * @prop {string | false} [thumbSelector]
     */

    /** @type {PhotoSwipeOptions} */
    const defaultOptions = {
      allowPanToNext: true,
      spacing: 0.1,
      loop: true,
      pinchToClose: true,
      closeOnVerticalDrag: true,
      hideAnimationDuration: 333,
      showAnimationDuration: 333,
      zoomAnimationDuration: 333,
      escKey: true,
      arrowKeys: true,
      returnFocus: true,
      maxWidthToAnimate: 4000,
      clickToCloseNonZoomable: true,
      imageClickAction: 'zoom-or-close',
      bgClickAction: 'close',
      tapAction: 'toggle-controls',
      doubleTapAction: 'zoom',
      indexIndicatorSep: ' / ',
      preloaderDelay: 2000,
      bgOpacity: 0.8,

      index: 0,
      errorMsg: 'The image cannot be loaded',
      preload: [1, 2],
      easing: 'cubic-bezier(.4,0,.22,1)'
    };

    /**
     * PhotoSwipe Core
     */
    class PhotoSwipe extends PhotoSwipeBase {
      /**
       * @param {PhotoSwipeOptions} options
       */
      constructor(options) {
        super();

        this._prepareOptions(options);

        /**
         * offset of viewport relative to document
         *
         * @type {{ x?: number; y?: number }}
         */
        this.offset = {};

        /**
         * @type {{ x?: number; y?: number }}
         * @private
         */
        this._prevViewportSize = {};

        /**
         * Size of scrollable PhotoSwipe viewport
         *
         * @type {{ x?: number; y?: number }}
         */
        this.viewportSize = {};

        /**
         * background (backdrop) opacity
         *
         * @type {number}
         */
        this.bgOpacity = 1;

        /** @type {HTMLDivElement} */
        this.topBar = undefined;

        this.events = new DOMEvents();

        /** @type {Animations} */
        this.animations = new Animations();

        this.mainScroll = new MainScroll(this);
        this.gestures = new Gestures(this);
        this.opener = new Opener(this);
        this.keyboard = new Keyboard(this);
        this.contentLoader = new ContentLoader(this);
      }

      init() {
        if (this.isOpen || this.isDestroying) {
          return;
        }

        this.isOpen = true;
        this.dispatch('init'); // legacy
        this.dispatch('beforeOpen');

        this._createMainStructure();

        // add classes to the root element of PhotoSwipe
        let rootClasses = 'pswp--open';
        if (this.gestures.supportsTouch) {
          rootClasses += ' pswp--touch';
        }
        if (this.options.mainClass) {
          rootClasses += ' ' + this.options.mainClass;
        }
        this.element.className += ' ' + rootClasses;

        this.currIndex = this.options.index || 0;
        this.potentialIndex = this.currIndex;
        this.dispatch('firstUpdate'); // starting index can be modified here

        // initialize scroll wheel handler to block the scroll
        this.scrollWheel = new ScrollWheel(this);

        // sanitize index
        if (Number.isNaN(this.currIndex)
            || this.currIndex < 0
            || this.currIndex >= this.getNumItems()) {
          this.currIndex = 0;
        }

        if (!this.gestures.supportsTouch) {
          // enable mouse features if no touch support detected
          this.mouseDetected();
        }

        // causes forced synchronous layout
        this.updateSize();

        this.offset.y = window.pageYOffset;

        this._initialItemData = this.getItemData(this.currIndex);
        this.dispatch('gettingData', {
          index: this.currIndex,
          data: this._initialItemData,
          slide: undefined
        });

        // *Layout* - calculate size and position of elements here
        this._initialThumbBounds = this.getThumbBounds();
        this.dispatch('initialLayout');

        this.on('openingAnimationEnd', () => {
          this.mainScroll.itemHolders[0].el.style.display = 'block';
          this.mainScroll.itemHolders[2].el.style.display = 'block';

          // Add content to the previous and next slide
          this.setContent(this.mainScroll.itemHolders[0], this.currIndex - 1);
          this.setContent(this.mainScroll.itemHolders[2], this.currIndex + 1);

          this.appendHeavy();

          this.contentLoader.updateLazy();

          this.events.add(window, 'resize', this._handlePageResize.bind(this));
          this.events.add(window, 'scroll', this._updatePageScrollOffset.bind(this));
          this.dispatch('bindEvents');
        });

        // set content for center slide (first time)
        this.setContent(this.mainScroll.itemHolders[1], this.currIndex);
        this.dispatch('change');

        this.opener.open();

        this.dispatch('afterInit');

        return true;
      }

      /**
       * Get looped slide index
       * (for example, -1 will return the last slide)
       *
       * @param {number} index
       */
      getLoopedIndex(index) {
        const numSlides = this.getNumItems();

        if (this.options.loop) {
          if (index > numSlides - 1) {
            index -= numSlides;
          }

          if (index < 0) {
            index += numSlides;
          }
        }

        index = clamp(index, 0, numSlides - 1);

        return index;
      }

      appendHeavy() {
        this.mainScroll.itemHolders.forEach((itemHolder) => {
          if (itemHolder.slide) {
            itemHolder.slide.appendHeavy();
          }
        });
      }

      /**
       * Change the slide
       * @param {number} index New index
       */
      goTo(index) {
        this.mainScroll.moveIndexBy(
          this.getLoopedIndex(index) - this.potentialIndex
        );
      }

      /**
       * Go to the next slide.
       */
      next() {
        this.goTo(this.potentialIndex + 1);
      }

      /**
       * Go to the previous slide.
       */
      prev() {
        this.goTo(this.potentialIndex - 1);
      }

      /**
       * @see slide/slide.js zoomTo
       *
       * @param {Parameters<Slide['zoomTo']>} args
       */
      zoomTo(...args) {
        this.currSlide.zoomTo(...args);
      }

      /**
       * @see slide/slide.js toggleZoom
       */
      toggleZoom() {
        this.currSlide.toggleZoom();
      }

      /**
       * Close the gallery.
       * After closing transition ends - destroy it
       */
      close() {
        if (!this.opener.isOpen || this.isDestroying) {
          return;
        }

        this.isDestroying = true;

        this.dispatch('close');

        this.events.removeAll();
        this.opener.close();
      }

      /**
       * Destroys the gallery:
       * - instantly closes the gallery
       * - unbinds events,
       * - cleans intervals and timeouts
       * - removes elements from DOM
       */
      destroy() {
        if (!this.isDestroying) {
          this.options.showHideAnimationType = 'none';
          this.close();
          return;
        }

        this.dispatch('destroy');

        this.listeners = null;

        this.scrollWrap.ontouchmove = null;
        this.scrollWrap.ontouchend = null;

        this.element.remove();

        this.mainScroll.itemHolders.forEach((itemHolder) => {
          if (itemHolder.slide) {
            itemHolder.slide.destroy();
          }
        });

        this.contentLoader.destroy();
        this.events.removeAll();
      }

      /**
       * Refresh/reload content of a slide by its index
       *
       * @param {number} slideIndex
       */
      refreshSlideContent(slideIndex) {
        this.contentLoader.removeByIndex(slideIndex);
        this.mainScroll.itemHolders.forEach((itemHolder, i) => {
          let potentialHolderIndex = this.currSlide.index - 1 + i;
          if (this.canLoop()) {
            potentialHolderIndex = this.getLoopedIndex(potentialHolderIndex);
          }
          if (potentialHolderIndex === slideIndex) {
            // set the new slide content
            this.setContent(itemHolder, slideIndex, true);

            // activate the new slide if it's current
            if (i === 1) {
              /** @type {Slide} */
              this.currSlide = itemHolder.slide;
              itemHolder.slide.setIsActive(true);
            }
          }
        });

        this.dispatch('change');
      }


      /**
       * Set slide content
       *
       * @param {ItemHolder} holder mainScroll.itemHolders array item
       * @param {number} index Slide index
       * @param {boolean=} force If content should be set even if index wasn't changed
       */
      setContent(holder, index, force) {
        if (this.canLoop()) {
          index = this.getLoopedIndex(index);
        }

        if (holder.slide) {
          if (holder.slide.index === index && !force) {
            // exit if holder already contains this slide
            // this could be common when just three slides are used
            return;
          }

          // destroy previous slide
          holder.slide.destroy();
          holder.slide = null;
        }

        // exit if no loop and index is out of bounds
        if (!this.canLoop() && (index < 0 || index >= this.getNumItems())) {
          return;
        }

        const itemData = this.getItemData(index);
        holder.slide = new Slide(itemData, index, this);

        // set current slide
        if (index === this.currIndex) {
          this.currSlide = holder.slide;
        }

        holder.slide.append(holder.el);
      }

      getViewportCenterPoint() {
        return {
          x: this.viewportSize.x / 2,
          y: this.viewportSize.y / 2
        };
      }

      /**
       * Update size of all elements.
       * Executed on init and on page resize.
       *
       * @param {boolean=} force Update size even if size of viewport was not changed.
       */
      updateSize(force) {
        // let item;
        // let itemIndex;

        if (this.isDestroying) {
          // exit if PhotoSwipe is closed or closing
          // (to avoid errors, as resize event might be delayed)
          return;
        }

        //const newWidth = this.scrollWrap.clientWidth;
        //const newHeight = this.scrollWrap.clientHeight;

        const newViewportSize = getViewportSize(this.options, this);

        if (!force && pointsEqual(newViewportSize, this._prevViewportSize)) {
          // Exit if dimensions were not changed
          return;
        }

        //this._prevViewportSize.x = newWidth;
        //this._prevViewportSize.y = newHeight;
        equalizePoints(this._prevViewportSize, newViewportSize);

        this.dispatch('beforeResize');

        equalizePoints(this.viewportSize, this._prevViewportSize);

        this._updatePageScrollOffset();

        this.dispatch('viewportSize');

        // Resize slides only after opener animation is finished
        // and don't re-calculate size on inital size update
        this.mainScroll.resize(this.opener.isOpen);

        if (!this.hasMouse && window.matchMedia('(any-hover: hover)').matches) {
          this.mouseDetected();
        }

        this.dispatch('resize');
      }

      /**
       * @param {number} opacity
       */
      applyBgOpacity(opacity) {
        this.bgOpacity = Math.max(opacity, 0);
        this.bg.style.opacity = String(this.bgOpacity * this.options.bgOpacity);
      }

      /**
       * Whether mouse is detected
       */
      mouseDetected() {
        if (!this.hasMouse) {
          this.hasMouse = true;
          this.element.classList.add('pswp--has_mouse');
        }
      }

      /**
       * Page resize event handler
       *
       * @private
       */
      _handlePageResize() {
        this.updateSize();

        // In iOS webview, if element size depends on document size,
        // it'll be measured incorrectly in resize event
        //
        // https://bugs.webkit.org/show_bug.cgi?id=170595
        // https://hackernoon.com/onresize-event-broken-in-mobile-safari-d8469027bf4d
        if (/iPhone|iPad|iPod/i.test(window.navigator.userAgent)) {
          setTimeout(() => {
            this.updateSize();
          }, 500);
        }
      }

      /**
       * Page scroll offset is used
       * to get correct coordinates
       * relative to PhotoSwipe viewport.
       *
       * @private
       */
      _updatePageScrollOffset() {
        this.setScrollOffset(0, window.pageYOffset);
      }

      /**
       * @param {number} x
       * @param {number} y
       */
      setScrollOffset(x, y) {
        this.offset.x = x;
        this.offset.y = y;
        this.dispatch('updateScrollOffset');
      }

      /**
       * Create main HTML structure of PhotoSwipe,
       * and add it to DOM
       *
       * @private
       */
      _createMainStructure() {
        // root DOM element of PhotoSwipe (.pswp)
        this.element = createElement('pswp');
        this.element.setAttribute('tabindex', '-1');
        this.element.setAttribute('role', 'dialog');

        // template is legacy prop
        this.template = this.element;

        // Background is added as a separate element,
        // as animating opacity is faster than animating rgba()
        this.bg = createElement('pswp__bg', false, this.element);
        this.scrollWrap = createElement('pswp__scroll-wrap', false, this.element);
        this.container = createElement('pswp__container', false, this.scrollWrap);

        this.mainScroll.appendHolders();

        this.ui = new UI(this);
        this.ui.init();

        // append to DOM
        (this.options.appendToEl || document.body).appendChild(this.element);
      }


      /**
       * Get position and dimensions of small thumbnail
       *   {x:,y:,w:}
       *
       * Height is optional (calculated based on the large image)
       */
      getThumbBounds() {
        return getThumbBounds(
          this.currIndex,
          this.currSlide ? this.currSlide.data : this._initialItemData,
          this
        );
      }

      /**
       * If the PhotoSwipe can have continious loop
       * @returns Boolean
       */
      canLoop() {
        return (this.options.loop && this.getNumItems() > 2);
      }

      /**
       * @param {PhotoSwipeOptions} options
       * @private
       */
      _prepareOptions(options) {
        if (window.matchMedia('(prefers-reduced-motion), (update: slow)').matches) {
          options.showHideAnimationType = 'none';
          options.zoomAnimationDuration = 0;
        }

        /** @type {PhotoSwipeOptions}*/
        this.options = {
          ...defaultOptions,
          ...options
        };
      }
    }

    /*
           (accessible)
         _ _      _       _
     ___| (_) ___| | __  (_)___
    / __| | |/ __| |/ /  | / __|
    \__ \ | | (__|   < _ | \__ \
    |___/_|_|\___|_|\_(_)/ |___/
                       |__/

     Version: 1.8.1@accessible360.1
      Author: Jason Webb (Accessible360)
     Website: https://accessible360.com
        Docs: https://accessible360.github.io/accessible-slick
        Repo: https://github.com/Accessible360/accessible-slick
      Issues: https://github.com/Accessible360/accessible-slick/issues

     */
    (function(factory) {
        if (typeof define === 'function' && define.amd) {
            define(['jquery'], factory);
        } else if (typeof exports !== 'undefined') {
            module.exports = factory(require('jquery'));
        } else {
            factory(jQuery);
        }

    }(function($) {
        var Slick = window.Slick || {};

        Slick = (function() {

            var instanceUid = 0;

            function Slick(element, settings) {

                var _ = this, dataSettings;

                _.defaults = {
                    adaptiveHeight: false,
                    appendArrows: $(element),
                    appendDots: $(element),
                    arrows: true,
                    arrowsPlacement: null,
                    asNavFor: null,
                    prevArrow: '<button class="slick-prev" type="button">'
                                + '<span class="slick-prev-icon" aria-hidden="true"></span>'
                                + '<span class="slick-sr-only">Previous</span>'
                             + '</button>',
                    nextArrow: '<button class="slick-next" type="button">'
                                + '<span class="slick-next-icon" aria-hidden="true"></span>'
                                + '<span class="slick-sr-only">Next</span>'
                             + '</button>',
                    autoplay: false,
                    autoplaySpeed: 3000,
                    centerMode: false,
                    centerPadding: '50px',
                    cssEase: 'ease',
                    customPaging: function(slider, i) {
                        return $('<button type="button">'
                                    + '<span class="slick-dot-icon" aria-hidden="true"></span>'
                                    + '<span class="slick-sr-only">Go to slide ' + (i+1) + '</span>'
                                + '</button>');
                    },
                    dots: false,
                    dotsClass: 'slick-dots',
                    draggable: true,
                    easing: 'linear',
                    edgeFriction: 0.35,
                    fade: false,
                    infinite: true,
                    initialSlide: 0,
                    instructionsText: null,
                    lazyLoad: 'ondemand',
                    mobileFirst: false,
                    playIcon: '<span class="slick-play-icon" aria-hidden="true"></span>',
                    pauseIcon: '<span class="slick-pause-icon" aria-hidden="true"></span>',
                    pauseOnHover: true,
                    pauseOnFocus: true,
                    pauseOnDotsHover: false,
                    regionLabel: 'carousel',
                    respondTo: 'window',
                    responsive: null,
                    rows: 1,
                    rtl: false,
                    slide: '',
                    slidesPerRow: 1,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    speed: 500,
                    swipe: true,
                    swipeToSlide: false,
                    touchMove: true,
                    touchThreshold: 5,
                    useAutoplayToggleButton: true,
                    useCSS: true,
                    useGroupRole: true,
                    useTransform: true,
                    variableWidth: false,
                    vertical: false,
                    verticalSwiping: false,
                    waitForAnimate: true,
                    zIndex: 1000
                };

                _.initials = {
                    animating: false,
                    dragging: false,
                    autoPlayTimer: null,
                    currentDirection: 0,
                    currentLeft: null,
                    currentSlide: 0,
                    direction: 1,
                    $dots: null,
                    $instructionsText: null,
                    listWidth: null,
                    listHeight: null,
                    loadIndex: 0,
                    $nextArrow: null,
                    $pauseButton: null,
                    $pauseIcon: null,
                    $playIcon: null,
                    $prevArrow: null,
                    scrolling: false,
                    slideCount: null,
                    slideWidth: null,
                    $slideTrack: null,
                    $slides: null,
                    sliding: false,
                    slideOffset: 0,
                    swipeLeft: null,
                    swiping: false,
                    $list: null,
                    touchObject: {},
                    transformsEnabled: false,
                    unslicked: false
                };

                $.extend(_, _.initials);

                _.activeBreakpoint = null;
                _.animType = null;
                _.animProp = null;
                _.breakpoints = [];
                _.breakpointSettings = [];
                _.cssTransitions = false;
                _.focussed = false;
                _.interrupted = false;
                _.hidden = 'hidden';
                _.paused = true;
                _.positionProp = null;
                _.respondTo = null;
                _.rowCount = 1;
                _.shouldClick = true;
                _.$slider = $(element);
                _.$slidesCache = null;
                _.transformType = null;
                _.transitionType = null;
                _.visibilityChange = 'visibilitychange';
                _.windowWidth = 0;
                _.windowTimer = null;

                dataSettings = $(element).data('slick') || {};

                _.options = $.extend({}, _.defaults, settings, dataSettings);

                _.currentSlide = _.options.initialSlide;

                _.originalSettings = _.options;

                if (typeof document.mozHidden !== 'undefined') {
                    _.hidden = 'mozHidden';
                    _.visibilityChange = 'mozvisibilitychange';
                } else if (typeof document.webkitHidden !== 'undefined') {
                    _.hidden = 'webkitHidden';
                    _.visibilityChange = 'webkitvisibilitychange';
                }

                _.autoPlay = $.proxy(_.autoPlay, _);
                _.autoPlayClear = $.proxy(_.autoPlayClear, _);
                _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
                _.autoPlayToggleHandler = $.proxy(_.autoPlayToggleHandler, _);
                _.changeSlide = $.proxy(_.changeSlide, _);
                _.clickHandler = $.proxy(_.clickHandler, _);
                _.selectHandler = $.proxy(_.selectHandler, _);
                _.setPosition = $.proxy(_.setPosition, _);
                _.swipeHandler = $.proxy(_.swipeHandler, _);
                _.dragHandler = $.proxy(_.dragHandler, _);

                _.instanceUid = instanceUid++;

                // A simple way to check for HTML strings
                // Strict HTML recognition (must start with <)
                // Extracted from jQuery v1.11 source
                _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


                _.registerBreakpoints();
                _.init(true);

            }

            return Slick;

        }());

        Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

            var _ = this;

            if (typeof(index) === 'boolean') {
                addBefore = index;
                index = null;
            } else if (index < 0 || (index >= _.slideCount)) {
                return false;
            }

            _.unload();

            if (typeof(index) === 'number') {
                if (index === 0 && _.$slides.length === 0) {
                    $(markup).appendTo(_.$slideTrack);
                } else if (addBefore) {
                    $(markup).insertBefore(_.$slides.eq(index));
                } else {
                    $(markup).insertAfter(_.$slides.eq(index));
                }
            } else {
                if (addBefore === true) {
                    $(markup).prependTo(_.$slideTrack);
                } else {
                    $(markup).appendTo(_.$slideTrack);
                }
            }

            _.$slides = _.$slideTrack.children(this.options.slide);

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.append(_.$slides);

            _.$slides.each(function(index, element) {
                $(element).attr('data-slick-index', index);
                $(element).attr('role', 'group');
                $(element).attr('aria-label', 'slide ' + index);
            });

            _.$slidesCache = _.$slides;

            _.reinit();

        };

        Slick.prototype.animateHeight = function() {
            var _ = this;
            if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
                var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
                _.$list.animate({
                    height: targetHeight
                }, _.options.speed);
            }
        };

        Slick.prototype.animateSlide = function(targetLeft, callback) {

            var animProps = {},
                _ = this;

            _.animateHeight();

            if (_.options.rtl === true && _.options.vertical === false) {
                targetLeft = -targetLeft;
            }
            if (_.transformsEnabled === false) {
                if (_.options.vertical === false) {
                    _.$slideTrack.animate({
                        left: targetLeft
                    }, _.options.speed, _.options.easing, callback);
                } else {
                    _.$slideTrack.animate({
                        top: targetLeft
                    }, _.options.speed, _.options.easing, callback);
                }

            } else {

                if (_.cssTransitions === false) {
                    if (_.options.rtl === true) {
                        _.currentLeft = -(_.currentLeft);
                    }
                    $({
                        animStart: _.currentLeft
                    }).animate({
                        animStart: targetLeft
                    }, {
                        duration: _.options.speed,
                        easing: _.options.easing,
                        step: function(now) {
                            now = Math.ceil(now);
                            if (_.options.vertical === false) {
                                animProps[_.animType] = 'translate(' +
                                    now + 'px, 0px)';
                                _.$slideTrack.css(animProps);
                            } else {
                                animProps[_.animType] = 'translate(0px,' +
                                    now + 'px)';
                                _.$slideTrack.css(animProps);
                            }
                        },
                        complete: function() {
                            if (callback) {
                                callback.call();
                            }
                        }
                    });

                } else {

                    _.applyTransition();
                    targetLeft = Math.ceil(targetLeft);

                    if (_.options.vertical === false) {
                        animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                    } else {
                        animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                    }
                    _.$slideTrack.css(animProps);

                    if (callback) {
                        setTimeout(function() {

                            _.disableTransition();

                            callback.call();
                        }, _.options.speed);
                    }

                }

            }

        };

        Slick.prototype.getNavTarget = function() {

            var _ = this,
                asNavFor = _.options.asNavFor;

            if ( asNavFor && asNavFor !== null ) {
                asNavFor = $(asNavFor).not(_.$slider);
            }

            return asNavFor;

        };

        Slick.prototype.asNavFor = function(index) {

            var _ = this,
                asNavFor = _.getNavTarget();

            if ( asNavFor !== null && typeof asNavFor === 'object' ) {
                asNavFor.each(function() {
                    var target = $(this).slick('getSlick');
                    if(!target.unslicked) {
                        target.slideHandler(index, true);
                    }
                });
            }

        };

        Slick.prototype.applyTransition = function(slide) {

            var _ = this,
                transition = {};

            if (_.options.fade === false) {
                transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
            } else {
                transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
            }

            if (_.options.fade === false) {
                _.$slideTrack.css(transition);
            } else {
                _.$slides.eq(slide).css(transition);
            }

        };

        Slick.prototype.autoPlay = function() {

            var _ = this;

            _.autoPlayClear();

            if ( _.slideCount > _.options.slidesToShow ) {
                _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
            }

        };

        Slick.prototype.autoPlayClear = function() {

            var _ = this;

            if (_.autoPlayTimer) {
                clearInterval(_.autoPlayTimer);
            }

        };

        Slick.prototype.autoPlayIterator = function() {

            var _ = this,
                slideTo = _.currentSlide + _.options.slidesToScroll;

            if ( !_.paused && !_.interrupted && !_.focussed ) {

                if ( _.options.infinite === false ) {

                    if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                        _.direction = 0;
                    }

                    else if ( _.direction === 0 ) {

                        slideTo = _.currentSlide - _.options.slidesToScroll;

                        if ( _.currentSlide - 1 === 0 ) {
                            _.direction = 1;
                        }

                    }

                }

                _.slideHandler( slideTo );

            }

        };

        Slick.prototype.autoPlayToggleHandler = function() {
            var _ = this;

            if(_.paused) {
                _.$playIcon.css('display', 'none');
                _.$pauseIcon.css('display', 'inline');

                _.$pauseButton.find('.slick-play-text').attr('style', 'display: none');
                _.$pauseButton.find('.slick-pause-text').removeAttr('style');

                _.slickPlay();
            } else {
                _.$playIcon.css('display', 'inline');
                _.$pauseIcon.css('display', 'none');

                _.$pauseButton.find('.slick-play-text').removeAttr('style');
                _.$pauseButton.find('.slick-pause-text').attr('style', 'display: none');

                _.slickPause();
            }
        };

        Slick.prototype.buildArrows = function() {

            var _ = this;

            if (_.options.arrows === true ) {

                _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
                _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

                if( _.slideCount > _.options.slidesToShow ) {

                    if (_.htmlExpr.test(_.options.prevArrow)) {
                        if(_.options.arrowsPlacement != null) {
                            switch(_.options.arrowsPlacement) {
                                case 'beforeSlides':
                                case 'split':
                                    console.log('test');
                                    _.$prevArrow.prependTo(_.options.appendArrows);
                                    break;

                                case 'afterSlides':
                                    _.$prevArrow.appendTo(_.options.appendArrows);
                                    break;
                            }

                        } else {
                            _.$prevArrow.prependTo(_.options.appendArrows);
                        }
                    }

                    if (_.htmlExpr.test(_.options.nextArrow)) {
                        if(_.options.arrowsPlacement != null) {
                            switch(_.options.arrowsPlacement) {
                                case 'beforeSlides':
                                    console.log('test2');
                                    _.$prevArrow.after(_.$nextArrow);
                                    break;

                                case 'afterSlides':
                                case 'split':
                                    _.$nextArrow.appendTo(_.options.appendArrows);
                            }
                        } else {
                           _.$nextArrow.appendTo(_.options.appendArrows);
                        }
                    }

                    if (_.options.infinite !== true) {
                        _.$prevArrow
                            .addClass('slick-disabled')
                            .prop('disabled', true);
                    }

                } else {

                    _.$prevArrow.add( _.$nextArrow )

                        .addClass('slick-hidden')
                        .prop('disabled', true);
                }

            }

        };

        Slick.prototype.buildDots = function() {

            var _ = this,
                i, dot;

            if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

                _.$slider.addClass('slick-dotted');

                dot = $('<ul />').addClass(_.options.dotsClass);

                for (i = 0; i <= _.getDotCount(); i += 1) {
                    dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
                }

                _.$dots = dot.appendTo(_.options.appendDots);

                _.$dots.find('li').first().addClass('slick-active');

            }

        };

        Slick.prototype.buildOut = function() {

            var _ = this;

            _.$slides =
                _.$slider
                    .children( _.options.slide + ':not(.slick-cloned)')
                    .addClass('slick-slide');

            _.slideCount = _.$slides.length;

            _.$slides.each(function(index, element) {
                $(element)
                    .attr('data-slick-index', index)
                    .data('originalStyling', $(element).attr('style') || '');

                if(_.options.useGroupRole) {
                    $(element)
                        .attr('role', 'group')
                        .attr('aria-label', 'slide ' + (index + 1));
                }
            });

            _.$slider.addClass('slick-slider');

            _.$slider.attr('role', 'region');
            _.$slider.attr('aria-label', _.options.regionLabel);

            _.$slideTrack = (_.slideCount === 0) ?
                $('<div class="slick-track"/>').appendTo(_.$slider) :
                _.$slides.wrapAll('<div class="slick-track"/>').parent();

            _.$list = _.$slideTrack.wrap(
                '<div class="slick-list"/>').parent();
            _.$slideTrack.css('opacity', 0);

            if (_.options.centerMode === true || _.options.swipeToSlide === true) {
                _.options.slidesToScroll = 1;
            }

            $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

            _.setupInfinite();

            _.buildArrows();

            _.buildDots();

            _.updateDots();


            _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

            if (_.options.draggable === true) {
                _.$list.addClass('draggable');
            }

            if ( _.options.autoplay && _.options.useAutoplayToggleButton ) {
                _.$pauseIcon = $(_.options.pauseIcon).attr('aria-hidden', true);
                _.$playIcon = $(_.options.playIcon).attr('aria-hidden', true);

                _.$pauseButton = $('<button type="button" class="slick-autoplay-toggle-button">');
                _.$pauseButton.append(_.$pauseIcon);
                _.$pauseButton.append(_.$playIcon.css('display', 'none'));
                _.$pauseButton.append($('<span class="slick-pause-text slick-sr-only">Pause</span>'));
                _.$pauseButton.append($('<span class="slick-play-text slick-sr-only" style="display: none">Play</span>'));

                _.$pauseButton.prependTo(_.$slider);
            }

            if((_.options.instructionsText != null && _.options.instructionsText != '')) {
                _.$instructionsText = $('<p class="slick-instructions slick-sr-only">' + _.options.instructionsText + '</p>');
                _.$instructionsText.prependTo(_.$slider);
            }

        };

        Slick.prototype.buildRows = function() {

            var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

            newSlides = document.createDocumentFragment();
            originalSlides = _.$slider.children();

            if(_.options.rows > 0) {

                slidesPerSection = _.options.slidesPerRow * _.options.rows;
                numOfSlides = Math.ceil(
                    originalSlides.length / slidesPerSection
                );

                for(a = 0; a < numOfSlides; a++){
                    var slide = document.createElement('div');
                    for(b = 0; b < _.options.rows; b++) {
                        var row = document.createElement('div');
                        for(c = 0; c < _.options.slidesPerRow; c++) {
                            var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                            if (originalSlides.get(target)) {
                                row.appendChild(originalSlides.get(target));
                            }
                        }
                        slide.appendChild(row);
                    }
                    newSlides.appendChild(slide);
                }

                _.$slider.empty().append(newSlides);
                _.$slider.children().children().children()
                    .css({
                        'width':(100 / _.options.slidesPerRow) + '%',
                        'display': 'inline-block'
                    });

            }

        };

        Slick.prototype.checkResponsive = function(initial, forceUpdate) {

            var _ = this,
                breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
            var sliderWidth = _.$slider.width();
            var windowWidth = window.innerWidth || $(window).width();

            if (_.respondTo === 'window') {
                respondToWidth = windowWidth;
            } else if (_.respondTo === 'slider') {
                respondToWidth = sliderWidth;
            } else if (_.respondTo === 'min') {
                respondToWidth = Math.min(windowWidth, sliderWidth);
            }

            if ( _.options.responsive &&
                _.options.responsive.length &&
                _.options.responsive !== null) {

                targetBreakpoint = null;

                for (breakpoint in _.breakpoints) {
                    if (_.breakpoints.hasOwnProperty(breakpoint)) {
                        if (_.originalSettings.mobileFirst === false) {
                            if (respondToWidth < _.breakpoints[breakpoint]) {
                                targetBreakpoint = _.breakpoints[breakpoint];
                            }
                        } else {
                            if (respondToWidth > _.breakpoints[breakpoint]) {
                                targetBreakpoint = _.breakpoints[breakpoint];
                            }
                        }
                    }
                }

                if (targetBreakpoint !== null) {
                    if (_.activeBreakpoint !== null) {
                        if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                            _.activeBreakpoint =
                                targetBreakpoint;
                            if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                                _.unslick(targetBreakpoint);
                            } else {
                                _.options = $.extend({}, _.originalSettings,
                                    _.breakpointSettings[
                                        targetBreakpoint]);
                                if (initial === true) {
                                    _.currentSlide = _.options.initialSlide;
                                }
                                _.refresh(initial);
                            }
                            triggerBreakpoint = targetBreakpoint;
                        }
                    } else {
                        _.activeBreakpoint = targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    if (_.activeBreakpoint !== null) {
                        _.activeBreakpoint = null;
                        _.options = _.originalSettings;
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                        triggerBreakpoint = targetBreakpoint;
                    }
                }

                // only trigger breakpoints during an actual break. not on initialize.
                if( !initial && triggerBreakpoint !== false ) {
                    _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
                }
            }

        };

        Slick.prototype.changeSlide = function(event, dontAnimate) {

            var _ = this,
                $target = $(event.currentTarget),
                indexOffset, slideOffset, unevenOffset;

            // If target is a link, prevent default action.
            if($target.is('a')) {
                event.preventDefault();
            }

            // If target is not the <li> element (ie: a child), find the <li>.
            if(!$target.is('li')) {
                $target = $target.closest('li');
            }

            unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
            indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

            switch (event.data.message) {

                case 'previous':
                    slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                    if (_.slideCount > _.options.slidesToShow) {
                        _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                    }
                    break;

                case 'next':
                    slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                    if (_.slideCount > _.options.slidesToShow) {
                        _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                    }
                    break;

                case 'index':
                    var index = event.data.index === 0 ? 0 :
                        event.data.index || $target.index() * _.options.slidesToScroll;

                    _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                    $target.children().trigger('focus');
                    break;

                default:
                    return;
            }

        };

        Slick.prototype.checkNavigable = function(index) {

            var _ = this,
                navigables, prevNavigable;

            navigables = _.getNavigableIndexes();
            prevNavigable = 0;
            if (index > navigables[navigables.length - 1]) {
                index = navigables[navigables.length - 1];
            } else {
                for (var n in navigables) {
                    if (index < navigables[n]) {
                        index = prevNavigable;
                        break;
                    }
                    prevNavigable = navigables[n];
                }
            }

            return index;
        };

        Slick.prototype.cleanUpEvents = function() {

            var _ = this;

            if(_.options.autoplay && _.options.useAutoplayToggleButton) {
                _.$pauseButton.off('click.slick', _.autoPlayToggleHandler);
            }

            if (_.options.dots && _.$dots !== null) {

                $('li', _.$dots)
                    .off('click.slick', _.changeSlide)
                    .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                    .off('mouseleave.slick', $.proxy(_.interrupt, _, false));
            }

            _.$slider.off('focus.slick blur.slick');

            if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
                _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
                _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
            }

            _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
            _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
            _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
            _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

            _.$list.off('click.slick', _.clickHandler);

            $(document).off(_.visibilityChange, _.visibility);

            _.cleanUpSlideEvents();

            $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

            $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

            $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

            $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

        };

        Slick.prototype.cleanUpSlideEvents = function() {

            var _ = this;

            _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

        };

        Slick.prototype.cleanUpRows = function() {

            var _ = this, originalSlides;

            if(_.options.rows > 0) {
                originalSlides = _.$slides.children().children();
                originalSlides.removeAttr('style');
                _.$slider.empty().append(originalSlides);
            }

        };

        Slick.prototype.clickHandler = function(event) {

            var _ = this;

            if (_.shouldClick === false) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            }

        };

        Slick.prototype.destroy = function(refresh) {

            var _ = this;

            _.autoPlayClear();

            _.touchObject = {};

            _.cleanUpEvents();

            $('.slick-cloned', _.$slider).detach();

            if(_.options.autoplay && _.options.useAutoplayToggleButton) {
                _.$pauseButton.remove();
            }

            if (_.$dots) {
                _.$dots.remove();
            }

            if ( _.$prevArrow && _.$prevArrow.length ) {

                _.$prevArrow
                    .removeClass('slick-disabled slick-arrow slick-hidden')
                    .prop('disabled', false)
                    .css('display','');

                if ( _.htmlExpr.test( _.options.prevArrow )) {
                    _.$prevArrow.remove();
                }
            }

            if ( _.$nextArrow && _.$nextArrow.length ) {

                _.$nextArrow
                    .removeClass('slick-disabled slick-arrow slick-hidden')
                    .prop('disabled', false)
                    .css('display','');

                if ( _.htmlExpr.test( _.options.nextArrow )) {
                    _.$nextArrow.remove();
                }
            }


            if (_.$slides) {

                _.$slides
                    .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                    .removeAttr('aria-hidden')
                    .removeAttr('data-slick-index')
                    .each(function(){
                        $(this).attr('style', $(this).data('originalStyling'));
                    });

                _.$slideTrack.children(this.options.slide).detach();

                _.$slideTrack.detach();

                _.$list.detach();

                _.$slider.append(_.$slides);
            }

            _.cleanUpRows();

            _.$slider.removeClass('slick-slider');
            _.$slider.removeClass('slick-initialized');
            _.$slider.removeClass('slick-dotted');

            _.unslicked = true;

            if(!refresh) {
                _.$slider.trigger('destroy', [_]);
            }

        };

        Slick.prototype.disableTransition = function(slide) {

            var _ = this,
                transition = {};

            transition[_.transitionType] = '';

            if (_.options.fade === false) {
                _.$slideTrack.css(transition);
            } else {
                _.$slides.eq(slide).css(transition);
            }

        };

        Slick.prototype.fadeSlide = function(slideIndex, callback) {

            var _ = this;

            if (_.cssTransitions === false) {

                _.$slides.eq(slideIndex).css({
                    zIndex: _.options.zIndex
                });

                _.$slides.eq(slideIndex).animate({
                    opacity: 1
                }, _.options.speed, _.options.easing, callback);

            } else {

                _.applyTransition(slideIndex);

                _.$slides.eq(slideIndex).css({
                    opacity: 1,
                    zIndex: _.options.zIndex
                });

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition(slideIndex);

                        callback.call();
                    }, _.options.speed);
                }

            }

        };

        Slick.prototype.fadeSlideOut = function(slideIndex) {

            var _ = this;

            if (_.cssTransitions === false) {

                _.$slides.eq(slideIndex).animate({
                    opacity: 0,
                    zIndex: _.options.zIndex - 2
                }, _.options.speed, _.options.easing);

            } else {

                _.applyTransition(slideIndex);

                _.$slides.eq(slideIndex).css({
                    opacity: 0,
                    zIndex: _.options.zIndex - 2
                });

            }

        };

        Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

            var _ = this;

            if (filter !== null) {

                _.$slidesCache = _.$slides;

                _.unload();

                _.$slideTrack.children(this.options.slide).detach();

                _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

                _.reinit();

            }

        };

        Slick.prototype.focusHandler = function() {

            var _ = this;

            // If any child element receives focus within the slider we need to pause the autoplay
            _.$slider
                .off('focus.slick blur.slick')
                .on(
                    'focus.slick',
                    '*',
                    function(event) {
                        var $sf = $(this);

                        setTimeout(function() {
                            if( _.options.pauseOnFocus ) {
                                if ($sf.is(':focus')) {
                                    _.focussed = true;
                                    _.autoPlay();
                                }
                            }
                        }, 0);
                    }
                ).on(
                    'blur.slick',
                    '*',
                    function(event) {
                        $(this);

                        // When a blur occurs on any elements within the slider we become unfocused
                        if( _.options.pauseOnFocus ) {
                            _.focussed = false;
                            _.autoPlay();
                        }
                    }
                );
        };

        Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

            var _ = this;
            return _.currentSlide;

        };

        Slick.prototype.getDotCount = function() {

            var _ = this;

            var breakPoint = 0;
            var counter = 0;
            var pagerQty = 0;

            if (_.options.infinite === true) {
                if (_.slideCount <= _.options.slidesToShow) {
                     ++pagerQty;
                } else {
                    while (breakPoint < _.slideCount) {
                        ++pagerQty;
                        breakPoint = counter + _.options.slidesToScroll;
                        counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                    }
                }
            } else if (_.options.centerMode === true) {
                pagerQty = _.slideCount;
            } else if(!_.options.asNavFor) {
                pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
            }else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }

            return pagerQty - 1;

        };

        Slick.prototype.getLeft = function(slideIndex) {

            var _ = this,
                targetLeft,
                verticalHeight,
                verticalOffset = 0,
                targetSlide,
                coef;

            _.slideOffset = 0;
            verticalHeight = _.$slides.first().outerHeight(true);

            if (_.options.infinite === true) {
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                    coef = -1;

                    if (_.options.vertical === true && _.options.centerMode === true) {
                        if (_.options.slidesToShow === 2) {
                            coef = -1.5;
                        } else if (_.options.slidesToShow === 1) {
                            coef = -2;
                        }
                    }
                    verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
                }
                if (_.slideCount % _.options.slidesToScroll !== 0) {
                    if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                        if (slideIndex > _.slideCount) {
                            _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                            verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                        } else {
                            _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                            verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                        }
                    }
                }
            } else {
                if (slideIndex + _.options.slidesToShow > _.slideCount) {
                    _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                    verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
                }
            }

            if (_.slideCount <= _.options.slidesToShow) {
                _.slideOffset = 0;
                verticalOffset = 0;
            }

            if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
                _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
            } else if (_.options.centerMode === true && _.options.infinite === true) {
                _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
            } else if (_.options.centerMode === true) {
                _.slideOffset = 0;
                _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
            }

            if (_.options.vertical === false) {
                targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
            } else {
                targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
            }

            if (_.options.variableWidth === true) {

                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft =  0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                if (_.options.centerMode === true) {
                    if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                    } else {
                        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                    }

                    if (_.options.rtl === true) {
                        if (targetSlide[0]) {
                            targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                        } else {
                            targetLeft =  0;
                        }
                    } else {
                        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                    }

                    targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
                }
            }

            return targetLeft;

        };

        Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

            var _ = this;

            return _.options[option];

        };

        Slick.prototype.getNavigableIndexes = function() {

            var _ = this,
                breakPoint = 0,
                counter = 0,
                indexes = [],
                max;

            if (_.options.infinite === false) {
                max = _.slideCount;
            } else {
                breakPoint = _.options.slidesToScroll * -1;
                counter = _.options.slidesToScroll * -1;
                max = _.slideCount * 2;
            }

            while (breakPoint < max) {
                indexes.push(breakPoint);
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }

            return indexes;

        };

        Slick.prototype.getSlick = function() {

            return this;

        };

        Slick.prototype.getSlideCount = function() {

            var _ = this,
                slidesTraversed, swipedSlide, swipeTarget, centerOffset;

            centerOffset = _.options.centerMode === true ? Math.floor(_.$list.width() / 2) : 0;
            swipeTarget = (_.swipeLeft * -1) + centerOffset;

            if (_.options.swipeToSlide === true) {

                _.$slideTrack.find('.slick-slide').each(function(index, slide) {

                    var slideOuterWidth, slideOffset, slideRightBoundary;
                    slideOuterWidth = $(slide).outerWidth();
                    slideOffset = slide.offsetLeft;
                    if (_.options.centerMode !== true) {
                        slideOffset += (slideOuterWidth / 2);
                    }

                    slideRightBoundary = slideOffset + (slideOuterWidth);

                    if (swipeTarget < slideRightBoundary) {
                        swipedSlide = slide;
                        return false;
                    }
                });

                slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

                return slidesTraversed;

            } else {
                return _.options.slidesToScroll;
            }

        };

        Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

            var _ = this;

            _.changeSlide({
                data: {
                    message: 'index',
                    index: parseInt(slide)
                }
            }, dontAnimate);

        };

        Slick.prototype.init = function(creation) {

            var _ = this;

            if (!$(_.$slider).hasClass('slick-initialized')) {

                $(_.$slider).addClass('slick-initialized');

                _.buildRows();
                _.buildOut();
                _.setProps();
                _.startLoad();
                _.loadSlider();
                _.initializeEvents();
                _.updateArrows();
                _.updateDots();
                _.checkResponsive(true);
                _.focusHandler();

            }

            if (creation) {
                _.$slider.trigger('init', [_]);
            }

            if ( _.options.autoplay ) {

                _.paused = false;
                _.autoPlay();

            }

            _.updateSlideVisibility();

            if(_.options.accessibility != undefined) {
                console.warn('accessibility setting is no longer supported.');
            }

            if(_.options.focusOnChange != undefined) {
                console.warn('focusOnChange is no longer supported.');
            }

            if(_.options.focusOnSelect != undefined) {
                console.warn('focusOnSelect is no longer supported.');
            }

        };

        Slick.prototype.initArrowEvents = function() {

            var _ = this;

            if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
                _.$prevArrow
                   .off('click.slick')
                   .on('click.slick', {
                        message: 'previous'
                   }, _.changeSlide);
                _.$nextArrow
                   .off('click.slick')
                   .on('click.slick', {
                        message: 'next'
                   }, _.changeSlide);
            }

        };

        Slick.prototype.initDotEvents = function() {

            var _ = this;

            if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
                $('li', _.$dots).on('click.slick', {
                    message: 'index'
                }, _.changeSlide);
            }

            if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

                $('li', _.$dots)
                    .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                    .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

            }

        };

        Slick.prototype.initSlideEvents = function() {

            var _ = this;

            if ( _.options.pauseOnHover ) {

                _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
                _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

            }

        };

        Slick.prototype.initializeEvents = function() {

            var _ = this;

            _.initArrowEvents();

            _.initDotEvents();
            _.initSlideEvents();

            if(_.options.autoplay && _.options.useAutoplayToggleButton) {
                _.$pauseButton.on('click.slick', _.autoPlayToggleHandler);
            }

            _.$list.on('touchstart.slick mousedown.slick', {
                action: 'start'
            }, _.swipeHandler);
            _.$list.on('touchmove.slick mousemove.slick', {
                action: 'move'
            }, _.swipeHandler);
            _.$list.on('touchend.slick mouseup.slick', {
                action: 'end'
            }, _.swipeHandler);
            _.$list.on('touchcancel.slick mouseleave.slick', {
                action: 'end'
            }, _.swipeHandler);

            _.$list.on('click.slick', _.clickHandler);

            $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

            $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

            $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

            $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

            $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
            $(_.setPosition);

        };

        Slick.prototype.initUI = function() {

            var _ = this;

            if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

                _.$prevArrow.show();
                _.$nextArrow.show();

            }

            if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

                _.$dots.show();

            }

        };

        Slick.prototype.lazyLoad = function() {

            var _ = this,
                loadRange, cloneRange, rangeStart, rangeEnd;

            function loadImages(imagesScope) {

                $('img[data-lazy]', imagesScope).each(function() {

                    var image = $(this),
                        imageSource = $(this).attr('data-lazy'),
                        imageSrcSet = $(this).attr('data-srcset'),
                        imageSizes  = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                        imageToLoad = document.createElement('img');

                    imageToLoad.onload = function() {

                        image
                            .animate({ opacity: 0 }, 100, function() {

                                if (imageSrcSet) {
                                    image
                                        .attr('srcset', imageSrcSet );

                                    if (imageSizes) {
                                        image
                                            .attr('sizes', imageSizes );
                                    }
                                }

                                image
                                    .attr('src', imageSource)
                                    .animate({ opacity: 1 }, 200, function() {
                                        image
                                            .removeAttr('data-lazy data-srcset data-sizes')
                                            .removeClass('slick-loading');
                                    });
                                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                            });

                    };

                    imageToLoad.onerror = function() {

                        image
                            .removeAttr( 'data-lazy' )
                            .removeClass( 'slick-loading' )
                            .addClass( 'slick-lazyload-error' );

                        _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                    };

                    imageToLoad.src = imageSource;

                });

            }

            if (_.options.centerMode === true) {
                if (_.options.infinite === true) {
                    rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                    rangeEnd = rangeStart + _.options.slidesToShow + 2;
                } else {
                    rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                    rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
                }
            } else {
                rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
                rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
                if (_.options.fade === true) {
                    if (rangeStart > 0) rangeStart--;
                    if (rangeEnd <= _.slideCount) rangeEnd++;
                }
            }

            loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

            if (_.options.lazyLoad === 'anticipated') {
                var prevSlide = rangeStart - 1,
                    nextSlide = rangeEnd,
                    $slides = _.$slider.find('.slick-slide');

                for (var i = 0; i < _.options.slidesToScroll; i++) {
                    if (prevSlide < 0) prevSlide = _.slideCount - 1;
                    loadRange = loadRange.add($slides.eq(prevSlide));
                    loadRange = loadRange.add($slides.eq(nextSlide));
                    prevSlide--;
                    nextSlide++;
                }
            }

            loadImages(loadRange);

            if (_.slideCount <= _.options.slidesToShow) {
                cloneRange = _.$slider.find('.slick-slide');
                loadImages(cloneRange);
            } else
            if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
                loadImages(cloneRange);
            } else if (_.currentSlide === 0) {
                cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
                loadImages(cloneRange);
            }

        };

        Slick.prototype.loadSlider = function() {

            var _ = this;

            _.setPosition();

            _.$slideTrack.css({
                opacity: 1
            });

            _.$slider.removeClass('slick-loading');

            _.initUI();

            if (_.options.lazyLoad === 'progressive') {
                _.progressiveLazyLoad();
            }

        };

        Slick.prototype.next = Slick.prototype.slickNext = function() {

            var _ = this;

            _.changeSlide({
                data: {
                    message: 'next'
                }
            });

        };

        Slick.prototype.orientationChange = function() {

            var _ = this;

            _.checkResponsive();
            _.setPosition();

        };

        Slick.prototype.pause = Slick.prototype.slickPause = function() {

            var _ = this;

            _.autoPlayClear();
            _.paused = true;

        };

        Slick.prototype.play = Slick.prototype.slickPlay = function() {

            var _ = this;

            _.autoPlay();
            _.options.autoplay = true;
            _.paused = false;
            _.focussed = false;
            _.interrupted = false;

        };

        Slick.prototype.postSlide = function(index) {

            var _ = this;

            if( !_.unslicked ) {

                _.$slider.trigger('afterChange', [_, index]);

                _.animating = false;

                if (_.slideCount > _.options.slidesToShow) {
                    _.setPosition();
                }

                _.swipeLeft = null;

                if ( _.options.autoplay ) {
                    _.autoPlay();
                }

                _.updateSlideVisibility();

            }

        };

        Slick.prototype.prev = Slick.prototype.slickPrev = function() {

            var _ = this;

            _.changeSlide({
                data: {
                    message: 'previous'
                }
            });

        };

        Slick.prototype.preventDefault = function(event) {

            event.preventDefault();

        };

        Slick.prototype.progressiveLazyLoad = function( tryCount ) {

            tryCount = tryCount || 1;

            var _ = this,
                $imgsToLoad = $( 'img[data-lazy]', _.$slider ),
                image,
                imageSource,
                imageSrcSet,
                imageSizes,
                imageToLoad;

            if ( $imgsToLoad.length ) {

                image = $imgsToLoad.first();
                imageSource = image.attr('data-lazy');
                imageSrcSet = image.attr('data-srcset');
                imageSizes  = image.attr('data-sizes') || _.$slider.attr('data-sizes');
                imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    if (imageSrcSet) {
                        image
                            .attr('srcset', imageSrcSet );

                        if (imageSizes) {
                            image
                                .attr('sizes', imageSizes );
                        }
                    }

                    image
                        .attr( 'src', imageSource )
                        .removeAttr('data-lazy data-srcset data-sizes')
                        .removeClass('slick-loading');

                    if ( _.options.adaptiveHeight === true ) {
                        _.setPosition();
                    }

                    _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);
                    _.progressiveLazyLoad();

                };

                imageToLoad.onerror = function() {

                    if ( tryCount < 3 ) {

                        /**
                         * try to load the image 3 times,
                         * leave a slight delay so we don't get
                         * servers blocking the request.
                         */
                        setTimeout( function() {
                            _.progressiveLazyLoad( tryCount + 1 );
                        }, 500 );

                    } else {

                        image
                            .removeAttr( 'data-lazy' )
                            .removeClass( 'slick-loading' )
                            .addClass( 'slick-lazyload-error' );

                        _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                        _.progressiveLazyLoad();

                    }

                };

                imageToLoad.src = imageSource;

            } else {

                _.$slider.trigger('allImagesLoaded', [ _ ]);

            }

        };

        Slick.prototype.refresh = function( initializing ) {

            var _ = this, currentSlide, lastVisibleIndex;

            lastVisibleIndex = _.slideCount - _.options.slidesToShow;

            // in non-infinite sliders, we don't want to go past the
            // last visible index.
            if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
                _.currentSlide = lastVisibleIndex;
            }

            // if less slides than to show, go to start.
            if ( _.slideCount <= _.options.slidesToShow ) {
                _.currentSlide = 0;

            }

            currentSlide = _.currentSlide;

            _.destroy(true);

            $.extend(_, _.initials, { currentSlide: currentSlide });

            _.init();

            if( !initializing ) {

                _.changeSlide({
                    data: {
                        message: 'index',
                        index: currentSlide
                    }
                }, false);

            }

        };

        Slick.prototype.registerBreakpoints = function() {

            var _ = this, breakpoint, currentBreakpoint, l,
                responsiveSettings = _.options.responsive || null;

            if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {

                _.respondTo = _.options.respondTo || 'window';

                for ( breakpoint in responsiveSettings ) {

                    l = _.breakpoints.length-1;

                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                        // loop through the breakpoints and cut out any existing
                        // ones with the same breakpoint number, we don't want dupes.
                        while( l >= 0 ) {
                            if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                                _.breakpoints.splice(l,1);
                            }
                            l--;
                        }

                        _.breakpoints.push(currentBreakpoint);
                        _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                    }

                }

                _.breakpoints.sort(function(a, b) {
                    return ( _.options.mobileFirst ) ? a-b : b-a;
                });

            }

        };

        Slick.prototype.reinit = function() {

            var _ = this;

            _.$slides =
                _.$slideTrack
                    .children(_.options.slide)
                    .addClass('slick-slide');

            _.slideCount = _.$slides.length;

            if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
                _.currentSlide = _.currentSlide - _.options.slidesToScroll;
            }

            if (_.slideCount <= _.options.slidesToShow) {
                _.currentSlide = 0;
            }

            _.registerBreakpoints();

            _.setProps();
            _.setupInfinite();
            _.buildArrows();
            _.updateArrows();
            _.initArrowEvents();
            _.buildDots();
            _.updateDots();
            _.initDotEvents();
            _.cleanUpSlideEvents();
            _.initSlideEvents();

            _.checkResponsive(false, true);

            _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

            _.setPosition();
            _.focusHandler();

            _.paused = !_.options.autoplay;
            _.autoPlay();

            _.$slider.trigger('reInit', [_]);

        };

        Slick.prototype.resize = function() {

            var _ = this;

            if ($(window).width() !== _.windowWidth) {
                clearTimeout(_.windowDelay);
                _.windowDelay = window.setTimeout(function() {
                    _.windowWidth = $(window).width();
                    _.checkResponsive();
                    if( !_.unslicked ) { _.setPosition(); }
                }, 50);
            }
        };

        Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

            var _ = this;

            if (typeof(index) === 'boolean') {
                removeBefore = index;
                index = removeBefore === true ? 0 : _.slideCount - 1;
            } else {
                index = removeBefore === true ? --index : index;
            }

            if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
                return false;
            }

            _.unload();

            if (removeAll === true) {
                _.$slideTrack.children().remove();
            } else {
                _.$slideTrack.children(this.options.slide).eq(index).remove();
            }

            _.$slides = _.$slideTrack.children(this.options.slide);

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.append(_.$slides);

            _.$slidesCache = _.$slides;

            _.reinit();

        };

        Slick.prototype.setCSS = function(position) {

            var _ = this,
                positionProps = {},
                x, y;

            if (_.options.rtl === true) {
                position = -position;
            }
            x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
            y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

            positionProps[_.positionProp] = position;

            if (_.transformsEnabled === false) {
                _.$slideTrack.css(positionProps);
            } else {
                positionProps = {};
                if (_.cssTransitions === false) {
                    positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                    _.$slideTrack.css(positionProps);
                } else {
                    positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                    _.$slideTrack.css(positionProps);
                }
            }

        };

        Slick.prototype.setDimensions = function() {

            var _ = this;

            if (_.options.vertical === false) {
                if (_.options.centerMode === true) {
                    _.$list.css({
                        padding: ('0px ' + _.options.centerPadding)
                    });
                }
            } else {
                _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
                if (_.options.centerMode === true) {
                    _.$list.css({
                        padding: (_.options.centerPadding + ' 0px')
                    });
                }
            }

            _.listWidth = _.$list.width();
            _.listHeight = _.$list.height();


            if (_.options.vertical === false && _.options.variableWidth === false) {
                _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
                _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

            } else if (_.options.variableWidth === true) {
                _.$slideTrack.width(5000 * _.slideCount);
            } else {
                _.slideWidth = Math.ceil(_.listWidth);
                _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
            }

            var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
            if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

        };

        Slick.prototype.setFade = function() {

            var _ = this,
                targetLeft;

            _.$slides.each(function(index, element) {
                targetLeft = (_.slideWidth * index) * -1;
                if (_.options.rtl === true) {
                    $(element).css({
                        position: 'relative',
                        right: targetLeft,
                        top: 0,
                        zIndex: _.options.zIndex - 2,
                        opacity: 0
                    });
                } else {
                    $(element).css({
                        position: 'relative',
                        left: targetLeft,
                        top: 0,
                        zIndex: _.options.zIndex - 2,
                        opacity: 0
                    });
                }
            });

            _.$slides.eq(_.currentSlide).css({
                zIndex: _.options.zIndex - 1,
                opacity: 1
            });

        };

        Slick.prototype.setHeight = function() {

            var _ = this;

            if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
                var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
                _.$list.css('height', targetHeight);
            }

        };

        Slick.prototype.setOption =
        Slick.prototype.slickSetOption = function() {

            /**
             * accepts arguments in format of:
             *
             *  - for changing a single option's value:
             *     .slick("setOption", option, value, refresh )
             *
             *  - for changing a set of responsive options:
             *     .slick("setOption", 'responsive', [{}, ...], refresh )
             *
             *  - for updating multiple values at once (not responsive)
             *     .slick("setOption", { 'option': value, ... }, refresh )
             */

            var _ = this, l, item, option, value, refresh = false, type;

            if( $.type( arguments[0] ) === 'object' ) {

                option =  arguments[0];
                refresh = arguments[1];
                type = 'multiple';

            } else if ( $.type( arguments[0] ) === 'string' ) {

                option =  arguments[0];
                value = arguments[1];
                refresh = arguments[2];

                if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {

                    type = 'responsive';

                } else if ( typeof arguments[1] !== 'undefined' ) {

                    type = 'single';

                }

            }

            if ( type === 'single' ) {

                _.options[option] = value;


            } else if ( type === 'multiple' ) {

                $.each( option , function( opt, val ) {

                    _.options[opt] = val;

                });


            } else if ( type === 'responsive' ) {

                for ( item in value ) {

                    if( $.type( _.options.responsive ) !== 'array' ) {

                        _.options.responsive = [ value[item] ];

                    } else {

                        l = _.options.responsive.length-1;

                        // loop through the responsive object and splice out duplicates.
                        while( l >= 0 ) {

                            if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {

                                _.options.responsive.splice(l,1);

                            }

                            l--;

                        }

                        _.options.responsive.push( value[item] );

                    }

                }

            }

            if ( refresh ) {

                _.unload();
                _.reinit();

            }

        };

        Slick.prototype.setPosition = function() {

            var _ = this;

            _.setDimensions();

            _.setHeight();

            if (_.options.fade === false) {
                _.setCSS(_.getLeft(_.currentSlide));
            } else {
                _.setFade();
            }

            _.$slider.trigger('setPosition', [_]);

        };

        Slick.prototype.setProps = function() {

            var _ = this,
                bodyStyle = document.body.style;

            _.positionProp = _.options.vertical === true ? 'top' : 'left';

            if (_.positionProp === 'top') {
                _.$slider.addClass('slick-vertical');
            } else {
                _.$slider.removeClass('slick-vertical');
            }

            if (bodyStyle.WebkitTransition !== undefined ||
                bodyStyle.MozTransition !== undefined ||
                bodyStyle.msTransition !== undefined) {
                if (_.options.useCSS === true) {
                    _.cssTransitions = true;
                }
            }

            if ( _.options.fade ) {
                if ( typeof _.options.zIndex === 'number' ) {
                    if( _.options.zIndex < 3 ) {
                        _.options.zIndex = 3;
                    }
                } else {
                    _.options.zIndex = _.defaults.zIndex;
                }
            }

            if (bodyStyle.OTransform !== undefined) {
                _.animType = 'OTransform';
                _.transformType = '-o-transform';
                _.transitionType = 'OTransition';
                if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
            }
            if (bodyStyle.MozTransform !== undefined) {
                _.animType = 'MozTransform';
                _.transformType = '-moz-transform';
                _.transitionType = 'MozTransition';
                if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
            }
            if (bodyStyle.webkitTransform !== undefined) {
                _.animType = 'webkitTransform';
                _.transformType = '-webkit-transform';
                _.transitionType = 'webkitTransition';
                if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
            }
            if (bodyStyle.msTransform !== undefined) {
                _.animType = 'msTransform';
                _.transformType = '-ms-transform';
                _.transitionType = 'msTransition';
                if (bodyStyle.msTransform === undefined) _.animType = false;
            }
            if (bodyStyle.transform !== undefined && _.animType !== false) {
                _.animType = 'transform';
                _.transformType = 'transform';
                _.transitionType = 'transition';
            }
            _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
        };


        Slick.prototype.setSlideClasses = function(index) {

            var _ = this,
                centerOffset, allSlides, indexOffset, remainder;

            allSlides = _.$slider
                .find('.slick-slide')
                .removeClass('slick-active slick-center slick-current')
                .attr('aria-hidden', 'true')
                .attr('aria-label', function() {
                    return $(this).attr('aria-label').replace(' (centered)', '');
                });

            _.$slides
                .eq(index)
                .addClass('slick-current');

            if (_.options.centerMode === true) {

                var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

                centerOffset = Math.floor(_.options.slidesToShow / 2);

                if (_.options.infinite === true) {

                    if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                        _.$slides
                            .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                            .addClass('slick-active')
                            .removeAttr('aria-hidden');

                    } else {

                        indexOffset = _.options.slidesToShow + index;
                        allSlides
                            .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                            .addClass('slick-active')
                            .removeAttr('aria-hidden');

                    }

                    if (index === 0) {

                        allSlides
                            .eq( _.options.slidesToShow + _.slideCount + 1 )
                            .addClass('slick-center')
                            .attr('aria-label', function() {
                                return $(this).attr('aria-label') + ' (centered)';
                            });

                    } else if (index === _.slideCount - 1) {

                        allSlides
                            .eq(_.options.slidesToShow)
                            .addClass('slick-center')
                            .attr('aria-label', function() {
                                return $(this).attr('aria-label') + ' (centered)';
                            });

                    }

                }

                _.$slides
                    .eq(index)
                    .addClass('slick-center')
                    .attr('aria-label', function() {
                        return $(this).attr('aria-label') + ' (centered)';
                    });

            } else {

                if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                    _.$slides
                        .slice(index, index + _.options.slidesToShow)
                        .addClass('slick-active')
                        .removeAttr('aria-hidden');

                } else if (allSlides.length <= _.options.slidesToShow) {

                    allSlides
                        .addClass('slick-active')
                        .removeAttr('aria-hidden');

                } else {

                    remainder = _.slideCount % _.options.slidesToShow;
                    indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                    if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                        allSlides
                            .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                            .addClass('slick-active')
                            .removeAttr('aria-hidden');

                    } else {

                        allSlides
                            .slice(indexOffset, indexOffset + _.options.slidesToShow)
                            .addClass('slick-active')
                            .removeAttr('aria-hidden');

                    }

                }

            }

            if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
                _.lazyLoad();
            }
        };

        Slick.prototype.setupInfinite = function() {

            var _ = this,
                i, slideIndex, infiniteCount;

            if (_.options.fade === true) {
                _.options.centerMode = false;
            }

            if (_.options.infinite === true && _.options.fade === false) {

                slideIndex = null;

                if (_.slideCount > _.options.slidesToShow) {

                    if (_.options.centerMode === true) {
                        infiniteCount = _.options.slidesToShow + 1;
                    } else {
                        infiniteCount = _.options.slidesToShow;
                    }

                    for (i = _.slideCount; i > (_.slideCount -
                            infiniteCount); i -= 1) {
                        slideIndex = i - 1;
                        $(_.$slides[slideIndex]).clone(true).attr('id', '')
                            .attr('data-slick-index', slideIndex - _.slideCount)
                            .prependTo(_.$slideTrack).addClass('slick-cloned');
                    }
                    for (i = 0; i < infiniteCount  + _.slideCount; i += 1) {
                        slideIndex = i;
                        $(_.$slides[slideIndex]).clone(true).attr('id', '')
                            .attr('data-slick-index', slideIndex + _.slideCount)
                            .appendTo(_.$slideTrack).addClass('slick-cloned');
                    }
                    _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                        $(this).attr('id', '');
                    });

                }

            }

        };

        Slick.prototype.interrupt = function( toggle ) {

            var _ = this;

            if( !toggle ) {
                _.autoPlay();
            }
            _.interrupted = toggle;

        };

        Slick.prototype.selectHandler = function(event) {

            var _ = this;

            var targetElement =
                $(event.target).is('.slick-slide') ?
                    $(event.target) :
                    $(event.target).parents('.slick-slide');

            var index = parseInt(targetElement.attr('data-slick-index'));

            if (!index) index = 0;

            if (_.slideCount <= _.options.slidesToShow) {

                _.slideHandler(index, false, true);
                return;

            }

            _.slideHandler(index);

        };

        Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

            var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
                _ = this, navTarget;

            sync = sync || false;

            if (_.animating === true && _.options.waitForAnimate === true) {
                return;
            }

            if (_.options.fade === true && _.currentSlide === index) {
                return;
            }

            if (sync === false) {
                _.asNavFor(index);
            }

            targetSlide = index;
            targetLeft = _.getLeft(targetSlide);
            slideLeft = _.getLeft(_.currentSlide);

            _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

            if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
                if (_.options.fade === false) {
                    targetSlide = _.currentSlide;
                    if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                        _.animateSlide(slideLeft, function() {
                            _.postSlide(targetSlide);
                        });
                    } else {
                        _.postSlide(targetSlide);
                    }
                }
                return;
            } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
                if (_.options.fade === false) {
                    targetSlide = _.currentSlide;
                    if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                        _.animateSlide(slideLeft, function() {
                            _.postSlide(targetSlide);
                        });
                    } else {
                        _.postSlide(targetSlide);
                    }
                }
                return;
            }

            if ( _.options.autoplay ) {
                clearInterval(_.autoPlayTimer);
            }

            if (targetSlide < 0) {
                if (_.slideCount % _.options.slidesToScroll !== 0) {
                    animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
                } else {
                    animSlide = _.slideCount + targetSlide;
                }
            } else if (targetSlide >= _.slideCount) {
                if (_.slideCount % _.options.slidesToScroll !== 0) {
                    animSlide = 0;
                } else {
                    animSlide = targetSlide - _.slideCount;
                }
            } else {
                animSlide = targetSlide;
            }

            _.animating = true;

            _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

            oldSlide = _.currentSlide;
            _.currentSlide = animSlide;

            _.setSlideClasses(_.currentSlide);

            if ( _.options.asNavFor ) {

                navTarget = _.getNavTarget();
                navTarget = navTarget.slick('getSlick');

                if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {
                    navTarget.setSlideClasses(_.currentSlide);
                }

            }

            _.updateDots();
            _.updateArrows();

            if (_.options.fade === true) {
                if (dontAnimate !== true) {

                    _.fadeSlideOut(oldSlide);

                    _.fadeSlide(animSlide, function() {
                        _.postSlide(animSlide);
                    });

                } else {
                    _.postSlide(animSlide);
                }
                _.animateHeight();
                return;
            }

            if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                _.animateSlide(targetLeft, function() {
                    _.postSlide(animSlide);
                });
            } else {
                _.postSlide(animSlide);
            }

        };

        Slick.prototype.startLoad = function() {

            var _ = this;

            if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

                _.$prevArrow.hide();
                _.$nextArrow.hide();

            }

            if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

                _.$dots.hide();

            }

            _.$slider.addClass('slick-loading');

        };

        Slick.prototype.swipeDirection = function() {

            var xDist, yDist, r, swipeAngle, _ = this;

            xDist = _.touchObject.startX - _.touchObject.curX;
            yDist = _.touchObject.startY - _.touchObject.curY;
            r = Math.atan2(yDist, xDist);

            swipeAngle = Math.round(r * 180 / Math.PI);
            if (swipeAngle < 0) {
                swipeAngle = 360 - Math.abs(swipeAngle);
            }

            if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
                return (_.options.rtl === false ? 'left' : 'right');
            }
            if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
                return (_.options.rtl === false ? 'left' : 'right');
            }
            if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
                return (_.options.rtl === false ? 'right' : 'left');
            }
            if (_.options.verticalSwiping === true) {
                if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                    return 'down';
                } else {
                    return 'up';
                }
            }

            return 'vertical';

        };

        Slick.prototype.swipeEnd = function(event) {

            var _ = this,
                slideCount,
                direction;

            _.dragging = false;
            _.swiping = false;

            if (_.scrolling) {
                _.scrolling = false;
                return false;
            }

            _.interrupted = false;
            _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

            if ( _.touchObject.curX === undefined ) {
                return false;
            }

            if ( _.touchObject.edgeHit === true ) {
                _.$slider.trigger('edge', [_, _.swipeDirection() ]);
            }

            if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {

                direction = _.swipeDirection();

                switch ( direction ) {

                    case 'left':
                    case 'down':

                        slideCount =
                            _.options.swipeToSlide ?
                                _.checkNavigable( _.currentSlide + _.getSlideCount() ) :
                                _.currentSlide + _.getSlideCount();

                        _.currentDirection = 0;

                        break;

                    case 'right':
                    case 'up':

                        slideCount =
                            _.options.swipeToSlide ?
                                _.checkNavigable( _.currentSlide - _.getSlideCount() ) :
                                _.currentSlide - _.getSlideCount();

                        _.currentDirection = 1;

                        break;


                }

                if( direction != 'vertical' ) {

                    _.slideHandler( slideCount );
                    _.touchObject = {};
                    _.$slider.trigger('swipe', [_, direction ]);

                }

            } else {

                if ( _.touchObject.startX !== _.touchObject.curX ) {

                    _.slideHandler( _.currentSlide );
                    _.touchObject = {};

                }

            }

        };

        Slick.prototype.swipeHandler = function(event) {

            var _ = this;

            if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
                return;
            } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
                return;
            }

            _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
                event.originalEvent.touches.length : 1;

            _.touchObject.minSwipe = _.listWidth / _.options
                .touchThreshold;

            if (_.options.verticalSwiping === true) {
                _.touchObject.minSwipe = _.listHeight / _.options
                    .touchThreshold;
            }

            switch (event.data.action) {

                case 'start':
                    _.swipeStart(event);
                    break;

                case 'move':
                    _.swipeMove(event);
                    break;

                case 'end':
                    _.swipeEnd(event);
                    break;

            }

        };

        Slick.prototype.swipeMove = function(event) {

            var _ = this,
                curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

            touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

            if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
                return false;
            }

            curLeft = _.getLeft(_.currentSlide);

            _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
            _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

            _.touchObject.swipeLength = Math.round(Math.sqrt(
                Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

            verticalSwipeLength = Math.round(Math.sqrt(
                Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

            if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
                _.scrolling = true;
                return false;
            }

            if (_.options.verticalSwiping === true) {
                _.touchObject.swipeLength = verticalSwipeLength;
            }

            swipeDirection = _.swipeDirection();

            if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
                _.swiping = true;
                event.preventDefault();
            }

            positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
            if (_.options.verticalSwiping === true) {
                positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
            }


            swipeLength = _.touchObject.swipeLength;

            _.touchObject.edgeHit = false;

            if (_.options.infinite === false) {
                if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                    swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                    _.touchObject.edgeHit = true;
                }
            }

            if (_.options.vertical === false) {
                _.swipeLeft = curLeft + swipeLength * positionOffset;
            } else {
                _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
            }
            if (_.options.verticalSwiping === true) {
                _.swipeLeft = curLeft + swipeLength * positionOffset;
            }

            if (_.options.fade === true || _.options.touchMove === false) {
                return false;
            }

            if (_.animating === true) {
                _.swipeLeft = null;
                return false;
            }

            _.setCSS(_.swipeLeft);

        };

        Slick.prototype.swipeStart = function(event) {

            var _ = this,
                touches;

            _.interrupted = true;

            if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
                _.touchObject = {};
                return false;
            }

            if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
                touches = event.originalEvent.touches[0];
            }

            _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
            _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

            _.dragging = true;

        };

        Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

            var _ = this;

            if (_.$slidesCache !== null) {

                _.unload();

                _.$slideTrack.children(this.options.slide).detach();

                _.$slidesCache.appendTo(_.$slideTrack);

                _.reinit();

            }

        };

        Slick.prototype.unload = function() {

            var _ = this;

            $('.slick-cloned', _.$slider).remove();

            if (_.$dots) {
                _.$dots.remove();
            }

            if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }

            if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }

            _.$slides
                .removeClass('slick-slide slick-active slick-visible slick-current')
                .attr('aria-hidden', 'true')
                .css('width', '');

        };

        Slick.prototype.unslick = function(fromBreakpoint) {

            var _ = this;
            _.$slider.trigger('unslick', [_, fromBreakpoint]);
            _.destroy();

        };

        Slick.prototype.updateArrows = function() {

            var _ = this;

            Math.floor(_.options.slidesToShow / 2);

            if ( _.options.arrows === true &&
                _.slideCount > _.options.slidesToShow &&
                !_.options.infinite ) {

                _.$prevArrow.removeClass('slick-disabled').prop('disabled', false);
                _.$nextArrow.removeClass('slick-disabled').prop('disabled', false);

                if (_.currentSlide === 0) {

                    _.$prevArrow.addClass('slick-disabled').prop('disabled', true);
                    _.$nextArrow.removeClass('slick-disabled').prop('disabled', false);

                } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                    _.$nextArrow.addClass('slick-disabled').prop('disabled', true);
                    _.$prevArrow.removeClass('slick-disabled').prop('disabled', false);

                } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                    _.$nextArrow.addClass('slick-disabled').prop('disabled', true);
                    _.$prevArrow.removeClass('slick-disabled').prop('disabled', false);

                }

            }

        };

        Slick.prototype.updateDots = function() {

            var _ = this;

            if (_.$dots !== null) {

                _.$dots
                    .find('li')
                        .removeClass('slick-active')
                        .find('button')
                            .removeAttr('aria-current')
                            .end()
                        .end();

                _.$dots
                    .find('li')
                    .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                        .addClass('slick-active')
                        .find('button')
                            .attr('aria-current', true)
                            .end()
                        .end();

            }

        };

        Slick.prototype.updateSlideVisibility = function() {
            var _ = this;

            _.$slideTrack
                .find('.slick-slide')
                    .attr('aria-hidden', 'true')
                    .find('a, input, button, select')
                        .attr('tabindex', '-1');

            _.$slideTrack
                .find('.slick-active')
                    .removeAttr('aria-hidden')
                    .find('a, input, button, select')
                        .removeAttr('tabindex');
        };

        Slick.prototype.visibility = function() {

            var _ = this;

            if ( _.options.autoplay ) {

                if ( document[_.hidden] ) {

                    _.interrupted = true;

                } else {

                    _.interrupted = false;

                }

            }

        };

        $.fn.slick = function() {
            var _ = this,
                opt = arguments[0],
                args = Array.prototype.slice.call(arguments, 1),
                l = _.length,
                i,
                ret;
            for (i = 0; i < l; i++) {
                if (typeof opt == 'object' || typeof opt == 'undefined')
                    _[i].slick = new Slick(_[i], opt);
                else
                    ret = _[i].slick[opt].apply(_[i].slick, args);
                if (typeof ret != 'undefined') return ret;
            }
            return _;
        };

    }));

    ////////////////////////////////
    // SLICKM SLIDER (ACCESSIBLE) //
    ////////////////////////////////

    // js-slider
    $('.js-slick').slick({
        autoplay: false,
        dots: true,
        //fade: true,
        arrows: true,
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        adaptiveHeight: true,
        cssEase: 'linear',
        prevArrow: '<button title="Previous Slide" class="slide-arrow slide-arrow--prev"><img src="' + js_vars.themeurl + '/dist/svg/inline-arrow-left.svg" alt="previous-slide"/></button>',
        nextArrow: '<button title="Next Slide" class="slide-arrow slide-arrow--next"><img src="' + js_vars.themeurl + '/dist/svg/inline-arrow-right.svg" alt="next-slide"/></button>',
        // responsive: [
        //   {
        //     breakpoint: 700,
        //     settings: {
        //       arrows: false,
        //       slidesToShow: 3
        //     }
        //   },
        //   {
        //     breakpoint: 500,
        //     settings: {
        //       arrows: false,
        //       slidesToShow: 2
        //     }
        //   },
        //   {
        //     breakpoint: 400,
        //     settings: {
        //       arrows: false,
        //       slidesToShow: 1
        //     }
        //   }
        // ]
    });

    $('.js-slick-one').slick({
        autoplay: false,
        dots: false,
        //fade: true,
        arrows: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
        cssEase: 'linear',
        prevArrow: '<button title="Previous Slide" class="slide-arrow slide-arrow--prev"><img src="' + js_vars.themeurl + '/dist/svg/inline-arrow-left.svg" alt="previous-slide"/></button>',
        nextArrow: '<button title="Next Slide" class="slide-arrow slide-arrow--next"><img src="' + js_vars.themeurl + '/dist/svg/inline-arrow-right.svg" alt="next-slide"/></button>',
    });

    $('.js-slick-two').slick({
        autoplay: false,
        dots: false,
        //fade: true,
        arrows: true,
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 2,
        adaptiveHeight: true,
        cssEase: 'linear',
        prevArrow: '<button title="Previous Slide" class="slide-arrow slide-arrow--prev"><img src="' + js_vars.themeurl + '/dist/svg/inline-arrow-left.svg" alt="previous-slide"/></button>',
        nextArrow: '<button title="Next Slide" class="slide-arrow slide-arrow--next"><img src="' + js_vars.themeurl + '/dist/svg/inline-arrow-right.svg" alt="next-slide"/></button>',
        responsive: [
          {
            breakpoint: 700,
            settings: {
              arrows: true,
              slidesToShow: 1
            }
          },
          {
            breakpoint: 500,
            settings: {
              arrows: true,
              slidesToShow: 1
            }
          },
          {
            breakpoint: 400,
            settings: {
              arrows: true,
              slidesToShow: 1
            }
          }
        ]
    });

    $('.js-slick-logos').slick({
        autoplay: true,
        autoplaySpeed: 1500,
        pauseOnFocus: false,
        pauseOnHover: false,
        dots: false,
        arrows: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        cssEase: 'linear',
        mobileFirst: true,
        responsive: [
          {
            breakpoint: 1000,
            settings: {
              slidesToShow: 7
            }
          },
          {
            breakpoint: 700,
            settings: {
              slidesToShow: 6
            }
          },
          {
            breakpoint: 500,
            settings: {
              slidesToShow: 3
            }
          },
          {
            breakpoint: 400,
            settings: {
              slidesToShow: 2
            }
          }
        ]
    });

    /*! Magnific Popup - v1.1.0 - 2016-02-20
    * http://dimsemenov.com/plugins/magnific-popup/
    * Copyright (c) 2016 Dmitry Semenov; */
    (function (factory) { 
    if (typeof define === 'function' && define.amd) { 
     // AMD. Register as an anonymous module. 
     define(['jquery'], factory); 
     } else if (typeof exports === 'object') { 
     // Node/CommonJS 
     factory(require('jquery')); 
     } else { 
     // Browser globals 
     factory(window.jQuery || window.Zepto); 
     } 
     }(function($) { 

    /*>>core*/
    /**
     * 
     * Magnific Popup Core JS file
     * 
     */


    /**
     * Private static constants
     */
    var CLOSE_EVENT = 'Close',
    	BEFORE_CLOSE_EVENT = 'BeforeClose',
    	AFTER_CLOSE_EVENT = 'AfterClose',
    	BEFORE_APPEND_EVENT = 'BeforeAppend',
    	MARKUP_PARSE_EVENT = 'MarkupParse',
    	OPEN_EVENT = 'Open',
    	CHANGE_EVENT = 'Change',
    	NS = 'mfp',
    	EVENT_NS = '.' + NS,
    	READY_CLASS = 'mfp-ready',
    	REMOVING_CLASS = 'mfp-removing',
    	PREVENT_CLOSE_CLASS = 'mfp-prevent-close';


    /**
     * Private vars 
     */
    /*jshint -W079 */
    var mfp, // As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
    	MagnificPopup = function(){},
    	_isJQ = !!(window.jQuery),
    	_prevStatus,
    	_window = $(window),
    	_document,
    	_prevContentType,
    	_wrapClasses,
    	_currPopupType;


    /**
     * Private functions
     */
    var _mfpOn = function(name, f) {
    		mfp.ev.on(NS + name + EVENT_NS, f);
    	},
    	_getEl = function(className, appendTo, html, raw) {
    		var el = document.createElement('div');
    		el.className = 'mfp-'+className;
    		if(html) {
    			el.innerHTML = html;
    		}
    		if(!raw) {
    			el = $(el);
    			if(appendTo) {
    				el.appendTo(appendTo);
    			}
    		} else if(appendTo) {
    			appendTo.appendChild(el);
    		}
    		return el;
    	},
    	_mfpTrigger = function(e, data) {
    		mfp.ev.triggerHandler(NS + e, data);

    		if(mfp.st.callbacks) {
    			// converts "mfpEventName" to "eventName" callback and triggers it if it's present
    			e = e.charAt(0).toLowerCase() + e.slice(1);
    			if(mfp.st.callbacks[e]) {
    				mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
    			}
    		}
    	},
    	_getCloseBtn = function(type) {
    		if(type !== _currPopupType || !mfp.currTemplate.closeBtn) {
    			mfp.currTemplate.closeBtn = $( mfp.st.closeMarkup.replace('%title%', mfp.st.tClose ) );
    			_currPopupType = type;
    		}
    		return mfp.currTemplate.closeBtn;
    	},
    	// Initialize Magnific Popup only when called at least once
    	_checkInstance = function() {
    		if(!$.magnificPopup.instance) {
    			/*jshint -W020 */
    			mfp = new MagnificPopup();
    			mfp.init();
    			$.magnificPopup.instance = mfp;
    		}
    	},
    	// CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
    	supportsTransitions = function() {
    		var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
    			v = ['ms','O','Moz','Webkit']; // 'v' for vendor

    		if( s['transition'] !== undefined ) {
    			return true; 
    		}
    			
    		while( v.length ) {
    			if( v.pop() + 'Transition' in s ) {
    				return true;
    			}
    		}
    				
    		return false;
    	};



    /**
     * Public functions
     */
    MagnificPopup.prototype = {

    	constructor: MagnificPopup,

    	/**
    	 * Initializes Magnific Popup plugin. 
    	 * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
    	 */
    	init: function() {
    		var appVersion = navigator.appVersion;
    		mfp.isLowIE = mfp.isIE8 = document.all && !document.addEventListener;
    		mfp.isAndroid = (/android/gi).test(appVersion);
    		mfp.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);
    		mfp.supportsTransition = supportsTransitions();

    		// We disable fixed positioned lightbox on devices that don't handle it nicely.
    		// If you know a better way of detecting this - let me know.
    		mfp.probablyMobile = (mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent) );
    		_document = $(document);

    		mfp.popupsCache = {};
    	},

    	/**
    	 * Opens popup
    	 * @param  data [description]
    	 */
    	open: function(data) {

    		var i;

    		if(data.isObj === false) { 
    			// convert jQuery collection to array to avoid conflicts later
    			mfp.items = data.items.toArray();

    			mfp.index = 0;
    			var items = data.items,
    				item;
    			for(i = 0; i < items.length; i++) {
    				item = items[i];
    				if(item.parsed) {
    					item = item.el[0];
    				}
    				if(item === data.el[0]) {
    					mfp.index = i;
    					break;
    				}
    			}
    		} else {
    			mfp.items = $.isArray(data.items) ? data.items : [data.items];
    			mfp.index = data.index || 0;
    		}

    		// if popup is already opened - we just update the content
    		if(mfp.isOpen) {
    			mfp.updateItemHTML();
    			return;
    		}
    		
    		mfp.types = []; 
    		_wrapClasses = '';
    		if(data.mainEl && data.mainEl.length) {
    			mfp.ev = data.mainEl.eq(0);
    		} else {
    			mfp.ev = _document;
    		}

    		if(data.key) {
    			if(!mfp.popupsCache[data.key]) {
    				mfp.popupsCache[data.key] = {};
    			}
    			mfp.currTemplate = mfp.popupsCache[data.key];
    		} else {
    			mfp.currTemplate = {};
    		}



    		mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data ); 
    		mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

    		if(mfp.st.modal) {
    			mfp.st.closeOnContentClick = false;
    			mfp.st.closeOnBgClick = false;
    			mfp.st.showCloseBtn = false;
    			mfp.st.enableEscapeKey = false;
    		}
    		

    		// Building markup
    		// main containers are created only once
    		if(!mfp.bgOverlay) {

    			// Dark overlay
    			mfp.bgOverlay = _getEl('bg').on('click'+EVENT_NS, function() {
    				mfp.close();
    			});

    			mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click'+EVENT_NS, function(e) {
    				if(mfp._checkIfClose(e.target)) {
    					mfp.close();
    				}
    			});

    			mfp.container = _getEl('container', mfp.wrap);
    		}

    		mfp.contentContainer = _getEl('content');
    		if(mfp.st.preloader) {
    			mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
    		}


    		// Initializing modules
    		var modules = $.magnificPopup.modules;
    		for(i = 0; i < modules.length; i++) {
    			var n = modules[i];
    			n = n.charAt(0).toUpperCase() + n.slice(1);
    			mfp['init'+n].call(mfp);
    		}
    		_mfpTrigger('BeforeOpen');


    		if(mfp.st.showCloseBtn) {
    			// Close button
    			if(!mfp.st.closeBtnInside) {
    				mfp.wrap.append( _getCloseBtn() );
    			} else {
    				_mfpOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
    					values.close_replaceWith = _getCloseBtn(item.type);
    				});
    				_wrapClasses += ' mfp-close-btn-in';
    			}
    		}

    		if(mfp.st.alignTop) {
    			_wrapClasses += ' mfp-align-top';
    		}

    	

    		if(mfp.fixedContentPos) {
    			mfp.wrap.css({
    				overflow: mfp.st.overflowY,
    				overflowX: 'hidden',
    				overflowY: mfp.st.overflowY
    			});
    		} else {
    			mfp.wrap.css({ 
    				top: _window.scrollTop(),
    				position: 'absolute'
    			});
    		}
    		if( mfp.st.fixedBgPos === false || (mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos) ) {
    			mfp.bgOverlay.css({
    				height: _document.height(),
    				position: 'absolute'
    			});
    		}

    		

    		if(mfp.st.enableEscapeKey) {
    			// Close on ESC key
    			_document.on('keyup' + EVENT_NS, function(e) {
    				if(e.keyCode === 27) {
    					mfp.close();
    				}
    			});
    		}

    		_window.on('resize' + EVENT_NS, function() {
    			mfp.updateSize();
    		});


    		if(!mfp.st.closeOnContentClick) {
    			_wrapClasses += ' mfp-auto-cursor';
    		}
    		
    		if(_wrapClasses)
    			mfp.wrap.addClass(_wrapClasses);


    		// this triggers recalculation of layout, so we get it once to not to trigger twice
    		var windowHeight = mfp.wH = _window.height();

    		
    		var windowStyles = {};

    		if( mfp.fixedContentPos ) {
                if(mfp._hasScrollBar(windowHeight)){
                    var s = mfp._getScrollbarSize();
                    if(s) {
                        windowStyles.marginRight = s;
                    }
                }
            }

    		if(mfp.fixedContentPos) {
    			if(!mfp.isIE7) {
    				windowStyles.overflow = 'hidden';
    			} else {
    				// ie7 double-scroll bug
    				$('body, html').css('overflow', 'hidden');
    			}
    		}

    		
    		
    		var classesToadd = mfp.st.mainClass;
    		if(mfp.isIE7) {
    			classesToadd += ' mfp-ie7';
    		}
    		if(classesToadd) {
    			mfp._addClassToMFP( classesToadd );
    		}

    		// add content
    		mfp.updateItemHTML();

    		_mfpTrigger('BuildControls');

    		// remove scrollbar, add margin e.t.c
    		$('html').css(windowStyles);
    		
    		// add everything to DOM
    		mfp.bgOverlay.add(mfp.wrap).prependTo( mfp.st.prependTo || $(document.body) );

    		// Save last focused element
    		mfp._lastFocusedEl = document.activeElement;
    		
    		// Wait for next cycle to allow CSS transition
    		setTimeout(function() {
    			
    			if(mfp.content) {
    				mfp._addClassToMFP(READY_CLASS);
    				mfp._setFocus();
    			} else {
    				// if content is not defined (not loaded e.t.c) we add class only for BG
    				mfp.bgOverlay.addClass(READY_CLASS);
    			}
    			
    			// Trap the focus in popup
    			_document.on('focusin' + EVENT_NS, mfp._onFocusIn);

    		}, 16);

    		mfp.isOpen = true;
    		mfp.updateSize(windowHeight);
    		_mfpTrigger(OPEN_EVENT);

    		return data;
    	},

    	/**
    	 * Closes the popup
    	 */
    	close: function() {
    		if(!mfp.isOpen) return;
    		_mfpTrigger(BEFORE_CLOSE_EVENT);

    		mfp.isOpen = false;
    		// for CSS3 animation
    		if(mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition )  {
    			mfp._addClassToMFP(REMOVING_CLASS);
    			setTimeout(function() {
    				mfp._close();
    			}, mfp.st.removalDelay);
    		} else {
    			mfp._close();
    		}
    	},

    	/**
    	 * Helper for close() function
    	 */
    	_close: function() {
    		_mfpTrigger(CLOSE_EVENT);

    		var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

    		mfp.bgOverlay.detach();
    		mfp.wrap.detach();
    		mfp.container.empty();

    		if(mfp.st.mainClass) {
    			classesToRemove += mfp.st.mainClass + ' ';
    		}

    		mfp._removeClassFromMFP(classesToRemove);

    		if(mfp.fixedContentPos) {
    			var windowStyles = {marginRight: ''};
    			if(mfp.isIE7) {
    				$('body, html').css('overflow', '');
    			} else {
    				windowStyles.overflow = '';
    			}
    			$('html').css(windowStyles);
    		}
    		
    		_document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
    		mfp.ev.off(EVENT_NS);

    		// clean up DOM elements that aren't removed
    		mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
    		mfp.bgOverlay.attr('class', 'mfp-bg');
    		mfp.container.attr('class', 'mfp-container');

    		// remove close button from target element
    		if(mfp.st.showCloseBtn &&
    		(!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
    			if(mfp.currTemplate.closeBtn)
    				mfp.currTemplate.closeBtn.detach();
    		}


    		if(mfp.st.autoFocusLast && mfp._lastFocusedEl) {
    			$(mfp._lastFocusedEl).focus(); // put tab focus back
    		}
    		mfp.currItem = null;	
    		mfp.content = null;
    		mfp.currTemplate = null;
    		mfp.prevHeight = 0;

    		_mfpTrigger(AFTER_CLOSE_EVENT);
    	},
    	
    	updateSize: function(winHeight) {

    		if(mfp.isIOS) {
    			// fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
    			var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
    			var height = window.innerHeight * zoomLevel;
    			mfp.wrap.css('height', height);
    			mfp.wH = height;
    		} else {
    			mfp.wH = winHeight || _window.height();
    		}
    		// Fixes #84: popup incorrectly positioned with position:relative on body
    		if(!mfp.fixedContentPos) {
    			mfp.wrap.css('height', mfp.wH);
    		}

    		_mfpTrigger('Resize');

    	},

    	/**
    	 * Set content of popup based on current index
    	 */
    	updateItemHTML: function() {
    		var item = mfp.items[mfp.index];

    		// Detach and perform modifications
    		mfp.contentContainer.detach();

    		if(mfp.content)
    			mfp.content.detach();

    		if(!item.parsed) {
    			item = mfp.parseEl( mfp.index );
    		}

    		var type = item.type;

    		_mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
    		// BeforeChange event works like so:
    		// _mfpOn('BeforeChange', function(e, prevType, newType) { });

    		mfp.currItem = item;

    		if(!mfp.currTemplate[type]) {
    			var markup = mfp.st[type] ? mfp.st[type].markup : false;

    			// allows to modify markup
    			_mfpTrigger('FirstMarkupParse', markup);

    			if(markup) {
    				mfp.currTemplate[type] = $(markup);
    			} else {
    				// if there is no markup found we just define that template is parsed
    				mfp.currTemplate[type] = true;
    			}
    		}

    		if(_prevContentType && _prevContentType !== item.type) {
    			mfp.container.removeClass('mfp-'+_prevContentType+'-holder');
    		}

    		var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
    		mfp.appendContent(newContent, type);

    		item.preloaded = true;

    		_mfpTrigger(CHANGE_EVENT, item);
    		_prevContentType = item.type;

    		// Append container back after its content changed
    		mfp.container.prepend(mfp.contentContainer);

    		_mfpTrigger('AfterChange');
    	},


    	/**
    	 * Set HTML content of popup
    	 */
    	appendContent: function(newContent, type) {
    		mfp.content = newContent;

    		if(newContent) {
    			if(mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
    				mfp.currTemplate[type] === true) {
    				// if there is no markup, we just append close button element inside
    				if(!mfp.content.find('.mfp-close').length) {
    					mfp.content.append(_getCloseBtn());
    				}
    			} else {
    				mfp.content = newContent;
    			}
    		} else {
    			mfp.content = '';
    		}

    		_mfpTrigger(BEFORE_APPEND_EVENT);
    		mfp.container.addClass('mfp-'+type+'-holder');

    		mfp.contentContainer.append(mfp.content);
    	},


    	/**
    	 * Creates Magnific Popup data object based on given data
    	 * @param  {int} index Index of item to parse
    	 */
    	parseEl: function(index) {
    		var item = mfp.items[index],
    			type;

    		if(item.tagName) {
    			item = { el: $(item) };
    		} else {
    			type = item.type;
    			item = { data: item, src: item.src };
    		}

    		if(item.el) {
    			var types = mfp.types;

    			// check for 'mfp-TYPE' class
    			for(var i = 0; i < types.length; i++) {
    				if( item.el.hasClass('mfp-'+types[i]) ) {
    					type = types[i];
    					break;
    				}
    			}

    			item.src = item.el.attr('data-mfp-src');
    			if(!item.src) {
    				item.src = item.el.attr('href');
    			}
    		}

    		item.type = type || mfp.st.type || 'inline';
    		item.index = index;
    		item.parsed = true;
    		mfp.items[index] = item;
    		_mfpTrigger('ElementParse', item);

    		return mfp.items[index];
    	},


    	/**
    	 * Initializes single popup or a group of popups
    	 */
    	addGroup: function(el, options) {
    		var eHandler = function(e) {
    			e.mfpEl = this;
    			mfp._openClick(e, el, options);
    		};

    		if(!options) {
    			options = {};
    		}

    		var eName = 'click.magnificPopup';
    		options.mainEl = el;

    		if(options.items) {
    			options.isObj = true;
    			el.off(eName).on(eName, eHandler);
    		} else {
    			options.isObj = false;
    			if(options.delegate) {
    				el.off(eName).on(eName, options.delegate , eHandler);
    			} else {
    				options.items = el;
    				el.off(eName).on(eName, eHandler);
    			}
    		}
    	},
    	_openClick: function(e, el, options) {
    		var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


    		if(!midClick && ( e.which === 2 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey ) ) {
    			return;
    		}

    		var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

    		if(disableOn) {
    			if($.isFunction(disableOn)) {
    				if( !disableOn.call(mfp) ) {
    					return true;
    				}
    			} else { // else it's number
    				if( _window.width() < disableOn ) {
    					return true;
    				}
    			}
    		}

    		if(e.type) {
    			e.preventDefault();

    			// This will prevent popup from closing if element is inside and popup is already opened
    			if(mfp.isOpen) {
    				e.stopPropagation();
    			}
    		}

    		options.el = $(e.mfpEl);
    		if(options.delegate) {
    			options.items = el.find(options.delegate);
    		}
    		mfp.open(options);
    	},


    	/**
    	 * Updates text on preloader
    	 */
    	updateStatus: function(status, text) {

    		if(mfp.preloader) {
    			if(_prevStatus !== status) {
    				mfp.container.removeClass('mfp-s-'+_prevStatus);
    			}

    			if(!text && status === 'loading') {
    				text = mfp.st.tLoading;
    			}

    			var data = {
    				status: status,
    				text: text
    			};
    			// allows to modify status
    			_mfpTrigger('UpdateStatus', data);

    			status = data.status;
    			text = data.text;

    			mfp.preloader.html(text);

    			mfp.preloader.find('a').on('click', function(e) {
    				e.stopImmediatePropagation();
    			});

    			mfp.container.addClass('mfp-s-'+status);
    			_prevStatus = status;
    		}
    	},


    	/*
    		"Private" helpers that aren't private at all
    	 */
    	// Check to close popup or not
    	// "target" is an element that was clicked
    	_checkIfClose: function(target) {

    		if($(target).hasClass(PREVENT_CLOSE_CLASS)) {
    			return;
    		}

    		var closeOnContent = mfp.st.closeOnContentClick;
    		var closeOnBg = mfp.st.closeOnBgClick;

    		if(closeOnContent && closeOnBg) {
    			return true;
    		} else {

    			// We close the popup if click is on close button or on preloader. Or if there is no content.
    			if(!mfp.content || $(target).hasClass('mfp-close') || (mfp.preloader && target === mfp.preloader[0]) ) {
    				return true;
    			}

    			// if click is outside the content
    			if(  (target !== mfp.content[0] && !$.contains(mfp.content[0], target))  ) {
    				if(closeOnBg) {
    					// last check, if the clicked element is in DOM, (in case it's removed onclick)
    					if( $.contains(document, target) ) {
    						return true;
    					}
    				}
    			} else if(closeOnContent) {
    				return true;
    			}

    		}
    		return false;
    	},
    	_addClassToMFP: function(cName) {
    		mfp.bgOverlay.addClass(cName);
    		mfp.wrap.addClass(cName);
    	},
    	_removeClassFromMFP: function(cName) {
    		this.bgOverlay.removeClass(cName);
    		mfp.wrap.removeClass(cName);
    	},
    	_hasScrollBar: function(winHeight) {
    		return (  (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height()) );
    	},
    	_setFocus: function() {
    		(mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
    	},
    	_onFocusIn: function(e) {
    		if( e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target) ) {
    			mfp._setFocus();
    			return false;
    		}
    	},
    	_parseMarkup: function(template, values, item) {
    		var arr;
    		if(item.data) {
    			values = $.extend(item.data, values);
    		}
    		_mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item] );

    		$.each(values, function(key, value) {
    			if(value === undefined || value === false) {
    				return true;
    			}
    			arr = key.split('_');
    			if(arr.length > 1) {
    				var el = template.find(EVENT_NS + '-'+arr[0]);

    				if(el.length > 0) {
    					var attr = arr[1];
    					if(attr === 'replaceWith') {
    						if(el[0] !== value[0]) {
    							el.replaceWith(value);
    						}
    					} else if(attr === 'img') {
    						if(el.is('img')) {
    							el.attr('src', value);
    						} else {
    							el.replaceWith( $('<img>').attr('src', value).attr('class', el.attr('class')) );
    						}
    					} else {
    						el.attr(arr[1], value);
    					}
    				}

    			} else {
    				template.find(EVENT_NS + '-'+key).html(value);
    			}
    		});
    	},

    	_getScrollbarSize: function() {
    		// thx David
    		if(mfp.scrollbarSize === undefined) {
    			var scrollDiv = document.createElement("div");
    			scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
    			document.body.appendChild(scrollDiv);
    			mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    			document.body.removeChild(scrollDiv);
    		}
    		return mfp.scrollbarSize;
    	}

    }; /* MagnificPopup core prototype end */




    /**
     * Public static functions
     */
    $.magnificPopup = {
    	instance: null,
    	proto: MagnificPopup.prototype,
    	modules: [],

    	open: function(options, index) {
    		_checkInstance();

    		if(!options) {
    			options = {};
    		} else {
    			options = $.extend(true, {}, options);
    		}

    		options.isObj = true;
    		options.index = index || 0;
    		return this.instance.open(options);
    	},

    	close: function() {
    		return $.magnificPopup.instance && $.magnificPopup.instance.close();
    	},

    	registerModule: function(name, module) {
    		if(module.options) {
    			$.magnificPopup.defaults[name] = module.options;
    		}
    		$.extend(this.proto, module.proto);
    		this.modules.push(name);
    	},

    	defaults: {

    		// Info about options is in docs:
    		// http://dimsemenov.com/plugins/magnific-popup/documentation.html#options

    		disableOn: 0,

    		key: null,

    		midClick: false,

    		mainClass: '',

    		preloader: true,

    		focus: '', // CSS selector of input to focus after popup is opened

    		closeOnContentClick: false,

    		closeOnBgClick: true,

    		closeBtnInside: true,

    		showCloseBtn: true,

    		enableEscapeKey: true,

    		modal: false,

    		alignTop: false,

    		removalDelay: 0,

    		prependTo: null,

    		fixedContentPos: 'auto',

    		fixedBgPos: 'auto',

    		overflowY: 'auto',

    		closeMarkup: '<button title="%title%" type="button" class="mfp-close">&#215;</button>',

    		tClose: 'Close (Esc)',

    		tLoading: 'Loading...',

    		autoFocusLast: true

    	}
    };



    $.fn.magnificPopup = function(options) {
    	_checkInstance();

    	var jqEl = $(this);

    	// We call some API method of first param is a string
    	if (typeof options === "string" ) {

    		if(options === 'open') {
    			var items,
    				itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
    				index = parseInt(arguments[1], 10) || 0;

    			if(itemOpts.items) {
    				items = itemOpts.items[index];
    			} else {
    				items = jqEl;
    				if(itemOpts.delegate) {
    					items = items.find(itemOpts.delegate);
    				}
    				items = items.eq( index );
    			}
    			mfp._openClick({mfpEl:items}, jqEl, itemOpts);
    		} else {
    			if(mfp.isOpen)
    				mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
    		}

    	} else {
    		// clone options obj
    		options = $.extend(true, {}, options);

    		/*
    		 * As Zepto doesn't support .data() method for objects
    		 * and it works only in normal browsers
    		 * we assign "options" object directly to the DOM element. FTW!
    		 */
    		if(_isJQ) {
    			jqEl.data('magnificPopup', options);
    		} else {
    			jqEl[0].magnificPopup = options;
    		}

    		mfp.addGroup(jqEl, options);

    	}
    	return jqEl;
    };

    /*>>core*/

    /*>>inline*/

    var INLINE_NS = 'inline',
    	_hiddenClass,
    	_inlinePlaceholder,
    	_lastInlineElement,
    	_putInlineElementsBack = function() {
    		if(_lastInlineElement) {
    			_inlinePlaceholder.after( _lastInlineElement.addClass(_hiddenClass) ).detach();
    			_lastInlineElement = null;
    		}
    	};

    $.magnificPopup.registerModule(INLINE_NS, {
    	options: {
    		hiddenClass: 'hide', // will be appended with `mfp-` prefix
    		markup: '',
    		tNotFound: 'Content not found'
    	},
    	proto: {

    		initInline: function() {
    			mfp.types.push(INLINE_NS);

    			_mfpOn(CLOSE_EVENT+'.'+INLINE_NS, function() {
    				_putInlineElementsBack();
    			});
    		},

    		getInline: function(item, template) {

    			_putInlineElementsBack();

    			if(item.src) {
    				var inlineSt = mfp.st.inline,
    					el = $(item.src);

    				if(el.length) {

    					// If target element has parent - we replace it with placeholder and put it back after popup is closed
    					var parent = el[0].parentNode;
    					if(parent && parent.tagName) {
    						if(!_inlinePlaceholder) {
    							_hiddenClass = inlineSt.hiddenClass;
    							_inlinePlaceholder = _getEl(_hiddenClass);
    							_hiddenClass = 'mfp-'+_hiddenClass;
    						}
    						// replace target inline element with placeholder
    						_lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
    					}

    					mfp.updateStatus('ready');
    				} else {
    					mfp.updateStatus('error', inlineSt.tNotFound);
    					el = $('<div>');
    				}

    				item.inlineElement = el;
    				return el;
    			}

    			mfp.updateStatus('ready');
    			mfp._parseMarkup(template, {}, item);
    			return template;
    		}
    	}
    });

    /*>>inline*/

    /*>>ajax*/
    var AJAX_NS = 'ajax',
    	_ajaxCur,
    	_removeAjaxCursor = function() {
    		if(_ajaxCur) {
    			$(document.body).removeClass(_ajaxCur);
    		}
    	},
    	_destroyAjaxRequest = function() {
    		_removeAjaxCursor();
    		if(mfp.req) {
    			mfp.req.abort();
    		}
    	};

    $.magnificPopup.registerModule(AJAX_NS, {

    	options: {
    		settings: null,
    		cursor: 'mfp-ajax-cur',
    		tError: '<a href="%url%">The content</a> could not be loaded.'
    	},

    	proto: {
    		initAjax: function() {
    			mfp.types.push(AJAX_NS);
    			_ajaxCur = mfp.st.ajax.cursor;

    			_mfpOn(CLOSE_EVENT+'.'+AJAX_NS, _destroyAjaxRequest);
    			_mfpOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
    		},
    		getAjax: function(item) {

    			if(_ajaxCur) {
    				$(document.body).addClass(_ajaxCur);
    			}

    			mfp.updateStatus('loading');

    			var opts = $.extend({
    				url: item.src,
    				success: function(data, textStatus, jqXHR) {
    					var temp = {
    						data:data,
    						xhr:jqXHR
    					};

    					_mfpTrigger('ParseAjax', temp);

    					mfp.appendContent( $(temp.data), AJAX_NS );

    					item.finished = true;

    					_removeAjaxCursor();

    					mfp._setFocus();

    					setTimeout(function() {
    						mfp.wrap.addClass(READY_CLASS);
    					}, 16);

    					mfp.updateStatus('ready');

    					_mfpTrigger('AjaxContentAdded');
    				},
    				error: function() {
    					_removeAjaxCursor();
    					item.finished = item.loadError = true;
    					mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
    				}
    			}, mfp.st.ajax.settings);

    			mfp.req = $.ajax(opts);

    			return '';
    		}
    	}
    });

    /*>>ajax*/

    /*>>image*/
    var _imgInterval,
    	_getTitle = function(item) {
    		if(item.data && item.data.title !== undefined)
    			return item.data.title;

    		var src = mfp.st.image.titleSrc;

    		if(src) {
    			if($.isFunction(src)) {
    				return src.call(mfp, item);
    			} else if(item.el) {
    				return item.el.attr(src) || '';
    			}
    		}
    		return '';
    	};

    $.magnificPopup.registerModule('image', {

    	options: {
    		markup: '<div class="mfp-figure">'+
    					'<div class="mfp-close"></div>'+
    					'<figure>'+
    						'<div class="mfp-img"></div>'+
    						'<figcaption>'+
    							'<div class="mfp-bottom-bar">'+
    								'<div class="mfp-title"></div>'+
    								'<div class="mfp-counter"></div>'+
    							'</div>'+
    						'</figcaption>'+
    					'</figure>'+
    				'</div>',
    		cursor: 'mfp-zoom-out-cur',
    		titleSrc: 'title',
    		verticalFit: true,
    		tError: '<a href="%url%">The image</a> could not be loaded.'
    	},

    	proto: {
    		initImage: function() {
    			var imgSt = mfp.st.image,
    				ns = '.image';

    			mfp.types.push('image');

    			_mfpOn(OPEN_EVENT+ns, function() {
    				if(mfp.currItem.type === 'image' && imgSt.cursor) {
    					$(document.body).addClass(imgSt.cursor);
    				}
    			});

    			_mfpOn(CLOSE_EVENT+ns, function() {
    				if(imgSt.cursor) {
    					$(document.body).removeClass(imgSt.cursor);
    				}
    				_window.off('resize' + EVENT_NS);
    			});

    			_mfpOn('Resize'+ns, mfp.resizeImage);
    			if(mfp.isLowIE) {
    				_mfpOn('AfterChange', mfp.resizeImage);
    			}
    		},
    		resizeImage: function() {
    			var item = mfp.currItem;
    			if(!item || !item.img) return;

    			if(mfp.st.image.verticalFit) {
    				var decr = 0;
    				// fix box-sizing in ie7/8
    				if(mfp.isLowIE) {
    					decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'),10);
    				}
    				item.img.css('max-height', mfp.wH-decr);
    			}
    		},
    		_onImageHasSize: function(item) {
    			if(item.img) {

    				item.hasSize = true;

    				if(_imgInterval) {
    					clearInterval(_imgInterval);
    				}

    				item.isCheckingImgSize = false;

    				_mfpTrigger('ImageHasSize', item);

    				if(item.imgHidden) {
    					if(mfp.content)
    						mfp.content.removeClass('mfp-loading');

    					item.imgHidden = false;
    				}

    			}
    		},

    		/**
    		 * Function that loops until the image has size to display elements that rely on it asap
    		 */
    		findImageSize: function(item) {

    			var counter = 0,
    				img = item.img[0],
    				mfpSetInterval = function(delay) {

    					if(_imgInterval) {
    						clearInterval(_imgInterval);
    					}
    					// decelerating interval that checks for size of an image
    					_imgInterval = setInterval(function() {
    						if(img.naturalWidth > 0) {
    							mfp._onImageHasSize(item);
    							return;
    						}

    						if(counter > 200) {
    							clearInterval(_imgInterval);
    						}

    						counter++;
    						if(counter === 3) {
    							mfpSetInterval(10);
    						} else if(counter === 40) {
    							mfpSetInterval(50);
    						} else if(counter === 100) {
    							mfpSetInterval(500);
    						}
    					}, delay);
    				};

    			mfpSetInterval(1);
    		},

    		getImage: function(item, template) {

    			var guard = 0,

    				// image load complete handler
    				onLoadComplete = function() {
    					if(item) {
    						if (item.img[0].complete) {
    							item.img.off('.mfploader');

    							if(item === mfp.currItem){
    								mfp._onImageHasSize(item);

    								mfp.updateStatus('ready');
    							}

    							item.hasSize = true;
    							item.loaded = true;

    							_mfpTrigger('ImageLoadComplete');

    						}
    						else {
    							// if image complete check fails 200 times (20 sec), we assume that there was an error.
    							guard++;
    							if(guard < 200) {
    								setTimeout(onLoadComplete,100);
    							} else {
    								onLoadError();
    							}
    						}
    					}
    				},

    				// image error handler
    				onLoadError = function() {
    					if(item) {
    						item.img.off('.mfploader');
    						if(item === mfp.currItem){
    							mfp._onImageHasSize(item);
    							mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
    						}

    						item.hasSize = true;
    						item.loaded = true;
    						item.loadError = true;
    					}
    				},
    				imgSt = mfp.st.image;


    			var el = template.find('.mfp-img');
    			if(el.length) {
    				var img = document.createElement('img');
    				img.className = 'mfp-img';
    				if(item.el && item.el.find('img').length) {
    					img.alt = item.el.find('img').attr('alt');
    				}
    				item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
    				img.src = item.src;

    				// without clone() "error" event is not firing when IMG is replaced by new IMG
    				// TODO: find a way to avoid such cloning
    				if(el.is('img')) {
    					item.img = item.img.clone();
    				}

    				img = item.img[0];
    				if(img.naturalWidth > 0) {
    					item.hasSize = true;
    				} else if(!img.width) {
    					item.hasSize = false;
    				}
    			}

    			mfp._parseMarkup(template, {
    				title: _getTitle(item),
    				img_replaceWith: item.img
    			}, item);

    			mfp.resizeImage();

    			if(item.hasSize) {
    				if(_imgInterval) clearInterval(_imgInterval);

    				if(item.loadError) {
    					template.addClass('mfp-loading');
    					mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
    				} else {
    					template.removeClass('mfp-loading');
    					mfp.updateStatus('ready');
    				}
    				return template;
    			}

    			mfp.updateStatus('loading');
    			item.loading = true;

    			if(!item.hasSize) {
    				item.imgHidden = true;
    				template.addClass('mfp-loading');
    				mfp.findImageSize(item);
    			}

    			return template;
    		}
    	}
    });

    /*>>image*/

    /*>>zoom*/
    var hasMozTransform,
    	getHasMozTransform = function() {
    		if(hasMozTransform === undefined) {
    			hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
    		}
    		return hasMozTransform;
    	};

    $.magnificPopup.registerModule('zoom', {

    	options: {
    		enabled: false,
    		easing: 'ease-in-out',
    		duration: 300,
    		opener: function(element) {
    			return element.is('img') ? element : element.find('img');
    		}
    	},

    	proto: {

    		initZoom: function() {
    			var zoomSt = mfp.st.zoom,
    				ns = '.zoom',
    				image;

    			if(!zoomSt.enabled || !mfp.supportsTransition) {
    				return;
    			}

    			var duration = zoomSt.duration,
    				getElToAnimate = function(image) {
    					var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
    						transition = 'all '+(zoomSt.duration/1000)+'s ' + zoomSt.easing,
    						cssObj = {
    							position: 'fixed',
    							zIndex: 9999,
    							left: 0,
    							top: 0,
    							'-webkit-backface-visibility': 'hidden'
    						},
    						t = 'transition';

    					cssObj['-webkit-'+t] = cssObj['-moz-'+t] = cssObj['-o-'+t] = cssObj[t] = transition;

    					newImg.css(cssObj);
    					return newImg;
    				},
    				showMainContent = function() {
    					mfp.content.css('visibility', 'visible');
    				},
    				openTimeout,
    				animatedImg;

    			_mfpOn('BuildControls'+ns, function() {
    				if(mfp._allowZoom()) {

    					clearTimeout(openTimeout);
    					mfp.content.css('visibility', 'hidden');

    					// Basically, all code below does is clones existing image, puts in on top of the current one and animated it

    					image = mfp._getItemToZoom();

    					if(!image) {
    						showMainContent();
    						return;
    					}

    					animatedImg = getElToAnimate(image);

    					animatedImg.css( mfp._getOffset() );

    					mfp.wrap.append(animatedImg);

    					openTimeout = setTimeout(function() {
    						animatedImg.css( mfp._getOffset( true ) );
    						openTimeout = setTimeout(function() {

    							showMainContent();

    							setTimeout(function() {
    								animatedImg.remove();
    								image = animatedImg = null;
    								_mfpTrigger('ZoomAnimationEnded');
    							}, 16); // avoid blink when switching images

    						}, duration); // this timeout equals animation duration

    					}, 16); // by adding this timeout we avoid short glitch at the beginning of animation


    					// Lots of timeouts...
    				}
    			});
    			_mfpOn(BEFORE_CLOSE_EVENT+ns, function() {
    				if(mfp._allowZoom()) {

    					clearTimeout(openTimeout);

    					mfp.st.removalDelay = duration;

    					if(!image) {
    						image = mfp._getItemToZoom();
    						if(!image) {
    							return;
    						}
    						animatedImg = getElToAnimate(image);
    					}

    					animatedImg.css( mfp._getOffset(true) );
    					mfp.wrap.append(animatedImg);
    					mfp.content.css('visibility', 'hidden');

    					setTimeout(function() {
    						animatedImg.css( mfp._getOffset() );
    					}, 16);
    				}

    			});

    			_mfpOn(CLOSE_EVENT+ns, function() {
    				if(mfp._allowZoom()) {
    					showMainContent();
    					if(animatedImg) {
    						animatedImg.remove();
    					}
    					image = null;
    				}
    			});
    		},

    		_allowZoom: function() {
    			return mfp.currItem.type === 'image';
    		},

    		_getItemToZoom: function() {
    			if(mfp.currItem.hasSize) {
    				return mfp.currItem.img;
    			} else {
    				return false;
    			}
    		},

    		// Get element postion relative to viewport
    		_getOffset: function(isLarge) {
    			var el;
    			if(isLarge) {
    				el = mfp.currItem.img;
    			} else {
    				el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
    			}

    			var offset = el.offset();
    			var paddingTop = parseInt(el.css('padding-top'),10);
    			var paddingBottom = parseInt(el.css('padding-bottom'),10);
    			offset.top -= ( $(window).scrollTop() - paddingTop );


    			/*

    			Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

    			 */
    			var obj = {
    				width: el.width(),
    				// fix Zepto height+padding issue
    				height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
    			};

    			// I hate to do this, but there is no another option
    			if( getHasMozTransform() ) {
    				obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
    			} else {
    				obj.left = offset.left;
    				obj.top = offset.top;
    			}
    			return obj;
    		}

    	}
    });



    /*>>zoom*/

    /*>>iframe*/

    var IFRAME_NS = 'iframe',
    	_emptyPage = '//about:blank',

    	_fixIframeBugs = function(isShowing) {
    		if(mfp.currTemplate[IFRAME_NS]) {
    			var el = mfp.currTemplate[IFRAME_NS].find('iframe');
    			if(el.length) {
    				// reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
    				if(!isShowing) {
    					el[0].src = _emptyPage;
    				}

    				// IE8 black screen bug fix
    				if(mfp.isIE8) {
    					el.css('display', isShowing ? 'block' : 'none');
    				}
    			}
    		}
    	};

    $.magnificPopup.registerModule(IFRAME_NS, {

    	options: {
    		markup: '<div class="mfp-iframe-scaler">'+
    					'<div class="mfp-close"></div>'+
    					'<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>'+
    				'</div>',

    		srcAction: 'iframe_src',

    		// we don't care and support only one default type of URL by default
    		patterns: {
    			youtube: {
    				index: 'youtube.com',
    				id: 'v=',
    				src: '//www.youtube.com/embed/%id%?autoplay=1'
    			},
    			vimeo: {
    				index: 'vimeo.com/',
    				id: '/',
    				src: '//player.vimeo.com/video/%id%?autoplay=1'
    			},
    			gmaps: {
    				index: '//maps.google.',
    				src: '%id%&output=embed'
    			}
    		}
    	},

    	proto: {
    		initIframe: function() {
    			mfp.types.push(IFRAME_NS);

    			_mfpOn('BeforeChange', function(e, prevType, newType) {
    				if(prevType !== newType) {
    					if(prevType === IFRAME_NS) {
    						_fixIframeBugs(); // iframe if removed
    					} else if(newType === IFRAME_NS) {
    						_fixIframeBugs(true); // iframe is showing
    					}
    				}// else {
    					// iframe source is switched, don't do anything
    				//}
    			});

    			_mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function() {
    				_fixIframeBugs();
    			});
    		},

    		getIframe: function(item, template) {
    			var embedSrc = item.src;
    			var iframeSt = mfp.st.iframe;

    			$.each(iframeSt.patterns, function() {
    				if(embedSrc.indexOf( this.index ) > -1) {
    					if(this.id) {
    						if(typeof this.id === 'string') {
    							embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id)+this.id.length, embedSrc.length);
    						} else {
    							embedSrc = this.id.call( this, embedSrc );
    						}
    					}
    					embedSrc = this.src.replace('%id%', embedSrc );
    					return false; // break;
    				}
    			});

    			var dataObj = {};
    			if(iframeSt.srcAction) {
    				dataObj[iframeSt.srcAction] = embedSrc;
    			}
    			mfp._parseMarkup(template, dataObj, item);

    			mfp.updateStatus('ready');

    			return template;
    		}
    	}
    });



    /*>>iframe*/

    /*>>gallery*/
    /**
     * Get looped index depending on number of slides
     */
    var _getLoopedId = function(index) {
    		var numSlides = mfp.items.length;
    		if(index > numSlides - 1) {
    			return index - numSlides;
    		} else  if(index < 0) {
    			return numSlides + index;
    		}
    		return index;
    	},
    	_replaceCurrTotal = function(text, curr, total) {
    		return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
    	};

    $.magnificPopup.registerModule('gallery', {

    	options: {
    		enabled: false,
    		arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
    		preload: [0,2],
    		navigateByImgClick: true,
    		arrows: true,

    		tPrev: 'Previous (Left arrow key)',
    		tNext: 'Next (Right arrow key)',
    		tCounter: '%curr% of %total%'
    	},

    	proto: {
    		initGallery: function() {

    			var gSt = mfp.st.gallery,
    				ns = '.mfp-gallery';

    			mfp.direction = true; // true - next, false - prev

    			if(!gSt || !gSt.enabled ) return false;

    			_wrapClasses += ' mfp-gallery';

    			_mfpOn(OPEN_EVENT+ns, function() {

    				if(gSt.navigateByImgClick) {
    					mfp.wrap.on('click'+ns, '.mfp-img', function() {
    						if(mfp.items.length > 1) {
    							mfp.next();
    							return false;
    						}
    					});
    				}

    				_document.on('keydown'+ns, function(e) {
    					if (e.keyCode === 37) {
    						mfp.prev();
    					} else if (e.keyCode === 39) {
    						mfp.next();
    					}
    				});
    			});

    			_mfpOn('UpdateStatus'+ns, function(e, data) {
    				if(data.text) {
    					data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
    				}
    			});

    			_mfpOn(MARKUP_PARSE_EVENT+ns, function(e, element, values, item) {
    				var l = mfp.items.length;
    				values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
    			});

    			_mfpOn('BuildControls' + ns, function() {
    				if(mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
    					var markup = gSt.arrowMarkup,
    						arrowLeft = mfp.arrowLeft = $( markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left') ).addClass(PREVENT_CLOSE_CLASS),
    						arrowRight = mfp.arrowRight = $( markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right') ).addClass(PREVENT_CLOSE_CLASS);

    					arrowLeft.click(function() {
    						mfp.prev();
    					});
    					arrowRight.click(function() {
    						mfp.next();
    					});

    					mfp.container.append(arrowLeft.add(arrowRight));
    				}
    			});

    			_mfpOn(CHANGE_EVENT+ns, function() {
    				if(mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

    				mfp._preloadTimeout = setTimeout(function() {
    					mfp.preloadNearbyImages();
    					mfp._preloadTimeout = null;
    				}, 16);
    			});


    			_mfpOn(CLOSE_EVENT+ns, function() {
    				_document.off(ns);
    				mfp.wrap.off('click'+ns);
    				mfp.arrowRight = mfp.arrowLeft = null;
    			});

    		},
    		next: function() {
    			mfp.direction = true;
    			mfp.index = _getLoopedId(mfp.index + 1);
    			mfp.updateItemHTML();
    		},
    		prev: function() {
    			mfp.direction = false;
    			mfp.index = _getLoopedId(mfp.index - 1);
    			mfp.updateItemHTML();
    		},
    		goTo: function(newIndex) {
    			mfp.direction = (newIndex >= mfp.index);
    			mfp.index = newIndex;
    			mfp.updateItemHTML();
    		},
    		preloadNearbyImages: function() {
    			var p = mfp.st.gallery.preload,
    				preloadBefore = Math.min(p[0], mfp.items.length),
    				preloadAfter = Math.min(p[1], mfp.items.length),
    				i;

    			for(i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
    				mfp._preloadItem(mfp.index+i);
    			}
    			for(i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
    				mfp._preloadItem(mfp.index-i);
    			}
    		},
    		_preloadItem: function(index) {
    			index = _getLoopedId(index);

    			if(mfp.items[index].preloaded) {
    				return;
    			}

    			var item = mfp.items[index];
    			if(!item.parsed) {
    				item = mfp.parseEl( index );
    			}

    			_mfpTrigger('LazyLoad', item);

    			if(item.type === 'image') {
    				item.img = $('<img class="mfp-img" />').on('load.mfploader', function() {
    					item.hasSize = true;
    				}).on('error.mfploader', function() {
    					item.hasSize = true;
    					item.loadError = true;
    					_mfpTrigger('LazyLoadError', item);
    				}).attr('src', item.src);
    			}


    			item.preloaded = true;
    		}
    	}
    });

    /*>>gallery*/

    /*>>retina*/

    var RETINA_NS = 'retina';

    $.magnificPopup.registerModule(RETINA_NS, {
    	options: {
    		replaceSrc: function(item) {
    			return item.src.replace(/\.\w+$/, function(m) { return '@2x' + m; });
    		},
    		ratio: 1 // Function or number.  Set to 1 to disable.
    	},
    	proto: {
    		initRetina: function() {
    			if(window.devicePixelRatio > 1) {

    				var st = mfp.st.retina,
    					ratio = st.ratio;

    				ratio = !isNaN(ratio) ? ratio : ratio();

    				if(ratio > 1) {
    					_mfpOn('ImageHasSize' + '.' + RETINA_NS, function(e, item) {
    						item.img.css({
    							'max-width': item.img[0].naturalWidth / ratio,
    							'width': '100%'
    						});
    					});
    					_mfpOn('ElementParse' + '.' + RETINA_NS, function(e, item) {
    						item.src = st.replaceSrc(item, ratio);
    					});
    				}
    			}

    		}
    	}
    });

    /*>>retina*/
     _checkInstance(); }));

    $('.js-popup-link').magnificPopup({
      type:'inline',
      midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
    });

    jQuery(document).ready(function() {
        var $faq = jQuery('.wp-block-yoast-faq-block');
        var $questions = $faq.find('.schema-faq-question');
        var $answers = $faq.find('.schema-faq-answer');

        $questions.each(function(index) {
            var answerId = 'faq-answer-' + (index + 1);
            var question = jQuery(this).text();
            jQuery(this).next('.schema-faq-answer').attr('id', answerId).attr('aria-hidden', 'true').attr('aria-labelledby', 'faq-question-' + (index + 1));
            jQuery(this).replaceWith('<a class="schema-faq-question" href="#" aria-expanded="false" tabindex="0" id="faq-question-' + (index + 1) + '" aria-controls="' + answerId + '">' + question + '</a>');
        });

        $questions = $faq.find('.schema-faq-question'); // reassign $questions variable to include new anchor tags

        $questions.on('click keydown', function(event) {
            if (event.type === 'click' || event.keyCode === 13 || event.keyCode === 32) {
                var $this = jQuery(this);
                var $thisAnswer = $this.siblings('.schema-faq-answer');
                
                $questions.not(this).removeClass('faq-q-open').attr('aria-expanded', 'false');
                $answers.not($thisAnswer).removeClass('faq-a-open').slideUp().attr('aria-hidden', 'true');
                
                if ($thisAnswer.is(':visible')) {
                    $this.removeClass('faq-q-open').attr('aria-expanded', 'false');
                    $thisAnswer.removeClass('faq-a-open').slideUp().attr('aria-hidden', 'true');
                } else {
                    $this.addClass('faq-q-open').attr('aria-expanded', 'true');
                    $thisAnswer.addClass('faq-a-open').slideDown().attr('aria-hidden', 'false');
                }
                event.preventDefault();
            }
        });
    });

    // // off canvas nav
    $(document).ready(() => { console.log("hello dddddd"); });

    const lightbox = new PhotoSwipeLightbox({
        gallery: '.js-photoswipe',
        children: 'a',
        pswpModule: PhotoSwipe
    });

    lightbox.init();

    // gsap.to(".entry-content > *", {
    //   duration: 2,
    //   scale: 0.5, 
    //   opacity: 0,
    //   stagger: 0.2
    // });

    console.log('GSAP Go!');


    // ACCORDION
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
    $(document).ready(function() {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 5) {
                $('body').addClass('scrolledDown');
            } else {
                $('body').removeClass('scrolledDown');
            }
        });
    });

    /// GSAP ///
    // import "../../node_modules/gsap/all.js";
    // import { gsap } from "../../node_modules/gsap/all.js"; 
    // import { gsap } from "../../node_modules/gsap/index.js";
    // import { ScrollTrigger } from "../../node_modules/gsap/ScrollTrigger";
    // import { ScrollToPlugin } from "../../node_modules/gsap/ScrollToPlugin";
    // import { DrawSVGPlugin } from "../../node_modules/gsap/DrawSVGPlugin";
    // import { ScrollSmoother } from "../../node_modules/gsap/ScrollSmoother";
    // import { GSDevTools } from "../../node_modules/gsap/GSDevTools"; 
    // gsap.registerPlugin(
    //     ScrollTrigger, ScrollToPlugin, DrawSVGPlugin, ScrollSmoother, GSDevTools
    // );

})();
