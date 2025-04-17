const crypto = require('crypto');
const vCardsJS = require('vcards-js');

const getBirthdayFromIDNumber = (idnumber) => {
  if (!idnumber) return null;
  const birthString = idnumber.substring(6, 14);
  return new Date(
    birthString.substring(0, 4),
    birthString.substring(4, 6) - 1,
    birthString.substring(6, 8),
  );
};

export const calcAgeFromIDNumber = (idnumber) => {
  if (!idnumber) {
    return {
      ageDisp: null,
      age: null,
    };
  }
  const birthday = getBirthdayFromIDNumber(idnumber);
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return {
    ageDisp: Math.abs(ageDate.getUTCFullYear() - 1970),
    age: ageDifMs,
  };
};

export const getAddressFromIDNumber = (idnumber, areaCodes) => {
  if (!idnumber) return null;

  const areaCode = idnumber.substring(0, 6);
  const cityCode = `${idnumber.substring(0, 4)}00`;
  const provCode = `${idnumber.substring(0, 2)}0000`;

  if (areaCode in areaCodes) {
    return areaCodes[provCode] + (areaCodes[cityCode] ? areaCodes[cityCode] : '') + areaCodes[areaCode];
  }
  if (cityCode in areaCodes) {
    return areaCodes[provCode] + (areaCodes[cityCode] ? areaCodes[cityCode] : '');
  }
  if (provCode in areaCodes) {
    return areaCodes[provCode];
  }
  return null;
};

export const decryptData = (ct, key) => {
  const keyBuf = Buffer.from(key, 'latin1');
  const comp = ct.split(':');
  const iv = Buffer.from(comp[0], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuf, iv);
  const authTag = Buffer.from(comp[1], 'base64');
  decipher.setAuthTag(authTag);
  let deciphered = decipher.update(comp[2], 'base64', 'utf-8');
  deciphered += decipher.final('utf-8');
  return deciphered;
};

export const generateVCards = (employees) => {
  let vCardsStr = '';
  employees.forEach((employee) => {
    const vCard = vCardsJS();
    vCard.firstName = employee.name.slice(1);
    vCard.lastName = employee.name.slice(0, 1);
    vCard.organization = employee.department;
    vCard.workPhone = employee.phone;
    const birthday = getBirthdayFromIDNumber(employee.idnumber);
    if (birthday) {
      vCard.birthday = birthday;
    }
    if (employee.area) {
      vCard.note = employee.area;
    }
    vCardsStr += vCard.getFormattedString();
  });
  return vCardsStr;
};

export const downloadFile = (filename, content) => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/vcard;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.click();
};

export const getDepartmentInfo = (members, deps) => {
  const data = [];
  deps.forEach((dep) => {
    data.push({
      name: dep,
      value: members.filter((m) => m.department === dep).length,
    });
  });
  return data.sort((a, b) => b.value - a.value);
};

export const getSexRatio = (members, deps) => {
  const data = [];
  let femMin = 1e10;
  let femMax = 0;
  let femMinDep = '';
  let femMaxDep = '';
  deps.forEach((dep) => {
    const total = members.filter((m) => m.department === dep);
    const fem = total.filter((m) => m.sex === '0');
    const femRatio = fem.length / (total.length - fem.length);
    if (femRatio > femMax) {
      femMax = femRatio;
      femMaxDep = dep;
    }
    if (femRatio < femMin) {
      femMin = femRatio;
      femMinDep = dep;
    }
    data.push({
      name: dep,
      value: (1 / femRatio).toFixed(2),
    });
  });

  return {
    minRatio: 1 / femMax,
    minDep: femMaxDep,
    maxRatio: 1 / femMin,
    maxDep: femMinDep,
    allRatio: members.filter((m) => m.sex === '1').length / members.filter((m) => m.sex === '0').length,
    data: data.sort((a, b) => b.value - a.value),
  };
};

const getHistogramData = (numbers, binCount) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return [];
  }

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const binSize = (max - min) / binCount;

  const bins = Array(binCount).fill(0);

  numbers.forEach((num) => {
    let index = Math.floor((num - min) / binSize);
    if (index === binCount) index -= 1; // Edge case for max value
    bins[index] += 1;
  });

  const histogram = bins.map((count, i) => {
    const binStart = min + i * binSize;
    const center = binStart + binSize / 2;
    return [center, count, binStart.toFixed(1), (binStart + binSize).toFixed(1)];
  });

  return histogram;
};

