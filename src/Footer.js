import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Emitter from './event';
import config from './config.json';

const useStyles = makeStyles({
  footerDiv: {
    textAlign: 'center',
    color: '#586069',
    fontSize: 12
  },
  updateDiv: {
    marginBottom: 5
  },
  footerLink: {
    color: '#586069',
    textDecoration: 'none'
  }
});

class Footer extends React.Component {
  constructor() {
    super()

    this.state = {
      updateTime: -1
    }
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
    const classes = this.props.classes;

    const releaseYear = 2021;
    const currentYear = new Date().getFullYear();
    let durationString = `${releaseYear}`;
    if (currentYear > releaseYear) {
      durationString += `-${currentYear}`;
    }

    let updateTimeString = '';
    if (this.state.updateTime >= 0) {
      const updateTime = new Date(this.state.updateTime * 1000);
      updateTimeString += `数据更新于：${updateTime.toLocaleString('zh-CN')}`;
    }

    return (
      <div className={classes.footerDiv}>
        <div className={classes.updateDiv}>{updateTimeString}</div>
        Copyright © {durationString} {config.footerInfo.copyright}&nbsp;|&nbsp;
        <a href='http://www.beian.miit.gov.cn/'
          target='_blank;'
          className={classes.footerLink}>
          {config.footerInfo.icp}
        </a>
      </div>
    );
  }
}

const FooterHook = () => {
  const classes = useStyles();
  return (
    <Footer classes={classes} />
  );
};
export default FooterHook;
