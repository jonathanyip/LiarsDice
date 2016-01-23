/* Global helper functions */
var utils = {
    setHash: function(path) {
        window.location.hash = path;
    },
    getHash: function() {
        return window.location.hash;
    }
};
