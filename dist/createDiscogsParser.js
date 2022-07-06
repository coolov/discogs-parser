"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiscogsParser = void 0;
const XMLParser_1 = require("./XMLParser");
const nodeToType_1 = require("./nodeToType");
async function* createDiscogsParser(readStream) {
    const parser = new XMLParser_1.XMLParser();
    const records = [];
    parser.on("record", (xmlNode) => {
        const record = nodeToType_1.nodeToType(xmlNode);
        records.push(record);
    });
    for await (const chunk of readStream) {
        parser.write(chunk);
        // wait for a record
        while (records.length) {
            const record = records.shift();
            if (record !== undefined) {
                yield record;
            }
        }
    }
    console.log("done iter");
}
exports.createDiscogsParser = createDiscogsParser;
//# sourceMappingURL=createDiscogsParser.js.map