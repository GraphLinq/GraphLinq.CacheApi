import express = require("express");
import bodyParser = require("body-parser");
import cors = require("cors");
import hostedApi from "../providers/hostedApi";
import moment from "moment"
import env from "../interfaces/env"
import { type } from "node:os";
import CacheWorker from "./cacheWorker";

export class CacheRoute {
    path: string
    body: any | undefined
    content: any
    last_refreshed: Date
    type: string
}

export class HttpServer
{
    public routesCaches: CacheRoute[] = []
    public routesHistory: CacheRoute[] = []

    private expressApp: any;
    private cacheWorker: CacheWorker;
    constructor(private host: string, private port: number) {
        this.cacheWorker = new CacheWorker(this)
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

    public fetchCacheHistory(route: string, body: any = undefined): CacheRoute | undefined {
        return this.routesHistory.find(x => x.path === route && x.body === body)
    }

    public updateCache(route: string, obj: CacheRoute) {
        const fromCache: CacheRoute | undefined = this.routesCaches.find(x => x.path === route && x.body === obj.body)
        if (fromCache === undefined) {
            console.log(`⚡️[http]: New endpoint added to the cache: ${obj.path}`)
            return this.routesCaches.push({
                path: obj.path,
                content: obj.content,
                last_refreshed: obj.last_refreshed,
                body: obj.body,
                type: obj.type
            })
        }
        
        fromCache.content = obj.content
        fromCache.last_refreshed = obj.last_refreshed
        fromCache.path = obj.path
        fromCache.body = obj.body
        fromCache.type = obj.type
    }

    public updateDailyHistory(route: string, obj: CacheRoute) {
        let fromCache: CacheRoute | undefined = this.routesHistory.find(x => x.path === route && x.body === obj.body)
        if (fromCache === undefined) {
            fromCache = {
                path: obj.path,
                content: obj.content,
                last_refreshed: obj.last_refreshed,
                body: obj.body,
                type: obj.type
            }

            this.routesHistory.push(fromCache)
        }
        else
        {
            var diff = moment.duration(moment(new Date()).diff(fromCache.last_refreshed))
            if (diff.hours() > 24) {
                fromCache.content = obj.content
                fromCache.last_refreshed = obj.last_refreshed
                fromCache.path = obj.path
                fromCache.body = obj.body
                fromCache.type = obj.type
            }
        }
    }

    public computeRouteQueries(queries: any[]): string
    {
        let route: string = ""
        Object.keys(queries).forEach((key: any, i: number) => {
            try {
                route += (i == 0) ? `?${key}=${queries[key].trim()}` : `&${key}=${queries[key].trim()}`
            } catch(e) { console.error(e) }
          });
        return route
    }

    public isHistoryRequest(queries: any[]): boolean {
        let isHistory: boolean = false
        Object.keys(queries).forEach((key: any, i: number) => {
            if (key === "apiHistory") { isHistory = true }
        })
        return isHistory
    }

    public async handleRequest(type: string, req: any, res: any)
    {
        let route = `${req.params[0]}` + this.computeRouteQueries(req.query)
        try {
            if (this.isHistoryRequest(req.query)) {
                // yeah i know.. but well at least it works
                route = route.replace("?apiHistory=", "")
                            .replace("&apiHistory=", "")
                            .replace("?apiHistory", "")
                            .replace("&apiHistory", "")
                console.log(`⚡️[http]: Received history cache request for ${route}`)

                const historyCache: CacheRoute | undefined = this.fetchCacheHistory(route, JSON.stringify(req.body))
                if (historyCache !== undefined) {
                    return res.send(historyCache.content)
                }
                return res.status(500).send({message: "History cache not formated yet"});
            }
        } catch(e) { console.error(e )}

        try {
            const fromCache: CacheRoute | undefined = this.fetchLiveCache(route, JSON.stringify(req.body))
            if (fromCache !== undefined) {
                return res.send(fromCache.content)
            }

            const result = (type === "GET") ? await hostedApi.fetchGetDatas(route) : await hostedApi.fetchPostDatas(route, req.body)
            const objCache: CacheRoute = {
                path: route,
                content: result,
                last_refreshed: new Date(),
                body: JSON.stringify(req.body),
                type: type
            }

            this.updateCache(route, objCache)
            this.updateDailyHistory(route, objCache)
            res.send(result);
        }
        catch (e)
        {
            console.error(e)
            const lastCache = this.fetchLastCache(route, JSON.stringify(req.body))
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

