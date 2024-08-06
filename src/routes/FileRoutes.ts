import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import { uploadMw } from '@src/middleware/uploadMw';
import path from 'path';
import { log } from '@src/utils/log';
import { connectFile, createFiles } from '@src/services/FileService';
import validationMw from '@src/middleware/validationMw';
import {
  IFileConnectReqAuth,
  IFileConnectRes,
  IFileRes,
  schemaFileConnect,
} from '@src/types/file';
import { authMw } from '@src/middleware/authMw';
import { EnvVars } from '@src/constants/EnvVars';

export class FileRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.post('/uploads', uploadMw().array('files'), this.uploads);
    this._routes.get('/load/:file_id', this.load);
    this._routes.post(
      '/connect',
      validationMw(schemaFileConnect),
      authMw,
      this.connect,
    );
  }

  public get routes(): Router {
    return this._routes;
  }

  private uploads = async (
    req: IReq,
    res: IRes<Array<IFileRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IFileRes>> | undefined> => {
    try {
      const files = req.files;
      if (files) {
        const iterableFiles = Array.isArray(files)
          ? files
          : Object.values(files).flat();

        const filesDb = await createFiles(iterableFiles);

        return res.status(HttpStatusCodes.OK).json(filesDb);
      } else {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'File require',
        };
      }
    } catch (e) {
      next(e);
    }
  };

  private connect = async (
    req: IReq<IFileConnectReqAuth>,
    res: IRes<IFileConnectRes>,
    next: NextFunction,
  ): Promise<IRes<IFileConnectRes> | undefined> => {
    try {
      const connect = await connectFile(req.body);
      return res.status(HttpStatusCodes.OK).json(connect);
    } catch (e) {
      next(e);
    }
  };

  private load = (req: IReq, res: IRes, next: NextFunction): void => {
    try {
      const file_id = req.params.file_id;

      if (!file_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Id File Required',
        };
      }

      const rootPath = process.cwd();
      const filePath = path.join(rootPath, EnvVars.FolderFile, file_id);

      // Set CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      // Set Cross-Origin-Resource-Policy header
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');

      res.sendFile(filePath, (err) => {
        if (err) {
          log.log(err);
          return res.status(HttpStatusCodes.NOT_FOUND).json({
            error: 'Not Found File',
          });
        }
      });
    } catch (e) {
      next(e);
    }
  };
}
