import { SaxesParser } from 'saxes';
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
    appendText: (str: string) => void;
}
declare type N = {
    name: string;
    attributes: keyval;
};
export declare class XMLParser extends SaxesParser {
    stack: XmlNode[];
    constructor();
    handleStartElement(n: N): void;
    handleEndElement(): any;
    handleText(txt: string): void;
}
export {};
