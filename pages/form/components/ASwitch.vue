<template>
  <view class="uni-form-component">
    <view class="component-label">
      <view class="field-desc">
        <text>{{ props.formItem.label }}</text>
        <text class="required" v-if="config.required">*</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value">
      <switch :name="`COMP_SWITCH_${props.formItem.sequence}`" :checked="config.defaultSelection" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from './../typings'

defineOptions({
  name: 'ASwitch',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()

const config = computed(() => {
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const defaultSelection = props.formItem.values.find((item) => item.name === '默认选择')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  return {
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    defaultSelection: defaultSelection === '开启',
    required: required
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
    .input-result {
      display: flex;
      align-items: center;
      margin-right: 8px;
      color: #606266;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 0rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
    .component-style {
      width: 240rpx;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 12rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
  }
}
</style>
