import Redis from "ioredis";

let redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    tls: {},
    retryStrategy(times) {
        console.log(`***Retrying redis connection: attempt ${times}***`);
        console.log(`***redis.status: ${redis.status}***`);
        if (times < 4) {
            return 1000 * 1;
        }
        return 1000 * 5;
    },
};
if (process.env.REDIS_TLS_ENABLE == "false") {
    redisConfig.tls = undefined;
}

const redis = new Redis(redisConfig);

redis.on("connect", () => {
    console.log("Redis connected");
});

export { redis };
