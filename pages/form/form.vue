<template>
  <view class="container">
    <scroll-view scroll-y class="scroll-content">
      <view
        class="form-container"
        :style="{
          pointerEvents: type === 'invalid' ? 'none' : 'auto' // 作废时禁止编辑表单
        }"
        v-if="formItems.length > 0"
      >
        <form @submit="formSubmit">
          <view v-for="formItem in formItems" :key="formItem.sequence" class="uni-form-item">
            <Renderer style="width: 100%" :formItem="formItem" :isReview="showApproveBar" />
          </view>
          <view v-if="type === 'invalid' || type === 'modify'" class="uni-form-comment">
            <view class="component-label">
              <view class="field-desc">
                <text class="required">*</text>
                <text class="field-label">{{ type === 'invalid' ? '作废理由' : '修改理由' }}</text>
              </view>
            </view>
            <view class="component-value">
              <input
                class="component-style"
                style="height: 80rpx"
                placeholder-style="color: #86909C; font-size: 28rpx;"
                v-model="comment"
                placeholder="请输入，最多输入200个字符"
              />
            </view>
          </view>
          <view class="bottom-submit-bar" v-if="showApproveBar">
            <view v-if="isOpen" class="action-panel" :style="{ height: height + 'px' }" @click="isOpen = false">
              <view class="actions">
                <button class="action" form-type="submit" @click="approveType = 'return'">
                  <image class="search-icon" src="/static/detail/return.svg" mode="aspectFit" />
                  <view class="action-text">退回</view>
                </button>
                <button class="action" form-type="submit" @click="approveType = 'transfer'">
                  <image class="search-icon" src="/static/detail/transfer.svg" mode="aspectFit" />
                  <view class="action-text">转交</view>
                </button>
              </view>
            </view>
            <view class="action-group">
              <view class="action-more">
                <view class="action-item" @click="openPanel">
                  <image class="search-icon" src="/static/detail/more.svg" mode="aspectFit" />
                  <view class="action-text">更多</view>
                </view>
                <view class="line"></view>
              </view>
              <view class="action-btns">
                <button class="reject" form-type="submit" @click="approveType = 'reject'">
                  <image class="search-icon" src="/static/detail/reject.svg" mode="aspectFit" />
                  <text class="action-text">拒绝</text>
                </button>
                <button class="agree" form-type="submit" @click="approveType = 'agree'">
                  <image class="search-icon" src="/static/detail/agree.svg" mode="aspectFit" />
                  <text class="action-text">同意</text>
                </button>
              </view>
            </view>
          </view>
          <view class="bottom-submit-bar" v-else>
            <button
              :class="['submit-btn', isUploading ? 'disabled' : 'activite']"
              :disabled="isUploading"
              :style="{
                width: `${type === 'resubmit' ? '48%' : '100%'}`,
                marginRight: type === 'resubmit' ? '4%' : '0',
                pointerEvents: 'auto'
              }"
              form-type="submit"
              @click="submitType = 'submit'"
            >
              {{ isUploading ? '提交中...' : '提交申请' }}
            </button>
            <button
              :style="{
                width: `${type === 'resubmit' ? '48%' : '0'}`,
                pointerEvents: 'auto'
              }"
              v-if="type === 'resubmit'"
              @click="submitType = 'save'"
              class="save-btn"
              form-type="submit"
            >
              保存申请
            </button>
          </view>
        </form>
      </view>
      <view v-else class="empty-state">
        <text>表单配置为空</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, provide, onMounted, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  createForm,
  getResubmitForm,
  invalidateApplicationInstance,
  modifyApplicationInstance,
  queryFormDetail,
  submitApplicationInstance,
  updateApplicationInstance
} from '@/apis/modules/form'
import type { FormActionType, FormInfo, FormItem, PageOptions } from './typings'
import Renderer from './Renderer.vue'
import type { WorkflowCfg } from '@/apis/typings/form'
import { formRulesUtil } from './utils/rules'
import { makeToast } from '@/utils/toast'
import { queryInstanceDetail } from '@/apis/modules/detail'
import { debounce } from 'lodash'
import { useStore } from 'vuex'
import { getStatusType } from '@/hooks/base/status'
import type { StoreState } from '@/store/types'

interface FormValues {
  [key: string]: string
}

const store = useStore()
const toast = makeToast()

