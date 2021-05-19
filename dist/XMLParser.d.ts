import expat from "node-expat";
interface keyval {
    [key: string]: string | undefined;
}
export interface XmlNode {
    tag: string;
    children: XmlNode[];
    _text?: string;
    _attrs?: keyval;
    attrs: keyval;
    text: string;
}
export declare class XMLParser extends expat.Parser {
    targetDepth: number;
    node: XmlNode;
    nodes: XmlNode[];
    isCapturing: boolean;
    level: number;
    record: XmlNode | undefined;
    constructor(targetDepth?: number);
    handleStartElement(name: string, attrs: any): void;
    handleEndElement(): void;
    handleText(txt: string): void;
    resume(): void;
}
export {};
