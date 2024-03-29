
import type { Redis } from "ioredis";
import type {
    Adapter,
    DatabaseSession,
    DatabaseUser,
    RegisteredDatabaseSessionAttributes,
} from "lucia";
export class RedisAdapter implements Adapter {
    redisClient: Redis

    constructor(redisClient: Redis) {
        this.redisClient = redisClient
    }

    public async deleteSession(sessionId: string): Promise<void> {
        try {
            const sessionData = await this.redisClient.get(sessionId)
            if (!sessionData) return
            const session = JSON.parse(sessionData) as DatabaseSession
            await Promise.all([
                this.redisClient.del(sessionId),
                this.redisClient.srem(session.userId, sessionId),
            ])
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

        let result = await this.redisClient.get(sessionId) || "{}"
        return [transformIntoDatabaseSession(JSON.parse(result)) || null, {} as DatabaseUser];
    }

    public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
        const sessionIds = await this.redisClient.smembers(userId);
        const allSessions = await Promise.all(
            sessionIds.map((sessionId: string) => this.redisClient.get(sessionId))
        );
        const sessionsToRemove :string[]= []
        const sessionsToReturn :string[]= []
        allSessions.forEach((element:null|string,index:number) => {
            if(element ===null){
                sessionsToRemove.push(sessionIds[index])
            }else{
                sessionsToReturn.push(element)
            }
        });
        await Promise.all(
            sessionsToRemove.map((sessionId: string) => this.redisClient.srem(userId,sessionId))
        );
        const sessions = sessionsToReturn
            .map((val) => JSON.parse(val) as DatabaseSession);
        return sessions;
    }

    public async setSession(value: DatabaseSession): Promise<void> {
        await Promise.all([
            this.redisClient.sadd(value.userId, value.id),
            this.redisClient.set(
                value.id,
                JSON.stringify(value),
                "EX",
                Math.floor((Number(value.expiresAt) - Date.now()) / 1000)
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
interface SessionSchema extends RegisteredDatabaseSessionAttributes {
    id: string;
    userId: string;
    expiresAt: Date | string;
    attributes: any
}

function transformIntoDatabaseSession(raw: SessionSchema): DatabaseSession {
    const { id, userId, expiresAt, attributes } = raw;
    return {
        userId,
        id,
        expiresAt: new Date(expiresAt),
        attributes
    };
}
