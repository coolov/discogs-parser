import fs from "fs";
import path from "path";
import https from "https";
import { IncomingMessage } from "http";
import zlib from "zlib";
import assert from "assert";

import { Label, Record, createDiscogsParser } from "../main";

const STUBS_DIR = path.join(__dirname, "../../stubs/");

function get(url: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, resolve);
    req.on("error", (e) => reject(e));
    req.end();
  });
}

async function fromDisk() {
  const xmlFile = path.join(STUBS_DIR, "labels.xml");

  const discogsStream = createDiscogsParser<Label>(
    fs.createReadStream(xmlFile)
  );

  for await (const label of discogsStream) {
    return;
  }
}

async function takeFromNetwork<T extends Record>(type: string, count: number) {
  const httpStream = await get(
    `https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_${type}.xml.gz`
  );
  const readStream = httpStream.pipe(zlib.createGunzip());
  const discogsStream = createDiscogsParser<T>(readStream);

  const items: T[] = [];
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

  const snapshot = fs
    .readFileSync(path.join(STUBS_DIR, `5-${type}.json`))
    .toString();

  JSON.parse(snapshot).forEach((snap: Record, i: number) => {
    const item: Record = items[i];
    try {
      console.log("Comparing snapshots for type: " + type);
      assert.deepStrictEqual(item, snap);
    } catch (err) {
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
