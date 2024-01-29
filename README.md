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
# what this adapter don't provide ?
as lucia v3 internal validation logic requires to fetch user data and we don't store user data on redis we only store user session , the function 

```ts
const { session, user } = await lucia.validateSession(sessionId);
```
it return return the user as object with id undefind