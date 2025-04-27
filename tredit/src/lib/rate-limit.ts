import { LRUCache } from "lru-cache";

interface RateLimitOptions {
	interval: number;
	uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimitOptions) {
	const tokenCache = new LRUCache({
		max: options.uniqueTokenPerInterval || 500,
		ttl: options.interval || 60000,
	});

	return {
		check: (limit: number, token: string = "CACHE_TOKEN") =>
			new Promise<void>((resolve, reject) => {
				const tokenCount = (tokenCache.get(token) as number[]) || [0];
				tokenCache.set(token, tokenCount);

				if (tokenCount[0] === 0) {
					tokenCache.set(token, [1]);
				}

				tokenCount[0] += 1;

				const currentUsage = tokenCount[0];
				const isRateLimited = currentUsage >= limit;

				if (isRateLimited) {
					reject(new Error("Rate limit exceeded"));
				} else {
					resolve();
				}
			}),
	};
}