export const getAgeInfo = (members) => {
  let minAge = Infinity;
  let maxAge = -Infinity;
  let maxAgeName = '';
  let minAgeName = '';
  let sumAge = 0;
  const ages = [];
  const byMonthDay = {};
  members.forEach((m) => {
    if (m.age > 0) {
      if (m.age > maxAge) {
        maxAge = m.age;
        maxAgeName = m.name;
      }
      if (m.age < minAge) {
        minAge = m.age;
        minAgeName = m.name;
      }
      sumAge += m.age / 1000;
      ages.push(m.age / 1000 / 31536000);
    }
    if (m.idnumber && m.idnumber.length === 18) {
      const birth = m.idnumber.slice(6, 14);
      const monthDay = birth.slice(4);

      if (!byMonthDay[monthDay]) byMonthDay[monthDay] = [];

      byMonthDay[monthDay].push(m.name);
    }
  });

  let maxMonthDayCount = 0;
  let maxMonthDay = '';

  Object.entries(byMonthDay).forEach(([md, names]) => {
    if (names.length > maxMonthDayCount) {
      maxMonthDayCount = names.length;
      maxMonthDay = md;
    }
  });

  const maxMonth = parseInt(maxMonthDay.slice(0, 2), 10);
  const maxDay = parseInt(maxMonthDay.slice(2), 10);

  return {
    average: (sumAge / members.length / 31536000).toFixed(2),
    min: (minAge / 1000 / 31536000).toFixed(2),
    minName: minAgeName,
    max: (maxAge / 1000 / 31536000).toFixed(2),
    maxName: maxAgeName,
    ages,
    hist: getHistogramData(ages, 20),
    maxMonthDay: `${maxMonth} 月 ${maxDay} 日`,
    maxMonthDayCount,
  };
};

export const getAddressInfo = (members, level = 'province') => {
  const data = {};
  members.forEach((m) => {
    const { idnumber } = m;
    if (idnumber) {
      const cityCode = `${idnumber.substring(0, 4)}00`;
      const provCode = `${idnumber.substring(0, 2)}0000`;
      const code = level === 'city' ? cityCode : provCode;
      if (code in data) {
        data[code] += 1;
      } else {
        data[code] = 1;
      }
    }
  });
  const codeMap = {
    110000: '北京市',
    120000: '天津市',
    130000: '河北省',
    140000: '山西省',
    150000: '内蒙古自治区',
    210000: '辽宁省',
    220000: '吉林省',
    230000: '黑龙江省',
    310000: '上海市',
    320000: '江苏省',
    330000: '浙江省',
    340000: '安徽省',
    350000: '福建省',
    360000: '江西省',
    370000: '山东省',
    410000: '河南省',
    420000: '湖北省',
    430000: '湖南省',
    440000: '广东省',
    450000: '广西壮族自治区',
    460000: '海南省',
    500000: '重庆市',
    510000: '四川省',
    520000: '贵州省',
    530000: '云南省',
    540000: '西藏自治区',
    610000: '陕西省',
    620000: '甘肃省',
    630000: '青海省',
    640000: '宁夏回族自治区',
    650000: '新疆维吾尔自治区',
    710000: '台湾省',
    810000: '香港特别行政区',
    820000: '澳门特别行政区',
  };
  const ret = [];
  Object.entries(data).forEach(([name, value]) => {
    ret.push({ name: codeMap[name], value });
  });
  return ret;
};

export const getNameInfo = (members) => {
  const fuxingList = ['欧阳', '上官', '皇甫', '令狐', '诸葛', '司徒', '司马', '申屠', '夏侯', '贺兰', '完颜', '慕容', '尉迟', '长孙'];
  const surnameMap = {};
  const nameMap = {};
  members.forEach(({ name }) => {
    if (name && name.length >= 2) {
      if (name in nameMap) {
        nameMap[name] += 1;
      } else {
        nameMap[name] = 1;
      }

      const fuxingTest = name.slice(0, 2);
      if (fuxingList.includes(fuxingTest)) {
        if (fuxingTest in surnameMap) {
          surnameMap[fuxingTest] += 1;
        } else {
          surnameMap[fuxingTest] = 1;
        }
      } else {
        const surname = name.slice(0, 1);
        if (surname in surnameMap) {
          surnameMap[surname] += 1;
        } else {
          surnameMap[surname] = 1;
        }
      }
    }
  });

  let maxNameCount = 0;
  let maxName = '';
  Object.entries(nameMap).forEach(([name, value]) => {
    if (value > maxNameCount) {
      maxNameCount = value;
      maxName = name;
    }
  });

  const surnameData = [];
  let maxSurnameCount = 0;
  let maxSurname = '';
  Object.entries(surnameMap).forEach(([name, value]) => {
    surnameData.push({ name, value });
    if (value > maxSurnameCount) {
      maxSurnameCount = value;
      maxSurname = name;
    }
  });

  return {
    maxName,
    maxNameCount,
    maxSurname,
    maxSurnameCount,
    surnameData: surnameData.sort((a, b) => b.value - a.value),
  };
};
