import Joi from 'joi';
import { IAuthReq } from './auth';
import { 
  IServicePostCommentRes, 
  IServicePostLikeRes, 
  IServicePostRes,
} from './services/post';

export interface IPetPostReq {
  id: number
}

export interface IHashtagRes {
  tag: string
  posts?: Array<{id: number}>
  created_at?: Date
}

export interface IFilePostReq {
  link: string
}

export interface IPostReq {
  title: string;
  content: string;
  pets?: Array<IPetPostReq>;
  hashtags?: Array<IHashtagRes>;
  files?: Array<IFilePostReq>
}

export interface IPostReqAuth extends IPostReq, IAuthReq {}

export const schemaPost = Joi.object({
  title: Joi.string().max(255).required(),
  content: Joi.string().required(),
  pets: Joi.array().items(
    Joi.object({
      id: Joi.number().required(),
    }),
  ),
  hashtags: Joi.array().items(
    Joi.object({
      tag: Joi.string().required(),
    }),
  ),
  files: Joi.array().items(
    Joi.object({
      link: Joi.string().required(),
    }),
  ),
});

export type IPostRes = IServicePostRes
export type IPostLikeRes = IServicePostLikeRes

export interface IPostCommentReq {
  content: string;
}

export interface IPostCommentReqAuth extends IPostCommentReq, IAuthReq {}

export type IPostCommentRes = IServicePostCommentRes

export const schemaComment = Joi.object({
  content: Joi.string().max(2000).required(),
});