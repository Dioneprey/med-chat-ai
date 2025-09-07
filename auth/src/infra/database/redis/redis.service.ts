import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { EnvService } from 'src/infra/env/env.service';

@Injectable()
export class RedisRepository {
  private client: Redis;

  constructor(private readonly envService: EnvService) {
    this.client = new Redis({
      host: this.envService.get('REDIS_HOST'),
      port: this.envService.get('REDIS_PORT'),
      password: this.envService.get('REDIS_PASSWORD'),
      db: 0,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.envService.get('NODE_ENV') === 'test') {
      return null;
    }

    const data = await this.client.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (this.envService.get('NODE_ENV') === 'test') {
      return;
    }

    const stringified = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, stringified, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, stringified);
    }
  }

  async del(key: string): Promise<void> {
    if (this.envService.get('NODE_ENV') === 'test') {
      return;
    }

    await this.client.del(key);
  }

  async purgeByPrefix(prefix: string) {
    if (this.envService.get('NODE_ENV') === 'test') {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const stream = this.client.scanStream({
        match: `${prefix}*`,
        count: 50,
      });

      const pipelinePromises: Promise<any>[] = [];

      stream.on('data', (keys: string[]) => {
        if (keys.length) {
          const pipeline = this.client.pipeline();
          keys.forEach((key) => pipeline.del(key));
          pipelinePromises.push(pipeline.exec());
        }
      });

      stream.on('end', async () => {
        try {
          await Promise.allSettled(pipelinePromises);
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      stream.on('error', (err) => reject(err));
    });
  }
}
