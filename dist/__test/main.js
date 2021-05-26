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
    // uncomment to update snapshot
    // fs.writeFileSync(
    //   path.join(STUBS_DIR, `snap-${type}.json`),
    //   JSON.stringify(items, null, 2)
    // );
    const snapshot = fs_1.default
        .readFileSync(path_1.default.join(STUBS_DIR, `snap-${type}.json`))
        .toString();
    console.log("Comparing snapshots for type: " + type);
    JSON.parse(snapshot).forEach((snap, i) => {
        const item = items[i];
        try {
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
    await Promise.all([
        takeFromNetwork("labels", 100),
        takeFromNetwork("artists", 100),
        takeFromNetwork("masters", 100),
        takeFromNetwork("releases", 100),
    ]);
}
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=main.js.map