interface EnvInterface {
    HTTP_HOST: string,
    HTTP_PORT: number,
    HOSTED_API_URL: string,
    CACHE_LIVETIME_SECONDS: number
}

export default (process.env as any) as EnvInterface