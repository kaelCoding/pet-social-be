import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import { IArticleCommentReqAuth, IArticleReqAuth } from '@src/types/article';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import {
  IServiceArticleCommentRes,
  IServiceArticleLikeRes,
  IServiceArticleRes,
} from '@src/types/services/article';
import { createNotification } from './NotificationService';

export const createArticle = async (
  Article: IArticleReqAuth,
): Promise<IServiceArticleRes> => {
  if (!Article._idProfile) {
    throw {
      status: HttpStatusCodes.BAD_REQUEST,
      error: 'Profile Not Created',
    };
  }

  const articlePris = await prisma()
    .article.create({
      data: {
        title: Article.title,
        content: Article.content,
        description: Article.description,
        profile_id: Article._idProfile,
        cover: Article.cover,
        view: 0,
      },
      include: {
        article_likes: {
          select: {
            profile_id: true,
          },
        },
        article_comments: {
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });
  if (!articlePris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create article',
    };
  }
  return {
    id: articlePris.id,
    title: articlePris.title,
    content: articlePris.content,
    description: articlePris.description,
    cover: articlePris.cover,
    view: articlePris.view,
    profile_id: articlePris.profile_id,
    created_at: articlePris.created_at,
    article_likes: articlePris.article_likes,
    article_comments: articlePris.article_comments,
  };
};

export const updateArticle = async (
  idArticle: number,
  Article: IArticleReqAuth,
): Promise<IServiceArticleRes> => {
  const articlePris = await prisma()
    .article.update({
      where: { id: idArticle },
      data: {
        title: Article.title,
        content: Article.content,
        description: Article.description,
        profile_id: Article._idProfile,
        cover: Article.cover,
      },
      include: {
        article_likes: {
          select: {
            profile_id: true,
          },
        },
        article_comments: {
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });
  if (!articlePris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t update article',
    };
  }
  return {
    id: articlePris.id,
    title: articlePris.title,
    content: articlePris.content,
    description: articlePris.description,
    profile_id: articlePris.profile_id,
    created_at: articlePris.created_at,
    article_likes: articlePris.article_likes,
    article_comments: articlePris.article_comments,
    cover: articlePris.cover,
    view: articlePris.view,
  };
};

export const deleteArticle = async (id: number): Promise<void> => {
  await prisma().article.delete({
    where: {
      id: id,
    },
  });
};

export const getArticles = async (
  profile_id: number | undefined,
): Promise<Array<IServiceArticleRes>> => {
  const articlesPris = await prisma().article.findMany({
    where: {
      profile_id: profile_id,
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      article_likes: {
        select: {
          profile_id: true,
        },
      },
      article_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });
  const articles = articlesPris.map((articlePris) => {
    return {
      id: articlePris.id,
      title: articlePris.title,
      content: '',
      description: articlePris.description,
      profile_id: articlePris.profile_id,
      created_at: articlePris.created_at,
      article_likes: articlePris.article_likes,
      article_comments: articlePris.article_comments,
      cover: articlePris.cover,
      view: articlePris.view,
    };
  });
  return articles;
};

export const searchArticles = async (
  key: string | undefined,
): Promise<Array<IServiceArticleRes>> => {
  let query = {}
  if(key){
    query = {
      OR: [
        {
          title: {
            contains: key,
          },
        },
        {
          content: {
            contains: key,
          },
        },
      ],
    }
  }
  const articlesPris = await prisma().article.findMany({
    where: query,
    orderBy: {
      created_at: 'desc',
    },
    include: {
      article_likes: {
        select: {
          profile_id: true,
        },
      },
      article_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });
  const articles = articlesPris.map((articlePris) => {
    return {
      id: articlePris.id,
      title: articlePris.title,
      content: '',
      description: articlePris.description,
      profile_id: articlePris.profile_id,
      created_at: articlePris.created_at,
      article_likes: articlePris.article_likes,
      article_comments: articlePris.article_comments,
      cover: articlePris.cover,
      view: articlePris.view,
    };
  });
  return articles;
};

export const getArticle = async (
  article_id: number,
): Promise<IServiceArticleRes> => {
  const articlePris = await prisma().article.findUnique({
    where: {
      id: article_id,
    },
    include: {
      article_likes: {
        select: {
          profile_id: true,
        },
      },
      article_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });
  if (!articlePris) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not found article',
    };
  }
  return {
    id: articlePris.id,
    title: articlePris.title,
    content: articlePris.content,
    description: articlePris.description,
    profile_id: articlePris.profile_id,
    created_at: articlePris.created_at,
    article_likes: articlePris.article_likes,
    article_comments: articlePris.article_comments,
    cover: articlePris.cover,
    view: articlePris.view,
  };
};

export const likeArticle = async (
  article_id: number,
  profile_id: number,
): Promise<IServiceArticleLikeRes> => {
  const article = await prisma().article.findUnique({
    where: { id: article_id },
  });

  if (!article) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Article not found',
    };
  }

  const articleLike = await prisma().articleLike.findFirst({
    where: {
      profile_id: profile_id,
      article_id: article_id,
    },
  });
  if (articleLike) {
    await prisma().articleLike.delete({
      where: { id: articleLike.id },
    });
  } else {
    await prisma().articleLike.create({
      data: {
        profile: { connect: { id: profile_id } },
        article: { connect: { id: article_id } },
      },
    });

    createNotification({
      action: 'LIKE_ARTICLE',
      content: 'like your article',
      from_id: profile_id,
      profile_id: article.profile_id,
      to_id: article.id,
    });
  }

  const articleAfter = await prisma().article.findUnique({
    where: { id: article_id },
    include: {
      article_likes: {
        select: {
          profile_id: true,
        },
      },
    },
  });
  if (!articleAfter) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Article not found',
    };
  }

  return articleAfter.article_likes;
};

export const commentArticle = async (
  article_id: number,
  comment: IArticleCommentReqAuth,
): Promise<IServiceArticleCommentRes> => {
  const idProfile = comment._idProfile;
  const content = comment.content;

  const article = await prisma().article.findUnique({
    where: { id: article_id },
  });

  if (!article) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Article not found',
    };
  }

  const articleComment = await prisma().articleComment.create({
    data: {
      content: content,
      profile: { connect: { id: idProfile } },
      article: { connect: { id: article_id } },
    },
  });

  if (!articleComment) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create comment',
    };
  }

  createNotification({
    action: 'COMMENT_ARTICLE',
    content: 'comment your article',
    from_id: idProfile,
    profile_id: article.profile_id,
    to_id: article.id,
  });

  return {
    id: articleComment.id,
    content: articleComment.content,
    profile_id: articleComment.profile_id,
    article_id: articleComment.article_id,
    created_at: articleComment.created_at,
  };
};
