// The back end's address: VITE_API_URL, such as https://webapi.makeonward.com. Without it the site asks its own
// domain, and Vercel (vercel.json) or the dev server (vite.config.js) passes the request on.
const API_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "").replace(/\/api$/, "");

export const apiFetch = (path, options) => fetch(`${API_URL}${path}`, options);
