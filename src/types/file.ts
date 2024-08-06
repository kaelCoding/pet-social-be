import Joi from 'joi';
import { IAuthReq } from './auth';
import { IServiceFileConnectRes, IServiceFileRes } from './services/file';

export interface IFileReq {
  id: string;
  name: string;
  type: string;
  size: number;
}

export type IFileRes = IServiceFileRes

export type TypeFileConnect = 'PROFILE_AVATAR' | 'PET_AVATAR';
export interface IFileConnectReq {
  type: TypeFileConnect;
  connect_id: number;
  file_id: string;
}
export interface IFileConnectReqAuth extends IFileConnectReq, IAuthReq {}

export const schemaFileConnect = Joi.object({
  type: Joi.string()
    .valid('PROFILE_AVATAR', 'PET_AVATAR')
    .required(),
  connect_id: Joi.number().integer().required().strict(),
  file_id: Joi.string().required(),
});

export type IFileConnectRes = IServiceFileConnectRes