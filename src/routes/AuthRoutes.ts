import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import validationMw from '@src/middleware/validationMw';
import {
  IAuthReq,
  ILoginReq,
  ILoginRes,
  IRegisterReq,
  IUserRes,
  schemaLogin,
  schemaRegister,
} from '@src/types/auth';
import {
  createUser,
  getUserById,
  loginUser,
} from '@src/services/UserService';
import { encodeToken } from '@src/utils/token';
import { authMw } from '@src/middleware/authMw';

export class AuthRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.get('/info', authMw, this.info);
    this._routes.post('/login', validationMw(schemaLogin), this.login);
    this._routes.post('/register', validationMw(schemaRegister), this.register);
  }

  public get routes(): Router {
    return this._routes;
  }

  private info = async (
    req: IReq<IAuthReq>,
    res: IRes<IUserRes>,
    next: NextFunction,
  ): Promise<IRes<IUserRes> | undefined> => {
    try {
      const idUser = req.body._idUser;
      const user = await getUserById(idUser);
      return res.status(HttpStatusCodes.OK).json(user);
    } catch (e) {
      next(e);
    }
  };

  private login = async (
    req: IReq<ILoginReq>,
    res: IRes,
    next: NextFunction,
  ): Promise<IRes<ILoginRes> | undefined> => {
    try {
      const body = req.body;
      const user = await loginUser(body.email, body.password);
      const token = await encodeToken({
        id: user.id,
      });
      return res.status(HttpStatusCodes.OK).json({
        token: token,
      });
    } catch (e) {
      next(e);
    }
  };

  private register = async (
    req: IReq<IRegisterReq>,
    res: IRes,
    next: NextFunction,
  ): Promise<IRes<IUserRes> | undefined> => {
    try {
      const user = await createUser(req.body);

      return res.status(HttpStatusCodes.OK).json(user);
    } catch (e) {
      next(e);
    }
  };
}
