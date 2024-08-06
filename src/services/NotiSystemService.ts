import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import { INotiSystemReqAuth } from '@src/types/notiSystem';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { 
  IServiceNotiSystemRes,
} from '@src/types/services/notiSystem';


export const createNotiSystem = 
  async (NotiSystem: INotiSystemReqAuth): Promise<IServiceNotiSystemRes> => {
    const notiSystemPris = await prisma()
      .notiSystem.create({
        data: {
          title: NotiSystem.title,
          content: NotiSystem.content,
          link: NotiSystem.link,
          cover: NotiSystem.cover,
          price: NotiSystem.cover,
        },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          log.log(e);
        } else {
          throw e;
        }
      });
    if (!notiSystemPris) {
      throw {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        error: 'Can\'t create notiSystem',
      };
    }
    return notiSystemPris;
  };

export const updateNotiSystem = 
  async (idNotiSystem: number, NotiSystem: INotiSystemReqAuth): 
  Promise<IServiceNotiSystemRes> => {
    const notiSystemPris = await prisma()
      .notiSystem.update({
        where: { id: idNotiSystem },
        data: {
          title: NotiSystem.title,
          content: NotiSystem.content,
          link: NotiSystem.link,
          cover: NotiSystem.cover,
          price: NotiSystem.cover,
        },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          log.log(e);
        } else {
          throw e;
        }
      });
    if (!notiSystemPris) {
      throw {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        error: 'Can\'t update notiSystem',
      };
    }
    return notiSystemPris;
  };

export const getNotiSystems = 
async (): Promise<Array<IServiceNotiSystemRes>> => {
  const notiSystemsPris = await prisma().notiSystem.findMany({
    orderBy: {
      created_at: 'desc',
    },
  });
  return notiSystemsPris;
};

export const getNotiSystem = 
async (notiSystem_id: number): Promise<IServiceNotiSystemRes>  => {
  const notiSystemPris = await prisma().notiSystem.findUnique({
    where: {
      id: notiSystem_id,
    },
  });
  if (!notiSystemPris) {
    throw {
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not found notiSystem',
    };
  }
  return notiSystemPris;
};

export const deleteNoti = async (
  id: number,
): Promise<void> => {
  await prisma().notiSystem.delete({
    where: {
      id: id,
    },
  });
};
