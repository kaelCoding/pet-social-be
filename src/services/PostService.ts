import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import {
  IHashtagRes,
  IPostCommentReqAuth,
  IPostReqAuth,
} from '@src/types/post';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import {
  IServicePostCommentRes,
  IServicePostLikeRes,
  IServicePostRes,
} from '@src/types/services/post';
import { getFollowCount } from './ProfileService';
import { createNotification } from './NotificationService';

export const createPost = async (
  Post: IPostReqAuth,
): Promise<IServicePostRes> => {
  if (!Post._idProfile) {
    throw {
      status: HttpStatusCodes.BAD_REQUEST,
      error: 'Profile Not Created',
    };
  }
  if (Post.hashtags) {
    for (const hashtag of Post.hashtags) {
      await prisma().hashtag.upsert({
        where: { tag: hashtag.tag },
        create: { tag: hashtag.tag },
        update: {},
      });
    }
  }

  const postPris = await prisma()
    .post.create({
      data: {
        title: Post.title,
        content: Post.content,
        profile_id: Post._idProfile,
        pets: {
          connect: Post.pets,
        },
        hashtags: {
          connect: Post.hashtags,
        },
        files: {
          create: Post.files,
        },
      },
      include: {
        pets: {
          select: {
            id: true,
          },
        },
        post_likes: {
          select: {
            profile_id: true,
          },
        },
        post_comments: {
          orderBy: {
            created_at: 'desc',
          },
        },
        hashtags: true,
        files: {
          select: {
            id: true,
            link: true,
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
  if (!postPris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create post',
    };
  }
  return {
    id: postPris.id,
    title: postPris.title,
    content: postPris.content,
    profile_id: postPris.profile_id,
    created_at: postPris.created_at,
    pets: postPris.pets,
    post_likes: postPris.post_likes,
    post_comments: postPris.post_comments,
    hashtags: postPris.hashtags,
    files: postPris.files,
  };
};

export const deletePost = async (
  idPost: number,
): Promise<void> => {
  await prisma().post.delete({
    where: {
      id: idPost,
    },
  });
};

export const updatePost = async (
  idPost: number,
  Post: IPostReqAuth,
): Promise<IServicePostRes> => {
  if (Post.hashtags) {
    for (const hashtag of Post.hashtags) {
      await prisma().hashtag.upsert({
        where: { tag: hashtag.tag },
        create: { tag: hashtag.tag },
        update: {},
      });
    }
  }

  await prisma().filePost.deleteMany({
    where: {
      post_id: idPost,
    },
  });

  const postPris = await prisma()
    .post.update({
      where: { id: idPost },
      data: {
        title: Post.title,
        content: Post.content,
        profile_id: Post._idProfile,
        pets: {
          connect: Post.pets,
        },
        hashtags: {
          connect: Post.hashtags,
        },
        files: {
          create: Post.files,
        },
      },
      include: {
        pets: {
          select: {
            id: true,
          },
        },
        post_likes: {
          select: {
            profile_id: true,
          },
        },
        post_comments: {
          orderBy: {
            created_at: 'desc',
          },
        },
        hashtags: true,
        files: {
          select: {
            id: true,
            link: true,
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
  if (!postPris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t update post',
    };
  }
  return {
    id: postPris.id,
    title: postPris.title,
    content: postPris.content,
    profile_id: postPris.profile_id,
    created_at: postPris.created_at,
    pets: postPris.pets,
    post_likes: postPris.post_likes,
    post_comments: postPris.post_comments,
    hashtags: postPris.hashtags,
    files: postPris.files,
  };
};

export const getPosts = async (
  profile_id: number | undefined,
): Promise<Array<IServicePostRes>> => {
  const postsPris = await prisma().post.findMany({
    where: {
      profile_id: profile_id,
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      pets: {
        select: {
          id: true,
        },
      },
      post_likes: {
        select: {
          profile_id: true,
        },
      },
      post_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
      hashtags: true,
      files: {
        select: {
          id: true,
          link: true,
        },
      },
    },
  });
  const posts = postsPris.map((postPris) => {
    return {
      id: postPris.id,
      title: postPris.title,
      content: postPris.content,
      profile_id: postPris.profile_id,
      created_at: postPris.created_at,
      pets: postPris.pets,
      post_likes: postPris.post_likes,
      post_comments: postPris.post_comments,
      hashtags: postPris.hashtags,
      files: postPris.files,
    };
  });
  return posts;
};

export const getMyFollowPosts = async (
  profile_id: number,
): Promise<Array<IServicePostRes>> => {

  const followCount = await getFollowCount(profile_id);
  
  const following = followCount.followings;
  const followingPets = followCount.followings_pet;


  const postsPris = await prisma().post.findMany({
    where: {
      OR: [
        {
          profile_id: {
            in: following.map((followed) => followed.follow_id),
          },
        },
        {
          pets: {
            some: {
              id: {
                in: followingPets.map((followedPet) => followedPet.follow_id),
              },
            },
          },
        },
      ],
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      pets: {
        select: {
          id: true,
        },
      },
      post_likes: {
        select: {
          profile_id: true,
        },
      },
      post_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
      hashtags: true,
      files: {
        select: {
          id: true,
          link: true,
        },
      },
    },
  });

  const posts = postsPris.map((postPris) => {
    return {
      id: postPris.id,
      title: postPris.title,
      content: postPris.content,
      profile_id: postPris.profile_id,
      created_at: postPris.created_at,
      pets: postPris.pets,
      post_likes: postPris.post_likes,
      post_comments: postPris.post_comments,
      hashtags: postPris.hashtags,
      files: postPris.files,
    };
  });

  return posts;
};

export const searchPosts = async (
  key: string | undefined,
): Promise<Array<IServicePostRes>> => {
  let query = {};
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
    };
  }
  const postsPris = await prisma().post.findMany({
    where: query,
    orderBy: {
      created_at: 'desc',
    },
    include: {
      pets: {
        select: {
          id: true,
        },
      },
      post_likes: {
        select: {
          profile_id: true,
        },
      },
      post_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
      hashtags: true,
      files: {
        select: {
          id: true,
          link: true,
        },
      },
    },
  });
  const posts = postsPris.map((postPris) => {
    return {
      id: postPris.id,
      title: postPris.title,
      content: postPris.content,
      profile_id: postPris.profile_id,
      created_at: postPris.created_at,
      pets: postPris.pets,
      post_likes: postPris.post_likes,
      post_comments: postPris.post_comments,
      hashtags: postPris.hashtags,
      files: postPris.files,
    };
  });
  return posts;
};

export const searchPostByHashtag = async (
  tag: string | undefined,
): Promise<Array<IServicePostRes>> => {
  const postsPris = await prisma().post.findMany({
    where: {
      hashtags: {
        some: {
          tag: tag,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      pets: {
        select: {
          id: true,
        },
      },
      post_likes: {
        select: {
          profile_id: true,
        },
      },
      post_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
      hashtags: true,
      files: {
        select: {
          id: true,
          link: true,
        },
      },
    },
  });
  const posts = postsPris.map((postPris) => {
    return {
      id: postPris.id,
      title: postPris.title,
      content: postPris.content,
      profile_id: postPris.profile_id,
      created_at: postPris.created_at,
      pets: postPris.pets,
      post_likes: postPris.post_likes,
      post_comments: postPris.post_comments,
      hashtags: postPris.hashtags,
      files: postPris.files,
    };
  });
  return posts;
};

export const getPost = async (post_id: number): Promise<IServicePostRes> => {
  const postPris = await prisma().post.findUnique({
    where: {
      id: post_id,
    },
    include: {
      pets: {
        select: {
          id: true,
        },
      },
      post_likes: {
        select: {
          profile_id: true,
        },
      },
      post_comments: {
        orderBy: {
          created_at: 'desc',
        },
      },
      hashtags: true,
      files: {
        select: {
          id: true,
          link: true,
        },
      },
    },
  });
  if (!postPris) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not found post',
    };
  }
  return {
    id: postPris.id,
    title: postPris.title,
    content: postPris.content,
    profile_id: postPris.profile_id,
    created_at: postPris.created_at,
    pets: postPris.pets,
    post_likes: postPris.post_likes,
    post_comments: postPris.post_comments,
    hashtags: postPris.hashtags,
    files: postPris.files,
  };
};

export const likePost = async (
  post_id: number,
  profile_id: number,
): Promise<IServicePostLikeRes> => {
  const post = await prisma().post.findUnique({
    where: { id: post_id },
  });

  if (!post) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Post not found',
    };
  }

  const postLike = await prisma().postLike.findFirst({
    where: {
      profile_id: profile_id,
      post_id: post_id,
    },
  });
  if (postLike) {
    await prisma().postLike.delete({
      where: { id: postLike.id },
    });
  } else {
    await prisma().postLike.create({
      data: {
        profile: { connect: { id: profile_id } },
        post: { connect: { id: post_id } },
      },
    });
    createNotification({
      action: 'LIKE_POST',
      content: 'like your post',
      from_id: profile_id,
      profile_id: post.profile_id,
      to_id: post.id,
    });
  }

  const postAfter = await prisma().post.findUnique({
    where: { id: post_id },
    include: {
      pets: {
        select: {
          id: true,
        },
      },
      post_likes: {
        select: {
          profile_id: true,
        },
      },
    },
  });
  if (!postAfter) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Post not found',
    };
  }

  return postAfter.post_likes;
};

export const commentPost = async (
  post_id: number,
  comment: IPostCommentReqAuth,
): Promise<IServicePostCommentRes> => {
  const idProfile = comment._idProfile;
  const content = comment.content;

  const post = await prisma().post.findUnique({
    where: { id: post_id },
  });

  if (!post) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Post not found',
    };
  }

  const postComment = await prisma().postComment.create({
    data: {
      content: content,
      profile: { connect: { id: idProfile } },
      post: { connect: { id: post_id } },
    },
  });

  if (!postComment) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create comment',
    };
  }

  createNotification({
    action: 'COMMENT_POST',
    content: 'comment your post',
    from_id: idProfile,
    profile_id: post.profile_id,
    to_id: post.id,
  });

  return {
    id: postComment.id,
    content: postComment.content,
    profile_id: postComment.profile_id,
    post_id: postComment.post_id,
    created_at: postComment.created_at,
  };
};

