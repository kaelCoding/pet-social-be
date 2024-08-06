import Joi from 'joi';
import { IAuthReq } from './auth';
import { 
  IServiceArticleCommentRes, 
  IServiceArticleLikeRes, 
  IServiceArticleRes,
} from './services/article';

export interface IArticleReq {
  title: string;
  content: string;
  description: string;
  cover: string;
}

export interface IArticleReqAuth extends IArticleReq, IAuthReq {}

export const schemaArticle = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().max(2000).required(),
  content: Joi.string().required(),
  cover: Joi.string().required(),
});

export type IArticleRes = IServiceArticleRes
export type IArticleLikeRes = IServiceArticleLikeRes

export interface IArticleCommentReq {
  content: string;
}

export interface IArticleCommentReqAuth extends IArticleCommentReq, IAuthReq {}

export type IArticleCommentRes = IServiceArticleCommentRes

export const schemaComment = Joi.object({
  content: Joi.string().max(2000).required(),
});