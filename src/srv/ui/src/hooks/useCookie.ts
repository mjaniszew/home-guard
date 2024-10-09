import { useState, useCallback } from "react";
import Cookies from 'js-cookie';

type Cookie = string | Record<string, any>;

export const useCookie = (cookieName: string, defaultValue: Cookie = '') => {
  const [value, setValue] = useState(() => {
    const cookie = Cookies.get(cookieName)
    if (cookie) return JSON.parse(cookie)
    Cookies.set(cookieName, JSON.stringify(defaultValue))
    return defaultValue
  })

  const setCookie = useCallback(
    (newValue: Cookie, options: Record<string, string>) => {
      Cookies.set(cookieName, JSON.stringify(newValue), options)
      setValue(newValue)
    },
    [cookieName]
  )

  const deleteCookie = useCallback(() => {
    Cookies.remove(cookieName)
    setValue(null)
  }, [cookieName])

  return [value, setCookie, deleteCookie]
}