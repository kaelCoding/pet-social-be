import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import { authMw } from '@src/middleware/authMw';
import { IAuthReq } from '@src/types/auth';
import {
  IConversationRes,
  IMessageReqAuth,
  IMessageRes,
  schemaMessage,
} from '@src/types/conversation';
import {
  createConversation,
  deleteMess,
  getConversations,
  sendMess,
  updateMess,
} from '@src/services/ConversationService';
import validationMw from '@src/middleware/validationMw';
import { IMessagesRes } from '@src/types';


export class ConversationRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.post('/:guest_id', authMw, this.create);
    this._routes.post(
      '/:conversation_id/messages/send',
      validationMw(schemaMessage),
      authMw,
      this.sendMess,
    );
    this._routes.get('/my', authMw, this.getMy );

    this._routes.patch(
      '/message/:message_id',
      validationMw(schemaMessage),
      authMw,
      this.updateMessage,
    );
    this._routes.delete('/message/:message_id', authMw, this.deleteMessage);
  }

  public get routes(): Router {
    return this._routes;
  }

  private create = async (
    req: IReq<IAuthReq>,
    res: IRes<IConversationRes>,
    next: NextFunction,
  ): Promise<IRes<IConversationRes> | undefined> => {
    try {
      const profile_id = req.body._idProfile;
      if (!profile_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Required',
        };
      }

      const guest_id = req.params.guest_id
        ? Number(req.params.guest_id)
        : undefined;

      if (!guest_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Guest Id Required',
        };
      }

      const conversation = await createConversation(profile_id, guest_id);

      return res.status(HttpStatusCodes.OK).json(conversation);
    } catch (e) {
      next(e);
    }
  };

  private sendMess = async (
    req: IReq<IMessageReqAuth>,
    res: IRes<IMessageRes>,
    next: NextFunction,
  ): Promise<IRes<IMessageRes> | undefined> => {
    try {
      const conversation_id = req.params.conversation_id
        ? Number(req.params.conversation_id)
        : undefined;

      if (!conversation_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Conversation Id Required',
        };
      }

      const mess = await sendMess(conversation_id, req.body);

      return res.status(HttpStatusCodes.OK).json(mess);
    } catch (e) {
      next(e);
    }
  };

  private getMy = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<IConversationRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IConversationRes>> | undefined> => {
    try {
      const profile_id = req.body._idProfile;
      if (!profile_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Required',
        };
      }

      const conversations = await getConversations(profile_id);
      return res.status(HttpStatusCodes.OK).json(conversations);
    } catch (e) {
      next(e);
    }
  };

  private updateMessage = async (
    req: IReq<IMessageReqAuth>,
    res: IRes<IMessageRes>,
    next: NextFunction,
  ): Promise<IRes<IMessageRes> | undefined> => {
    try {
      const message_id = req.params.message_id
        ? Number(req.params.message_id)
        : undefined;

      if (!message_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Message Id Required',
        };
      }

      const message = await updateMess(message_id, req.body);
      return res.status(HttpStatusCodes.OK).json(message);
    } catch (e) {
      next(e);
    }
  };

  private deleteMessage = async (
    req: IReq<IAuthReq>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      const message_id = req.params.message_id
        ? Number(req.params.message_id)
        : undefined;

      if (!message_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Message Id Required',
        };
      }
      await deleteMess(message_id);
      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };
}
