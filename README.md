# discogs-parser

The streaming parser takes a read stream and returns an async iterator

```javascript
const https = require("https");
const { createDiscogsParser } = require("discogs-parser");

// more info here http://data.discogs.com/
const DISCOGS_DATA_URL =
  "https://discogs-data-dumps.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_artists.xml.gz";

https.get(DISCOGS_DATA_URL, async (httpStream) => {
  for await (const chunk of createDiscogsParser(httpStream)) {
    console.log(chunk.id);
  }

  console.log("done!");
});
```

You can also read the data dump from disk using fs module (and TypeScript):

```typescript
import fs from "fs";
import path from "path";
import { Label, createDiscogsParser } from "discogs-parser";

const xmlFile = path.join(__dirname, "discogs_20210501_labels.xml.gz");

async function parseLabels() {
  const stream = createDiscogsParser<Label>(fs.createReadStream(xmlFile));
  for await (const label of stream) {
    console.log(label);
  }
}

parseLabels();
```
