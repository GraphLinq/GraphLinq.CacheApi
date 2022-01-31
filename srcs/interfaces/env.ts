interface EnvInterface {
    HTTP_HOST: string,
    HTTP_PORT: number,
    HOSTED_API_URL: string,
    CACHE_LIVETIME_SECONDS: number,
    CACHE_REFRESH_REQUESTS: number
}

export default (process.env as any) as EnvInterface