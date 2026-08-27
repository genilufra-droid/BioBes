export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** All browser login entry points lead to the local account portal. */
export const startLogin = () => {
  window.location.href = "/login";
};
