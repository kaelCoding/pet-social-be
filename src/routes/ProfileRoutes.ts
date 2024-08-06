import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import validationMw from '@src/middleware/validationMw';
import { authMw } from '@src/middleware/authMw';
import {
  IAvatarReqAuth,
  ICoverReqAuth,
  IFollowCountRes,
  IFollowRes,
  IProfileInfoRes,
  IProfileReqAuth,
  IProfileRes,
  schemaProfile,
} from '@src/types/profile';
import { 
  createProfile, 
  followProfile, 
  followProfilePet, 
  getFollowCount, 
  getPetFollowCount, 
  getProfile, 
  getProfileInfo,
  getProfiles,
  searchProfiles,
  uploadAvatar,
  uploadCover,
} from '@src/services/ProfileService';
import { IAuthReq } from '@src/types/auth';
import { adminMw } from '@src/middleware/adminMw';
import { IMessagesRes } from '@src/types';

export class ProfileRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    
    this._routes.post('', validationMw(schemaProfile), authMw, this.create);
    this._routes.get('/', authMw, this.detailAuth);

    this._routes.get('/all', adminMw, this.all);
    this._routes.get('/search', this.search);
    this._routes.get('/info/:profile_id', this.info);
    this._routes.get('/:profile_id', this.detail);
    this._routes.post('/avatar', authMw, this.uploadAvatar);
    this._routes.post('/cover', authMw, this.uploadCover);
    this._routes.post('/:follow_id/follow', authMw, this.follow);
    this._routes.post('/:follow_id/follow/pet', authMw, this.followPet);
    this._routes.get('/:profile_id/follow/count', this.getFollowCount);
    this._routes.get('/:pet_id/pet/follow/count', this.getFollowPetCount);
  }

  public get routes(): Router {
    return this._routes;
  }

  private all = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<IProfileRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IProfileRes>> | undefined> => {
    try {
      
      const profiles = await getProfiles();
      return res.status(HttpStatusCodes.OK).json(profiles);
    } catch (e) {
      next(e);
    }
  };

  private search = async (
    req: IReq,
    res: IRes<Array<IProfileRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IProfileRes>> | undefined> => {
    try {
      const key = req.query.key ? String(req.query.key) : undefined;

      const profiles = await searchProfiles(key);
      return res.status(HttpStatusCodes.OK).json(profiles);
    } catch (e) {
      next(e);
    }
  };

  private create = async (
    req: IReq<IProfileReqAuth>,
    res: IRes<IProfileRes>,
    next: NextFunction,
  ): Promise<IRes<IProfileRes> | undefined> => {
    try {
      const profile = await createProfile(req.body);

      return res.status(HttpStatusCodes.OK).json(profile);
    } catch (e) {
      next(e);
    }
  };

  private detailAuth = async (
    req: IReq<IAuthReq>,
    res: IRes<IProfileRes>,
    next: NextFunction,
  ): Promise<IRes<IProfileRes> | undefined> => {
    try {
      const idUser = req.body._idUser;

      const profile = await getProfile(idUser);
      return res.status(HttpStatusCodes.OK).json(profile);
    } catch (e) {
      next(e);
    }
  };

  private info = async (
    req: IReq,
    res: IRes<IProfileInfoRes>,
    next: NextFunction,
  ): Promise<IRes<IProfileInfoRes> | undefined> => {
    try {
      const profile_id = req.params.profile_id
        ? Number(req.params.profile_id)
        : undefined;

      if (!profile_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Id Required',
        };
      }

      const profile = await getProfileInfo(profile_id);
      return res.status(HttpStatusCodes.OK).json(profile);
    } catch (e) {
      next(e);
    }
  };

  private detail = async (
    req: IReq,
    res: IRes<IProfileRes>,
    next: NextFunction,
  ): Promise<IRes<IProfileRes> | undefined> => {
    try {
      const profile_id = req.params.profile_id
        ? Number(req.params.profile_id)
        : undefined;

      if (!profile_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Id Required',
        };
      }

      const profile = await getProfile(profile_id);
      return res.status(HttpStatusCodes.OK).json(profile);
    } catch (e) {
      next(e);
    }
  };

  private uploadAvatar = async (
    req: IReq<IAvatarReqAuth>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      await uploadAvatar(req.body);

      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };

  private uploadCover = async (
    req: IReq<ICoverReqAuth>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      await uploadCover(req.body);

      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };

  private follow = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<IFollowRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IFollowRes>> | undefined> => {
    try {
      const follow_id = req.params.follow_id
        ? Number(req.params.follow_id)
        : undefined;

      if (!follow_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Follow Id Required',
        };
      }

      const profile_id = req.body._idProfile;
      if(!profile_id){
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Required',
        };
      }
      const follows = await followProfile(profile_id, follow_id);

      return res.status(HttpStatusCodes.OK).json(follows);

    } catch (e) {
      next(e);
    }
  };

  private followPet = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<IFollowRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IFollowRes>> | undefined> => {
    try {
      const follow_id = req.params.follow_id
        ? Number(req.params.follow_id)
        : undefined;

      if (!follow_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Follow Id Required',
        };
      }

      const profile_id = req.body._idProfile;
      if(!profile_id){
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Required',
        };
      }
      const follows = await followProfilePet(profile_id, follow_id);

      return res.status(HttpStatusCodes.OK).json(follows);

    } catch (e) {
      next(e);
    }
  };

  private getFollowCount = async (
    req: IReq,
    res: IRes<IFollowCountRes>,
    next: NextFunction,
  ): Promise<IRes<IFollowCountRes> | undefined> => {
    try {
      const profile_id = req.params.profile_id
        ? Number(req.params.profile_id)
        : undefined;

      if (!profile_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Id Required',
        };
      }

      const follows = await getFollowCount(profile_id)

      return res.status(HttpStatusCodes.OK).json(follows);
    } catch (e) {
      next(e);
    }
  };

  private getFollowPetCount = async (
    req: IReq,
    res: IRes<Array<IFollowRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IFollowRes>> | undefined> => {
    try {
      const pet_id = req.params.pet_id
        ? Number(req.params.pet_id)
        : undefined;

      if (!pet_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Pet Id Required',
        };
      }

      const follows = await getPetFollowCount(pet_id)

      return res.status(HttpStatusCodes.OK).json(follows);
    } catch (e) {
      next(e);
    }
  };
}
