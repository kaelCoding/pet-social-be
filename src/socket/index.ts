import { EnvVars } from '@src/constants/EnvVars';
import { log } from '@src/utils/log';
import WebSocket from 'ws';
import { decodeToken, ITokenReturn } from '@src/utils/token';
import { getUserById } from '@src/services/UserService';

type Clients = {
  [clientId: string]: Array<WebSocket>;
};

const clients: Clients = {};

/*
 * clients = {
    idA: [socket, ...],
    idB: [socket, ...]
 }
 */
// let clients = {};

interface WebSocketCustom extends WebSocket {
  idClient?: string;
}

export type TypeMessSocket = {
  action: string;
  data?: any;
};

export const run = (): void => {
  const server = new WebSocket.Server({
    port: EnvVars.PortSocket,
  });
  server.on('connection', (socket): void => {
    try {
      socket.on('message', (msg): void => {
        const msgString = msg.toString();

        const data = JSON.parse(msgString) as TypeMessSocket;
        process_mess(socket, data);
      });
    } catch (e) {
      log.err(e);
    }
  });
};

// handle process when clients request socket
const process_mess = (soc: WebSocketCustom, data: TypeMessSocket): void => {
  try {
    switch (data.action) {
    case 'CONNECT_SOCKET':
      init_connect_socket(soc, data);
      break;
    }
  } catch (e) {
    console.log(e);
  }
};

// init client connect socket
const init_connect_socket = async (
  soc: WebSocketCustom,
  data: TypeMessSocket,
): Promise<void> => {
  try {
    const authHeader = data.data as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      const jwt = (await decodeToken(token)) as ITokenReturn;
      const user = await getUserById(jwt.id);

      if (!user) {
        return;
      }

      const idClient = user.id.toString();

      soc.idClient = idClient;

      if (!clients[idClient]) {
        clients[idClient] = [];
      }
      clients[idClient].push(soc);

      send_mess_socket(soc, {
        action: 'STATUS_SOCKET',
        data: {
          messages: 'success',
        },
      });

      // Remove handle when close connect
      soc.on('close', () => {
        try {
          const idClient = soc.idClient as string;

          console.log("on close socket ", idClient, clients[idClient])
          if (clients[idClient]) {
            const idx = clients[idClient].findIndex((item) => item == soc);

            console.log("idx socket close ", idx)
            if (idx >= 0) {
              clients[idClient].splice(idx, 1);
            }
          }
          console.log("socket now ", clients)
        } catch (e) {
          console.log(e);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

//Send message to socket client
const send_mess_socket = (soc: WebSocketCustom, mess: TypeMessSocket): void => {
  try {
    soc.send(JSON.stringify(mess));
  } catch (e) {
    console.log(e);
  }
};

export const sendMessSocketUser = (
  idClient: string,
  mess: TypeMessSocket,
): void => {
  console.log('send mess socket ', idClient);
  const users = clients[idClient];
  console.log(users)
  console.log("socket now ", clients)
  if (users) {
    for (const user of users) {
      if (user) {
        send_mess_socket(user, mess);
      }
    }
  }
};

setInterval(() => {
  try {
    for (const key in clients) {
      if (clients[key]) {
        for (const soc of clients[key]) {
          send_mess_socket(soc, {
            action: 'PIN',
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}, 20000);

//wss:localhost:5001
