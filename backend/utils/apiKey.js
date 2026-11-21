const crypto = require('crypto');

const hashKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

const generateKey = () => {
  const secret = crypto.randomBytes(32).toString('hex');
  const fullKey = 'pk_' + secret;
  return { fullKey, prefix: fullKey.slice(0, 8), keyHash: hashKey(fullKey) };
};

module.exports = { hashKey, generateKey }; 