import env from "./interfaces/env"
const { MongoClient } = require('mongodb');

export class NftsLoader
{

    private static nfts: any[]

    public static loadNfts(): Promise<boolean> {
        const URL = env.MONGODB_URI;
        const client = new MongoClient(URL);

        return new Promise(async (res, rej) => {
            try {
                await client.connect();
                const db = client.db("cryptexos");
                const collection = db.collection('nfts');
                NftsLoader.nfts =  await collection.find({}).toArray();
                return res(NftsLoader.nfts.length > 0 ? true : false);
            }
            catch (e) { 
                console.error(e)
                return res(false)
            }
        })
    }

    public static fetchNFTS() {
        return NftsLoader.nfts;
    }
};
