import express = require("express");
import bodyParser = require("body-parser");
import cors = require("cors");
import metadata from "./metadata"

export class HttpServer
{
    private expressApp: any;
    constructor(private host: string, private port: number) {
    }

    public async initExpress() : Promise<void>{
        return new Promise<void>((res) => {
            this.expressApp = express();
            this.expressApp.use((express.json({ limit: '50mb' })))
            this.expressApp.use(cors())
            this.expressApp.use('/datas', metadata)

            try {
            this.expressApp.listen(this.port, () => {
                console.log(`⚡️[http]: Server is running at ${this.host}:${this.port}`);
                res()
            })
            } catch(e) { console.error(e) } 
        })
    }

};

