import { XMLParser, XmlNode } from "./XMLParser";
import { Readable } from "stream";
import { DiscogsItem } from "./types";
import { nodeToType } from "./nodeToType";
import zlib from "zlib";

export async function* createDiscogsParser<T extends DiscogsItem>(
  readStream: Readable
) {
  try {
    const parser = new XMLParser();
    const records: T[] = [];

    parser.on("record", (xmlNode: XmlNode) => {
      const record: T = nodeToType(xmlNode) as T;
      records.push(record);
    });

    for await (const chunk of readStream.pipe(zlib.createGunzip())) {
      parser.write(chunk);

      // wait for a record
      while (records.length) {
        const record = records.shift();
        if (record !== undefined) {
          yield record;
        }
      }
    }
  } finally {
    readStream.destroy();
  }
}
