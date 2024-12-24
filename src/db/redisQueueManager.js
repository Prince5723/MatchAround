const Redis = require('redis');

class RedisQueueManager {
    constructor() {
        this.redisClient = Redis.createClient({
            password: `${process.env.REDIS_CLIENT_PASSWORD}`,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            }
        });

        this.redisClient.on('error', (err) => {
            console.error('Redis error:', err);
        });

        this.redisClient.connect().then(() => console.log('Redis connected')); // Connect to Redis
    }

    async getQueueLength(queueName) {
        return await this.redisClient.lLen(queueName);
    }

    async addToQueue(gender, userId) {
        console.log(gender, userId);
        const queueName = gender === 'male' ? 'maleQueue' : 'femaleQueue';
        await this.redisClient.rPush(queueName, userId);
    }

    async popFromQueue(queueName) {
        return await this.redisClient.lPop(queueName);
    }
}

module.exports = { RedisQueueManager };
