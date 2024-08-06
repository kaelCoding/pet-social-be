export type IServicePostLikeRes = Array<{ profile_id: number }>;

export interface IServicePostRes {
  id: number;
  title: string;
  content: string;
  profile_id: number;
  created_at: Date;
  pets: Array<{ id: number }>;
  post_likes: IServicePostLikeRes;
  post_comments: Array<IServicePostCommentRes>;
  hashtags: Array<IServiceHashtagRes>;
  files: Array<IServiceFilePostRes>;
}

export interface IServicePostCommentRes {
  id: number;
  content: string;
  profile_id: number;
  post_id: number;
  created_at: Date;
}

export interface IServiceHashtagRes {
  tag: string;
}

export interface IServiceFilePostRes {
  id: number;
  link: string;
}
