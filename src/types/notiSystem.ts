import { IAuthReq } from './auth';
import { 
  IServiceNotiSystemRes,
} from './services/notiSystem';

export interface INotiSystemReq {
  title: string;
  content: string;
  link: string;
  cover: string;
  price: string;
}

export interface INotiSystemReqAuth extends INotiSystemReq, IAuthReq {}

export type INotiSystemRes = IServiceNotiSystemRes
