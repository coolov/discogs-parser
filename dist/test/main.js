"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const main_1 = require("../main");
async function main() {
    const xmlFile = path_1.default.join(__dirname, 'labels.xml');
    const fileStream = fs_1.default.createReadStream(xmlFile);
    const stream = fileStream.pipe(main_1.createDiscogsParser());
    for await (const chunk of stream) {
        try {
            console.log(chunk);
        }
        catch (err) {
            console.log(err);
        }
    }
}
main();
//# sourceMappingURL=main.js.map