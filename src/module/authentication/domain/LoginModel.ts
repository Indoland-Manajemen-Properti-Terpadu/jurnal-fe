export type LoginModel = {
  user?: User;
  tokens?: Tokens;
};

export type Tokens = {
  access?: Access;
  refresh?: Access;
};

export type Access = {
  token?: string;
  expires?: Date;
};

export type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  accessRole?: AccessRole[];
  isEmailVerified?: boolean;
  site?: Site;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Site = {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface AccessRole {
  menu?: MenuEntity[] | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}
export interface MenuEntity {
  route: string;
  method: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}
