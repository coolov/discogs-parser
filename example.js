const zlib = require("zlib");
const https = require("https");
const { DiscogsParser, createDiscogsParser } = require("./dist/main");

// more info here http://data.discogs.com/
const DISCOGS_DATA_URL =
  "https://discogs-data.s3-us-west-2.amazonaws.com/data/2021/discogs_20210501_releases.xml.gz";

let n = 0;

let lastN = 0;
let lastT = new Date().getTime();

setInterval(() => {
  const { heapTotal, heapUsed } = process.memoryUsage();
  const t = new Date().getTime();

  const velocity = (n - lastN) / (t - lastT);

  console.log(
    [new Date().getTime(), n, velocity, heapTotal, heapUsed].join(",")
  );

  lastN = n;
  lastT = t;
}, 3000);

https.get(DISCOGS_DATA_URL, async (response) => {
  const httpStream = response.pipe(zlib.createGunzip());
  // const stream = response.pipe(unzip).pipe(parse);

  for await (const chunk of createDiscogsParser(httpStream)) {
    n++;
  }

  console.log("done!");
});
