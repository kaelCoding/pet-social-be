import { Prisma } from '@prisma/client';
import { prisma } from '@src/prisma';
import { log } from '@src/utils/log';
import { HttpStatusCodes } from '@src/constants/HttpStatusCodes';
import {
  IConversationRes,
  IMessageReqAuth,
  IMessageRes,
} from '@src/types/conversation';
import { getProfileInfo } from './ProfileService';
import { createUniqueID } from '@src/utils/unique';
import { sendMessSocketUser } from '@src/socket/index';

export const createConversation = async (
  idOwner: number,
  idGuest: number,
): Promise<IConversationRes> => {
  const uniqueID = createUniqueID(idOwner.toString(), idGuest.toString());

  const existingConversation = await prisma().conversation.findFirst({
    where: {
      id_unique: uniqueID,
    },
    include: {
      profile: {
        select: {
          id: true,
        },
      },
      messages: true,
    },
  });

  if (existingConversation) {
    const guest = await getProfileInfo(idGuest);

    return {
      id: existingConversation.id,
      id_guest: idGuest,
      name: guest.name,
      avatar: guest.avatar,
      profiles: existingConversation.profile,
      created_at: existingConversation.created_at,
      messages: existingConversation.messages,
    };
  }

  const conversation = await prisma()
    .conversation.create({
      data: {
        profile: { connect: [{ id: idOwner }, { id: idGuest }] },
        id_unique: uniqueID,
      },
      include: {
        profile: {
          select: {
            id: true,
          },
        },
        messages: true,
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        log.log(e);
      } else {
        throw e;
      }
    });

  if (!conversation) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create conversation',
    };
  }

  const guest = await getProfileInfo(idGuest);

  const conversationReturn = {
    id: conversation.id,
    name: guest.name,
    avatar: guest.avatar,
    id_guest: idGuest,
    profiles: conversation.profile,
    created_at: conversation.created_at,
    messages: conversation.messages,
  };

  for (const profile of conversation.profile) {
    const user_id = (await getProfileInfo(profile.id)).user_id;
    sendMessSocketUser(user_id.toString(), {
      action: 'CONVERSATION_CREATE',
      data: conversationReturn,
    });
  }
  return conversationReturn;
};

export const sendMess = async (
  conversation_id: number,
  message: IMessageReqAuth,
): Promise<IMessageRes> => {
  const idProfile = message._idProfile;

  const conversation = await prisma().conversation.findFirst({
    where: {
      profile: {
        every: {
          OR: [{ id: idProfile }, { id: conversation_id }],
        },
      },
    },
    include: {
      profile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!conversation) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t find conversation',
    };
  }

  const messageCreate = await prisma().message.create({
    data: {
      content: message.content,
      profile: { connect: { id: idProfile } },
      conversation: { connect: { id: conversation.id } },
    },
  });

  if (!messageCreate) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t create message',
    };
  }

  const messReturn = {
    id: messageCreate.id,
    content: messageCreate.content,
    profile_id: messageCreate.profile_id,
    conversation_id: messageCreate.conversation_id,
    created_at: messageCreate.created_at,
  };

  for (const profile of conversation.profile) {
    const user_id = (await getProfileInfo(profile.id)).user_id;
    sendMessSocketUser(user_id.toString(), {
      action: 'CONVERSATION_SEND_MESS',
      data: messReturn,
    });
  }

  return messReturn;
};

export const deleteMess = async (idMess: number): Promise<void> => {
  const message = await prisma().message.findUnique({
    where: {
      id: idMess,
    },
    include: {
      profile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!message) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t find message',
    };
  }

  const conversation = await getConversation(message.conversation_id);

  await prisma().message.delete({
    where: {
      id: idMess,
    },
  });

  for (const profile of conversation.profiles) {
    const user_id = (await getProfileInfo(profile.id)).user_id;
    sendMessSocketUser(user_id.toString(), {
      action: 'CONVERSATION_DELETE_MESS',
      data: {
        conversation_id: conversation.id,
        message_id: idMess,
      },
    });
  }
};

export const getConversation = async (
  idConversation: number,
): Promise<IConversationRes> => {
  const conversationPris = await prisma().conversation.findUnique({
    where: {
      id: idConversation,
    },
    include: {
      profile: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!conversationPris) {
    throw {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Can\'t find conversation',
    };
  }
  return {
    id: conversationPris.id,
    created_at: conversationPris.created_at,
    profiles: conversationPris.profile,
  };
};

export const updateMess = async (
  idMess: number,
  message: IMessageReqAuth,
): Promise<IMessageRes> => {
  const messageCreate = await prisma().message.update({
    where: {
      id: idMess,
    },
    data: {
      content: message.content,
    },
  });

  const conversation = await getConversation(messageCreate.conversation_id);

  const messReturn = {
    id: messageCreate.id,
    content: messageCreate.content,
    profile_id: messageCreate.profile_id,
    conversation_id: messageCreate.conversation_id,
    created_at: messageCreate.created_at,
  };

  for (const profile of conversation.profiles) {
    const user_id = (await getProfileInfo(profile.id)).user_id;
    sendMessSocketUser(user_id.toString(), {
      action: 'CONVERSATION_UPDATE_MESS',
      data: messReturn,
    });
  }

  return messReturn;
};

export const getConversations = async (
  profile_id: number,
): Promise<Array<IConversationRes>> => {
  const conversationsPris = await prisma().conversation.findMany({
    where: {
      profile: {
        some: {
          id: profile_id,
        },
      },
    },
    include: {
      profile: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const conversationsReturn = [];
  for (let i = 0; i < conversationsPris.length; i++) {
    const conversationPris = conversationsPris[i];
    const indexGuest = conversationPris.profile.findIndex(
      (item) => item.id !== profile_id,
    );
    if (indexGuest >= 0) {
      const guest = await getProfileInfo(
        conversationPris.profile[indexGuest].id,
      );
      conversationsReturn.push({
        id: conversationPris.id,
        name: guest.name,
        avatar: guest.avatar,
        id_guest: guest.id,
        created_at: conversationPris.created_at,
        profiles: conversationPris.profile,
      });
    }
  }
  return conversationsReturn;
};
