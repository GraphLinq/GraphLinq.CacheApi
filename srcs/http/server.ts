import express = require("express");
import bodyParser = require("body-parser");
import cors = require("cors");
import hostedApi from "../providers/hostedApi";
import moment from "moment"
import env from "../interfaces/env"

class CacheRoute {
    path: string
    body: any | undefined
    content: any
    last_refreshed: Date
}

class HttpServer
{
    public routesCaches: CacheRoute[] = []
    private expressApp: any;
    constructor(private host: string, private port: number) { 
    }

    public fetchLiveCache(route: string, body: any = undefined): CacheRoute | undefined {
        const fromCache: CacheRoute | undefined = this.routesCaches.find(x => x.path === route && x.body === body)
        if (fromCache === undefined) return undefined;
        var diff = moment.duration(moment(new Date()).diff(fromCache.last_refreshed))
        return (diff.seconds() < env.CACHE_LIVETIME_SECONDS) ? fromCache : undefined
    }

    public fetchLastCache(route: string, body: any = undefined): CacheRoute | undefined {
        return this.routesCaches.find(x => x.path === route && x.body === body)
    }

    public updateCache(route: string, obj: CacheRoute) {
        const fromCache: CacheRoute | undefined = this.routesCaches.find(x => x.path === route && x.body === obj.body)
        if (fromCache === undefined) { 
            return this.routesCaches.push({
                path: obj.path,
                content: obj.content,
                last_refreshed: obj.last_refreshed,
                body: obj.body
            })
        }
        
        fromCache.content = obj.content
        fromCache.last_refreshed = obj.last_refreshed
        fromCache.path = obj.path
        fromCache.body = obj.body
    }

    public async handleRequest(type: string, req: any, res: any)
    {
        try {
            const fromCache: CacheRoute | undefined = this.fetchLiveCache(req.params[0], JSON.stringify(req.body))
            if (fromCache !== undefined) {
                return res.send(fromCache.content)
            }

            const result = (type === "GET") ? await hostedApi.fetchGetDatas(req.params[0]) : await hostedApi.fetchPostDatas(req.params[0], req.body)
            this.updateCache(req.params[0], {
                path: req.params[0],
                content: result,
                last_refreshed: new Date(),
                body: JSON.stringify(req.body)
            })
            res.send(result);
        }
        catch (e)
        {
            console.error(e)
            const lastCache = this.fetchLastCache(req.params[0], JSON.stringify(req.body))
            if (lastCache !== undefined) {
                return res.send(lastCache.content);
            }
            return res.status(500).send();
        }
    }

    public async initExpress() : Promise<void>{
        return new Promise<void>((res) => {
            this.expressApp = express();
            this.expressApp.use((express.json({ limit: '50mb' })))
            this.expressApp.use(cors())

            this.expressApp.get('*', async (req: any, res: any) => {
                this.handleRequest('GET', req, res)
            });

            
            this.expressApp.post('*', async (req: any, res: any) => {
                this.handleRequest('POST', req, res)
            });

            try {
            this.expressApp.listen(this.port, () => {
                console.log(`⚡️[http]: Server is running at ${this.host}:${this.port}`);
                res()
            })
            } catch(e) { console.error(e) } 
        })
    }

};

export default HttpServer;