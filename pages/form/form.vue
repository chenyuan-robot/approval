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
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { queryFormDetail } from '@/apis/modules/form'
import type { FormItem } from './typings'
import Renderer from './Renderer.vue'

interface FormPageOptions {
  id?: string
}

interface FormValues {
  switch: boolean
}

const formItems = ref<FormItem[]>([])

const formSubmit = (event: Event) => {
  const e = event as unknown as {
    detail: {
      value: FormValues
    }
  }
  console.log('提交的表单数据：', e.detail.value)
}

const queryFormCfg = (id: string) => {
  queryFormDetail(id)
    .then((res) => {
      if (res.code === 200) {
        let depItems: FormItem[] = []
        const formConfigs = res?.message?.form_config || []
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

onLoad((options?: FormPageOptions) => {
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
