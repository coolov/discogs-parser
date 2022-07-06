import fs from "fs";
import path from "path";
import https from "https";
import { IncomingMessage } from "http";
import assert from "assert";

import { Label, DiscogsItem, createDiscogsParser } from "../main";

const STUBS_DIR = path.join(__dirname, "../../stubs/");
const BASE_URL = "https://discogs-data-dumps.s3-us-west-2.amazonaws.com";

function get(url: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, resolve);
    req.on("error", (e) => reject(e));
    req.end();
  });
}

async function takeFromNetwork<T extends DiscogsItem>(
  type: string,
  count: number
) {
  const url = `${BASE_URL}/data/2021/discogs_20210501_${type}.xml.gz`;
  const stream = await get(url);
  const discogsStream = createDiscogsParser<T>(stream);

  const items: T[] = [];
  let i = 0;
  for await (const chunk of discogsStream) {
    items.push(chunk);
    if (++i === count) {
      break;
    }
  }

  const snapshot = fs
    .readFileSync(path.join(STUBS_DIR, `snap-${type}.json`))
    .toString();

  console.log("Comparing snapshots for type: " + type);
  JSON.parse(snapshot).forEach((snap: DiscogsItem, i: number) => {
    const item: DiscogsItem = items[i];
    try {
      assert.deepStrictEqual(item, snap);
    } catch (err) {
      console.log("snapshots do not match for: " + type);
      console.log(err);
    }
  });

  return items;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  for (let i = 1; i < 101; i++) {
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
