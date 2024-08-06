import { Prisma } from '@prisma/client';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import { prisma } from '@src/prisma';
import { IRegisterReq } from '@src/types/auth';
import { IServiceUserRes } from '@src/types/services/user';


export const getUsers = 
  async (): Promise<Array<IServiceUserRes>> => {
    const users = await prisma().user.findMany({
      select: {
        id: true,
        email: true,
        created_at: true,
        role: true,
        password: false,
      },
    });
    return users;
  };

export const getUserByEmail = 
  async (email: string): Promise<IServiceUserRes> => {
    const user = await prisma().user.findUnique({
      where: {
        email: email,
      },
      include:{
        profile: {
          select: {
            id: true,
          },
        },
      },
    });
    if(!user){
      throw({
        status: HttpStatusCodes.NOT_FOUND,
        error: 'Not Found User',
      });
    }
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      profile_id: user.profile?.id,
      role: user.role,
    };
  };

export const loginUser = 
  async (email: string, password: string ): Promise<IServiceUserRes> => {
    const user = await prisma().user.findUnique({
      where: {
        email: email,
      },
      include:{
        profile: {
          select: {
            id: true,
          },
        },
      },
    });
    if(!user){
      throw({
        status: HttpStatusCodes.NOT_FOUND,
        error: 'Not Found User',
      });
    }
    if(user.password !== password){
      throw({
        status: HttpStatusCodes.BAD_REQUEST,
        error: 'Email or password not true',
      });
    }
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      profile_id: user.profile?.id,
      role: user.role,
    };
  };


export const getUserById = async (id: number): Promise<IServiceUserRes> => {
  const user = await prisma().user.findUnique({
    where: {
      id: id,
    },
    include:{
      profile: {
        select: {
          id: true,
          avatar: true,
          block: true,
        },
      },
    },
  });
  if(!user){
    throw({
      status: HttpStatusCodes.NOT_FOUND,
      error: 'Not Found User',
    });
  }

  let avatar = undefined;
  if(user.profile){
    if(user.profile.avatar){
      avatar = user.profile.avatar;
    }
    if(user.profile.block){
      throw({
        status: HttpStatusCodes.BAD_REQUEST,
        error: 'Your account has been block',
      });
    }
  }

  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    profile_id: user.profile?.id,
    role: user.role,
    avatar: avatar,
  };
};

export const createUser = 
 async (User: IRegisterReq): Promise<IServiceUserRes>=>{
   const user = await prisma()
     .user.create({
       data: {
         email: User.email,
         password: User.password,
       },
     }).catch(e => {
       if (e instanceof Prisma.PrismaClientKnownRequestError) {
         if (e.code === 'P2002') {
           throw({
             status: HttpStatusCodes.BAD_REQUEST,
             error: 'Email is used',
           });
         }
       }else {
         throw e;
       }
     });
   if(!user){
     throw({
       status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
       error: 'Can\'t create user',
     });
   }
   return {
     id: user.id,
     email: user.email,
     created_at: user.created_at,
     profile_id: undefined,
     role: user.role,
   };
 };

