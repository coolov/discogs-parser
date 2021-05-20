"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const main_1 = require("../main");
const xmlFile = path_1.default.join(__dirname, '../../stubs/labels.xml');
async function main() {
    const discogsParser = new main_1.DiscogsParser();
    const stream = fs_1.default.createReadStream(xmlFile).pipe(discogsParser);
    for await (const label of stream) {
        try {
            console.log(label);
        }
        catch (err) {
            console.log(err);
        }
    }
}
main();
//# sourceMappingURL=main.js.map