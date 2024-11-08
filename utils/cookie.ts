import { sessionConfig } from "./config";

/**
 * Set a cookie with an optional expiration time.
 * @param name - Cookie name.
 * @param value - Cookie value.
 * @param days - Number of days before the cookie expires. If not provided, the cookie is a session cookie.
 */
export const setCookie = (name: string, value: string, days?: number) => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 864e5); // 864e5 is 1 day in milliseconds
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
};
  
/**
 * Get a cookie by name.
 * @param name - Cookie name.
 * @returns The value of the cookie or null if the cookie does not exist.
 */
export const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};
  
/**
 * Remove a cookie by setting its expiration date to a past date.
 * @param name - Cookie name.
 */
export const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};
  
/**
 * Get the session token from cookies.
 * @returns The session token if available, or null if not.
 */
export const getSessionToken = (): string | null => {
    return getCookie(sessionConfig.cookie);
};
  
/**
 * Set the session token in cookies. Optionally set an expiration time (7 days).
 * @param token - The session token to store.
 * @param rememberMe - Whether to persist the token for 7 days (defaults to false).
 */
export const setSessionToken = (token: string, rememberMe: boolean = false) => {
    setCookie(sessionConfig.cookie, token, rememberMe ? sessionConfig.duration: undefined); // duration if rememberMe is true, else session cookie
};

/**
 * Remove the session token from cookies.
 */
export const removeSessionToken = () => {
    removeCookie(sessionConfig.cookie);
};