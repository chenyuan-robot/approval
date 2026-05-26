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
      <!-- <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text> -->
      <!-- <input
        v-else
        :name="`COMP_SINGLE_INPUT___${props.formItem.sequence}`"
        class="component-style"
        placeholder-style="color: #adb5bd; font-size: 28rpx;"
        :value="config.defaultValue"
        :placeholder="config.placeholder"
        :maxlength="config.maxlength"
      /> -->
      <text class="render-text">未知控件</text>
    </view>
  </view>
</template>
<!-- #adb5bd -->
<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'
// import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'SingleInput',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const maxlength = props.formItem.values.find((item) => item.name === '字符数限制')?.value as string
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  // 该表单项校验规则
  // formRulesUtil.depRules({
  //   name: `COMP_SINGLE_INPUT___${props.formItem.sequence}`,
  //   rules: [
  //     {
  //       // ^.+$: 至少一个字符（必填）
  //       // .*: 任意字符（非必填）
  //       ruleType: required ? '^.+$' : '.*',
  //       errorMessage: `${props.formItem.label}不能为空`
  //     }
  //   ]
  // })
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    defaultValue: defaultItem?.value === '指定值' ? ((defaultItem?.specific_value as string[])?.[0] ?? '') : '',
    maxlength: Number(maxlength) || 1000,
    required: required,
    value: titleItem?.form_value ?? '-'
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
    .component-value {
      .render-text {
        color: #1b1f26;
        font-size: 28rpx;
      }
    }
  }
}
</style>
