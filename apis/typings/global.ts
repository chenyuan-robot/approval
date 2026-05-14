import type internal from "stream"

export interface UserListResponse {
  persons: Array<IPerson>
}

export interface IPerson {
  account: string
  name: string
  job_title: string
  departments: string
  checked?: boolean
  back_ground: string
}

export interface UploadAttachmentItem {
  file_name: string
  oss_key: string
}

export interface DepartmentsResponse {
  children: Array<DepartmentsResponse>
  key: string,
  name: string
}
