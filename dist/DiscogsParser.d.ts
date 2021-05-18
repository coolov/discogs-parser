/// <reference types="node" />
import { Duplex } from "stream";
import { XMLParser, XmlNode } from "./XMLParser";
export declare class DiscogsParser extends Duplex {
    records: (XmlNode | null)[];
    parser: XMLParser;
    constructor();
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    _destroy(err: Error | null): void;
    _read(): void;
}
