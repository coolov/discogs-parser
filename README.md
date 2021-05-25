# discogs-parser

The streaming parser takes a read stream and returns an async iterator

```javascript
const zlib = require("zlib");
const https = require("https");
const { createDiscogsParser } = require("discogs-parser");

// more info here http://data.discogs.com/
const DISCOGS_DATA_URL =
  "https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_artists.xml.gz";

https.get(DISCOGS_DATA_URL, async (response) => {
  const httpStream = response.pipe(zlib.createGunzip());
  const stream = createDiscogsParser(httpStream);

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
import { Label, createDiscogsParser } from "discogs-parser";

const xmlFile = path.join(__dirname, "labels.xml");

async function parseLabels() {
  const stream = createDiscogsParser<Label>(fs.createReadStream(xmlFile));
  for await (const label of stream) {
    console.log(label);
  }
}

parseLabels();
```
