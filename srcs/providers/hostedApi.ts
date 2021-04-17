import env from "../interfaces/env"
import fetch from "node-fetch"

class HostedApi
{
    public fetchGetDatas(route: string): Promise<any> {
        return new Promise((res, rej) => {
            fetch(`${env.HOSTED_API_URL}/${route}`, {
                method: 'get',
                headers: { 'Content-Type': 'application/json'},
            })
            .then(res => res.json())
            .then(json => res(json)).catch(e => rej(e));
        })
    }

    public fetchPostDatas(route: string, body: any): Promise<any> {
        return new Promise((res, rej) => {
            fetch(`${env.HOSTED_API_URL}/${route}`, {
                method: 'post',
                body:    JSON.stringify(body),
                headers: { 'Content-Type': 'application/json'},
            })
            .then(res => res.json())
            .then(json => res(json)).catch(e => rej(e));
        })
    }
}

export default new HostedApi();