const attachmentList = computed(() => (store.state as StoreState).instance.attachmentList)
const secretAttachmentList = computed(() => (store.state as StoreState).instance.secretAttachmentList)
// const { user_name } = toRefs(userInfo.value)

const isUploading = ref<boolean>(false)
const formInfo = reactive<FormInfo>({
  form_code: '',
  form_instance_code: '',
  reform_id: '',
  form_group: '',
  form_name: '',
  form_instance: [],
  workflow_cfg: {} as WorkflowCfg
})
const formItems = ref<FormItem[]>([])
const type = ref<FormActionType>('create') // create、edit、view、resubmit、invalid、modify的类型
const comment = ref<string>('')
const showApproveBar = ref<boolean>(false)
const isOpen = ref<boolean>(false)
let approveType = '' // 同意、退回、转交、拒绝的类型
const height = ref(0)
let submitType = 'submit' // submit 或 save
const fromLarkMsg = ref<boolean>(false)

provide('type', type)

const formSubmit = debounce((event: Event) => {
  const e = event as unknown as {
    detail: {
      value: FormValues
    }
  }
  // 处理作废单
  if (type.value === 'invalid') {
    if (!comment.value) {
      toast.error('请输入作废理由', 2000)
      return
    }
    invalidateApplicationInstance({ comment: comment.value, instance_id: formInfo.form_code })
      .then((res) => {
        if (res.code === 200) {
          toast.success('操作成功', 2000)
          uni.switchTab({
            url: '/pages/center/center'
          })
        } else {
          toast.error(res.message.toString() || '操作失败', 2000)
        }
      })
      .catch((err) => {
        console.error('作废单据失败：', err)
        toast.error('操作异常', 2000)
      })
    return
  }
  console.log('提交的表单数据：', e.detail.value)
  const formKeys = Object.keys(e.detail.value)
  if (Math.random()) {
    for (let i = 0; i < formKeys.length; i++) {
      const key = formKeys[i]
      const value = e.detail.value[key as keyof FormValues]
      // console.log(`表单项 ${key} 的值为：`, value)
      const componentRuleItem = formRulesUtil.rules.find((item) => item.name === key)
      const componentRules = componentRuleItem?.rules ?? []
      for (let j = 0; j < componentRules.length; j++) {
        const ruleItem = componentRules[j]
        const reg = new RegExp(ruleItem.ruleType)
        console.log(`正则表达式 ${ruleItem.ruleType} 的测试结果为：`, reg.test(value), value)
        if (!reg.test(value)) {
          console.warn(`表单项 ${key} 的值 "${value}" 不符合规则：`, ruleItem.errorMessage)
          toast.error(ruleItem.errorMessage)
          return
        }
      }
      const identifier = key?.split('___')
      const comp = identifier?.[0] ?? ''
      const last = identifier?.[1] ?? ''
      const sequence = last?.includes('_') ? Number(last.split('_')[0]) : Number(last)
      console.log(`组件类型：${comp}, 序列号：${sequence}`)
      const find = formInfo.form_instance[sequence - 1].values.find((item) => item.name === '标题')
      if (!find) {
        console.warn(`未找到序列号 ${sequence} 对应的表单项`)
        continue
      }
      if (comp === 'COMP_SWITCH') {
        // 处理自定义控件开关组件的值
        find.form_value = value ? '是' : '否'
      } else if (comp === 'COMP_SINGLE_INPUT') {
        // 处理自定义控件单行输入组件的值
        find.form_value = value
      } else if (comp === 'COMP_NUMBER') {
        // 处理自定义控件数字输入组件的值
        console.log(`数字输入组件 ${sequence} 的值为：`, value)
        find.form_value = value
      } else if (comp === 'COMP_MULTI_INPUT') {
        // 处理自定义控件多行输入组件的值
        find.form_value = value
      } else if (comp === 'COMP_VALUE_LIST') {
        // 处理自定义控件选项列表组件的值
        const multiple =
          formInfo.form_instance[sequence - 1].values.find((item) => item.name === '选择模式')?.value === '多选'
        if (multiple) {
          find.form_values = value.split(',')
        } else {
          find.form_value = value
        }
      } else if (comp === 'COMP_AMOUNT') {
        // 处理自定义控件金额输入组件的值
        const required =
          (
            formInfo.form_instance[sequence - 1].values.find((item) => item.name === '字段属性')?.value as string
          )?.includes('必填') ?? false
        if (required) {
          if (value.endsWith('_')) {
            return
          }
          // 处理自定义控件金额输入组件的值
          find.form_values = value.split('_')
        } else {
          if (value.endsWith('_')) {
            find.form_values = null
          } else {
            find.form_values = value.split('_')
          }
        }
      } else if (comp === 'COMP_SELECTION_BOX') {
        // 处理自定义控件选择框组件的值
        const multiple =
          formInfo.form_instance[sequence - 1].values.find((item) => item.name === '选择模式')?.value === '多选'
        if (multiple) {
          find.form_values = value.split(',')
        } else {
          find.form_value = value
        }
      } else if (comp === 'COMP_CITY') {
        // 处理自定义控件城市选择组件的值
        const multiple =
          formInfo.form_instance[sequence - 1].values.find((item) => item.name === '选择模式')?.value === '多选'
        if (multiple) {
          find.form_values = value.split(',')
        } else {
          find.form_values = value.split('/')
        }
      } else if (comp === 'COMP_DATE') {
        // 处理自定义控件日期选择组件的值
        if (value !== '0') {
          find.form_value = value
        }
      } else if (comp === 'COMP_DATE_RANGE') {
        // 处理自定义控件日期范围选择组件的值
        console.log('value_date_range', value)
        if (value !== '0') {
          if (!find.form_values || (Array.isArray(find.form_values) && find.form_values.length === 2)) {
            find.form_values = []
          }
          // 防止开始、结束日期顺序错误
          const formValues = find.form_values as string[]
          if (formValues.length === 1 && last.endsWith('_start')) {
            formValues.unshift(value)
          } else {
            formValues.push(value)
          }
        }
      } else if (comp === 'COMP_ATTACHMENT') {
        // 处理自定义控件附件组件的值
        find.form_values = attachmentList.value
      } else if (comp === 'COMP_USER_SELECT') {
        // 处理自定义控件用户选择组件的值
        find.form_values = value.split(', ')
      } else if (comp === 'COMP_START_END_DATE') {
        if (value !== '0') {
          if (!find.form_values || (Array.isArray(find.form_values) && find.form_values.length === 2)) {
            find.form_values = []
          }
          // 防止开始、结束日期顺序错误
          const formValues = find.form_values as string[]
          if (formValues.length === 1 && last.endsWith('_start')) {
            formValues.unshift(value)
          } else {
            formValues.push(value)
          }
        }
      } else if (comp === 'COMP_HAPPEN_DATE') {
        if (value !== '0') {
          find.form_value = value
        }
      } else if (comp === 'COMP_SUBSTITUTE') {
        // 处理自定义控件替班组件的值
        find.form_value = value
      } else if (comp === 'COMP_SECRET_ATTACHMENT') {
        // 处理自定义控件附件组件的值
        find.form_values = secretAttachmentList.value
      } else if (comp === 'COMP_COMPANY_SELECT') {
        const multiple =
          formInfo.form_instance[sequence - 1].values.find((item) => item.name === '选择模式')?.value === '多选'
        if (multiple) {
          find.form_values = value.split(',')
        } else {
          find.form_value = value
        }
      } else if (comp === 'COMP_REASON') {
        // 处理自定义控件原因组件的值
        find.form_value = value
      } else if (comp === 'COMP_SECRET_MULTI_INPUT') {
        // 处理自定义控件多行输入组件的值
        find.form_value = value
      } else if (comp === 'COMP_INVOICE') {
        // 处理自定义控件发票组件的值
        find.form_value = value
      } else if (comp === 'COMP_COST_BEAR') {
        // 处理自定义控件费用承担组件的值
        find.form_value = value
      } else if (comp === 'COMP_DEPARTMENT_SELECT') {
        // 处理自定义控件选部门组件的值
        find.form_values = value.split(', ')
      } else if (comp === 'COMP_DESC_INPUT') {
        // 说明 组件
        find.form_value = value
      } else if (comp === 'COMP_FORMULA') {
        find.form_value = value
      } else {
        // 处理其他组件的值
        console.warn(`未处理组件 ${comp} 的值`)
      }
    }
    console.log('提交表单数据：', formInfo)
    if (showApproveBar.value) {
      const formInstance = formInfo.form_instance
      store.commit('instance/SET_FORM_INSTANCE', formInstance)
      store.commit('instance/SET_COMMENT_ATTACHMENT_LIST', [])
      uni.navigateTo({
        url: `/pages/comment/index?id=${formInfo.form_code}&type=${approveType}`
      })
      return
    }
    // 处理变更单
    if (type.value === 'modify') {
      if (!comment.value) {
        toast.error('请输入修改理由', 2000)
        return
      }
      modifyApplicationInstance({
        comment: comment.value,
        form_name: formInfo.form_name,
        instance_id: formInfo.form_code,
        form_instance: formInfo.form_instance
      })
        .then((res) => {
          if (res.code === 200) {
            toast.success('操作成功', 2000)
            // uni.navigateBack()
            uni.switchTab({
              url: '/pages/center/center'
            })
          } else {
            toast.error(res.message.toString() || '操作失败', 2000)
          }
        })
        .catch((err) => {
          console.error('修改单据失败：', err)
          toast.error('操作异常', 2000)
        })
      return
    }
    // return
  }

  isUploading.value = true
  if (type.value === 'edit') {
    updateApplicationInstance(formInfo, formInfo.form_code)
      .then((res) => {
        console.log('提交表单成功：', res)
        if (res.code === 200) {
          const instanceId = res.message
          submittion(
            {
              workflow_cfg: formInfo.workflow_cfg,
              form_instance: formInfo.form_instance,
              form_instance_code: formInfo.form_instance_code,
              form_name: formInfo.form_name
            },
            instanceId
          )
        } else {
          toast.error(res.message.toString() || '创建申请单实例失败', 2000)
        }
      })
      .catch((err) => {
        console.error('提交表单失败：', err)
        toast.error('创建申请单实例出现异常', 2000)
      })
      .finally(() => {
        isUploading.value = false
      })
  } else if (type.value === 'create') {
    createForm(formInfo)
      .then((res) => {
        if (res.code === 200) {
          const instanceId = res.message
          submittion(
            {
              workflow_cfg: formInfo.workflow_cfg,
              form_instance: formInfo.form_instance
            },
            instanceId
          )
        } else {
          toast.error(res.message.toString() || '创建申请单实例失败', 2000)
        }
      })
      .catch((err) => {
        console.error('提交表单失败：', err)
        toast.error('创建申请单实例出现异常', 2000)
      })
      .finally(() => {
        isUploading.value = false
        submitType = 'submit'
      })
  } else if (type.value === 'resubmit') {
    createForm({
      form_code: formInfo.form_code,
      form_group: formInfo.form_group,
      form_name: formInfo.form_name,
      workflow_cfg: formInfo.workflow_cfg,
      form_instance: formInfo.form_instance,
      reform_id: formInfo.reform_id
    })
      .then((res) => {
        console.log('提交表单成功：', res)
        if (res.code === 200) {
          const instanceId = res.message
          if (submitType === 'save') {
            toast.success('保存成功', 2000)
            // uni.navigateBack()
            uni.switchTab({
              url: '/pages/center/center'
            })
            return
          }
          submittion(
            {
              workflow_cfg: formInfo.workflow_cfg,
              form_instance: formInfo.form_instance
            },
            instanceId
          )
        } else {
          toast.error(res.message.toString() || '创建申请单实例失败', 2000)
        }
      })
      .catch((err) => {
        console.error('提交表单失败：', err)
        toast.error('创建申请单实例出现异常', 2000)
      })
      .finally(() => {
        isUploading.value = false
      })
  }
}, 10)

