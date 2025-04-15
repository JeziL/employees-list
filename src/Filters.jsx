/* eslint-disable react/forbid-prop-types */

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Clear from '@material-ui/icons/Clear';
import CloudDownload from '@material-ui/icons/CloudDownload';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import Search from '@material-ui/icons/Search';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Emitter from './event';

const useStyles = makeStyles((theme) => ({
  inputForm: {
    display: 'block',
    alignItems: 'center',
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: '10%',
  },
  filterBtn: {
    margin: theme.spacing(3, 1, 1),
  },
}));

class Filters extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      sex: '',
      phone: '',
      idno: '',
      department: [],
      deps: [],
      age: [0, 120],
      area: '',
    };
  }

  componentDidMount() {
    this.eventEmitter = Emitter.addListener('departmentList', (deps) => {
      this.setState({ deps });
    });
  }

  componentWillUnmount() {
    Emitter.removeListener(this.eventEmitter);
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.search();
    }
  }

  search = () => {
    Emitter.emit('search', this.state);
  }

  clearFilters = () => {
    this.setState({
      name: '',
      sex: '',
      phone: '',
      idno: '',
      department: [],
      age: [0, 120],
      area: '',
    });
  }

  render() {
    const { classes } = this.props;
    const {
      name,
      sex,
      phone,
      idno,
      department,
      deps,
      age,
      area,
    } = this.state;

    return (
      <div className={classes.inputForm}>

        <FormControl className={classes.formControl}>
          <TextField
            label="姓名"
            value={name}
            onChange={(e) => { this.setState({ name: e.target.value }); }}
            onKeyPress={this.handleKeyPress}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel id="filter-sex-label">性别</InputLabel>
          <Select
            labelId="filter-sex-label"
            id="filter-sex"
            value={sex}
            onChange={(e) => { this.setState({ sex: e.target.value }); }}
          >
            <MenuItem value="">&nbsp;</MenuItem>
            <MenuItem value="1">男</MenuItem>
            <MenuItem value="0">女</MenuItem>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField
            label="手机号"
            value={phone}
            onChange={(e) => { this.setState({ phone: e.target.value }); }}
            onKeyPress={this.handleKeyPress}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField
            label="身份证号"
            value={idno}
            onChange={(e) => { this.setState({ idno: e.target.value }); }}
            onKeyPress={this.handleKeyPress}
          />
        </FormControl>

        <FormControl className={classes.formControl} style={{ maxWidth: '50%' }}>
          <InputLabel id="filter-dep-label">部门</InputLabel>
          <Select
            labelId="filter-dep-label"
            id="filter-dep"
            multiple
            value={department}
            renderValue={(selected) => selected.join(', ')}
            onChange={(e) => { this.setState({ department: e.target.value }); }}
          >
            <MenuItem value="">&nbsp;</MenuItem>
            {
              deps.map((dep) => (
                <MenuItem key={dep} value={dep}>
                  <Checkbox checked={department.includes(dep)} />
                  <ListItemText primary={dep} />
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>

        <FormControl className={classes.formControl} style={{ minWidth: '20%' }}>
          <Typography id="range-slider" color="primary" gutterBottom>
            年龄
          </Typography>
          <Slider
            min={0}
            max={120}
            value={age}
            onChange={(_e, v) => { this.setState({ age: v }); }}
            valueLabelDisplay="auto"
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField
            label="籍贯"
            value={area}
            onChange={(e) => { this.setState({ area: e.target.value }); }}
            onKeyPress={this.handleKeyPress}
          />
        </FormControl>

        <Button variant="outlined" className={classes.filterBtn} onClick={this.clearFilters}>
          <Clear />
          &ensp;清空
        </Button>

        <Button variant="contained" color="primary" className={classes.filterBtn} onClick={this.search}>
          <Search />
          &ensp;搜索
        </Button>

        <Button variant="outlined" color="primary" className={classes.filterBtn} onClick={() => { Emitter.emit('save'); }}>
          <CloudDownload />
          &ensp;保存
        </Button>

      </div>
    );
  }
}

Filters.propTypes = {
  classes: PropTypes.object.isRequired,
};

const FiltersHook = () => {
  const classes = useStyles();
  return (
    <Filters classes={classes} />
  );
};
export default FiltersHook;
