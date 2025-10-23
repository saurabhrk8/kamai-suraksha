// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/.well-known',
    createProxyMiddleware({
      target: 'https://eu-west-26shs4vlqm.auth.eu-west-2.amazoncognito.com',
      changeOrigin: true,
      secure: true,
    })
  );
};