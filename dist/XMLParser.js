"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLParser = void 0;
/*
 * Code based on node-big-xml
 * https://github.com/jahewson/node-big-xml
 *
 * 1) node-expat does a depth first traversal of the XML-tree
 * 2) the assumption is that the xml file has a single root node,
 *    containing one long homegenous list of nodes
 * 3) the streaming parser will emit each child node in the list
 */
const node_expat_1 = __importDefault(require("node-expat"));
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
    };
}
function peek(stack) {
    if (stack.length) {
        return stack[stack.length - 1];
    }
}
class XMLParser extends node_expat_1.default.Parser {
    constructor() {
        super("UTF-8");
        this.stack = [];
        this.on("startElement", this.handleStartElement.bind(this));
        this.on("text", this.handleText.bind(this));
        this.on("endElement", this.handleEndElement.bind(this));
    }
    handleStartElement(name, attrs) {
        const parentNode = peek(this.stack);
        const node = createEmptyNode(name, attrs, parentNode);
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
        // push children to the parent node
        node.parent.children.push(node);
    }
    handleText(txt) {
        const node = peek(this.stack);
        if (node) {
            node._text = txt;
        }
    }
    resume() {
        super.resume();
        this.emit("resume");
    }
}
exports.XMLParser = XMLParser;
//# sourceMappingURL=XMLParser.js.map