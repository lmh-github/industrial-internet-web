import fetch from 'utils/fetch';

// 新增数据前过去id
export function getObjId() {
  return fetch({
    url: '/api/things/area/getId',
    method: 'get'
  })
}