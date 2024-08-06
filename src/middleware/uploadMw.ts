import multer from 'multer';
import { EnvVars } from '@src/constants/EnvVars';

export function uploadMw():  multer.Multer{
  const upload = multer({ dest: EnvVars.FolderFile });
  return upload;
}