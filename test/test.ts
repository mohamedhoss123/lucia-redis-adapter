import Redis from 'ioredis'
import { RedisAdapter } from '../src/index.js'
import {TimeSpan,createDate} from "oslo"
export const redis = new Redis()

let adapter = new RedisAdapter(redis)

async function main(){
    // let data = await adapter.setSession({id:"tqwtq12321qweqwe",userId:"ewqiuewqueq",expiresAt:createDate(new TimeSpan(500,"h")),attributes:{username:"hellow",ez:"manga"}})
    let data = await adapter.getSessionAndUser("01HN8HERF81R4Q8Y95ZKSCRSQX")

    console.log(data);
    redis.disconnect() 
}

main()