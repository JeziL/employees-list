const crypto = require("crypto");

export const calcAgeFromIDNumber = (idnumber) => {
  if (!idnumber) return null;
  const birthString = idnumber.substring(6, 14);
  const birthday = new Date(
    birthString.substring(0, 4),
    birthString.substring(4, 6) - 1,
    birthString.substring(6, 8)
  );
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export const getAddressFromIDNumber = (idnumber, areaCodes) => {
  if (!idnumber) return null;

  const areaCode = idnumber.substring(0, 6);
  const cityCode = idnumber.substring(0, 4) + '00';
  const provCode = idnumber.substring(0, 2) + '0000';

  if (areaCode in areaCodes) {
    return areaCodes[provCode] + (areaCodes[cityCode] ? areaCodes[cityCode] : '') + areaCodes[areaCode];
  } else if (cityCode in areaCodes) {
    return areaCodes[provCode] + (areaCodes[cityCode] ? areaCodes[cityCode] : '');
  } else if (provCode in areaCodes) {
    return areaCodes[provCode];
  } else {
    return null;
  }
}

export const decryptData = (ct, key) => {
  const keyBuf = Buffer.from(key, "latin1");
  const comp = ct.split(":");
  const iv = Buffer.from(comp[0], "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuf, iv);
  const authTag = Buffer.from(comp[1], "base64");
  decipher.setAuthTag(authTag);
  let deciphered = decipher.update(comp[2], "base64", "utf-8");
  deciphered += decipher.final("utf-8");
  return deciphered;
};
