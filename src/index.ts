
import type { Redis } from "ioredis";
import type {
    Adapter,
    DatabaseSession,
    DatabaseUser,
} from "lucia";
export class RedisAdapter implements Adapter {
    redisClient: Redis

    constructor(redisClient: Redis) {
        this.redisClient = redisClient
    }
    
    public async deleteSession(sessionId: string): Promise<void> {
        try {
            await this.redisClient.del(sessionId);
        } catch {
            // ignore if session id is invalid
        }
    }
    
    public async deleteUserSessions(userId: string): Promise<void> {
        const sessionIds = await this.redisClient.smembers(userId);
        await Promise.all([
            ...sessionIds.map((sessionId: string) => this.redisClient.del(sessionId)),
            this.redisClient.del(userId)
        ]);
    }
    
    public async getSessionAndUser(
        sessionId: string
    ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
        let result = await this.redisClient.get(sessionId) || ""
        return [JSON.parse(result) || null, null];
    }
    
    public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
        const sessionIds = await this.redisClient.smembers(userId);
        const sessionData = await Promise.all(
            sessionIds.map((sessionId: string) => this.redisClient.get(sessionId))
        );
        const sessions = sessionData
            .filter((val): val is NonNullable<typeof val> => val !== null)
            .map((val) => JSON.parse(val) as SessionSchema);
        return sessions;
        return []
    }

    public async setSession(value: DatabaseSession): Promise<void> {
        await Promise.all([
            this.redisClient.sadd(value.userId, value.id),
            this.redisClient.set(
                value.id,
                JSON.stringify(value),
                "EX",
                Math.floor(Number(value.expiresAt) / 1000)
            )
        ]);
    }
    
    public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
        let data = await this.redisClient.get(sessionId) as DatabaseSession
        data.expiresAt = expiresAt
        await this.setSession(data)

    }

    public async deleteExpiredSessions(): Promise<void> {

    }
}
