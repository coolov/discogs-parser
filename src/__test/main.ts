import fs from 'fs';
import path from 'path';
import { Label, DiscogsParser } from '../main'

const xmlFile = path.join(__dirname, '../../stubs/labels.xml');

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