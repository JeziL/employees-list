/* eslint-disable global-require */
import Container from '@material-ui/core/Container';
import React, { useEffect, useState } from 'react';
import EmployeeTable from './EmployeeTable';
import Filters from './Filters';
import Footer from './Footer';
import Emitter from './event';
import {
  calcAgeFromIDNumber,
  getAddressFromIDNumber,
  decryptData,
} from './utils';
import Statistics from './Statistics';

function App() {
  let eventListener;
  const [view, setView] = useState('table');

  const config = process.env.REACT_APP_CI === 'github_ci' ? JSON.parse(process.env.REACT_APP_PROJ_CONFIG) : require('./config.json');

  const loadEmployees = async (areaCodes) => {
    fetch(config.dataSource.list)
      .then((response) => response.text())
      .then((ct) => {
        const deciphered = decryptData(ct, config.updateData.encryptKey);
        return JSON.parse(deciphered);
      })
      .then((obj) => {
        const members = obj.data.map((m) => ({
          ...m,
          age: calcAgeFromIDNumber(m.idnumber).age,
          ageDisp: calcAgeFromIDNumber(m.idnumber).ageDisp,
          area: getAddressFromIDNumber(m.idnumber, areaCodes),
        }));
        Emitter.emit('employee-data', members);
        Emitter.emit('departmentList', [...new Set(members.map((m) => m.department))].sort((a, b) => a.localeCompare(b)));
        Emitter.emit('updateTime', obj.updateTime);
      });
  };

  const loadData = () => {
    fetch(config.dataSource.areaCode)
      .then((response) => response.json())
      .then((areaCodes) => {
        loadEmployees(areaCodes);
      });
  };

  useEffect(() => {
    loadData();
    eventListener = Emitter.addListener('switch-stat', () => { setView('stat'); });
    eventListener.addListener('switch-table', () => { setView('table'); });
    return () => {
      if (typeof eventListener === 'function') {
        Emitter.removeListener(eventListener);
      }
    };
  }, []);

  return (
    <Container fixed>
      <div id="table-view" hidden={view === 'stat'}>
        <Filters />
        <br />
        <EmployeeTable />
        <br />
      </div>
      <div id="stat-view" hidden={view === 'table'}>
        <Statistics />
      </div>
      <Footer />
      <br />
    </Container>
  );
}

export default App;
