const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const healthRoutes = require('./routes/healthRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;