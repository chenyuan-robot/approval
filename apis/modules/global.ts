import { DIGITAL_BASE_URL } from '@/constants/common'
import { http } from '../request'
import type { UploadAttachmentItem, UserListResponse, DepartmentsResponse } from '../typings/global'

/**
 * 获取用户列表
 * @param params
 * @returns
 */
export const queryUserList = () => {
  return http.post<UserListResponse>(`${DIGITAL_BASE_URL}/api/v1/appmsg/user/query_all_person`, {
    tenant: 'cowarobot'
  })
}

/**
 * 上传附件
 * @param params
 * @returns
 */
export const uploadAttachment = () => {
  return http.post<Array<UploadAttachmentItem>>('/api/v1/dl_approval/file/upload')
}

/**
 * 获取部门树
 * @param params
 * @returns
 */
export const getDepartments = () => {
  return http.get<DepartmentsResponse>(`${DIGITAL_BASE_URL}/api/v1/appmsg/public/department/tree/coowa`)
}