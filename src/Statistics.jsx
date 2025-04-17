/* eslint-disable global-require */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import ListAltIcon from '@material-ui/icons/ListAlt';
import Typography from '@material-ui/core/Typography';
import {
  getAddressInfo, getAgeInfo, getSexRatio, getDepartmentInfo,
  getNameInfo,
} from './utils';
import Emitter from './event';

const Statistics = () => {
  let eventListener;
  const [members, setMembers] = useState([]);
  const [depList, setDepList] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const config = process.env.REACT_APP_CI === 'github_ci' ? JSON.parse(process.env.REACT_APP_PROJ_CONFIG) : require('./config.json');

  const loadMap = () => {
    fetch(config.dataSource.map)
      .then((response) => response.json())
      .then((mapObj) => {
        echarts.registerMap('China-P', mapObj);
        setMapLoaded(true);
      });
  };

  useEffect(() => {
    loadMap();
    eventListener = Emitter.addListener('employee-data', (employees) => { setMembers(employees); });
    eventListener = Emitter.addListener('departmentList', (deps) => { setDepList(deps); });
    return () => {
      if (typeof eventListener === 'function') {
        Emitter.removeListener(eventListener);
      }
    };
  }, []);

  const depInfo = getDepartmentInfo(members, depList);
  const sexInfo = getSexRatio(members, depList);
  const ageInfo = getAgeInfo(members);
  const addrInfo = getAddressInfo(members);
  const nameInfo = getNameInfo(members);

  return (
    <div style={{ marginTop: 48 }}>
      <Button
        variant="outlined"
        color="primary"
        style={{ marginBottom: 24 }}
        onClick={() => { Emitter.emit('switch-table'); }}
      >
        <ListAltIcon />
        &ensp;切换至列表视图
      </Button>
      <Stat title="数据总人数" value={members.length} comma />
      <Divider style={{ marginBottom: 24 }} />
      <Typography variant="h4" gutterBottom>
        <b>部门分布</b>
      </Typography>
      <ReactECharts option={{
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false,
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            name: '部门',
            type: 'pie',
            radius: '80%',
            data: depInfo,
            center: ['50%', '50%'],
            label: { show: false },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }}
      />
      <Divider style={{ marginBottom: 24 }} />
      <Typography variant="h4" gutterBottom>
        <b>性别分布</b>
      </Typography>
      <Typography variant="body1" gutterBottom>
        综合男女比&nbsp;
        {sexInfo.allRatio.toFixed(2)}
        :1，最高部门
        {sexInfo.maxDep}
        （
        {sexInfo.maxRatio.toFixed(2)}
        :1），最低部门
        {sexInfo.minDep}
        （
        {sexInfo.minRatio.toFixed(2)}
        :1）。
      </Typography>
      <ReactECharts option={{
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false,
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            name: '性别',
            type: 'pie',
            radius: '80%',
            data: [
              { name: '男', value: members.filter((m) => m.sex === '1').length },
              { name: '女', value: members.filter((m) => m.sex === '0').length },
            ],
            center: ['50%', '50%'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }}
      />
      <ReactECharts option={{
        title: {
          text: '各部门男女比',
          left: 'center',
        },
        xAxis: {
          type: 'category',
          data: sexInfo.data.map((d) => d.name),
          axisTick: { show: false },
          axisLabel: { show: false },
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 12,
        },
        series: [{
          data: sexInfo.data.map((d) => d.value),
          type: 'bar',
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
      }}
      />
      <Divider style={{ marginBottom: 24 }} />
      <Typography variant="h4" gutterBottom>
        <b>年龄分布</b>
      </Typography>
      <Typography variant="body1" gutterBottom>
        总体平均年龄&nbsp;
        {ageInfo.average}
        &nbsp;岁，最年长的是
        {ageInfo.maxName}
        （
        {ageInfo.max}
        岁），最年轻的是
        {ageInfo.minName}
        （
        {ageInfo.min}
        岁）。
      </Typography>
      <Typography variant="body1" gutterBottom>
        出生于&nbsp;
        {ageInfo.maxMonthDay}
        &nbsp;的人数最多，有&nbsp;
        {ageInfo.maxMonthDayCount}
        &nbsp;人。
      </Typography>
      <ReactECharts option={{
        title: {
          text: '年龄区间分布',
          left: 'center',
        },
        xAxis: [{ type: 'value' }],
        yAxis: [{ type: 'value' }],
        series: [{
          name: '人数',
          type: 'bar',
          data: ageInfo.hist,
          barWidth: '99.3%',
          encode: {
            x: 0,
            y: 1,
            tooltip: [2, 3, 1],
          },
        }],
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow',
          },
          formatter: (params) => {
            const v = params.data;
            const n = params.seriesName;
            return `${n}<br />${v[2]} - ${v[3]}\t<b>${v[1]}</b>`;
          },
        },
      }}
      />
      <Divider style={{ marginBottom: 24 }} />
      <Typography variant="h4" gutterBottom>
        <b>地域分布</b>
      </Typography>
      {mapLoaded ? (
        <ReactECharts option={{
          tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2,
          },
          visualMap: {
            left: 'right',
            min: 1,
            max: 250,
            inRange: {
              color: [
                '#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026',
              ],
            },
            calculable: true,
          },
          series: [{
            id: 'mapChart',
            name: '人数',
            type: 'map',
            roam: true,
            map: 'China-P',
            emphasis: {
              label: { show: false },
            },
            data: addrInfo,
          }],
        }}
        />
      ) : ('')}
      <Divider style={{ marginBottom: 24 }} />
      <Typography variant="h4" gutterBottom>
        <b>姓名分布</b>
      </Typography>
      <Typography variant="body1" gutterBottom>
        重名最多的是
        {nameInfo.maxName}
        ，有&nbsp;
        {nameInfo.maxNameCount}
        &nbsp;人。姓
        {nameInfo.maxSurname}
        的人最多，有&nbsp;
        {nameInfo.maxSurnameCount}
        &nbsp;人。
      </Typography>
      <ReactECharts option={{
        title: {
          text: '各姓氏人数',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false,
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            name: '姓氏',
            type: 'pie',
            radius: '80%',
            data: nameInfo.surnameData,
            center: ['50%', '50%'],
            label: { show: false },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }}
      />
    </div>
  );
};

const Stat = ({
  title, value, precision = 0, comma = false,
}) => (
  <div>
    <Typography variant="subtitle1" display="block" color="textSecondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h2" gutterBottom>
      {comma ? value.toLocaleString('en-US', { minimumFractionDigits: precision }) : value.toFixed(precision)}
    </Typography>
  </div>
);

export default Statistics;
