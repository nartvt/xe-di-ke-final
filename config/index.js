
const dotenv = require('dotenv');
dotenv.config();
// process.env.NODE_ENV = 'development';
console.log(process.env.NODE_ENV);
console.log(process.env.NODE_ENV === 'development');
let mongo_uri = '';
let secret_key;
let port;
let jwt_expired;
switch (process.env.NODE_ENV) {
  case 'development':
    mongo_uri = process.env.MONGO_URI_DEVELOPMENT;
    secret_key = process.env.SECRET_KEY_DEVELOPMENT;
    port = process.env.PORT;
    jwt_expired = process.env.JWT_EXPIRED_DEVELOPMENT;
    break;
  case 'staging':
    mongo_uri = process.env.MONGO_URI_STAGING;
    secret_key = process.env.SECRET_KEY_STAGING;
    jwt_expired = process.env.JWT_EXPIRED_STAGING;
    break;
}
console.log(process.env.NODE_ENV);
console.log(mongo_uri);

module.exports = {
  mongo_uri,
  secret_key,
  jwt_expired,
  port
}