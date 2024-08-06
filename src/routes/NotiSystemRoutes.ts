import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import { 
  INotiSystemReqAuth, 
  INotiSystemRes, 
} from '@src/types/notiSystem';
import {
  createNotiSystem,
  updateNotiSystem,
  getNotiSystems,
  getNotiSystem,
  deleteNoti,
} from '@src/services/NotiSystemService';
import { adminMw } from '@src/middleware/adminMw';
import { IMessagesRes } from '@src/types';

export class NotiSystemRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.post('', adminMw, this.create);
    this._routes.get('', this.get);
    this._routes.get('/:notiSystem_id', this.detail);
    this._routes.patch(
      '/:notiSystem_id',
      adminMw,
      this.update,
    );
    this._routes.delete('/:notiSystem_id', this.delete);
  }

  public get routes(): Router {
    return this._routes;
  }

  private create = async (
    req: IReq<INotiSystemReqAuth>,
    res: IRes<INotiSystemRes>,
    next: NextFunction,
  ): Promise<IRes<INotiSystemRes> | undefined> => {
    try {
      const notiSystem = await createNotiSystem(req.body);
      return res.status(HttpStatusCodes.OK).json(notiSystem);
    } catch (e) {
      next(e);
    }
  };

  private update = async (
    req: IReq<INotiSystemReqAuth>,
    res: IRes<INotiSystemRes>,
    next: NextFunction,
  ): Promise<IRes<INotiSystemRes> | undefined> => {
    try {
      const notiSystem_id = req.params.notiSystem_id
        ? Number(req.params.notiSystem_id)
        : undefined;

      if (!notiSystem_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'NotiSystem Id Required',
        };
      }
      const notiSystem = await updateNotiSystem(notiSystem_id, req.body);
      return res.status(HttpStatusCodes.OK).json(notiSystem);
    } catch (e) {
      next(e);
    }
  };

  private get = async (
    req: IReq,
    res: IRes<Array<INotiSystemRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<INotiSystemRes>> | undefined> => {
    try {
      const notiSystems = await getNotiSystems();
      return res.status(HttpStatusCodes.OK).json(notiSystems);
    } catch (e) {
      next(e);
    }
  };

  private detail = async (
    req: IReq,
    res: IRes<INotiSystemRes>,
    next: NextFunction,
  ): Promise<IRes<INotiSystemRes> | undefined> => {
    try {
      const notiSystem_id = req.params.notiSystem_id
        ? Number(req.params.notiSystem_id)
        : undefined;

      if (!notiSystem_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'NotiSystem Id Required',
        };
      }

      const notiSystem = await getNotiSystem(notiSystem_id);
      if (notiSystem) {
        return res.status(HttpStatusCodes.OK).json(notiSystem);
      } else {
        throw {
          status: HttpStatusCodes.NOT_FOUND,
          error: 'Not Found NotiSystem',
        };
      }
    } catch (e) {
      next(e);
    }
  };

  private delete = async (
    req: IReq,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      const notiSystem_id = req.params.notiSystem_id
        ? Number(req.params.notiSystem_id)
        : undefined;

      if (!notiSystem_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'NotiSystem Id Required',
        };
      }

      await deleteNoti(notiSystem_id)

      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };

}
