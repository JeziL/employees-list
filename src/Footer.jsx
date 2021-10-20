/* eslint-disable react/forbid-prop-types */

import PropTypes from 'prop-types';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Emitter from './event';
import config from './config.json';

const useStyles = makeStyles({
  footerDiv: {
    textAlign: 'center',
    color: '#586069',
    fontSize: 12,
  },
  updateDiv: {
    marginBottom: 5,
  },
  footerLink: {
    color: '#586069',
    textDecoration: 'none',
  },
});

class Footer extends React.Component {
  constructor() {
    super();

    this.state = {
      updateTime: -1,
    };
  }

  componentDidMount() {
    this.eventEmitter = Emitter.addListener('updateTime', (timestamp) => {
      this.setState({ updateTime: timestamp });
    });
  }

  componentWillUnmount() {
    Emitter.removeListener(this.eventEmitter);
  }

  render() {
    const { classes } = this.props;
    const { updateTime } = this.state;

    const releaseYear = 2021;
    const currentYear = new Date().getFullYear();
    let durationString = `${releaseYear}`;
    if (currentYear > releaseYear) {
      durationString += `-${currentYear}`;
    }

    let updateTimeString = '';
    if (updateTime >= 0) {
      const updateTimeMs = new Date(updateTime * 1000);
      updateTimeString += `数据更新于：${updateTimeMs.toLocaleString('zh-CN')}`;
    }

    return (
      <div className={classes.footerDiv}>
        <div className={classes.updateDiv}>{updateTimeString}</div>
        Copyright ©&nbsp;
        {durationString}
        &nbsp;
        {config.footerInfo.copyright}
        &nbsp;|&nbsp;
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank;"
          className={classes.footerLink}
        >
          {config.footerInfo.icp}
        </a>
      </div>
    );
  }
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired,
};

const FooterHook = () => {
  const classes = useStyles();
  return (
    <Footer classes={classes} />
  );
};
export default FooterHook;
