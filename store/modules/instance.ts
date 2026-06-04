import type { FormConfigItem } from '@/apis/typings/detail'
import type { InstanceState } from '../types/instance'

/**
 * 单据实例状态
 * @returns
 */
const getDefaultState = (): InstanceState => ({
  instance_id: '',
  instance_type: '',
  task_node_instance_id: '',
  form_instance: []
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
    },

    SET_FORM_INSTANCE(state: InstanceState, data: Array<FormConfigItem>) {
      state.form_instance = data
    }
  }
}

export default instance
