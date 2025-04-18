/* eslint-disable global-require */
/* eslint-disable react/forbid-prop-types */

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
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
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { makeStyles } from '@material-ui/core/styles';
import Emitter from './event';
import TablePaginationActions from './TablePaginationActions';
import {
  generateVCards,
  downloadFile,
} from './utils';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

class EmployeeTable extends React.Component {
  constructor() {
    super();

    this.state = {
      employees: [],
      allEmployees: [],
      page: 0,
      rowsPerPage: 10,
      saveDialogVisible: false,
      orderedBy: 'name',
      order: 'asc',
    };
  }

  componentDidMount() {
    this.eventEmitter = Emitter.addListener('search', this.filterEmployee);
    this.eventEmitter.addListener('save', () => { this.setState({ saveDialogVisible: true }); });
    this.eventEmitter.addListener('employee-data', (employees) => {
      this.setState({
        employees,
        allEmployees: employees,
      });
    });
  }

  componentWillUnmount() {
    if (typeof this.eventEmitter === 'function') {
      Emitter.removeListener(this.eventEmitter);
    }
  }

  handleDialogClose = () => {
    this.setState({ saveDialogVisible: false });
  }

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10) });
    this.setState({ page: 0 });
  }

  handleChangePage = (_event, newPage) => {
    this.setState({ page: newPage });
  }

  handleRequestSort(column) {
    const { orderedBy, order } = this.state;
    if (orderedBy === column) {
      this.setState({
        order: order === 'asc' ? 'desc' : 'asc',
      }, this.sortEmployees);
    } else {
      this.setState({
        orderedBy: column,
        order: 'asc',
      }, this.sortEmployees);
    }
  }

  saveToVCF = () => {
    this.handleDialogClose();
    const { employees } = this.state;
    const vCardsStr = generateVCards(employees);
    downloadFile('employees.vcf', vCardsStr);
  }

  filterEmployee = (query) => {
    let { allEmployees: filtered } = this.state;
    if (query.name.length > 0) {
      filtered = filtered.filter((e) => {
        if (!e.name) return false;
        return e.name.includes(query.name);
      });
    }
    if (query.sex !== '') {
      filtered = filtered.filter((e) => {
        if (!e.sex) return false;
        return e.sex.includes(query.sex);
      });
    }
    if (query.phone.length > 0) {
      filtered = filtered.filter((e) => {
        if (!e.phone) return false;
        return e.phone.includes(query.phone);
      });
    }
    if (query.idno.length > 0) {
      filtered = filtered.filter((e) => {
        if (!e.idnumber) return false;
        return e.idnumber.includes(query.idno);
      });
    }
    if (query.department.length > 0) {
      filtered = filtered.filter((e) => {
        if (!e.department) return false;
        return query.department.includes(e.department);
      });
    }
    if (query.age.length === 2
      && query.age[0] <= query.age[1]
      && query.age[1] - query.age[0] < 120) {
      filtered = filtered.filter((e) => {
        if (!e.ageDisp) return false;
        return (e.ageDisp >= query.age[0] && e.ageDisp <= query.age[1]);
      });
    }
    if (query.area.length > 0) {
      filtered = filtered.filter((e) => {
        if (!e.area) return false;
        return e.area.includes(query.area);
      });
    }

    this.setState({ employees: filtered, page: 0 });
  }

  sortEmployees() {
    const { employees, orderedBy, order } = this.state;
    const sortedEmployees = employees.sort((a, b) => {
      const x = a[orderedBy];
      const y = b[orderedBy];
      if (typeof x === 'string') {
        return order === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
      }
      if (x === null) return 1;
      if (y === null) return -1;
      return order === 'asc' ? x - y : y - x;
    });
    this.setState({ employees: sortedEmployees });
  }

  render() {
    const { classes } = this.props;
    const {
      employees,
      page,
      rowsPerPage,
      saveDialogVisible,
      orderedBy,
      order,
    } = this.state;

    return (
      <TableContainer component={Paper} elevation={2}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <b>姓名</b>
                <TableSortLabel
                  active={orderedBy === 'name'}
                  direction={orderedBy === 'name' ? order : 'asc'}
                  onClick={() => { this.handleRequestSort('name'); }}
                />
              </TableCell>
              <TableCell align="center"><b>性别</b></TableCell>
              <TableCell align="center">
                <b>年龄</b>
                <TableSortLabel
                  active={orderedBy === 'age'}
                  direction={orderedBy === 'age' ? order : 'asc'}
                  onClick={() => { this.handleRequestSort('age'); }}
                />
              </TableCell>
              <TableCell align="center"><b>手机号</b></TableCell>
              <TableCell align="center"><b>身份证号</b></TableCell>
              <TableCell align="center"><b>籍贯</b></TableCell>
              <TableCell align="center"><b>部门</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              (employees.slice(page * rowsPerPage, (page + 1) * rowsPerPage))
                .map((employee) => (
                  <TableRow key={employee.memid}>
                    <TableCell component="th" scope="row" align="center">
                      {
                        employee.name.length === 2
                          ? `${employee.name[0]}\u2003${employee.name[1]}`
                          : employee.name
                      }
                    </TableCell>
                    <TableCell align="center">{(employee.sex === '0') ? '女' : '男'}</TableCell>
                    <TableCell align="center">{employee.ageDisp}</TableCell>
                    <TableCell align="center">{employee.phone}</TableCell>
                    <TableCell align="center">{employee.idnumber}</TableCell>
                    <TableCell align="center">{employee.area}</TableCell>
                    <TableCell align="center">{employee.department}</TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                count={employees.length}
                rowsPerPage={rowsPerPage}
                page={page}
                labelRowsPerPage="每页行数:"
                labelDisplayedRows={({ from, to, count }) => `第 ${from}-${to}，共 ${count}`}
                SelectProps={{
                  native: false,
                  style: { minWidth: 60 },
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
        <Dialog
          open={saveDialogVisible}
          onClose={this.handleDialogClose}
        >
          <DialogTitle>保存为 vCard 文件？</DialogTitle>
          <DialogContent>
            <DialogContentText>
              将下载一个包含&nbsp;
              {employees.length}
              &nbsp;个联系人的 vCard 文件，可导入至通讯录软件。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose}>
              取消
            </Button>
            <Button onClick={this.saveToVCF} color="primary" autoFocus>
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </TableContainer>
    );
  }
}

EmployeeTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

const EmployeeTableHook = () => {
  const classes = useStyles();
  return (
    <EmployeeTable classes={classes} />
  );
};
export default EmployeeTableHook;
