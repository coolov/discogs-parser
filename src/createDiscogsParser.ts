import { XMLParser, XmlNode } from "./XMLParser";
import { Readable } from "stream";
import { nodeToType } from "./Model";
import { Record } from "./types";

export async function* createDiscogsParser<T extends Record>(
  readStream: Readable
) {
  const parser = new XMLParser();
  const records: T[] = [];

  parser.on("record", (xmlNode) => {
    const record: T = nodeToType(xmlNode) as T;
    records.push(record);
  });

  for await (const chunk of readStream) {
    parser.write(chunk);

    // wait for a record
    while (records.length) {
      const record = records.shift();
      if (record !== undefined) {
        yield record;
      }
    }
  }
}
