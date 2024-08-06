import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import { IAuthReq } from '@src/types/auth';
import { INotificationRes } from '@src/types/notification';
import { authMw } from '@src/middleware/authMw';
import { getNotifications } from '@src/services/NotificationService';

export class NotificationRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.get('', authMw, this.get);
  }

  public get routes(): Router {
    return this._routes;
  }

  private get = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<INotificationRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<INotificationRes>> | undefined> => {
    try {
      const idProfile = req.body._idProfile;
      if (!idProfile) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile require',
        };
      }
      const notifications = await getNotifications(idProfile);
      return res.status(HttpStatusCodes.OK).json(notifications);
    } catch (e) {
      next(e);
    }
  };
}
