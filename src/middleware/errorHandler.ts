import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { Request, Response, NextFunction } from 'express';
import { log } from '@src/utils/log';

interface Error {
  status: number,
  error: string
}

export const errorHandler = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction,
): Response<unknown, Record<string, unknown>> => {
  log.info('----> on error handler');
  log.err(err, true);
  
  let status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
  if (err.status) {
    status = err.status;
  }
  let error = 'Internal Server';
  if ( err.error ){
    error = err.error;
  }
  return res.status(status).json({ error: error });
  next();
};