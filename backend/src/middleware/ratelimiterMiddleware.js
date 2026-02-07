import redis from "../lib/redis.js";

export const rateLimiter = ({
  windowSeconds,
  maxRequests,
  keyGenerator,
}) => {
  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);

      if (!key) {
        // If we cannot identify user, fail closed
        return res.status(400).json({
          success: false,
          message: "Unable to identify request for rate limiting",
        });
      }

      // Increment request count
      const currentCount = await redis.incr(key);

      // First request → set TTL
      if (currentCount === 1) {
        await redis.expire(key, windowSeconds);
      } else {
          const currentTtl = await redis.ttl(key);
          if (currentTtl === -1) {
              await redis.expire(key, windowSeconds);
          }
      }

      // Exceeded limit
      if (currentCount > maxRequests) {
        const ttl = await redis.ttl(key);
        const retryAfter = ttl > 0 ? ttl : windowSeconds;
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfterSeconds: retryAfter,
        });
      }

      next();
    } catch (err) {
      // Redis down? Do NOT block app.
      console.error("Rate limiter error:", err);
      next();
    }
  };
};
