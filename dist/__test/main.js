"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const zlib_1 = __importDefault(require("zlib"));
const assert_1 = __importDefault(require("assert"));
const main_1 = require("../main");
const STUBS_DIR = path_1.default.join(__dirname, "../../stubs/");
function get(url) {
    return new Promise((resolve, reject) => {
        const req = https_1.default.get(url, resolve);
        req.on("error", (e) => reject(e));
        req.end();
    });
}
async function fromDisk() {
    const xmlFile = path_1.default.join(STUBS_DIR, "labels.xml");
    const discogsStream = main_1.createDiscogsParser(fs_1.default.createReadStream(xmlFile));
    for await (const label of discogsStream) {
        return;
    }
}
async function takeFromNetwork(type, count) {
    const httpStream = await get(`https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_${type}.xml.gz`);
    const readStream = httpStream.pipe(zlib_1.default.createGunzip());
    const discogsStream = main_1.createDiscogsParser(readStream);
    const items = [];
    let i = 0;
    for await (const chunk of discogsStream) {
        items.push(chunk);
        if (++i === count) {
            break;
        }
    }
    // fs.writeFileSync(
    //   path.join(STUBS_DIR, `5-${type}.json`),
    //   JSON.stringify(items)
    // );
    const snapshot = fs_1.default
        .readFileSync(path_1.default.join(STUBS_DIR, `5-${type}.json`))
        .toString();
    JSON.parse(snapshot).forEach((snap, i) => {
        const item = items[i];
        try {
            console.log("Comparing snapshots for type: " + type);
            assert_1.default.deepStrictEqual(item, snap);
        }
        catch (err) {
            console.log("snapshots do not match for: " + type);
            console.log(err);
        }
    });
    return items;
}
async function main() {
    let t = new Date().getTime();
    for (let i = 0; i < 10; i++) {
        await Promise.all([
            takeFromNetwork("labels", 5),
            takeFromNetwork("artists", 5),
            takeFromNetwork("masters", 5),
            takeFromNetwork("releases", 5),
        ]);
    }
}
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=main.js.map