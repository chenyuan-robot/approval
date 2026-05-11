<template>
  <view class="container">
    <scroll-view scroll-y class="scroll-content">
      <view class="form-container" v-if="formItems.length > 0">
        <form @submit="formSubmit">
          <view
            v-for="(formItem, index) in formItems"
            :key="formItem.sequence"
            :class="['uni-form-item', index < formItems.length - 1 ? 'border-bottom' : '']"
          >
            <Renderer :formItem="formItem" />
          </view>
          <view class="bottom-submit-bar">
            <button class="submit-btn" form-type="submit">提交申请</button>
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
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createForm, queryFormDetail, submitApplicationInstance } from '@/apis/modules/form'
import type { FormInfo, FormItem, PageOptions } from './typings'
import Renderer from './Renderer.vue'
import type { WorkflowCfg } from '@/apis/typings/form'

interface FormValues {
  switch: boolean
}

const formInfo = reactive<FormInfo>({
  form_code: '',
  form_group: '',
  form_name: '',
  form_instance: [],
  workflow_cfg: {} as WorkflowCfg
})
const formItems = ref<FormItem[]>([])

const formSubmit = (event: Event) => {
  const e = event as unknown as {
    detail: {
      value: FormValues
    }
  }
  console.log('提交的表单数据：', e.detail.value)
  const formKeys = Object.keys(e.detail.value)
  if (Math.random()) {
    for (let i = 0; i < formKeys.length; i++) {
      const key = formKeys[i]
      const value = e.detail.value[key as keyof FormValues]
      console.log(`表单项 ${key} 的值为：`, value)
      const comp = key.split('___')[0]
      const sequence = Number(key.split('___')[1])
      console.log(`组件类型：${comp}, 序列号：${sequence}`)
      if (comp === 'COMP_SWITCH') {
        // 处理自定义控件开关组件的值
        const find = formInfo.form_instance[sequence - 1].values.find((item) => item.name === '标题')
        if (find) {
          find.form_value = value.toString()
        }
      } else if (comp === 'COMP_SINGLE_INPUT') {
        // 处理自定义控件单行输入组件的值
        console.log(`单行输入组件 ${sequence} 的值为：`, value)
        const find = formInfo.form_instance[sequence - 1].values.find((item) => item.name === '标题')
        if (find) {
          find.form_value = value
        }
      }
    }
    console.log('form keys', formInfo)
  }
  createForm(formInfo)
    .then((res) => {
      console.log('提交表单成功：', res)
      if (res.code === 200) {
        const instanceId = res.message
        submitApplicationInstance(
          {
            workflow_cfg: formInfo.workflow_cfg,
            form_instance: formInfo.form_instance
          },
          instanceId
        ).then((res) => {
          console.log('提交申请单实例成功：', res)
          if (res.code === 200) {
            uni.showToast({
              title: '提交成功',
              icon: 'success'
            })
            uni.navigateBack()
          } else {
            uni.showToast({
              title: res.message || '提交申请单实例失败',
              icon: 'error'
            })
          }
        })
      } else {
        uni.showToast({
          title: res.message || '创建申请单实例失败',
          icon: 'error'
        })
      }
    })
    .catch((err) => {
      console.error('提交表单失败：', err)
      uni.showToast({
        title: '创建申请单实例出现异常',
        icon: 'error'
      })
    })
}

const queryFormCfg = (id: string) => {
  queryFormDetail(id)
    .then((res) => {
      if (res.code === 200) {
        console.log('查询表单详情成功：', res)
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
}

onLoad((options?: PageOptions) => {
  if (options?.id) {
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
    border: 1px solid #e5e7eb;
    .uni-form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 26rpx 0;
      &.border-bottom {
        border-bottom: 1px solid #f3f4f6;
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
  /* 兼容 iPhone 底部安全区，也就是你要求的“最下面” */
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
  z-index: 99;

  .submit-btn {
    background-color: #2979ff;
    color: #fff;
    font-size: 32rpx;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 16rpx;
    &::after {
      border: none;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
