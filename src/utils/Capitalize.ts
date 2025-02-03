export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

export const CamelCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^\w]+(.)/g, (ltr) => ltr.toUpperCase())
    .replace(/[^a-zA-Z]/g, '');
};
