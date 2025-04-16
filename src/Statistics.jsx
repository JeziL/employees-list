import React from 'react';
import Button from '@material-ui/core/Button';
import ListAltIcon from '@material-ui/icons/ListAlt';
import Emitter from './event';

const Statistics = () => (
  <div>
    <Button variant="outlined" color="primary" onClick={() => { Emitter.emit('switch-table'); }}>
      <ListAltIcon />
      &ensp;切换至列表视图
    </Button>
  </div>
);

export default Statistics;
