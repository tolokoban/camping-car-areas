/**
 * Component error
 */

exports.tags = ["error"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    root.name = "div";
    root.attribs["class"] = "error";
};
