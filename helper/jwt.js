const expressjwt = require('express-jwt');

function authJwt() {
  const secret = process.env.JWT_SECRET_KEY;
  return expressjwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      {
        url: /^\/public\/uploads\/.*/,
        methods: ['GET', 'OPTIONS'],
      },
      {
        url: /^\/api\/v1\/products\/.*/,
        methods: ['GET', 'OPTIONS'],
      },
      {
        url: /^\/api\/v1\/categories\/.*/,
        methods: ['GET', 'OPTIONS'],
      },
      '/api/v1/users/login',
      '/api/v1/users/register',
    ],
  });
}
async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    console.log('NO ADMIN');
    done(null, true);
  }

  done();
}

module.exports = authJwt;
