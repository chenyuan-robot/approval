import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import user from './modules/user'
import instance from './modules/instance'
import storage from '@/utils/storage'
import type { RootState, StoreState } from './types'
import type { IPerson, DepartmentsResponse } from '@/apis/typings/global'

const store = createStore<RootState>({
  modules: {
    user,
    instance
  },

  state: (): RootState => ({
    device_id: '',
    userList: [],
    departments: null,
    departmentsMap: {}
  }),

  mutations: {
    SET_DEVICE_ID(state, id: string) {
      state.device_id = id
    },

    SET_USER_LIST(state, list: Array<IPerson>) {
      state.userList = list
    },

    SET_DEPARTMENTS(state, data: DepartmentsResponse) {
      state.departments = data
    },

    SET_DEPARTMENTS_MAP(state, data: Record<string, DepartmentsResponse>) {
      state.departmentsMap = data
    }
  },

  plugins: [
    createPersistedState<RootState>({
      key: 'store',
      reducer: (state) => {
        const s = state as StoreState
        return {
          device_id: s.device_id,
          userList: s.userList,
          user: s.user
        }
      },
      storage: {
        getItem: (key) => storage.getItem(key),
        setItem: (key, value) => storage.setItem(key, value),
        removeItem: (key) => storage.removeItem(key)
      }
    })
  ]
})

export default store
