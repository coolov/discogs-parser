import fs from "fs";
import path from "path";
import https from "https";
import { IncomingMessage } from "http";
import zlib from "zlib";

import { Label, DiscogsParser } from "../main";

function get(url: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, resolve);
    req.on("error", (e) => reject(e));
    req.end();
  });
}

async function fromDisk() {
  const xmlFile = path.join(__dirname, "../../stubs/labels.xml");

  const discogsParser = new DiscogsParser<Label>();
  const stream = fs.createReadStream(xmlFile).pipe(discogsParser);

  for await (const label of stream) {
    try {
      console.log(label);
    } catch (err) {
      console.log(err);
    }
  }
}

async function fiveFromNetwork(type: string) {
  const httpStream = await get(
    `https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_${type}.xml.gz`
  );

  const discogsParser = new DiscogsParser<Label>();
  const unzip = zlib.createGunzip();
  const stream = httpStream.pipe(unzip).pipe(discogsParser);

  // console.log("push");
  let i = 0;
  const list = [];
  for await (const label of stream) {
    try {
      list.push(label);
      if (i++ > 5) {
        stream.destroy();
      }
    } catch (err) {
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
  } catch (err) {
    console.log("ming");
  }
}

main().catch((err) => {
  console.error(err);
});
