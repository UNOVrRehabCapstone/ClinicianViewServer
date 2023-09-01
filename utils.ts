const generateId = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateUniqueId = (length: number, sessionKeyList: String[]) => {
  let id = generateId(length);
  while (sessionKeyList.includes(id)) {
    id = generateId(length);
  }
  return id;
};
