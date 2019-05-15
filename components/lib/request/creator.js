import axios from 'axios'
import qs from 'qs'
import _ from 'lodash'

export default function requestCreator (options = {}) {
  const defaultOptions = {
    baseURL: '/',
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    paramsSerializer: function (params) {
      // { a: 'hello', b: ['world', '!'] } => 'a=hello&b=world&b=!'
      return qs.stringify(params, {
        skipNulls: true,
        arrayFormat: 'repeat',
        encoder: function (str) {
          return encodeURIComponent(str)
        }
      })
    },
    transformRequest: function (data, header) {
      // 文件上传
      const isMultiPart = header['content-type'] === 'multipart/form-data'
      if (isMultiPart) {
        return data
      }

      if (data == null || typeof data === 'string') {
        return data
      }

      // 是否为表单模式
      const isForm = header['content-type'] === 'application/x-www-form-urlencoded'

      return isForm ? qs.stringify(data) : JSON.stringify(data)
    },
    validateStatus: function (status) {
      return status >= 200 && status < 300
    }
  }
  const instance = axios.create(_.defaultsDeep(options, defaultOptions))
  instance.interceptors.response.use(
    function (response) {
      let result = response.data
      if (!result) {
        throw new Error('请求异常！')
      } else if (typeof result !== 'object') {
        throw new Error('返回数据格式异常！')
      } else if (result.header.code !== 200) {
        throw new Error(result.header.desc || '请求异常！')
      } else {
        return result.body
      }
    },
    function (error) {
      if (error.response) {
        const data = error.response.data
        if (data && data.error) {
          throw new Error(data.error)
        }
        throw new Error('请求异常：' + error.response.statusText)
      } else if (error.request) {
        throw new Error('请求异常：无返回结果')
      } else {
        throw new Error(error.message)
      }
    }
  )
  return instance
}
