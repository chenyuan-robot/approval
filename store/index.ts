import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import user from './modules/user'
import storage from '@/utils/storage'
import type { RootState, StoreState } from './types'
import type { IPerson } from '@/apis/typings/global'

const store = createStore<RootState>({
  modules: {
    user
  },

  state: (): RootState => ({
    device_id: '',
    userList: []
  }),

  mutations: {
    SET_DEVICE_ID(state, id: string) {
      state.device_id = id
    },

    SET_USER_LIST(state, list: Array<IPerson>) {
      state.userList = list
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
