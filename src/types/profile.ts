import Joi from 'joi';
import { IAuthReq } from './auth';
import {
  IServiceFollowCountRes,
  IServiceFollowRes,
  IServiceProfileInfoRes,
  IServiceProfileRes,
} from './services/profile';

export interface IProfileReq {
  name: string;
  description: string;
  phone: string;
  address: string;
  birthday: Date;
  gender: boolean;
}

export interface IProfileReqAuth extends IProfileReq, IAuthReq {}

export const schemaProfile = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().max(255).required(),
  phone: Joi.string().max(20).required(),
  address: Joi.string().max(255).required(),
  birthday: Joi.string().max(255).required(),
  gender: Joi.boolean().required(),
});

export type IProfileRes = IServiceProfileRes;
export type IProfileInfoRes = IServiceProfileInfoRes;

export interface IAvatarReq {
  avatar: string;
}

export interface IAvatarReqAuth extends IAvatarReq, IAuthReq {}

export interface ICoverReq {
  cover: string;
}
export interface ICoverReqAuth extends ICoverReq, IAuthReq {}

export type IFollowRes = IServiceFollowRes;

export type IFollowCountRes = IServiceFollowCountRes;