import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import {
  IFileConnectReq,
} from '@src/types/file';
import { 
  IServiceFileConnectRes, 
  IServiceFileRes,
} from '@src/types/services/file';

export const createFiles = 
  async (filesUp: Express.Multer.File[]): Promise<Array<IServiceFileRes>> => {
    const filesPris = await Promise.all(
      filesUp.map(async (file) => {
        return await createFile(file);
      }),
    ).catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });
    if(!filesPris){
      throw {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        error: 'Can\'t create files',
      };
    }
    const files = filesPris.map(filePris => {
      return {
        id: filePris.id,
        name: filePris.name,
        type: filePris.type,
        size: filePris.size,
        created_at: filePris.created_at,
      };
    });
    return files;
  };

export const createFile = 
  async (file: Express.Multer.File): Promise<IServiceFileRes> => {
    const filePris = await prisma()
      .file.create({
        data: {
          id: file.filename,
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
        },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          log.log(e);
        } else {
          throw e;
        }
      });
    if (!filePris) {
      throw {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        error: 'Can\'t create file',
      };
    }
    return {
      id: filePris.id,
      name: filePris.name,
      type: filePris.type,
      size: filePris.size,
      created_at: filePris.created_at,
    };
  };

export const connectFile = 
  async (connect: IFileConnectReq): Promise<IServiceFileConnectRes> => {
    const fileConnectPris = await prisma()
      .fileConnect.upsert({
        where: {
          connect_unique: connect.type + '_' + connect.connect_id.toString(),
        },
        update: {
          type: connect.type,
          connect_id: connect.connect_id,
          file_id: connect.file_id,
        },
        create: {
          type: connect.type,
          connect_id: connect.connect_id,
          connect_unique: connect.type + '_' + connect.connect_id.toString(),
          file_id: connect.file_id,
        },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          log.log(e);
          switch (e.code) {
          case 'P2003':
            throw {
              status: HttpStatusCodes.NOT_FOUND,
              error: 'File not found',
            };
          }
        } else {
          throw e;
        }
      });

    if(!fileConnectPris){
      throw {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        error: 'Can\'t connnect file',
      };
    }
    return {
      id: fileConnectPris.id,
      type: fileConnectPris.type,
      connect_id: fileConnectPris.connect_id,
      connect_unique: fileConnectPris.connect_unique,
      file_id: fileConnectPris.file_id,
    };
  };
