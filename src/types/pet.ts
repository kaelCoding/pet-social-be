import Joi from 'joi';
import { IAuthReq } from './auth';
import { IServicePetReq, IServicePetRes } from './services/pet';


export type IPetReq = IServicePetReq

export interface IPetReqAuth extends IPetReq, IAuthReq {}

export const schemaPet = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().max(255).required(),
  birthday: Joi.string().max(255).required(),
  gender: Joi.boolean().required(),
  specie_type: Joi.string().required(),
});

export type IPetRes = IServicePetRes

export interface IAvatarPetReq {
  avatar: string;
}

export interface IAvatarPetReqAuth extends IAvatarPetReq, IAuthReq{}

export interface ICoverPetReq {
  cover: string;
}
export interface ICoverPetReqAuth extends ICoverPetReq, IAuthReq{}

export interface ISpecieRes {
  type: string
  pets?: Array<{id: number, avatar?: string | null}>
  created_at?: Date
}