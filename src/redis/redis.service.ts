import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  //从redis获取数据
  async get(key: string) {
    return await this.redisClient.get(key);
  }

  //存储变量进redis，设置过期时间
  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);
    //设置过期时间
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }
}
