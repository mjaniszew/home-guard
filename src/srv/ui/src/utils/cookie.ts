import Cookies from 'js-cookie';

export const getCookieObject = (name: string) => {
  const cookieString = Cookies.get(name);
  if (!cookieString) return null;
  return JSON.parse(cookieString);
}