"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiscogsParser = void 0;
const XMLParser_1 = require("./XMLParser");
const nodeToType_1 = require("./nodeToType");
const zlib_1 = __importDefault(require("zlib"));
async function* createDiscogsParser(readStream) {
    try {
        const parser = new XMLParser_1.XMLParser();
        const records = [];
        parser.on("record", (xmlNode) => {
            const record = nodeToType_1.nodeToType(xmlNode);
            records.push(record);
        });
        for await (const chunk of readStream.pipe(zlib_1.default.createGunzip())) {
            parser.write(chunk);
            // wait for a record
            while (records.length) {
                const record = records.shift();
                if (record !== undefined) {
                    yield record;
                }
            }
        }
    }
    finally {
        readStream.destroy();
    }
}
exports.createDiscogsParser = createDiscogsParser;
//# sourceMappingURL=createDiscogsParser.js.map