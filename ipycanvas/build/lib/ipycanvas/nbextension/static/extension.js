// Entry point for the notebook bundle containing custom model definitions.
//
define(function() {
    "use strict";

    if (window.require) {
        window.require.config({
            map: {
                '*': {
                    'ipycanvas': 'nbextensions/ipycanvas/index',
                },
            }
        });
    }
    // Export the required load_ipython_extension function
    return {
        load_ipython_extension : function() {}
    };
});
