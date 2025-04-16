import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import ListAltIcon from '@material-ui/icons/ListAlt';
import Emitter from './event';

const Statistics = () => {
  let eventListener;
  const [members, setMembers] = useState([]);

  useEffect(() => {
    eventListener = Emitter.addListener('employee-data', (employees) => { setMembers(employees); });
    return () => {
      if (typeof eventListener === 'function') {
        Emitter.removeListener(eventListener);
      }
    };
  }, []);

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={() => { Emitter.emit('switch-table'); }}>
        <ListAltIcon />
        &ensp;切换至列表视图
      </Button>
      <p>
        总人数：
        {members.length}
      </p>
    </div>
  );
};

export default Statistics;
