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
  form_instance: [],
  attachmentList: [],
  secretAttachmentList: [],
  commentAttachmentList: []
})

const instance = {
  namespaced: true,
  state: getDefaultState,
  mutations: {
    /**
     * reset instance state
     * @param state
     */
    // RESET_STATE(state: InstanceState) {
    //   Object.assign(state, getDefaultState())
    // },

    /**
     * set instance state
     * @param state
     * @param data
     */
    SET_STATE(state: InstanceState, data: InstanceState) {
      state.instance_id = data.instance_id
      state.instance_type = data.instance_type
      state.task_node_instance_id = data.task_node_instance_id
    },

    SET_FORM_INSTANCE(state: InstanceState, data: Array<FormConfigItem>) {
      state.form_instance = data
    },

    /**
     * set attachment list
     * @param state
     * @param data
     */
    SET_ATTACHMENT_LIST(state: InstanceState, data: string[]) {
      state.attachmentList = data
    },

    /**
     * set secret attachment list
     * @param state
     * @param data
     */
    SET_SECRET_ATTACHMENT_LIST(state: InstanceState, data: string[]) {
      state.secretAttachmentList = data
    },

    /**
     * set comment attachment list
     * @param state
     * @param data
     */
    SET_COMMENT_ATTACHMENT_LIST(state: InstanceState, data: string[]) {
      state.commentAttachmentList = data
    },

    CLEAR_INSTANCE_LINK(state: InstanceState) {
      state.instance_id = ''
      state.instance_type = ''
      state.task_node_instance_id = ''
      state.form_instance = []
    }
  }
}

export default instance
