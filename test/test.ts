import Redis from 'ioredis'
import { RedisAdapter } from '../src/index.js'
import { TimeSpan, createDate } from "oslo"
export const redis = new Redis()

let adapter = new RedisAdapter(redis)

async function main() {
    let data = await adapter.setSession({id:"tqwtqrqrqw12321qweqwe",userId:"ewqiuewqueq",expiresAt:createDate(new TimeSpan(9,"s")),attributes:{username:"hellow",ez:"manga"}})
    // let data = await adapter.getSessionAndUser("01HN8HERF81R4Q8Y95ZKSCRSQX")
    console.log(Number(createDate(new TimeSpan(30,"s"))));
    console.log(Date.now());
    console.log(Number(createDate(new TimeSpan(500,"h")))-Date.now());
    redis.disconnect()
}

main()