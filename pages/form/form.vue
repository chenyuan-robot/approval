<template>
  <view class="container">
    <scroll-view scroll-y class="scroll-content">
      <view class="form-container" v-if="formItems.length > 0">
        <form @submit="formSubmit">
          <view v-for="formItem in formItems" :key="formItem.sequence" class="uni-form-item">
            <Renderer style="width: 100%" :formItem="formItem" />
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
          <view class="bottom-submit-bar">
            <button
              :class="['submit-btn', isUploading ? 'disabled' : 'activite']"
              :disabled="isUploading"
              :style="{
                width: `${type === 'resubmit' ? '48%' : '100%'}`,
                marginRight: type === 'resubmit' ? '4%' : '0'
              }"
              form-type="submit"
              @click="submitType = 'submit'"
            >
              {{ isUploading ? '提交中...' : '提交申请' }}
            </button>
            <button
              :style="{
                width: `${type === 'resubmit' ? '48%' : '0'}`
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
import { reactive, ref, provide } from 'vue'
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

interface FormValues {
  [key: string]: string
}

const toast = makeToast()

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
const type = ref<FormActionType>('create')
const comment = ref<string>('')
let submitType = 'submit' // submit 或 save

provide('type', type)

const formSubmit = debounce((event: Event) => {
  const e = event as unknown as {
    detail: {
      value: FormValues
    }
  }
  if (type.value === 'invalid' || type.value === 'modify') {
    if (!comment.value) {
      toast.error(type.value === 'invalid' ? '请输入作废理由' : '请输入修改理由', 2000)
      return
    }
    if (type.value === 'invalid') {
      invalidateApplicationInstance({ comment: comment.value, instance_id: formInfo.form_code })
        .then((res) => {
          if (res.code === 200) {
            toast.success('操作成功', 2000)
            uni.navigateBack()
          } else {
            toast.error(res.message.toString() || '操作失败', 2000)
          }
        })
        .catch((err) => {
          console.error('作废单据失败：', err)
          toast.error('操作异常', 2000)
        })
    } else {
      modifyApplicationInstance({
        comment: comment.value,
        form_name: formInfo.form_name,
        instance_id: formInfo.form_code,
        form_instance: formInfo.form_instance
      })
        .then((res) => {
          if (res.code === 200) {
            toast.success('操作成功', 2000)
            uni.navigateBack()
          } else {
            toast.error(res.message.toString() || '操作失败', 2000)
          }
        })
        .catch((err) => {
          console.error('修改单据失败：', err)
          toast.error('操作异常', 2000)
        })
    }
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
        find.form_value = value
      } else if (comp === 'COMP_DATE_RANGE') {
        // 处理自定义控件日期范围选择组件的值
        console.log('value_date_range', value)
        if (!find.form_values || (Array.isArray(find.form_values) && find.form_values.length === 2)) {
          console.log('value_date_range_clear')
          find.form_values = []
        }
        ;(find.form_values as string[]).push(value)
      } else if (comp === 'COMP_ATTACHMENT') {
        // 处理自定义控件附件组件的值
        find.form_values = value.split(',')
      } else if (comp === 'COMP_USER_SELECT') {
        // 处理自定义控件用户选择组件的值
        find.form_values = value.split(', ')
      } else if (comp === 'COMP_START_END_DATE') {
        if (!find.form_values || (Array.isArray(find.form_values) && find.form_values.length === 2)) {
          find.form_values = []
        }
        ;(find.form_values as string[]).push(value)
      } else if (comp === 'COMP_HAPPEN_DATE') {
        find.form_value = value
      } else if (comp === 'COMP_SUBSTITUTE') {
        // 处理自定义控件替班组件的值
        find.form_value = value
      } else if (comp === 'COMP_SECRET_ATTACHMENT') {
        // 处理自定义控件附件组件的值
        find.form_values = value.split(',')
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
      } else {
        // 处理其他组件的值
        console.warn(`未处理组件 ${comp} 的值`)
      }
    }
    console.log('提交表单数据：', formInfo)
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
            uni.navigateBack()
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
        uni.navigateBack()
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
          console.log('获取单据详情成功：', res.message)
          const message = res.message || {}
          formInfo.form_code = id || ''
          formInfo.form_instance_code = message.form_instance_code || ''
          formInfo.form_name = message.form_name || ''
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
  } else if (type.value === 'resubmit') {
    getResubmitForm({ instance_id: id })
      .then(async (res) => {
        if (res.code === 200) {
          const message = res.message || {}
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
  }
}

onLoad((options?: PageOptions) => {
  formRulesUtil.clearRules()
  if (options?.id) {
    type.value = options.type as FormActionType
    if (type.value === 'edit') {
      formInfo.workflow_cfg = {
        workflow_code: options.workflow_code!,
        workflow_version: options.workflow_version!
      }
    }
    queryFormCfg(options.id)
  }
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
}
</style>
