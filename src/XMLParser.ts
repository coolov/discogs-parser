/*
 * Code based on node-big-xml
 * https://github.com/jahewson/node-big-xml
 *
 * Modification to pick target nodes based on depth instead of name
 */
import expat from "node-expat";

interface keyval {
  [key: string]: string | undefined
};

export interface XmlNode {
  tag: string,
  children: XmlNode[],
  _text?: string,
  _attrs?: keyval,
  attrs: keyval,
  text: string,
}

function createEmptyNode(tag: string): XmlNode {
  return {
    tag,
    children: [],
    get attrs() {
      return this._attrs || {};
    },
    get text() {
      return this._text || '';
    },
  }
}

export class XMLParser extends expat.Parser {
  targetDepth: number;
  node: XmlNode;
  nodes: XmlNode[];
  isCapturing: boolean;
  level: number;
  record: XmlNode | undefined;
  constructor(targetDepth = 1) {
    super("UTF-8");
    this.targetDepth = targetDepth + 1; // 
    this.node = createEmptyNode('$root');
    this.nodes = [];
    this.isCapturing = false;
    this.level = 0;
    this.on("startElement", this.handleStartElement.bind(this));
    this.on("text", this.handleText.bind(this));
    this.on("endElement", this.handleEndElement.bind(this));
  }

  handleStartElement(name: string, attrs: any) {
    this.level++;

    if (!this.isCapturing) {
      if (this.level !== this.targetDepth) {
        return;
      }
      this.isCapturing = true;
      this.node = createEmptyNode('$root');
      this.nodes = [];
      this.record = undefined;
    }

    const child = createEmptyNode(name);
    this.node.children.push(child);

    if (Object.keys(attrs).length > 0) {
      child._attrs = attrs;
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

  handleText(txt: string) {
    if (!this.isCapturing) {
      return;
    }

    if (txt.trim().length > 0) {
      if (this.node._text === undefined) {
        this.node._text = txt;
      } else {
        this.node._text += txt;
      }
    }
  }

  resume() {
    super.resume();
    this.emit("resume");
  }
}
