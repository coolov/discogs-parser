const zlib = require("zlib");
const https = require("https");
const { DiscogsParser, createDiscogsParser } = require("./dist/main");

const DISCOGS_DATA_URL = `https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_releases.xml.gz`;
https.get(DISCOGS_DATA_URL, async (response) => {
  const httpStream = response.pipe(zlib.createGunzip());
  for await (const chunk of createDiscogsParser(httpStream)) {
    console.log(chunk);
  }
});
