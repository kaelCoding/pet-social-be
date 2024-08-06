import Joi from 'joi';
import { IAuthReq } from './auth';
import {
  IServiceConversationRes,
  IServiceMessageRes,
} from './services/conversation';

export type IConversationRes = IServiceConversationRes;

export interface IMessageReq {
  content: string;
}

export interface IMessageReqAuth extends IMessageReq, IAuthReq {}

export type IMessageRes = IServiceMessageRes;

export const schemaMessage = Joi.object({
  content: Joi.string().max(2000).required(),
});
