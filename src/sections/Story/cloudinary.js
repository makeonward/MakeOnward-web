// Sized, compressed copies of a Cloudinary picture. Any other URL is returned untouched.
const MARK = "/image/upload/";

export const cldUrl = (url, width) =>
  url.includes("res.cloudinary.com") && url.includes(MARK)
    ? url.replace(MARK, `${MARK}f_auto,q_auto,c_limit,w_${width}/`)
    : url;

export const cldSrcSet = (url) =>
  cldUrl(url, 1) === url ? undefined : [800, 1200, 1600, 2000].map((w) => `${cldUrl(url, w)} ${w}w`).join(", ");
