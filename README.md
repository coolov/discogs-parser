# discogs-parser

The streaming parser implements a [Duplex interface](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams). Combine it with a pipe and the zlib module to read a compressed [data dump](http://data.discogs.com/) from disk or over the http.

```javascript
const zlib = require("zlib");
const https = require("https");

const { createDiscogsParser } = require("discogs-parser");

// more info here http://data.discogs.com/
const DISCOGS_DATA_URL =
  "https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_masters.xml.gz";

https.get(DISCOGS_DATA_URL, async (response) => {
  const unzip = zlib.createGunzip();
  const parse = createDiscogsParser();
  const stream = response.pipe(unzip).pipe(parse);

  try {
    for await (const chunk of stream) {
      console.log(chunk);
    }
  } catch (err) {
    console.error(err);
  }

  console.log("done!");
});
```
