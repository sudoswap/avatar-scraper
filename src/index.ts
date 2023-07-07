import { existsSync, readFileSync, writeFileSync } from "fs";
import { loadEnv } from "./utils/loadEnv";
import axios from "axios";
import axiosRetry from "axios-retry";

const FILENAME = "data/avatars.json";
const ENDPOINT = `https://nftdata.parallelnft.com/api/parallel-avatars/ipfs/`;
const BATCH_SIZE = 50;
const COLLECTION_SIZE = 11001;

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });
loadEnv();
setupFiles();

async function main() {
    const avatarMap: Record<string, string> = JSON.parse(
        readFileSync(FILENAME, "utf-8")
    );
    let promises: Promise<any>[] = [];

    for (let i = 1; i <= COLLECTION_SIZE; i++) {
        if (
            !avatarMap[i.toString()] ||
            avatarMap[i.toString()] === "Unrevealed"
        ) {
            promises.push(
                (async () => {
                    const res = await axios.get(ENDPOINT + i.toString());
                    return res.data;
                })()
            );
        }

        if (promises.length >= BATCH_SIZE || i >= COLLECTION_SIZE) {
            const results = await Promise.all(promises);

            for (const result of results) {
                avatarMap[result.token_id.toString()] =
                    result.name.split(" ")[0];
            }
            promises = [];
            console.log(
                `Scraped ${i.toString()} of ${COLLECTION_SIZE} metadata`
            );
        }
    }

    writeFileSync(FILENAME, JSON.stringify(avatarMap, null, 4));
}

function setupFiles() {
    if (!existsSync(FILENAME)) {
        writeFileSync(FILENAME, JSON.stringify({}, null, 4));
    }
}

main();
