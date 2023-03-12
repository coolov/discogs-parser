"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const assert_1 = __importDefault(require("assert"));
const main_1 = require("../main");
const STUBS_DIR = path_1.default.join(__dirname, "../../stubs/");
const BASE_URL = "https://discogs-data-dumps.s3-us-west-2.amazonaws.com";
const TAKES = 10;
function get(url) {
    return new Promise((resolve, reject) => {
        const req = https_1.default.get(url, resolve);
        req.on("error", (e) => reject(e));
        req.end();
    });
}
async function takeFromNetwork(type, count) {
    const url = `${BASE_URL}/data/2021/discogs_20210501_${type}.xml.gz`;
    const stream = await get(url);
    const discogsStream = main_1.createDiscogsParser(stream);
    const items = [];
    let i = 0;
    for await (const chunk of discogsStream) {
        items.push(chunk);
        if (++i === count) {
            break;
        }
    }
    // comment out to update snapshots
    // fs.writeFileSync(
    //   path.join(STUBS_DIR, `snap-${type}.json`),
    //   JSON.stringify(items, null, 2)
    // );
    // return;
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
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function main() {
    for (let i = 1; i < TAKES; i++) {
        const start = Date.now();
        console.log(`take ${i}...`);
        await Promise.all([
            takeFromNetwork("labels", 100),
            takeFromNetwork("artists", 100),
            takeFromNetwork("masters", 100),
            takeFromNetwork("releases", 100),
        ]);
        console.log(`... took ${Date.now() - start} ms`);
        await sleep(500);
    }
}
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=main.js.map