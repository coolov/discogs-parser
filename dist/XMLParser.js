"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLParser = void 0;
const saxes_1 = require("saxes");
function createEmptyNode(tag, attrs, parent) {
    return {
        tag,
        children: [],
        parent,
        _attrs: attrs,
        get isRoot() {
            return this.parent === undefined;
        },
        get attrs() {
            return this._attrs || {};
        },
        get text() {
            return this._text || "";
        },
        appendText(txt) {
            if (this._text === undefined) {
                this._text = txt;
            }
            else {
                this._text += txt;
            }
        },
    };
}
function peek(stack) {
    if (stack.length) {
        return stack[stack.length - 1];
    }
}
class XMLParser extends saxes_1.SaxesParser {
    constructor() {
        super("UTF-8");
        this.stack = [];
        this.on("opentag", this.handleStartElement.bind(this));
        this.on("text", this.handleText.bind(this));
        this.on("closetag", this.handleEndElement.bind(this));
    }
    handleStartElement(n) {
        console.log(n);
        const parentNode = peek(this.stack);
        const node = createEmptyNode(n.name, n.attributes, parentNode);
        this.stack.push(node);
    }
    handleEndElement() {
        const node = this.stack.pop();
        // we have reached the root node!
        if (typeof node === "undefined" || !node.parent) {
            return this.emit("end");
        }
        // emit all nodes on the first level
        if (node.parent.isRoot) {
            return this.emit("record", node);
        }
        // remove unnescessary whitespace from text node
        if (typeof node._text === "string") {
            node._text = node._text.trim();
        }
        // push children to the parent node
        node.parent.children.push(node);
    }
    handleText(txt) {
        const node = peek(this.stack);
        if (node && !node.isRoot) {
            node.appendText(txt);
        }
    }
}
exports.XMLParser = XMLParser;
//# sourceMappingURL=XMLParser.js.map