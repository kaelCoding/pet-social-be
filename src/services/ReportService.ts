import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { 
  IServiceReportReq,
  IServiceReportRes, 
} from '@src/types/services/report';
import { IReportRes } from '@src/types/report';
import { deletePost } from './PostService';
import { deleteArticle } from './ArticleService';
import { createNotification } from './NotificationService';

export const createReport = async (
  reportReq: IServiceReportReq,
): Promise<IReportRes> => {

  const reportPris = await prisma().report.create({
    data: {
      action: reportReq.action,
      content: reportReq.content,
      profile: { connect: { id: reportReq.profile_id } },
      target_id: reportReq.target_id,
    },
  }).catch((e) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      log.log(e);
    } else {
      throw e;
    }
  });
  if (!reportPris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create report',
    };
  }

  return reportPris;
};

export const getReports = 
async (): Promise<Array<IServiceReportRes>> => {
  const reports = await prisma().report.findMany({
    orderBy: {
      created_at: 'desc',
    },
  });
  return reports;
};

export const createBlock = async (
  reportReq: IServiceReportReq,
): Promise<void> => {
  let idProfile;

  switch(reportReq.action){
  case 'POST':
    await prisma().post.findUnique({
      where: { id: reportReq.target_id },
    }).then(res => {
      idProfile = res?.profile_id;
    });
    deletePost(reportReq.target_id);
    break;
  case 'ARTICLE':
    await prisma().article.findUnique({
      where: { id: reportReq.target_id },
    }).then(res => {
      idProfile = res?.profile_id;
    });
    deleteArticle(reportReq.target_id);
    break;
  case 'USER':
    await prisma().profile.update({
      where: {
        id: reportReq.target_id,
      },
      data: {
        block: true,
      },
    });
    break;
  }

  if(idProfile){
    createNotification({
      action: 'BLOCK' + '_' + reportReq.action,
      content: reportReq.content,
      profile_id: parseInt(idProfile),
    });
  }
};