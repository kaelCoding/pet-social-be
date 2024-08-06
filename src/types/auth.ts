import Joi from 'joi';
import { IServiceUserRes } from './services/user';

export interface ILoginReq {
  email: string;
  password: string;
}

export const schemaLogin = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{8,30}$/)
    .required(),
});

export interface ILoginRes {
  token: string;
}

export interface IRegisterReq {
  email: string;
  password: string;
  confirm_password: string;
}

export const schemaRegister = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{8,30}$/)
    .required(),
  confirm_password: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Confirm password must match the password',
    }),
});

export type IUserRes = IServiceUserRes;

export interface IAuthReq {
  _idUser: number;
  _idProfile?: number;
}
