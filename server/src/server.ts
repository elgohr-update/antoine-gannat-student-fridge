import * as Fastify from 'fastify';
import * as openapiGlue from "fastify-openapi-glue";
import * as path from 'path';
import requestsLogger from './loggers/requestsLogger';
import logger from './loggers/logger';
import service from './service';
import database from './database';
import authMiddleware from './controllers/auth/authMiddleware';
import * as fs from 'fs';

database.connect();

// Set the swagger options
const options = {
  specification: `${__dirname}/openapi.yaml`,
  service: service,
  prefix: 'api'
};
// Set the port
const port = Number(process.env.PORT) || 4000;

let fastifyOptions;
if (!process.env.NODE_DEBUG) {
  // Certificate
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/student-fridge.fr/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/student-fridge.fr/cert.pem', 'utf8');
  const ca = fs.readFileSync('/etc/letsencrypt/live/student-fridge.fr/chain.pem', 'utf8');

  fastifyOptions = {
    https: {
      key: privateKey,
      cert: certificate,
      ca: ca
    }
  }
}

let fastify = Fastify(fastifyOptions);

// Register a static route to serve the client
logger.log("Serving frontend from folder: ", path.join(__dirname, '../../webapp/dist'));

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '../../webapp/dist'),
  decorateReply: false
})

// Register a static route to the static files
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '../static-files'),
  prefix: '/data/',
  decorateReply: false
})

// Register swagger with openapiglue
fastify.register(openapiGlue, options);

// Set the request logger
fastify.use(requestsLogger);
// Set the auth middleware
fastify.addHook('preHandler', authMiddleware);

// Start the server
fastify.listen(port, "0.0.0.0", (err, address) => {
  if (err) {
    logger.error(err.message);
    return;
  }
  logger.log("Server listening on address", address);
});