import { Duplex } from "stream";
import { XMLParser, XmlNode } from "./XMLParser";
import { nodeToType } from "./Model";
import { Record } from "./types";

// Inspired by:
// https://gist.github.com/FranckFreiburger/9af693b0432d7ee85d4e360e524551dc

export class DiscogsParser<T extends Record> extends Duplex {
  records: (T | null)[];
  parser: XMLParser;
  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: false,
    });
    this.records = [];
    this.parser = new XMLParser();

    this.parser.on("record", (record: XmlNode) => {
      // buffer incoming records so they can
      // be consumed by the reader
      try {
        // transform the XML record to a DiscogsItem
        this.records.push(nodeToType(record) as T);
      } catch (err) {
        // print error!!!
        // console.dir(record, { depth: 10 });
        this.emit("error", err);
      }

      // pause the parser if records start piling up
      if (this.records.length > 1) {
        this.parser.pause();
      }
    });

    this.parser.on("error", (err) => this.emit("error", err));
    this.once("finish", () => this.parser.end());

    // handle end of stream
    this.parser.on("end", () => {
      // send null record to terminate the read stream
      this.records.push(null);
      this.end();
    });
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ) {
    const ok = this.parser.parse(chunk);
    if (!ok) {
      // wait for the parser to resume
      // before accepting more writes
      this.parser.once("resume", () => callback());
    } else {
      callback();
    }
  }

  _destroy(err: Error | null) {
    this.parser.destroy();
  }

  _read() {
    if (this.records.length) {
      while (this.records.length) {
        const chunk = this.records.shift();
        this.push(chunk);
      }
      // the buffer has been consumed and
      // the parser can resume
      this.parser.resume();
    } else {
      // wait for the first record and then read again
      this.parser.once("record", () => this._read());
    }
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T | null> {
    return super[Symbol.asyncIterator]();
  }
}
