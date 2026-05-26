<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="field-label">{{ props.formItem.label }}</text>
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value">
      <picker class="component-style" :range="[]" range-key="label" @change="bindValueChange">
        <text class="input-result">{{ '请选择' }}</text>
      </picker>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'

defineOptions({
  name: 'AllocationBudget',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const bindValueChange = () => {}

const config = computed(() => {
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  .component-label {
    margin-left: 32rpx;
    .field-desc {
      color: #374151;
      font-size: 32rpx;
      .required {
        color: #e53e3e;
        font-size: 28rpx;
        position: relative;
        left: 5rpx;
        top: -6rpx;
      }
    }
    .field-sub-desc {
      color: #868e96;
      font-size: 28rpx;
    }
  }
  .component-value {
    display: flex;
    align-items: center;
    margin-right: 32rpx;
    .component-style {
      width: 300rpx;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 0rpx 20rpx;
      height: 64rpx;
      line-height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
      position: relative;
      .input-result {
        position: absolute;
        left: 20rpx;
        top: 0;
        color: #31373d;
        font-size: 28rpx;
      }
    }
  }
  &.readable {
    .component-label {
      margin-left: 0;
      margin-bottom: 10rpx;
      .field-desc {
        .field-label {
          color: #727c88;
          font-size: 26rpx;
        }
      }
      .field-sub-desc {
        font-size: 24rpx;
        color: #727c88;
      }
    }
    .component-value {
      .render-text {
        color: #1b1f26;
        font-size: 28rpx;
      }
    }
  }
  &.editable {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .component-label {
      .field-desc {
        .field-label {
          color: #374151;
          font-size: 32rpx;
        }
      }
      .field-sub-desc {
        font-size: 24rpx;
        color: #9ca3af;
      }
    }
  }
}
</style>
