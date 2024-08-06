import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IReq, IRes } from '@src/types/express/misc';
import { Router, NextFunction } from 'express';
import validationMw from '@src/middleware/validationMw';
import { authMw } from '@src/middleware/authMw';
import {
  IHashtagRes,
  IPostCommentReqAuth,
  IPostCommentRes,
  IPostLikeRes,
  IPostReqAuth,
  IPostRes,
  schemaComment,
  schemaPost,
} from '@src/types/post';
import {
  createPost,
  updatePost,
  getPosts,
  getPost,
  likePost,
  commentPost,
  getHashtagsPopular,
  searchHashtagByTag,
  deletePost,
  updateComment,
  deleteComment,
  searchPosts,
  searchPostByHashtag,
  getMyFollowPosts,
} from '@src/services/PostService';
import { IAuthReq } from '@src/types/auth';
import { IMessagesRes } from '@src/types';

export class PostRoutes {
  private _routes: Router;

  public constructor() {
    this._routes = Router();
    this._routes.post('', validationMw(schemaPost), authMw, this.create);
    this._routes.get('', this.get);
    this._routes.get('/follow', authMw,this.getMyFollow);
    this._routes.get('/search', this.search);
    this._routes.get('/hashtags/search', this.searchByHashtag);
    this._routes.get('/:post_id', this.detail);
    this._routes.patch(
      '/:post_id',
      validationMw(schemaPost),
      authMw,
      this.update,
    );
    this._routes.delete('/:post_id', authMw, this.delete);
    this._routes.post('/:post_id/like', authMw, this.like);
    this._routes.post(
      '/:post_id/comment',
      validationMw(schemaComment),
      authMw,
      this.comment,
    );


    this._routes.get('/hashtags/popular', this.getHashtagsPopular);
    this._routes.get('/hashtags/search/tag', this.searchHashtagByTag);

    this._routes.patch(
      '/comment/:comment_id',
      validationMw(schemaComment),
      authMw,
      this.updateComment,
    );
    this._routes.delete('/comment/:comment_id', authMw, this.deleteComment);
  }

  public get routes(): Router {
    return this._routes;
  }

  private create = async (
    req: IReq<IPostReqAuth>,
    res: IRes<IPostRes>,
    next: NextFunction,
  ): Promise<IRes<IPostRes> | undefined> => {
    try {
      const post = await createPost(req.body);
      return res.status(HttpStatusCodes.OK).json(post);
    } catch (e) {
      next(e);
    }
  };

