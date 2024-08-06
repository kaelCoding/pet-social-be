/* eslint-disable node/no-process-env */

export const EnvVars = {
  NodeEnv: process.env.NODE_ENV ?? '',
  Port: process.env.PORT ?? 0,
  PortSocket: Number(process.env.PORT_SOCKET ?? 8001),
  ApiBasePath: process.env.API_BASE_PATH ?? '',
  FolderFile: process.env.FILE_FOLDER ?? '.uploads',
  CookieProps: {
    Key: 'ExpressGeneratorTs',
    Secret: process.env.COOKIE_SECRET ?? '',
    // Casing to match express cookie options
    Options: {
      httpOnly: true,
      signed: true,
      path: process.env.COOKIE_PATH ?? '',
      maxAge: Number(process.env.COOKIE_EXP ?? 0),
      domain: process.env.COOKIE_DOMAIN ?? '',
      secure: process.env.SECURE_COOKIE === 'true',
    },
  },
  Jwt: {
    Secret: process.env.JWT_SECRET ?? '',
    Exp: process.env.COOKIE_EXP ?? '', // exp at the same time as the cookie
  },
  Logger: {
    JetLoggerMode: process.env.JET_LOGGER_MODE ?? '',
    JetLoggerFilePath: process.env.JET_LOGGER_FILEPATH,
    JetLoggerDatetime: process.env.JET_LOGGER_FILEPATH_DATETIME === 'true',
    JetLoggerTimestamp: process.env.JET_LOGGER_TIMESTAMP === 'true',
    JetLoggerFormat: process.env.JET_LOGGER_FORMAT,
  },
} as const;
