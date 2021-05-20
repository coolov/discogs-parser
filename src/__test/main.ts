import fs from 'fs';
import path from 'path';
import { createDiscogsParser } from '../main'

async function main() {
    const xmlFile = path.join(__dirname, 'labels.xml');
    const fileStream = fs.createReadStream(xmlFile);
    const stream = fileStream.pipe(createDiscogsParser());

    for await (const chunk of stream) {
        try {
            console.log(chunk);
        } catch (err) {
            console.log(err);
        }
    }
}

main();