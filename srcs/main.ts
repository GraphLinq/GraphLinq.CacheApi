import HttpServer from "./http/server";
import dotenv = require("dotenv");
import env from "./interfaces/env"

(async () => {
    // loading env variables
    dotenv.config()

    // starting http server
    const httpServer: HttpServer = new HttpServer(env.HTTP_HOST, env.HTTP_PORT)
    await httpServer.initExpress()

    console.log(`⚡️[logs]: GraphLinq Cache API ready to receive incoming requests!`)
})();