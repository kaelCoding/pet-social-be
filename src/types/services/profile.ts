export interface IServiceProfileRes {
  id: number;
  user_id: number;
  name: string;
  description: string;
  phone: string;
  address: string;
  birthday: Date;
  gender: boolean;
  posts?: Array<{ id: number }>;
  pets?: Array<{ id: number }>;
  articles?: Array<{ id: number }>;
  created_at: Date;
  avatar?: string | null;
  cover?: string | null;
}

export interface IServiceProfileInfoRes {
  id: number;
  user_id: number;
  name: string;
  avatar?: string | null;
  created_at: Date;
}

export interface IServiceFollowRes {
  follow_id: number;
}

export interface IServiceFollowCountRes {
  followers: Array<IServiceFollowRes>
  followings: Array<IServiceFollowRes>
  followings_pet: Array<IServiceFollowRes>
}