- create database on redis
- npm i redis
- npm i -D @types/redis
- create username with access control on redis website
- copy username, password, url, port to .env

in index.ts

// REDIS SETUP

const client = createClient({
username: process.env.REDIS_USERNAME,
password: process.env.REDIS_PASSWORD,
socket: {
host: process.env.REDIS_URL,
port: parseInt(process.env.REDIS_PORT!),
},
});

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect().then(() => console.log(`Connected to Redis.`));
