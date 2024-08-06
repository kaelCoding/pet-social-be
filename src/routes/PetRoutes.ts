import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import validationMw from '@src/middleware/validationMw';
import { authMw } from '@src/middleware/authMw';
import { 
  IAvatarPetReqAuth, 
  ICoverPetReqAuth, 
  IPetReqAuth, 
  IPetRes, 
  ISpecieRes, 
  schemaPet,
} from '@src/types/pet';
import {
  createPet,
  updatePet,
  getPets,
  getPet,
  uploadAvatar,
  uploadCover,
  getSpeciesPopular,
  searcSpecieByName,
  searchPets,
} from '@src/services/PetService';
import { IMessagesRes } from '@src/types';

export class PetRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.post('', validationMw(schemaPet), authMw, this.create);
    this._routes.get('', this.get);
    this._routes.get('/search', this.search);
    this._routes.get('/:pet_id', this.detail);
    this._routes.patch(
      '/:pet_id',
      validationMw(schemaPet),
      authMw,
      this.update,
    );
    this._routes.post('/:pet_id/avatar', authMw, this.uploadAvatar);
    this._routes.post('/:pet_id/cover', authMw, this.uploadCover);

    this._routes.get('/species/popular', this.getSpeciesPopular);
    this._routes.get('/species/search', this.searchSpecieByName);
  }

  public get routes(): Router {
    return this._routes;
  }

  private create = async (
    req: IReq<IPetReqAuth>,
    res: IRes<IPetRes>,
    next: NextFunction,
  ): Promise<IRes<IPetRes> | undefined> => {
    try {
      const pet = await createPet(req.body);
      return res.status(HttpStatusCodes.OK).json(pet);
    } catch (e) {
      next(e);
    }
  };

  private update = async (
    req: IReq<IPetReqAuth>,
    res: IRes<IPetRes>,
    next: NextFunction,
  ): Promise<IRes<IPetRes> | undefined> => {
    try {
      const pet_id = req.params.pet_id ? Number(req.params.pet_id) : undefined;

      if (!pet_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Pet Id Required',
        };
      }
      const pet = await updatePet(pet_id, req.body);
      return res.status(HttpStatusCodes.OK).json(pet);
    } catch (e) {
      next(e);
    }
  };

  private get = async (
    req: IReq,
    res: IRes<Array<IPetRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IPetRes>> | undefined> => {
    try {
      const user_id = 
        req.query.profile_id ? Number(req.query.profile_id) : undefined;

      const pets = await getPets(user_id);
      return res.status(HttpStatusCodes.OK).json(pets);
    } catch (e) {
      next(e);
    }
  };

  private search = async (
    req: IReq,
    res: IRes<Array<IPetRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IPetRes>> | undefined> => {
    try {
      const key = req.query.key ? String(req.query.key) : undefined;

      const pets = await searchPets(key);
      return res.status(HttpStatusCodes.OK).json(pets);
    } catch (e) {
      next(e);
    }
  };

  private detail = async (
    req: IReq,
    res: IRes<IPetRes>,
    next: NextFunction,
  ): Promise<IRes<IPetRes> | undefined> => {
    try {
      const pet_id = req.params.pet_id ? Number(req.params.pet_id) : undefined;

      if (!pet_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Pet Id Required',
        };
      }

      const pet = await getPet(pet_id);
      if (pet) {
        return res.status(HttpStatusCodes.OK).json(pet);
      } else {
        throw {
          status: HttpStatusCodes.NOT_FOUND,
          error: 'Not Found Pet',
        };
      }
    } catch (e) {
      next(e);
    }
  };

  private uploadAvatar = async (
    req: IReq<IAvatarPetReqAuth>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      const pet_id = req.params.pet_id ? Number(req.params.pet_id) : undefined;

      if (!pet_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Pet Id Required',
        };
      }

      await uploadAvatar(pet_id, req.body);

      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };

  private uploadCover = async (
    req: IReq<ICoverPetReqAuth>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      const pet_id = req.params.pet_id ? Number(req.params.pet_id) : undefined;

      if (!pet_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Pet Id Required',
        };
      }

      await uploadCover(pet_id, req.body);

      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };

  private getSpeciesPopular = async (
    req: IReq,
    res: IRes<Array<ISpecieRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<ISpecieRes>> | undefined> => {
    try {
      const species = await getSpeciesPopular();

      return res.status(HttpStatusCodes.OK).json(species);
    } catch (e) {
      next(e);
    }
  };

  private searchSpecieByName = async (
    req: IReq,
    res: IRes<Array<ISpecieRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<ISpecieRes>> | undefined> => {
    try {
      const name = req.query.name ? String(req.query.name) : undefined;
      
      if (!name) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Name Required',
        };
      }

      const species = await searcSpecieByName(name);

      return res.status(HttpStatusCodes.OK).json(species);
    } catch (e) {
      next(e);
    }
  };
}
