import jsonwebtoken, { VerifyErrors, JwtPayload } from 'jsonwebtoken';
import { EnvVars } from '@src/constants/EnvVars';
import { log } from './log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';

const Options = {
  expiresIn: EnvVars.Jwt.Exp,
};

const Errors = {
  ParamFalsey: 'Param is falsey',
  Validation: 'JSON-web-token validation failed.',
} as const;

export function encodeToken(data: string | object | Buffer): Promise<string> {
  return new Promise((res, rej) => {
    jsonwebtoken.sign(data, EnvVars.Jwt.Secret, Options, (err, token) => {
      return err ? rej(err) : res(token || '');
    });
  });
}

export interface ITokenReturn {
  id: number;
}

export function decodeToken<T>(jwt: string): Promise<string | undefined | T> {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(
      jwt,
      EnvVars.Jwt.Secret,
      (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            // Handle token expiration error
            return reject({
              status: HttpStatusCodes.UNAUTHORIZED,
              error: 'Token Expired',
            });
          } else {
            // Handle other token validation errors
            return reject({
              status: HttpStatusCodes.UNAUTHORIZED,
              error: 'Invalid Token',
            });
          }
        } else {
          return resolve(decoded as T);
        }
      },
    );
  });
}
