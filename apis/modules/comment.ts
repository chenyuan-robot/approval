import { http } from '../request'

/**
 * 添加评论
 * @param params
 * @returns
 */
export const addComment = (params: Record<string, unknown>) => {
  return http.put<boolean | string>('/api/v1/approval/instance/operation', params)
}

/**
 * 预览附件
 * @param params
 * @returns
 */
export const previewAttachment = (osskey: string) => {
  return http.get(`/api/v1/approval/file/preview/proxy/${osskey}`)
}
