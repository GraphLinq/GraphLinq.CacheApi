import {HttpServer, CacheRoute} from "./server";
import hostedApi from "../providers/hostedApi";
import env from "../interfaces/env"

export default class CacheWorker
{
    constructor(private httpServer: HttpServer)
    {
        this.initCacheReloading()
    }

    async waiter(ms: number): Promise<void> {
        return new Promise((res, _) => { 
            setTimeout(() => res(), ms)
        })
    }

    reloadCache() {
        this.httpServer.routesCaches.forEach(async (x: CacheRoute) => {
                try {
                const objBody = JSON.parse(x.body)

                const result = (x.type === "GET") ? await hostedApi.fetchGetDatas(x.path) : await hostedApi.fetchPostDatas(x.path, objBody)
                this.httpServer.updateCache(x.path, {
                    path: x.path,
                    content: result,
                    last_refreshed: new Date(),
                    body: x.body,
                    type: x.type
                })
                
                console.log(`⚡️[http]: Endpoint ${x.path} refreshed successfully`)
            } catch (e) {
                console.error(e)
            }
        })
    }

    async initCacheReloading()
    {
        while (42) {
            try {
                this.reloadCache()
                await this.waiter(env.CACHE_REFRESH_REQUESTS * 1000)
            } catch (e) { console.error(e) }
        }
    }
}