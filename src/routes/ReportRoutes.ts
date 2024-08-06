import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import { IAuthReq } from '@src/types/auth';
import { IReportReqAuth, IReportRes } from '@src/types/report';
import { authMw } from '@src/middleware/authMw';
import { 
  createBlock, 
  createReport, 
  getReports,
} from '@src/services/ReportService';
import { adminMw } from '@src/middleware/adminMw';
import { IMessagesRes } from '@src/types';

export class ReportRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.get('', adminMw, this.get);
    this._routes.post('/create', authMw, this.create);
    this._routes.post('/create/block', adminMw, this.createBlock);
  }

  public get routes(): Router {
    return this._routes;
  }

  private get = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<IReportRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IReportRes>> | undefined> => {
    try {
      const reports = await getReports();
      return res.status(HttpStatusCodes.OK).json(reports);
    } catch (e) {
      next(e);
    }
  };

  private create = async (
    req: IReq<IReportReqAuth>,
    res: IRes<IReportRes>,
    next: NextFunction,
  ): Promise<IRes<IReportRes> | undefined > => {
    try {
      const data = req.body
      const idProfile = req.body._idProfile

      if (!idProfile) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile require',
        };
      }

      const report = await createReport({
        action: data.action,
        content: data.content,
        target_id: data.target_id,
        profile_id: idProfile,
      });

      return res.status(HttpStatusCodes.OK).json(report);
    } catch (e) {
      next(e);
    }
  };

  private createBlock = async (
    req: IReq<IReportReqAuth>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      const data = req.body
    
      await createBlock({
        action: data.action,
        content: data.content,
        target_id: data.target_id,
        profile_id: 0,
      });

      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };
}
