# installation 
```bash
pnpm install lucia-redis-adapter ioredis
```
you will also need to use oslo and lucia
# config 
```ts
import Redis from 'ioredis'
import {RedisAdapter} from 'lucia-redis-adapter'
export const redis = new Redis()
let adapter = new RedisAdapter(redis)
```