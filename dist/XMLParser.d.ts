import expat from "node-expat";
export interface XmlNode {
    tag: string | undefined;
    text: string | undefined;
    attrs: any;
    children: any[];
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
