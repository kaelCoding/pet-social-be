import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import {
  IAuthReq,
  IUserRes,
} from '@src/types/auth';
import {
  getUsers,
} from '@src/services/UserService';
import { adminMw } from '@src/middleware/adminMw';

export class UserRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.get('/', adminMw, this.all);
  }

  public get routes(): Router {
    return this._routes;
  }

  private all = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<IUserRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IUserRes>> | undefined> => {
    try {
      const users = await getUsers();
      return res.status(HttpStatusCodes.OK).json(users);
    } catch (e) {
      next(e);
    }
  };
}
