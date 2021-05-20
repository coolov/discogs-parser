# discogs-parser

The streaming parser implements a [Duplex interface](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams). Combine it with a pipe and the zlib module to read a compressed [data dump](http://data.discogs.com/) from disk or over the http:

```javascript
const zlib = require("zlib");
const https = require("https");
const { DiscogsParser } = require("discogs-parser");

// more info here http://data.discogs.com/
const DISCOGS_DATA_URL =
  "https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_artists.xml.gz";

https.get(DISCOGS_DATA_URL, async (response) => {
  const unzip = zlib.createGunzip();
  const parse = new DiscogsParser();
  const stream = response.pipe(unzip).pipe(parse);

  for await (const chunk of stream) {
    console.log(chunk.id);
  }

  console.log("done!");
});
```

You can also read the data dump from disk using fs module (and use TypeScript):

```typescript
import fs from "fs";
import path from "path";
import { Label, DiscogsParser } from "discogs-parser";

const xmlFile = path.join(__dirname, "../../stubs/labels.xml");

async function main() {
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

main();
```
