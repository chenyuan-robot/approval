import type { UserState } from '../types/user'

const getDefaultState = (): UserState => ({
  access_token: '',
  refresh_token: '',
  account: '',
  user_name: '',
  job_title: '',
  gender: 1
})

const user = {
  namespaced: true,
  state: getDefaultState,
  mutations: {
    /**
     * reset user state
     * @param state
     */
    RESET_STATE(state: UserState) {
      Object.assign(state, getDefaultState())
    },

    /**
     * set user state
     * @param state
     * @param data
     */
    SET_STATE(state: UserState, data: UserState) {
      state.access_token = data.access_token
      state.refresh_token = data.refresh_token
      state.account = data.account
      state.job_title = data.job_title
      state.user_name = data.user_name
      state.gender = data.gender
    }
  }
}

export default user
