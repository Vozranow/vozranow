export const userKey = (routeName) => (req) =>
  req.user?._id
    ? `rl:user:${req.user._id}:${routeName}`
    : null;

export const ipKey = (routeName) => (req) =>
  `rl:ip:${req.ip}:${routeName}`;

export const emailKey = (routeName) => (req) =>
  req.body?.email
    ? `rl:email:${req.body.email}:${routeName}`
    : null;
