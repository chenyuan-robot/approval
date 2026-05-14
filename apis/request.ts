import store from '@/store'
import type { IBaseResponse } from './typings/base'
import { BASE_URL, HTTP_CODE } from '@/constants/common'
import { stringify } from '@/utils/stringify'
import type { StoreState } from '@/store/types'

export function http<T>(options: UniNamespace.RequestOptions) {
  return new Promise<IBaseResponse<T>>((resolve, reject) => {
    const publicUrl = options.url.includes('http') ? '' : BASE_URL
    let url = options.url
    if (options.method === 'GET') {
      const query = options.data ? stringify(options.data) : ''
      url = query ? `${url}?${query}` : url
    }
    uni.request({
      ...options,
      url: `${publicUrl}${url}`,
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(store.state as StoreState).user.access_token}`
      },
      timeout: 10000 * 6, // 60秒
      dataType: 'json',
      responseType: 'json',
      success(res) {
        const data = res.data as IBaseResponse<T>
        const code = data.code
        switch (code) {
          case HTTP_CODE.SUCCESS:
          case HTTP_CODE.BAD_REQUEST:
          case HTTP_CODE.FORBIDDEN:
            resolve(data)
            break

          case HTTP_CODE.UNAUTHORIZED:
            // TODO
            resolve(data)
            break

          case HTTP_CODE.INTERNAL_SERVER_ERROR:
            uni.showToast({
              title: (data.message as string) || '服务器错误',
              icon: 'error',
              duration: 2000,
              mask: true
            })
            resolve(data)
            break

          default:
            resolve(data)
            break
        }
      },
      // 响应失败
      fail(err) {
        console.log('error', err)
        uni.showToast({
          icon: 'none',
          title: '网络请求错误'
        })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 * @param url 后台地址
 * @param query 请求query参数
 * @returns
 */
export function httpGet<D>(url: string, data?: Record<string, unknown>): Promise<IBaseResponse<D>> {
  return http<D>({
    url,
    data,
    method: 'GET'
  })
}

/**
 * POST 请求
 * @param url 后台地址
 * @param data 请求body参数
 * @returns
 */
export function httpPost<D>(url: string, data?: Record<string, unknown>): Promise<IBaseResponse<D>> {
  return http<D>({
    url,
    data,
    method: 'POST'
  })
}

/**
 * PUT 请求
 */
export function httpPut<D>(url: string, data?: Record<string, unknown>): Promise<IBaseResponse<D>> {
  return http<D>({
    url,
    data,
    method: 'PUT'
  })
}

/**
 * DELETE 请求
 */
export function httpDelete<D>(url: string, data?: Record<string, unknown>): Promise<IBaseResponse<D>> {
  return http<D>({
    url,
    data,
    method: 'DELETE'
  })
}

/**
 * 下载 请求
 */
export function httpDownload<D>(url: string, data?: Record<string, unknown>): Promise<IBaseResponse<D>> {
  return http<D>({
    url,
    data,
    method: 'GET'
  })
}

http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete
http.download = httpDownload
