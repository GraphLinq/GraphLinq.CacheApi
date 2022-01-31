import {HttpServer} from "./http/server";
import dotenv = require("dotenv");
import env from "./interfaces/env"
import { NftsLoader } from "./nfts";

(async () => {
    // loading env variables
    dotenv.config()

    // load nfts
    const result = await NftsLoader.loadNfts();
    if (result) {
        console.log(`⚡️[logs]: ${NftsLoader.fetchNFTS().length} NFTS Exoplanets loaded successfully`)
    }

    // starting http server
    const httpServer: HttpServer = new HttpServer(env.HTTP_HOST, env.HTTP_PORT)
    await httpServer.initExpress()

    console.log(`⚡️[logs]: Cryptexos Metadata API ready to receive incoming requests!`)
})();