const submittion = (data: Record<string, unknown>, id: string) => {
  submitApplicationInstance(data, id)
    .then((res) => {
      if (res.code === 200) {
        toast.success('提交成功', 2000)
        // uni.navigateBack()
        uni.switchTab({
          url: '/pages/center/center'
        })
      } else {
        toast.error(res.message.toString(), 2000)
      }
    })
    .catch((err) => {
      toast.error(err.toString() || '提交申请单实例出现异常', 2000)
    })
    .finally(() => {
      isUploading.value = false
    })
}

const queryFormCfg = (id: string) => {
  if (type.value === 'create') {
    queryFormDetail(id)
      .then((res) => {
        if (res.code === 200) {
          const message = res.message || {}
          formInfo.form_code = id
          formInfo.form_group = message.group || ''
          formInfo.form_name = message.name || ''
          formInfo.workflow_cfg = message.workflow_cfg || {}
          formInfo.form_instance = message.form_config || []
          let depItems: FormItem[] = []
          const formConfigs = message.form_config || []
          formConfigs.forEach((formConfig) => {
            depItems.push({
              label: formConfig.values.find((item) => item.name === '标题')?.value as string,
              sequence: formConfig.sequence,
              component_code: formConfig.component_code,
              values: formConfig.values
            })
          })
          formItems.value = depItems
        } else {
          console.error('查询表单详情失败：', res.message)
        }
      })
      .catch((err) => {
        console.error('查询表单详情失败：', err)
      })
  } else if (type.value === 'edit' || type.value === 'invalid' || type.value === 'modify') {
    queryInstanceDetail(id)
      .then((res) => {
        if (res.code === 200) {
          // console.log('获取单据详情成功：', res.message)
          const message = res.message || {}
          if (getStatusType(message.status) !== 'draft' && fromLarkMsg.value) {
            toast.info('正在跳转...')
            const applicaitonItem = {
              instance_id: id,
              instance_type: ''
            }
            uni.reLaunch({
              url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify(applicaitonItem))}`
            })
            return
          }
          formInfo.form_code = id || ''
          formInfo.form_instance_code = message.form_instance_code || ''
          formInfo.form_name = message.form_name || ''
          formInfo.workflow_cfg = message.workflow_cfg || {}
          formInfo.form_instance = message.form_instance || []
          let depItems: FormItem[] = []
          const formConfigs = message.form_instance || []
          formConfigs.forEach((formConfig) => {
            depItems.push({
              label: formConfig.values.find((item) => item.name === '标题')?.value as string,
              sequence: formConfig.sequence,
              component_code: formConfig.component_code,
              values: formConfig.values
            })
          })
          formItems.value = depItems
        } else {
          console.error('查询表单编辑详情失败：', res.message)
        }
      })
      .catch((err) => {
        console.error('查询表单编辑详情失败：', err)
      })
      .finally(() => {
        toast.hiddenLoading()
      })
  } else if (type.value === 'resubmit') {
    getResubmitForm({ instance_id: id })
      .then(async (res) => {
        if (res.code === 200) {
          const message = res.message || {}
          if (getStatusType(message.status) !== 'draft' && fromLarkMsg.value) {
            toast.info('正在跳转...')
            const applicaitonItem = {
              instance_id: id,
              instance_type: ''
            }
            uni.reLaunch({
              url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify(applicaitonItem))}`
            })
            return
          }
          formInfo.form_code = message.form_code || ''
          formInfo.form_name = message.form_name || ''
          formInfo.workflow_cfg = message.workflow_cfg || {}
          formInfo.form_instance = message.form_config || []
          formInfo.reform_id = id
          let depItems: FormItem[] = []
          const formConfigs = message.form_config || []
          formConfigs.forEach((formConfig) => {
            depItems.push({
              label: formConfig.values.find((item) => item.name === '标题')?.value as string,
              sequence: formConfig.sequence,
              component_code: formConfig.component_code,
              values: formConfig.values
            })
          })
          formItems.value = depItems
          const result = await queryFormDetail(formInfo.form_code)
          if (result.code === 200) {
            console.log('查询表单详情成功：', result)
            formInfo.form_group = result.message.group || ''
          }
        } else {
          console.error('查询表单详情失败：', res.message)
        }
      })
      .catch((err) => {
        console.error('查询表单详情失败：', err)
      })
      .finally(() => {
        toast.hiddenLoading()
      })
  }
}

