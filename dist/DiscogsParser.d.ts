/// <reference types="node" />
import { Duplex } from "stream";
import { XMLParser } from "./XMLParser";
import { Record } from "./types";
export declare class DiscogsParser<T extends Record> extends Duplex {
    records: (T | null)[];
    parser: XMLParser;
    constructor();
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    _destroy(err: Error | null): void;
    _read(): void;
    [Symbol.asyncIterator](): AsyncIterableIterator<T | null>;
}
