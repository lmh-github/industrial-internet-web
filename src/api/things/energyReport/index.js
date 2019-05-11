import fetch from 'utils/fetch';

// 能耗分析报表,查询当月每日数据
export function getTotilWashYearMonthDay(query) {
  return fetch({
    url: '/api/things/totilWashInfo/getTotilWashYearMonthDay',
    method: 'get',
    params: query
  });
}

// 能耗分析报表,查询当年每月数据
export function getTotilWashYearMonth(query) {
  return fetch({
    url: '/api/things/totilWashInfo/getTotilWashYearMonth',
    method: 'get',
    params: query
  });
}

export function page(query) {
  return fetch({
    url: '/api/things/totilWashInfo/page',
    method: 'get',
    params: query
  });
}

export function getStationList(query) {
  return fetch({
    url: '/api/things/totilWashInfo/all',
    method: 'get',
    params: query
  });
}

export function addObj(obj) {
  return fetch({
    url: '/api/things/totilWashInfo',
    method: 'post',
    data: obj
  });
}

export function getObj(id) {
  return fetch({
    url: '/api/things/totilWashInfo/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return fetch({
    url: '/api/things/totilWashInfo/' + id,
    method: 'delete'
  })
}

export function putObj(id, obj) {
  return fetch({
    url: '/api/things/totilWashInfo/' + id,
    method: 'put',
    data: obj
  })
}
