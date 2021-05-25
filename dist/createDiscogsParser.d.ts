/// <reference types="node" />
import { Readable } from "stream";
import { Record } from "./types";
export declare function createDiscogsParser<T extends Record>(readStream: Readable): AsyncGenerator<T, void, unknown>;
