/* eslint-disable global-require */
/* eslint-disable react/forbid-prop-types */

import PropTypes from 'prop-types';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Emitter from './event';

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

    if (process.env.REACT_APP_CI === 'github_ci') {
      this.config = JSON.parse(process.env.REACT_APP_PROJ_CONFIG);
    } else {
      this.config = require('./config.json');
    }
  }

  componentDidMount() {
    this.eventEmitter = Emitter.addListener('updateTime', (timestamp) => {
      this.setState({ updateTime: timestamp });
    });
  }

  componentWillUnmount() {
    if (typeof this.eventEmitter === 'function') {
      Emitter.removeListener(this.eventEmitter);
    }
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
        {this.config.footerInfo.copyright}
        &nbsp;|&nbsp;
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank;"
          className={classes.footerLink}
        >
          {this.config.footerInfo.icp}
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