  private update = async (
    req: IReq<IPostReqAuth>,
    res: IRes<IPostRes>,
    next: NextFunction,
  ): Promise<IRes<IPostRes> | undefined> => {
    try {
      const post_id = req.params.post_id
        ? Number(req.params.post_id)
        : undefined;

      if (!post_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Post Id Required',
        };
      }
      const post = await updatePost(post_id, req.body);
      return res.status(HttpStatusCodes.OK).json(post);
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
      const post_id = req.params.post_id
        ? Number(req.params.post_id)
        : undefined;

      if (!post_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Post Id Required',
        };
      }
      await deletePost(post_id);
      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };

  private get = async (
    req: IReq,
    res: IRes<Array<IPostRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IPostRes>> | undefined> => {
    try {
      const user_id = req.query.user_id ? Number(req.query.user_id) : undefined;

      const posts = await getPosts(user_id);
      return res.status(HttpStatusCodes.OK).json(posts);
    } catch (e) {
      next(e);
    }
  };

  private getMyFollow = async (
    req: IReq<IAuthReq>,
    res: IRes<Array<IPostRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IPostRes>> | undefined> => {
    try {
      const idProfile = req.body._idProfile;
      if (!idProfile) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile require',
        };
      }
      const posts = await getMyFollowPosts(idProfile);
      return res.status(HttpStatusCodes.OK).json(posts);
    } catch (e) {
      next(e);
    }
  };

  private search = async (
    req: IReq,
    res: IRes<Array<IPostRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IPostRes>> | undefined> => {
    try {
      const key = req.query.key ? String(req.query.key) : undefined;

      const posts = await searchPosts(key);
      return res.status(HttpStatusCodes.OK).json(posts);
    } catch (e) {
      next(e);
    }
  };

  private searchByHashtag = async (
    req: IReq,
    res: IRes<Array<IPostRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IPostRes>> | undefined> => {
    try {
      const key = req.query.key ? String(req.query.key) : undefined;

      const posts = await searchPostByHashtag(key);
      return res.status(HttpStatusCodes.OK).json(posts);
    } catch (e) {
      next(e);
    }
  };

  private detail = async (
    req: IReq,
    res: IRes<IPostRes>,
    next: NextFunction,
  ): Promise<IRes<IPostRes> | undefined> => {
    try {
      const post_id = req.params.post_id
        ? Number(req.params.post_id)
        : undefined;

      if (!post_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Post Id Required',
        };
      }

      const post = await getPost(post_id);
      if (post) {
        return res.status(HttpStatusCodes.OK).json(post);
      } else {
        throw {
          status: HttpStatusCodes.NOT_FOUND,
          error: 'Not Found Post',
        };
      }
    } catch (e) {
      next(e);
    }
  };

  private like = async (
    req: IReq<IAuthReq>,
    res: IRes<IPostLikeRes>,
    next: NextFunction,
  ): Promise<IRes<IPostLikeRes> | undefined> => {
    try {
      const post_id = req.params.post_id
        ? Number(req.params.post_id)
        : undefined;

      if (!post_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Post Id Required',
        };
      }
      const profile_id = req.body._idProfile;
      if (!profile_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Profile Required',
        };
      }
      const likes = await likePost(post_id, profile_id);

      return res.status(HttpStatusCodes.OK).json(likes);
    } catch (e) {
      next(e);
    }
  };

  private comment = async (
    req: IReq<IPostCommentReqAuth>,
    res: IRes<IPostCommentRes>,
    next: NextFunction,
  ): Promise<IRes<IPostCommentRes> | undefined> => {
    try {
      const post_id = req.params.post_id
        ? Number(req.params.post_id)
        : undefined;

      if (!post_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Post Id Required',
        };
      }

      const comment = await commentPost(post_id, req.body);

      return res.status(HttpStatusCodes.OK).json(comment);
    } catch (e) {
      next(e);
    }
  };

  private getHashtagsPopular = async (
    req: IReq,
    res: IRes<Array<IHashtagRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IHashtagRes>> | undefined> => {
    try {
      const hashtags = await getHashtagsPopular();

      return res.status(HttpStatusCodes.OK).json(hashtags);
    } catch (e) {
      next(e);
    }
  };

  private searchHashtagByTag = async (
    req: IReq,
    res: IRes<Array<IHashtagRes>>,
    next: NextFunction,
  ): Promise<IRes<Array<IHashtagRes>> | undefined> => {
    try {
      const tag = req.query.tag ? String(req.query.tag) : undefined;

      if (!tag) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Tag Required',
        };
      }

      const hashtags = await searchHashtagByTag(tag);

      return res.status(HttpStatusCodes.OK).json(hashtags);
    } catch (e) {
      next(e);
    }
  };

  private updateComment = async (
    req: IReq<IPostCommentReqAuth>,
    res: IRes<IPostCommentRes>,
    next: NextFunction,
  ): Promise<IRes<IPostCommentRes> | undefined> => {
    try {
      const comment_id = req.params.comment_id
        ? Number(req.params.comment_id)
        : undefined;

      if (!comment_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Comment Id Required',
        };
      }

      const comment = await updateComment(comment_id, req.body);
      return res.status(HttpStatusCodes.OK).json(comment);
    } catch (e) {
      next(e);
    }
  };

  private deleteComment = async (
    req: IReq<IAuthReq>,
    res: IRes<IMessagesRes>,
    next: NextFunction,
  ): Promise<IRes<IMessagesRes> | undefined> => {
    try {
      const comment_id = req.params.comment_id
        ? Number(req.params.comment_id)
        : undefined;

      if (!comment_id) {
        throw {
          status: HttpStatusCodes.BAD_REQUEST,
          error: 'Comment Id Required',
        };
      }
      await deleteComment(comment_id);
      return res.status(HttpStatusCodes.OK).json({
        messages: 'success',
      });
    } catch (e) {
      next(e);
    }
  };
}
