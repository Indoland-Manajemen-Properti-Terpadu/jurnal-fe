import type { Profile, UpdateProfileInput } from '../domain/profile';
import type { ProfileDto, UpdateProfileRequestDto } from './profileDto';

export const toProfile = (dto: ProfileDto): Profile => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  isEmailVerified: dto.isEmailVerified,
  site: dto.site ? { id: dto.site.id, name: dto.site.name } : undefined,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toUpdateRequest = ({
  id: _id,
  ...fields
}: UpdateProfileInput): UpdateProfileRequestDto => fields;
