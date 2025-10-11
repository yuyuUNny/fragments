const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('./logger');

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

logger.info('Configured to use AWS Cognito for Authorization');

jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS successfully cached');
  })
  .catch((err) => {
    logger.error('Unable to cache Cognito JWKS', { err });
  });

const bearerStrategy = new BearerStrategy(async (token, done) => {
  try {
    const payload = await jwtVerifier.verify(token);
    logger.debug({ user: payload }, 'verified user token');
    done(null, payload);
  } catch (err) {
    logger.error('Token verification failed', { err });
    done(null, false);
  }
});

// Register the strategy with passport
passport.use('bearer', bearerStrategy);

// Export functions
module.exports.strategy = () => bearerStrategy;
module.exports.authenticate = () => passport.authenticate('bearer', { session: false });
