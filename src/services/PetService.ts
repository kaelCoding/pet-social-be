import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import {
  IAvatarPetReqAuth,
  ICoverPetReqAuth,
  IPetReqAuth,
  ISpecieRes,
} from '@src/types/pet';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { IServicePetRes } from '@src/types/services/pet';

export const createPet = async (Pet: IPetReqAuth): Promise<IServicePetRes> => {
  if (!Pet._idProfile) {
    throw {
      status: HttpStatusCodes.BAD_REQUEST,
      error: 'Profile Not Created',
    };
  }
  
  await prisma().specie.upsert({
    where: { type: Pet.specie_type },
    create: { type: Pet.specie_type  },
    update: {},
  });

  const petPris = await prisma()
    .pet.create({
      data: {
        name: Pet.name,
        description: Pet.description,
        birthday: Pet.birthday,
        gender: Pet.gender,
        profile_id: Pet._idProfile,
        specie_type: Pet.specie_type,
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });
  if (!petPris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create pet',
    };
  }
  return {
    id: petPris.id,
    name: petPris.name,
    description: petPris.description,
    birthday: petPris.birthday,
    gender: petPris.gender,
    profile_id: petPris.profile_id,
    specie_type: petPris.specie_type,
    created_at: petPris.created_at,
  };
};

export const updatePet = async (
  idPet: number,
  Pet: IPetReqAuth,
): Promise<IServicePetRes> => {

  await prisma().specie.upsert({
    where: { type: Pet.specie_type },
    create: { type: Pet.specie_type  },
    update: {},
  });

  const petPris = await prisma()
    .pet.update({
      where: { id: idPet },
      data: {
        name: Pet.name,
        description: Pet.description,
        birthday: Pet.birthday,
        gender: Pet.gender,
        specie_type: Pet.specie_type,
        profile_id: Pet._idProfile,
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });
  if (!petPris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t update pet',
    };
  }
  return {
    id: petPris.id,
    name: petPris.name,
    description: petPris.description,
    birthday: petPris.birthday,
    gender: petPris.gender,
    profile_id: petPris.profile_id,
    created_at: petPris.created_at,
    avatar: petPris.avatar,
    cover: petPris.cover,
    specie_type: petPris.specie_type,
  };
};

export const getPets = async (
  profile_id: number | undefined,
): Promise<Array<IServicePetRes>> => {
  const petsPris = await prisma().pet.findMany({
    where: {
      profile_id: profile_id,
    },
  });
  const pets = petsPris.map((petPris) => {
    return {
      id: petPris.id,
      name: petPris.name,
      description: petPris.description,
      birthday: petPris.birthday,
      gender: petPris.gender,
      profile_id: petPris.profile_id,
      created_at: petPris.created_at,
      avatar: petPris.avatar,
      specie_type: petPris.specie_type,
      cover: petPris.cover,
    };
  });
  return pets;
};

export const searchPets = async (
  key: string | undefined,
): Promise<Array<IServicePetRes>> => {
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
  const petsPris = await prisma().pet.findMany({
    where: query,
  });
  const pets = petsPris.map((petPris) => {
    return {
      id: petPris.id,
      name: petPris.name,
      description: petPris.description,
      birthday: petPris.birthday,
      gender: petPris.gender,
      profile_id: petPris.profile_id,
      created_at: petPris.created_at,
      avatar: petPris.avatar,
      specie_type: petPris.specie_type,
      cover: petPris.cover,
    };
  });
  return pets;
};


export const getPet = async (pet_id: number): Promise<IServicePetRes> => {
  const petPris = await prisma().pet.findUnique({
    where: {
      id: pet_id,
    },
    include: {
      posts: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!petPris) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not found pet',
    };
  }
  return {
    id: petPris.id,
    name: petPris.name,
    description: petPris.description,
    birthday: petPris.birthday,
    gender: petPris.gender,
    profile_id: petPris.profile_id,
    posts: petPris.posts,
    created_at: petPris.created_at,
    avatar: petPris.avatar,
    cover: petPris.cover,
    specie_type: petPris.specie_type,
  };
};

export const uploadAvatar = async (
  id_pet: number,
  data: IAvatarPetReqAuth,
): Promise<void> => {
  await prisma().pet.update({
    where: { id: id_pet },
    data: {
      avatar: data.avatar,
    },
  });
};

export const uploadCover = async (
  id_pet: number,
  data: ICoverPetReqAuth,
): Promise<void> => {
  await prisma().pet.update({
    where: { id: id_pet },
    data: {
      cover: data.cover,
    },
  });
};

export const getSpeciesPopular = async (): Promise<Array<ISpecieRes>> => {
  const species = await prisma().specie.findMany({
    include: {
      pets: {
        select: {
          id: true,
          avatar: true,
        },
      },
    },
  });

  const sortedSpecies = species.sort(
    (a, b) => b.pets.length - a.pets.length,
  );

  return sortedSpecies;
};

export const searcSpecieByName = async (
  name: string,
): Promise<Array<ISpecieRes>> => {
  const species = await prisma().specie.findMany({
    where: {
      type: {
        contains: name,
      },
    },
    include: {
      pets: {
        select: {
          id: true,
          avatar: true,
        },
      },
    },
  });

  const sortedSpecies = species.sort(
    (a, b) => b.pets.length - a.pets.length,
  );

  return sortedSpecies;
};
