import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import validationMw from '@src/middleware/validationMw';
import { authMw } from '@src/middleware/authMw';
import { 
  IArticleCommentReqAuth, 
  IArticleCommentRes, 
  IArticleLikeRes, 
  IArticleReqAuth, 
  IArticleRes, 
  schemaComment, 
  schemaArticle,
} from '@src/types/article';
import {
  createArticle,
  updateArticle,
  getArticles,
  getArticle,
  likeArticle,
  commentArticle,
  deleteArticle,
  searchArticles,
} from '@src/services/ArticleService';
import { IAuthReq } from '@src/types/auth';
import { IMessagesRes } from '@src/types';

export class ArticleRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.post('', validationMw(schemaArticle), authMw, this.create);
    this._routes.get('', this.get);
    this._routes.get('/search', this.search);
    this._routes.get('/:article_id', this.detail);
    this._routes.patch(
      '/:article_id',
      validationMw(schemaArticle),
      authMw,
      this.update,
    );
    this._routes.delete(
      '/:article_id',
      authMw,
      this.delete,
    );
    this._routes.post('/:article_id/like', authMw, this.like);
    this._routes.post(
      '/:article_id/comment', 
      validationMw(schemaComment),
      authMw, 
      this.comment,
    );
  }

  public get routes(): Router {
    return this._routes;
  }

  private create = async (
    req: IReq<IArticleReqAuth>,
    res: IRes<IArticleRes>,
    next: NextFunction,
  ): Promise<IRes<IArticleRes> | undefined> => {
    try {
      const article = await createArticle(req.body);
      return res.status(HttpStatusCodes.OK).json(article);
    } catch (e) {
      next(e);
    }
  };

  private delete = async (
    req: IReq<IAuthReq>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      const article_id = req.params.article_id
        ? Number(req.params.article_id)
        : undefined;

      if (!article_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Article Id Required',
        };
      }
      await deleteArticle(article_id);
      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };

  private update = async (
    req: IReq<IArticleReqAuth>,
    res: IRes<IArticleRes>,
    next: NextFunction,
  ): Promise<IRes<IArticleRes> | undefined> => {
    try {
      const article_id = req.params.article_id
        ? Number(req.params.article_id)
        : undefined;

      if (!article_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Article Id Required',
        };
      }
      const article = await updateArticle(article_id, req.body);
      return res.status(HttpStatusCodes.OK).json(article);
    } catch (e) {
      next(e);
    }
  };

  private get = async (
    req: IReq,
    res: IRes<Array<IArticleRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IArticleRes>> | undefined> => {
    try {
      const user_id = req.query.user_id ? Number(req.query.user_id) : undefined;

      const articles = await getArticles(user_id);
      return res.status(HttpStatusCodes.OK).json(articles);
    } catch (e) {
      next(e);
    }
  };

  private search = async (
    req: IReq,
    res: IRes<Array<IArticleRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IArticleRes>> | undefined> => {
    try {
      const key = req.query.key ? String(req.query.key) : undefined;

      const articles = await searchArticles(key);
      return res.status(HttpStatusCodes.OK).json(articles);
    } catch (e) {
      next(e);
    }
  };

  private detail = async (
    req: IReq,
    res: IRes<IArticleRes>,
    next: NextFunction,
  ): Promise<IRes<IArticleRes> | undefined> => {
    try {
      const article_id = req.params.article_id
        ? Number(req.params.article_id)
        : undefined;

      if (!article_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Article Id Required',
        };
      }

      const article = await getArticle(article_id);
      if (article) {
        return res.status(HttpStatusCodes.OK).json(article);
      } else {
        throw {
          status: HttpStatusCodes.NOT_FOUND,
          error: 'Not Found Article',
        };
      }
    } catch (e) {
      next(e);
    }
  };

  private like = async (
    req: IReq<IAuthReq>,
    res: IRes<IArticleLikeRes>,
    next: NextFunction,
  ): Promise<IRes<IArticleLikeRes> | undefined> => {
    try {
      const article_id = req.params.article_id
        ? Number(req.params.article_id)
        : undefined;

      if (!article_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Article Id Required',
        };
      }
      const profile_id = req.body._idProfile;
      if(!profile_id){
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Required',
        };
      }
      const likes = await likeArticle(article_id, profile_id);

      return res.status(HttpStatusCodes.OK).json(likes);

    } catch (e) {
      next(e);
    }
  };

  private comment = async (
    req: IReq<IArticleCommentReqAuth>,
    res: IRes<IArticleCommentRes>,
    next: NextFunction,
  ): Promise<IRes<IArticleCommentRes> | undefined> => {
    try {
      const article_id = req.params.article_id
        ? Number(req.params.article_id)
        : undefined;

      if (!article_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Article Id Required',
        };
      }

      const comment = await commentArticle(article_id, req.body);

      return res.status(HttpStatusCodes.OK).json(comment);
    } catch (e) {
      next(e);
    }
  };

}
