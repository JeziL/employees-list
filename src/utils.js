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
