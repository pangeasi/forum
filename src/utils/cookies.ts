export const getCookie = (cookie: string, key: string) => {
  const cookies = cookie.split("; ");
  const cookieValue = cookies.find((c) => c.startsWith(key));
  return cookieValue?.split("=")[1];
};
