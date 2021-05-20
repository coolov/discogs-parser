const zlib = require("zlib");
const https = require("https");
const { DiscogsParser } = require("./dist/main");

// more info here http://data.discogs.com/
const DISCOGS_DATA_URL =
  "https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_artists.xml.gz";

https.get(DISCOGS_DATA_URL, async (response) => {
  const unzip = zlib.createGunzip();
  const parse = new DiscogsParser();
  const stream = response.pipe(unzip).pipe(parse);

  try {
    for await (const chunk of stream) {
      console.log(chunk.id);
    }
  } catch (err) {
    console.error(err);
  }

  console.log("done!");
});
