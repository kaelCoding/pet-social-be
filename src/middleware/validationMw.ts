import { Request, Response, NextFunction } from 'express';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import Joi, { ValidationResult } from 'joi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validationMw(schema: Joi.ObjectSchema<any>) {
  return function (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response<unknown, Record<string, unknown>> | undefined {
    const { error }: ValidationResult = schema.validate(req.body);
    if (error) {
      // Return a 400 Bad Request response if validation fails
      const status = HttpStatusCodes.BAD_REQUEST;
      return res.status(status).json({ error: error.details[0].message });
    }
    next();
  };
}

export default validationMw;
