export interface UserListResponse {
  persons: Array<Person>
}

export interface Person {
  account: string
  name: string
  job_title: string
  checked?: boolean
}
