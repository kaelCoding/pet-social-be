export interface IServicePetReq {
  name: string;
  description: string;
  birthday: Date;
  gender: boolean;
  specie_type: string;
}

export interface IServicePetRes {
  id: number;
  name: string;
  description: string;
  birthday: Date;
  gender: boolean;
  profile_id: number;
  specie_type: string;
  created_at: Date;
  posts?: Array<{ id: number }>;
  avatar?: string | null;
  cover?: string | null;
}
