/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction } from 'express';
import { decodeToken, ITokenReturn } from '@src/utils/token';
import { IReq, IRes } from '@src/types/express/misc';
import { IAuthReq } from '@src/types/auth';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { getUserById } from '@src/services/UserService';

// interface IAuthRequest {
//     _idUser: number
// }

export async function authMw(
  req: IReq<IAuthReq>,
  res: IRes,
  next: NextFunction,
):Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      const jwt = (await decodeToken(token)) as ITokenReturn;
      const id = jwt.id;

      const user = await getUserById(id);
      if(user){
        req.body._idUser = user.id;
        req.body._idProfile = user.profile_id;
        return next();
      }else {
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .send('Invalid authorization header | Not Found User');
      }
      
    } else {
      res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .send('Invalid authorization header');
    }
  } catch (e) {
    next(e);
  }
}
