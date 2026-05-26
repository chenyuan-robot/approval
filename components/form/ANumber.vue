<template>
  <view class="uni-form-component">
    <view :class="['uni-row', props.renderOnly ? 'readable' : 'editable']">
      <view class="component-label">
        <view class="field-desc">
          <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
          <text class="required" v-if="!props.renderOnly && config.required">*</text>
        </view>
      </view>
      <view class="component-value">
        <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
        <input
          v-else
          placeholder-style="color: #adb5bd; font-size: 28rpx;"
          class="component-style"
          :value="displayValue"
          :placeholder="config.placeholder"
          @input="bindInputValue"
        />
        <input hidden :name="`COMP_NUMBER___${props.formItem.sequence}`" :value="concernValue" />
        <text class="unit-text" v-if="config.unit">{{ config.unit }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'ANumber',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const displayValue = ref<string>('')
const concernValue = ref<string>('')

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const unit = props.formItem.values.find((item) => item.name === '单位')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const integerLimit = props.formItem.values.find((item) => item.name === '整数位数')?.value as string
  const decimalLimit = props.formItem.values.find((item) => item.name === '小数位数')?.value as string
  const fieldAttrValue = fieldAttr?.value as string
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  let showThousand = false
  try {
    const obj = JSON.parse(fieldAttrValue as string)
    showThousand = obj['数字显示千分位']
  } catch (error) {
    console.log('error', error)
  }
  formRulesUtil.depRules({
    name: `COMP_NUMBER___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      },
      {
        ruleType: `^\\d{0,${Number(integerLimit) || 5}}(\\.\\d{0,${Number(decimalLimit) || 3}})?$`,
        errorMessage: `${props.formItem.label}格式不正确，整数部分最多${integerLimit}位，小数部分最多${decimalLimit}位`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入内容',
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    required: required,
    showThousand,
    unit: unit,
    value: titleItem?.form_value ?? '-'
  }
})

const formatThousand = (num: string | number) => {
  if (!config.value.showThousand) {
    return typeof num === 'number' ? num.toString() : num
  }
  if (!num) return ''
  const str = num.toString()
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

const unFormatThousand = (str: string) => {
  return str.replace(/,/g, '')
}

const bindInputValue = (event: Event) => {
  const e = event as unknown as { detail: { value: string } }
  let val = unFormatThousand(e.detail.value)
  // if (!val) {
  //   displayValue.value = ''
  //   concernValue.value = `${selectedValue.value}_`
  //   return
  // }
  concernValue.value = val
  displayValue.value = formatThousand(val)
}
</script>

<style lang="scss" scoped>
.uni-form-component {
  .uni-row {
    // display: flex;
    // align-items: center;
    // justify-content: space-between;
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
        margin-right: 10rpx;
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
        .unit-text {
          color: #1b1f26;
          font-size: 28rpx;
          margin-left: 5rpx;
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
}
</style>
