<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value">
      <text v-if="props.renderOnly" class="render-text">{{ config.value ? '是' : '否' }}</text>
      <switch v-else :name="`COMP_SWITCH___${props.formItem.sequence}`" :checked="config.defaultSelection" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'

defineOptions({
  name: 'ASwitch',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = computed(() => {
  console.log('ASwitch组件接收到的formItem数据：', props.formItem)
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const defaultSelection = props.formItem.values.find((item) => item.name === '默认选择')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  return {
    showFieldDesc: showFieldDesc,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    desc: fieldDesc?.value as string,
    defaultSelection: defaultSelection === '开启',
    required: required,
    value: titleItem?.form_value === 'true'
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
    .input-result {
      display: flex;
      align-items: center;
      margin-right: 8px;
      color: #606266;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 0rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
    .component-style {
      width: 300rpx;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 12rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
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
