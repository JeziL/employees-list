import FirstPageIcon from '@material-ui/icons/FirstPage';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import config from './config.json';
import Emitter from './event';
import { calcAgeFromIDNumber, getAddressFromIDNumber, decryptData } from "./utils";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const useStyles1 = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}));

function TablePaginationActions(props) {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

class EmployeeTable extends React.Component {
  constructor() {
    super();

    this.state = {
      employees: [],
      allEmployees: [],
      areaCodes: {},
      page: 0,
      rowsPerPage: 10
    };

    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.filterEmployee = this.filterEmployee.bind(this);
  }

  handleChangePage(_event, newPage) {
    this.setState({ page: newPage });
  }

  handleChangeRowsPerPage(event) {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10) });
    this.setState({ page: 0 });
  }

  loadData() {
    fetch('https://cdn.jsdelivr.net/gh/JeziL/employees-list/data/areaCodes.json')
      .then((response) => {
        return response.json();
      })
      .then((obj) => {
        this.setState({ areaCodes: obj });
      })
      .then(() => {
        this.loadEmployees();
      });
  }

  async loadEmployees() {
    fetch('https://cdn.jsdelivr.net/gh/JeziL/employees-list/data/data.json.enc')
      .then(response => {
        return response.text();
      })
      .then(ct => {
        let deciphered = decryptData(ct, config.updateData.encryptKey);
        return JSON.parse(deciphered);
      })
      .then(obj => {
        const members = obj.data.map(m => {
          let o = Object.assign({}, m);
          o.age = calcAgeFromIDNumber(o.idnumber);
          o.area = getAddressFromIDNumber(o.idnumber, this.state.areaCodes);
          return o;
        });
        this.setState({ allEmployees: members, employees: members });
        Emitter.emit('updateTime', obj.updateTime);
      });
  }

  componentDidMount() {
    this.loadData();
    this.eventEmitter = Emitter.addListener('search', this.filterEmployee);
  }

  filterEmployee(query) {
    let filtered = this.state.allEmployees;
    if (query.name.length > 0) {
      filtered = filtered.filter(e => {
        if (!e.name) return false;
        return e.name.includes(query.name);
      });
    }
    if (query.sex !== '') {
      filtered = filtered.filter(e => {
        if (!e.sex) return false;
        return e.sex.includes(query.sex);
      });
    }
    if (query.phone.length > 0) {
      filtered = filtered.filter(e => {
        if (!e.phone) return false;
        return e.phone.includes(query.phone);
      });
    }
    if (query.idno.length > 0) {
      filtered = filtered.filter(e => {
        if (!e.idnumber) return false;
        return e.idnumber.includes(query.idno);
      });
    }
    if (query.department.length > 0) {
      filtered = filtered.filter(e => {
        if (!e.department) return false;
        return e.department.includes(query.department);
      });
    }
    if (query.age.length === 2 && query.age[0] <= query.age[1] && query.age[1] - query.age[0] < 120) {
      filtered = filtered.filter(e => {
        if (!e.age) return false;
        return (e.age >= query.age[0] && e.age <= query.age[1]);
      });
    }
    if (query.area.length > 0) {
      filtered = filtered.filter(e => {
        if (!e.area) return false;
        return e.area.includes(query.area);
      });
    }

    this.setState({ employees: filtered, page: 0 });
  }

  componentWillUnmount() {
    Emitter.removeListener(this.eventEmitter);
  }

  render() {
    const classes = this.props.classes;

    return (
      <TableContainer component={Paper} elevation={2}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center"><b>姓名</b></TableCell>
              <TableCell align="center"><b>性别</b></TableCell>
              <TableCell align="center"><b>年龄</b></TableCell>
              <TableCell align="center"><b>手机号</b></TableCell>
              <TableCell align="center"><b>身份证号</b></TableCell>
              <TableCell align="center"><b>籍贯</b></TableCell>
              <TableCell align="center"><b>部门</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(this.state.employees.slice(
              this.state.page * this.state.rowsPerPage,
              (this.state.page + 1) * this.state.rowsPerPage
            )).map((employee) => (
              <TableRow key={employee.memid}>
                <TableCell component="th" scope="row" align="center">{
                  employee.name.length === 2
                    ? employee.name[0] + '\u2003' + employee.name[1]
                    : employee.name
                }</TableCell>
                <TableCell align="center">{(employee.sex === "0") ? "女" : "男"}</TableCell>
                <TableCell align="center">{employee.age}</TableCell>
                <TableCell align="center">{employee.phone}</TableCell>
                <TableCell align="center">{employee.idnumber}</TableCell>
                <TableCell align="center">{employee.area}</TableCell>
                <TableCell align="center">{employee.department}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                count={this.state.employees.length}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                labelRowsPerPage={'每页行数:'}
                labelDisplayedRows={({ from, to, count }) => `第 ${from}-${to}，共 ${count}`}
                SelectProps={{
                  native: false,
                  style: { minWidth: 60 }
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  }
}

const EmployeeTableHook = () => {
  const classes = useStyles();
  return (
    <EmployeeTable classes={classes} />
  );
};
export default EmployeeTableHook;
