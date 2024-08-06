import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import { apiRouter }  from '@src/routes/index';
import { EnvVars } from '@src/constants/EnvVars';
import { NodeEnvs } from '@src/constants/misc';
import { errorHandler } from './middleware/errorHandler';

// **** Variables **** //



const app = express();


// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(EnvVars.CookieProps.Secret));


// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

app.use(cors());

// Add APIs, must be after middleware
app.use(EnvVars.ApiBasePath, apiRouter);

// Add error handler
app.use(errorHandler);


export default app;
