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
