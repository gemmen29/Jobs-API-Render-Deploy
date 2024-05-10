require('dotenv').config();
require('express-async-errors');
const express = require('express');
// security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();

const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');
//routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

//error handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);
app.use(express.json());
app.use(helmet()); // set security headers to protect the API from common web vulnerabilities
app.use(cors()); // allow all origins to access the API (for now) - we will change this later
app.use(xss()); // sanitize user input coming from POST body, GET queries, and url params

// routes
app.get('/', (req, res) => {
  res.send('<h1>Job API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
