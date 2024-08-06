import { Router } from 'express';

import { AuthRoutes } from './AuthRoutes';
import { ProfileRoutes } from './ProfileRoutes';
import { PostRoutes } from './PostRoutes';
import { PetRoutes } from './PetRoutes';
import { FileRoutes } from './FileRoutes';
import { ConversationRoutes } from './ConversationRoutes';
import { UserRoutes } from './UserRoutes';
import { ArticleRoutes } from './ArticleRoutes';
import { NotiSystemRoutes } from './NotiSystemRoutes';
import { NotificationRoutes } from './NotificationRoutes';
import { ReportRoutes } from './ReportRoutes';

export const apiRouter = Router();

apiRouter.use('/auth', new AuthRoutes().routes);
apiRouter.use('/profiles', new ProfileRoutes().routes);
apiRouter.use('/posts', new PostRoutes().routes);
apiRouter.use('/pets', new PetRoutes().routes);
apiRouter.use('/files', new FileRoutes().routes);
apiRouter.use('/conversations', new ConversationRoutes().routes);
apiRouter.use('/users', new UserRoutes().routes);
apiRouter.use('/articles', new ArticleRoutes().routes);
apiRouter.use('/noti-systems', new NotiSystemRoutes().routes);
apiRouter.use('/notifications', new NotificationRoutes().routes);
apiRouter.use('/reports', new ReportRoutes().routes);