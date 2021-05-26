/// <reference types="node" />
import { Readable } from "stream";
import { DiscogsItem } from "./types";
export declare function createDiscogsParser<T extends DiscogsItem>(readStream: Readable): AsyncGenerator<T, void, unknown>;
