import type { Person } from '@/apis/typings/global'
import type { UserState } from './user'

/**
 * 全量store state
 */
export interface RootState {
  device_id: string
  userList: Array<Person>
}

export interface StoreState extends RootState {
  user: UserState
}
