"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscogsParser = void 0;
const stream_1 = require("stream");
const XMLParser_1 = require("./XMLParser");
// Inspired by:
// https://gist.github.com/FranckFreiburger/9af693b0432d7ee85d4e360e524551dc
class DiscogsParser extends stream_1.Duplex {
    constructor() {
        super({
            readableObjectMode: true,
            writableObjectMode: false,
        });
        this.records = [];
        this.parser = new XMLParser_1.XMLParser();
        this.parser.on("record", (record) => {
            // buffer incoming records so they can
            // be consumed by the reader
            try {
                // transform the XML record to a DiscogsItem
                this.records.push(record);
            }
            catch (err) {
                // print error!!!
                console.dir(record, { depth: 10 });
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
    _write(chunk, encoding, callback) {
        const ok = this.parser.parse(chunk);
        if (!ok) {
            // wait for the parser to resume
            // before accepting more writes
            this.parser.once("resume", () => callback());
        }
        else {
            callback();
        }
    }
    _destroy(err) {
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
        }
        else {
            // wait for the first record and then read again
            this.parser.once("record", () => this._read());
        }
    }
}
exports.DiscogsParser = DiscogsParser;
//# sourceMappingURL=DiscogsParser.js.map