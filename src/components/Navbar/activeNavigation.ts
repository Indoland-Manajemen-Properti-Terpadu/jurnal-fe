const matchesRouteBoundary = (pathname: string, link: string) =>
  pathname === link || pathname.startsWith(`${link}/`);

export function isNavigationLinkActive(
  pathname: string,
  link: string,
  siblingLinks: string[]
): boolean {
  if (!matchesRouteBoundary(pathname, link)) return false;

  const matchingLinks = siblingLinks.filter((candidate) =>
    matchesRouteBoundary(pathname, candidate)
  );
  const mostSpecificLength = Math.max(...matchingLinks.map((candidate) => candidate.length));

  return link.length === mostSpecificLength;
}

export function isNavigationChildActive(
  pathname: string,
  link: string,
  siblingLinks: string[],
  matchPrefixes: string[] = []
): boolean {
  const matchingPrefixes = [link, ...matchPrefixes].filter((prefix) =>
    matchesRouteBoundary(pathname, prefix)
  );
  if (matchingPrefixes.length === 0) return false;

  const matchingSiblings = siblingLinks.filter((candidate) =>
    matchesRouteBoundary(pathname, candidate)
  );
  const mostSpecificLength = Math.max(...matchingSiblings.map((candidate) => candidate.length));

  return matchingPrefixes.some((prefix) => prefix.length === mostSpecificLength);
}
