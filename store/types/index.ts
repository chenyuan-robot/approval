import type { IPerson, DepartmentsResponse } from '@/apis/typings/global'
import type { UserState } from './user'
import type { InstanceState } from './instance'

/**
 * 全量store state
 */
export interface RootState {
  device_id: string
  userList: Array<IPerson>
  departments: DepartmentsResponse | null
  departmentsMap: Record<string, DepartmentsResponse>
}

export interface StoreState extends RootState {
  user: UserState
  instance: InstanceState
}
