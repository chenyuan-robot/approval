import type { IPerson } from '@/apis/typings/global'
import type { UserState } from './user'

/**
 * 全量store state
 */
export interface RootState {
  device_id: string
  userList: Array<IPerson>
}

export interface StoreState extends RootState {
  user: UserState
}
