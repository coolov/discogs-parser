"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const zlib_1 = __importDefault(require("zlib"));
const main_1 = require("../main");
function get(url) {
    return new Promise((resolve, reject) => {
        const req = https_1.default.get(url, resolve);
        req.on("error", (e) => reject(e));
        req.end();
    });
}
async function fromDisk() {
    const xmlFile = path_1.default.join(__dirname, "../../stubs/labels.xml");
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
async function fiveFromNetwork(type) {
    const httpStream = await get(`https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_${type}.xml.gz`);
    const discogsParser = new main_1.DiscogsParser();
    const unzip = zlib_1.default.createGunzip();
    const stream = httpStream.pipe(unzip).pipe(discogsParser);
    stream.on("end", () => {
        console.log("end event");
    });
    stream.on("close", () => {
        console.log("close event");
    });
    stream.on("error", (err) => {
        console.log("error event", err);
    });
    stream.on("data", (evt) => {
        // console.log("data event");
    });
    // console.log("push");
    let i = 0;
    const list = [];
    for await (const label of stream) {
        try {
            list.push(label);
            if (i++ > 5) {
                stream.destroy();
                // stream.clo
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    return list;
}
async function main() {
    // fromDisk();
    try {
        const res = await fiveFromNetwork("labels");
        console.log("bang");
        console.log(res);
    }
    catch (err) {
        console.log("ming");
    }
}
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=main.js.map