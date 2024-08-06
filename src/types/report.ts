import { IAuthReq } from './auth';
import { IServiceReportReq, IServiceReportRes } from './services/report';

export type IReportRes = IServiceReportRes

export interface IReportReq {
    action: string;
    content: string;
    target_id: number;
  }
  

export interface IReportReqAuth extends IReportReq, IAuthReq {}