import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import {
  IAvatarReqAuth,
  ICoverReqAuth,
  IFollowCountRes,
  IFollowRes,
  IProfileReqAuth,
} from '@src/types/profile';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import {
  IServiceProfileInfoRes,
  IServiceProfileRes,
} from '@src/types/services/profile';
import { createNotification } from './NotificationService';

export const uploadAvatar = async (data: IAvatarReqAuth): Promise<void> => {
  await prisma().profile.update({
    where: { id: data._idProfile },
    data: {
      avatar: data.avatar,
    },
  });
};

export const uploadCover = async (data: ICoverReqAuth): Promise<void> => {
  await prisma().profile.update({
    where: { id: data._idProfile },
    data: {
      cover: data.cover,
    },
  });
};

export const createProfile = async (
  Profile: IProfileReqAuth,
): Promise<IServiceProfileRes> => {
  const profile = await prisma()
    .profile.upsert({
      where: { user_id: Profile._idUser },
      update: {
        name: Profile.name,
        description: Profile.description,
        phone: Profile.phone,
        address: Profile.address,
        birthday: Profile.birthday,
        gender: Profile.gender,
      },
      create: {
        name: Profile.name,
        description: Profile.description,
        phone: Profile.phone,
        address: Profile.address,
        birthday: Profile.birthday,
        gender: Profile.gender,
        user_id: Profile._idUser,
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });
  if (!profile) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Can\'t create profile',
    };
  }
  return {
    id: profile.id,
    user_id: profile.user_id,
    name: profile.name,
    description: profile.description,
    phone: profile.phone,
    address: profile.address,
    birthday: profile.birthday,
    gender: profile.gender,
    created_at: profile.created_at,
  };
};

export const getProfiles = async (): Promise<Array<IServiceProfileRes>> => {
  const profilesPris = await prisma().profile.findMany({});

  return profilesPris;
};

export const searchProfiles = async (
  key: string | undefined,
): Promise<Array<IServiceProfileRes>> => {
  let query = {};
  if(key){
    query = {
      OR: [
        {
          name: {
            contains: key,
          },
        },
        {
          description: {
            contains: key,
          },
        },
      ],
    };
  }
  const profilesPris = await prisma().profile.findMany({
    where: query,
  });

  return profilesPris;
};

export const getProfile = async (
  profile_id: number,
): Promise<IServiceProfileRes> => {
  const profile = await prisma()
    .profile.findUnique({
      where: {
        id: profile_id,
      },
      include: {
        posts: {
          select: {
            id: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        pets: {
          select: {
            id: true,
          },
        },
        articles: {
          select: {
            id: true,
          },
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
  if (!profile) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not Found Profile',
    };
  }
  return {
    id: profile.id,
    user_id: profile.user_id,
    name: profile.name,
    description: profile.description,
    phone: profile.phone,
    address: profile.address,
    birthday: profile.birthday,
    gender: profile.gender,
    posts: profile.posts,
    pets: profile.pets,
    created_at: profile.created_at,
    avatar: profile.avatar,
    cover: profile.cover,
    articles: profile.articles,
  };
};

export const getProfileInfo = async (
  profile_id: number,
): Promise<IServiceProfileInfoRes> => {
  const profile = await prisma()
    .profile.findUnique({
      where: {
        id: profile_id,
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });
  if (!profile) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not Found Profile',
    };
  }
  return {
    id: profile.id,
    user_id: profile.user_id,
    name: profile.name,
    created_at: profile.created_at,
    avatar: profile.avatar,
  };
};

export const followProfile = async (
  profile_id: number,
  follow_id: number,
): Promise<Array<IFollowRes>> => {
  const profile = await prisma().profile.findUnique({
    where: { id: profile_id },
  });

  if (!profile) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Profile not found',
    };
  }

  const profileFollow = await prisma().follow.findFirst({
    where: {
      profile_id: profile_id,
      follow_id: follow_id,
    },
  });

  if (profileFollow) {
    await prisma().follow.delete({
      where: { id: profileFollow.id },
    });
  } else {
    await prisma().follow.create({
      data: {
        profile: { connect: { id: profile_id } },
        follow_id: follow_id,
      },
    });
    createNotification({
      action: 'FOLLOW',
      content: 'start follow you',
      from_id: profile_id,
      profile_id: follow_id,
      to_id: profile_id,
    });
  }

  const follow = await prisma().follow.findMany({
    where: {
      follow_id: follow_id,
    },
  });

  const followers = follow.map((item) => {
    return {
      follow_id: item.profile_id,
    };
  });

  

  return followers;
};

export const getFollowCount = async (
  profile_id: number,
): Promise<IFollowCountRes> => {
  const profile = await prisma().profile.findUnique({
    where: {
      id: profile_id,
    },
    include: {
      follows: {
        select: {
          follow_id: true,
        },
      },
      follow_pets: {
        select: {
          follow_id: true,
        },
      },
    },
  });

  if (!profile) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not Found Profile',
    };
  }

  const followings = profile.follows;
  const followings_pet = profile.follow_pets;

  const follow = await prisma().follow.findMany({
    where: {
      follow_id: profile_id,
    },
  });

  const followers = follow.map((item) => {
    return {
      follow_id: item.profile_id,
    };
  });

  return {
    followers,
    followings,
    followings_pet,
  };
};

export const followProfilePet = async (
  profile_id: number,
  follow_id: number,
): Promise<Array<IFollowRes>> => {
  const profile = await prisma().profile.findUnique({
    where: { id: profile_id },
  });

  if (!profile) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Profile not found',
    };
  }

  const profileFollow = await prisma().followPet.findFirst({
    where: {
      profile_id: profile_id,
      follow_id: follow_id,
    },
  });

  if (profileFollow) {
    await prisma().followPet.delete({
      where: { id: profileFollow.id },
    });
  } else {
    await prisma().followPet.create({
      data: {
        profile: { connect: { id: profile_id } },
        follow_id: follow_id,
      },
    });
  }

  const follow = await prisma().followPet.findMany({
    where: {
      follow_id: follow_id,
    },
  });

  const followers = follow.map((item) => {
    return {
      follow_id: item.profile_id,
    };
  });

  return followers;
};

export const getPetFollowCount = async (
  pet_id: number,
): Promise<Array<IFollowRes>> => {
  const follow = await prisma().followPet.findMany({
    where: {
      follow_id: pet_id,
    },
  });

  const followers = follow.map((item) => {
    return {
      follow_id: item.profile_id,
    };
  });

  return followers;
};
