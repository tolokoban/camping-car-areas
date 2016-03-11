"use strict";

var Parser = function(content) {
    this._index = 0;
    this._size = content.length;
    this._content = content;
    this.token = null;
};

/**
 * @return void
 */
Parser.prototype.swallowSpaces = function() {
    while (this._index < this._size && " \t\n\r".indexOf(this._content.charAt(this._index)) > -1) {
        this._index++;
    }
    return this;
};

/**
 * @return void
 */
Parser.prototype.getAttributeName = function() {
    this.swallowSpaces();
    var begin = this._index;
    var c;
    while (this._index < this._size) {
        c = this._content.charAt(this._index);
        if (c != '_' && (c < 'a' || c > 'z') && (c < 'A' || c > 'Z')) {
            break;
        }
        this._index++;
    }
    if (begin < this._index) {
        return this._content.substring(begin, this._index);
    }
    return null;
};

/**
 * @return void
 */
Parser.prototype.getAttributeValue = function() {
    this.swallowSpaces();
    if (this._index >= this._size) return null;
    if (this._content.charAt(this._index) != '=') return null;
    this._index++;
    if (this._index >= this._size) return null;
    if (this._content.charAt(this._index) != '"') return null;
    this._index++;
    var begin = this._index;
    while (this._index < this._size && this._content.charAt(this._index) != '"') {
        this._index++;
    }
    this._index++;
    return this._content.substring(begin, this._index - 1);
};

/**
 * @return void
 */
Parser.prototype.findAndSkip = function(text) {
    var pos = this._content.indexOf(text, this._index);
    if (pos < 0) return false;
    this._index = pos + text.length;
    return true;
};



module.exports = Parser;
