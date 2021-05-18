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
 * Modification to pick target nodes based on depth instead of name
 */
const node_expat_1 = __importDefault(require("node-expat"));
function createEmptyNode(tag) {
    return {
        tag,
        text: undefined,
        attrs: {},
        children: []
    };
}
class XMLParser extends node_expat_1.default.Parser {
    constructor(targetDepth = 1) {
        super("UTF-8");
        this.targetDepth = targetDepth + 1;
        this.node = createEmptyNode();
        this.nodes = [];
        this.isCapturing = false;
        this.level = 0;
        this.on("startElement", this.handleStartElement.bind(this));
        this.on("text", this.handleText.bind(this));
        this.on("endElement", this.handleEndElement.bind(this));
    }
    handleStartElement(name, attrs) {
        this.level++;
        if (!this.isCapturing && this.level !== this.targetDepth) {
            return;
        }
        if (!this.isCapturing) {
            this.isCapturing = true;
            this.node = createEmptyNode();
            this.nodes = [];
            this.record = undefined;
        }
        if (this.node.children === undefined) {
            this.node.children = [];
        }
        const child = createEmptyNode(name);
        this.node.children.push(child);
        if (Object.keys(attrs).length > 0) {
            child.attrs = attrs;
        }
        this.nodes.push(this.node);
        this.node = child;
        if (this.level === this.targetDepth) {
            this.record = this.node;
        }
    }
    handleEndElement() {
        this.level--;
        const node = this.nodes.pop();
        if (node !== undefined) {
            this.node = node;
        }
        if (this.level === this.targetDepth - 1 && this.record !== undefined) {
            this.isCapturing = false;
            this.emit("record", this.record);
        }
        if (this.level === 0) {
            this.emit("end");
        }
    }
    handleText(txt) {
        if (!this.isCapturing) {
            return;
        }
        if (txt.trim().length > 0) {
            if (this.node.text === undefined) {
                this.node.text = txt;
            }
            else {
                this.node.text += txt;
            }
        }
    }
    resume() {
        super.resume();
        this.emit("resume");
    }
}
exports.XMLParser = XMLParser;
//# sourceMappingURL=XMLParser.js.map