export interface ProfileSiteDto {
  id: string;
  name: string;
}

export interface ProfileDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  site?: ProfileSiteDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequestDto {
  name?: string;
  email?: string;
  password?: string;
}

export interface ApiMessageDto {
  code?: number;
  message?: string;
  data?: { message?: string };
}
