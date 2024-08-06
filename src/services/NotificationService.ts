import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { 
  IServiceNotificationReq, 
  IServiceNotificationRes, 
} from '@src/types/services/notification';

export const createNotification = async (
  notiReq: IServiceNotificationReq,
): Promise<IServiceNotificationRes> => {

  const notiPris = await prisma().notification.create({
    data: {
      action: notiReq.action,
      content: notiReq.content,
      from_id: notiReq.from_id,
      profile: { connect: { id: notiReq.profile_id } },
      to_id: notiReq.to_id,
    },
  }).catch((e) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      log.log(e);
    } else {
      throw e;
    }
  });
  if (!notiPris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create notification',
    };
  }

  return notiPris;
};

export const getNotifications = 
async (profile_id: number): Promise<Array<IServiceNotificationRes>> => {
  const notifications = await prisma().notification.findMany({
    where:{
      profile_id: profile_id,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
  return notifications;
};
