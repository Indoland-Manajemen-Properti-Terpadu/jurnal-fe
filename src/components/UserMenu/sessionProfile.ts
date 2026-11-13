export interface SessionProfileDto {
  name?: string;
  email?: string;
  role?: string;
  site?: { id?: string; name?: string; external_site_id?: string };
}

export interface SessionProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
  site?: { name: string; code?: string };
}

const titleCase = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

/** Who is signed in, as the header shows it: a tidy name, its initials, the role and the company (site). */
export const toSessionProfile = (dto: SessionProfileDto): SessionProfile => {
  const name = titleCase(dto.name ?? '');
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase() || '?';
  return {
    name,
    email: dto.email ?? '',
    role: titleCase(dto.role ?? ''),
    initials,
    site: dto.site?.name ? { name: dto.site.name, code: dto.site.external_site_id } : undefined,
  };
};