export const deleteComment = async (
  idComment: number,
): Promise<void> => {
  await prisma().postComment.delete({
    where: {
      id: idComment,
    },
  });
};

export const updateComment = async (
  comment_id: number,
  comment: IPostCommentReqAuth,
): Promise<IServicePostCommentRes> => {
  const content = comment.content;

  const postComment = await prisma().postComment.update({
    where: {
      id: comment_id,
    },
    data: {
      content: content,
    },
  });

  return {
    id: postComment.id,
    content: postComment.content,
    profile_id: postComment.profile_id,
    post_id: postComment.post_id,
    created_at: postComment.created_at,
  };
};

export const getHashtagsPopular = async (): Promise<Array<IHashtagRes>> => {
  const hashtags = await prisma().hashtag.findMany({
    include: {
      posts: {
        select: {
          id: true,
        },
      },
    },
  });

  const sortedHashtags = hashtags.sort(
    (a, b) => b.posts.length - a.posts.length,
  );

  return sortedHashtags;
};

export const searchHashtagByTag = async (
  tag: string,
): Promise<Array<IHashtagRes>> => {
  const hashtags = await prisma().hashtag.findMany({
    where: {
      tag: {
        contains: tag,
      },
    },
    include: {
      posts: {
        select: {
          id: true,
        },
      },
    },
  });

  const sortedHashtags = hashtags.sort(
    (a, b) => b.posts.length - a.posts.length,
  );

  return sortedHashtags;
};
