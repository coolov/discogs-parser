import expat from "node-expat";
interface keyval {
    [key: string]: string | undefined;
}
export interface XmlNode {
    tag: string;
    children: XmlNode[];
    parent?: XmlNode;
    _text?: string;
    _attrs?: keyval;
    attrs: keyval;
    text: string;
    isRoot: Boolean;
}
export declare class XMLParser extends expat.Parser {
    stack: XmlNode[];
    constructor();
    handleStartElement(name: string, attrs: any): void;
    handleEndElement(): boolean | undefined;
    handleText(txt: string): void;
    resume(): void;
}
export {};