const openPanel = () => {
  isOpen.value = true
}

// 此处处理飞书消息跳转
const globalInstanceId = computed(() => store.state.instance.instance_id)
watch(globalInstanceId, (newVal: string) => {
  if (newVal) {
    toast.loading('加载中...')
    fromLarkMsg.value = true
    const globalInstanceType = store.state.instance.instance_type
    type.value = globalInstanceType
    queryFormCfg(globalInstanceId.value)
  }
})

onLoad((options?: PageOptions) => {
  formRulesUtil.clearRules()
  if (options?.id) {
    fromLarkMsg.value = false
    type.value = options.type as FormActionType
    if (type.value === 'edit') {
      console.log('编辑表单：', options)
      formInfo.workflow_cfg = {
        workflow_code: options.workflow_code!,
        workflow_version: options.workflow_version!
      }
      if (Boolean(options.approve)) {
        // 即可编辑也可执行同意、拒绝等操作
        showApproveBar.value = true
      }
    }
    queryFormCfg(options.id)
  }
})

onMounted(() => {
  height.value = uni.getSystemInfoSync().windowHeight
})
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7f9;
}

.scroll-content {
  flex: 1;
  padding: 32rpx;
  box-sizing: border-box;
  padding-bottom: 160rpx; /* 为底部按钮留出空间 */
  .form-container {
    background-color: #fff;
    border-radius: 16rpx;
    padding-top: 16rpx;
    .uni-form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16rpx 0;
    }
    .uni-form-comment {
      width: calc(100% - 64rpx);
      margin-left: 32rpx;
      padding-bottom: 32rpx;
      pointer-events: auto;
      .component-label {
        margin-bottom: 10rpx;
        .field-desc {
          font-size: 26rpx;
          .required {
            color: #fb2c36;
            font-size: 28rpx;
            margin-right: 6rpx;
            vertical-align: middle;
            font-weight: bold;
          }
        }
      }
      .component-value {
        display: flex;
        align-items: center;
        position: relative;
        .component-style {
          width: 100%;
          border: 1px solid rgba(229, 230, 235, 0.6);
          background-color: rgba(249, 250, 251, 1);
          border-radius: 8px;
          padding-left: 20rpx;
          padding-top: 10rpx;
          padding-bottom: 12rpx;
          padding-right: 50rpx;
          font-size: 28rpx;
          box-sizing: border-box;
          color: rgba(16, 20, 28, 1);
        }
      }
    }
  }
}

