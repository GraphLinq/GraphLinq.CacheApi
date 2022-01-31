interface EnvInterface {
    HTTP_HOST: string,
    HTTP_PORT: number,
    HOSTED_API_URL: string,
    MONGODB_URI: string,
}

export default (process.env as any) as EnvInterface