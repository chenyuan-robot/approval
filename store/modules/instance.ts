import type { InstanceState } from '../types/instance'

/**
 * 单据实例状态
 * @returns
 */
const getDefaultState = (): InstanceState => ({
  instance_id: '',
  instance_type: ''
})

const instance = {
  namespaced: true,
  state: getDefaultState,
  mutations: {
    /**
     * reset instance state
     * @param state
     */
    RESET_STATE(state: InstanceState) {
      Object.assign(state, getDefaultState())
    },

    /**
     * set instance state
     * @param state
     * @param data
     */
    SET_STATE(state: InstanceState, data: InstanceState) {
      state.instance_id = data.instance_id
      state.instance_type = data.instance_type
    }
  }
}

export default instance