/* 底部操作栏 */
.bottom-submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  /* 兼容 iPhone 底部安全区，也就是你要求的“最下面” */
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
  z-index: 99;

  .submit-btn {
    font-size: 32rpx;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 16rpx;
    &::after {
      border: none;
    }
    &.disabled {
      background-color: rgba(0, 0, 0, 0.1);
      color: rgba(109, 115, 123, 1);
    }
    &.activite {
      background-color: #2979ff;
      color: #fff;
      &:active {
        opacity: 0.8;
      }
    }
  }

  .save-btn {
    font-size: 32rpx;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 16rpx;
    &::after {
      border: none;
    }
    &.disabled {
      background-color: rgba(0, 0, 0, 0.1);
      color: rgba(109, 115, 123, 1);
    }
    &.activite {
      background-color: #2979ff;
      color: #fff;
      &:active {
        opacity: 0.8;
      }
    }
  }

  .action-panel {
    position: fixed;
    bottom: 120rpx;
    left: 0;
    right: 0;
    height: 400px;
    background-color: rgba(0, 0, 0, 0.2);
    .actions {
      height: 188rpx;
      width: 100%;
      padding-left: 72rpx;
      padding-right: 72rpx;
      box-sizing: border-box;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      position: absolute;
      left: 0;
      bottom: 0;
      box-shadow: 0px 2px 8px 0px #0000001a;
      .action {
        border: none !important;
        text-align: center;
        margin-right: 100rpx;
        margin-left: 0;
        line-height: normal;
        background-color: #ffffff;
        .search-icon {
          width: 32rpx;
          height: 32rpx;
          margin-bottom: 8rpx;
        }
        .action-text {
          color: #4b5563;
          font-size: 26rpx;
        }
        &::after {
          border: none !important;
        }
        &::host {
          border: none !important;
        }
      }
    }
  }

  .action-group {
    width: 100%;
    display: flex;
    .action-more {
      display: flex;
      align-items: center;
      margin-right: 32rpx;
      margin-left: 40rpx;
      .action-item {
        margin-right: 56rpx;
        text-align: center;
        .search-icon {
          width: 28rpx;
          height: 28rpx;
        }
        .action-text {
          color: #4b5563;
          font-size: 26rpx;
        }
      }
      .line {
        width: 1px;
        height: 72rpx;
        background-color: rgba(229, 230, 235, 0.6);
      }
    }
    .action-btns {
      display: flex;
      flex: 1;
      margin-right: 54rpx;
      .reject {
        background-color: #ffffff;
        height: 88rpx;
        border-radius: 8px;
        border: 1px solid #e5e6eb;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        .search-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 16rpx;
        }
        .action-text {
          color: #4b5563;
          font-size: 28rpx;
        }
        &::after {
          border: none !important;
        }
      }
      .agree {
        background-color: #277eff;
        height: 88rpx;
        border-radius: 8px;
        border: 1px solid #e5e6eb;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        .search-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 16rpx;
        }
        .action-text {
          color: #ffffff;
          font-size: 28rpx;
        }
        &::after {
          border: none !important;
        }
      }
    }
  }
}
</style>
