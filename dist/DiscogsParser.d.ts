/// <reference types="node" />
import { Duplex } from "stream";
import { XMLParser } from "./XMLParser";
import { Record } from './Model';
export declare class DiscogsParser extends Duplex {
    records: (Record | null)[];
    parser: XMLParser;
    constructor();
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    _destroy(err: Error | null): void;
    _read(): void;
}
