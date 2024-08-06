export type IServiceArticleLikeRes = Array<{profile_id: number}>

export interface IServiceArticleRes {
    id: number,
    title: string,
    content: string,
    description: string,
    profile_id: number,
    created_at: Date,
    article_likes: IServiceArticleLikeRes,
    article_comments: Array<IServiceArticleCommentRes>,
    cover: string,
    view: number,
  }

export interface IServiceArticleCommentRes {
  id: number,
  content: string,
  profile_id: number,
  article_id: number,
  created_at: Date,
}