const fs = require("fs");
const axios = require("axios");

const parseEmployees = (resp) => {
  const PHONE_REG = /^\d+$/;
  const ID_REG = /^\d{17}[xX\d]$/;

  const obj = resp.data;
  const groups = obj.data.trip_department_employees;

  let members = [];

  groups.forEach(group => {
    group.forEach(member => {
      let mem = {};

      mem.name = member.member_name;

      if (!PHONE_REG.test(member.member_phone)) {
        mem.phone = member.number;
      } else {
        mem.phone = member.member_phone;
      }

      if (!ID_REG.test(member.certification_number)) {
        mem.idnumber = null;
      } else {
        mem.idnumber = member.certification_number.toUpperCase();
      }

      if (mem.idnumber) {
        const sexIdentifier = parseInt(mem.idnumber[16]);
        mem.sex = (sexIdentifier % 2 === 0) ? "0" : "1";
      } else {
        if (member.member_sex !== "0" && member.member_sex !== "1") {
          mem.sex = null;
        } else {
          mem.sex = member.member_sex;
        }
      }

      mem.memid = member.member_id

      mem.department = member.trip_department_name;

      members.push(mem);
    });
  });

  fs.writeFileSync("employees.json", JSON.stringify({
    data: members,
    updateTime: Math.floor(Date.now() / 1000)
  }));
}

const config = JSON.parse(fs.readFileSync("../../src/config.json"));

axios({
  method: "post",
  url: config.updateData.url,
  headers: config.updateData.headers,
  data: JSON.stringify(config.updateData.body)
})
  .then(parseEmployees)
  .catch((error) => {
    console.log(error);
  });
