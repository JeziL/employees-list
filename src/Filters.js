import Button from '@material-ui/core/Button';
import Clear from '@material-ui/icons/Clear';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
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
    alignItems: 'center'
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: '10%',
  },
  filterBtn: {
    margin: theme.spacing(3, 1, 1),
  }
}));

class Filters extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      sex: '',
      phone: '',
      idno: '',
      department: '',
      age: [0, 120],
      area: ''
    };

    this.clearFilters = this.clearFilters.bind(this);
    this.search = this.search.bind(this);
  }

  clearFilters() {
    this.setState({
      name: '',
      sex: '',
      phone: '',
      idno: '',
      department: '',
      age: [0, 120],
      area: ''
    });
  }

  search() {
    Emitter.emit('search', this.state);
  }

  render() {
    const classes = this.props.classes;

    return (
      <div className={classes.inputForm}>

        <FormControl className={classes.formControl}>
          <TextField id="filter-name" label="姓名"
            value={this.state.name}
            onChange={(e) => { this.setState({ name: e.target.value }) }}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel id="filter-sex-label">性别</InputLabel>
          <Select
            labelId="filter-sex-label"
            id="filter-sex"
            value={this.state.sex}
            onChange={(e) => { this.setState({ sex: e.target.value }) }}
          >
            <MenuItem value={''}>&nbsp;</MenuItem>
            <MenuItem value={'1'}>男</MenuItem>
            <MenuItem value={'0'}>女</MenuItem>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField id="filter-phone" label="手机号"
            value={this.state.phone}
            onChange={(e) => { this.setState({ phone: e.target.value }) }}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField id="filter-id" label="身份证号"
            value={this.state.idno}
            onChange={(e) => { this.setState({ idno: e.target.value }) }}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField id="filter-department" label="部门"
            value={this.state.department}
            onChange={(e) => { this.setState({ department: e.target.value }) }}
          />
        </FormControl>

        <FormControl className={classes.formControl} style={{minWidth: '20%'}}>
          <Typography id="range-slider" color='primary' gutterBottom>
            年龄
          </Typography>
          <Slider
            min={0}
            max={120}
            value={this.state.age}
            onChange={(_e, v) => { this.setState({ age: v }) }}
            valueLabelDisplay="auto"
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField id="filter-area" label="籍贯"
            value={this.state.area}
            onChange={(e) => { this.setState({ area: e.target.value }) }}
          />
        </FormControl>

        <Button variant="outlined" className={classes.filterBtn} onClick={this.clearFilters}>
          <Clear />清空
        </Button>

        <Button variant="contained" color="primary" className={classes.filterBtn} onClick={this.search}>
          <Search />搜索
        </Button>

      </div>
    );
  }
}

const FiltersHook = () => {
  const classes = useStyles();
  return (
    <Filters classes={classes} />
  );
};
export default FiltersHook;
