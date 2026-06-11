<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <text class="render-text" v-if="props.renderOnly">{{ formatThousand(config.value) }}</text>
      <view v-else style="width: 100%">
        <picker class="component-style" :range="AMountOpts" :value="index" range-key="label" @change="bindValueChange">
          <view :class="['action-result', AMountOpts[index]?.label ? 'fill' : 'empty']">
            {{ AMountOpts[index]?.label || '请选择' }}
          </view>
          <image class="suffix-icon" src="/static/arrow_down.svg" mode="aspectFit" />
        </picker>
        <input
          ref="inputAmountRef"
          placeholder-style="color: #86909C; font-size: 28rpx;"
          class="component-style"
          type="text"
          inputmode="decimal"
          :placeholder="config.placeholder as string"
          :value="displayValue"
          @input="bindInputValue"
          @focus="bindInputFocus"
          @blur="bindInputBlur"
        />
        <input hidden :name="`COMP_AMOUNT___${props.formItem.sequence}_picker`" :value="concernValue" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { inject, nextTick, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { AMountOpts } from '../../pages/form/data'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

export interface FormConfig {
  placeholder: string
  required: boolean
  showTitle: boolean
  showThousand: boolean
  value: string
}

defineOptions({
  name: 'Amount',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = ref<FormConfig>({
  placeholder: '',
  required: false,
  showTitle: false,
  showThousand: false,
  value: ''
})
const index = ref<number>(0)
const selectedValue = ref<string>('')
const concernValue = ref<string>('')
const displayValue = ref<string>('')
const isFocused = ref<boolean>(false)
const inputAmountRef = ref()

const getConfig = (): FormConfig => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const showThousand = (fieldAttr?.value as string)?.includes('数字显示千分位') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  formRulesUtil.depRules({
    name: `COMP_AMOUNT___${props.formItem.sequence}_picker`,
    rules: [
      {
        ruleType: required ? '^.+_.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      },
      {
        ruleType: required ? '^[^_]+_\\d+(\\.\\d{0,2})?$' : '.*',
        errorMessage: `${props.formItem.label}最多可输入两位小数`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入金额',
    required: required,
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    showThousand,
    value: Array.isArray(titleItem?.form_values) ? titleItem?.form_values?.join(', ') : ''
  }
}

// 千分位格式化（支持两位小数）
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

// 去掉千分位
const unFormatThousand = (str: string) => {
  return str.replace(/,/g, '')
}

// 限制只保留数字和最多两位小数
const limitDecimal = (str: string) => {
  // 只保留数字和小数点
  let val = str.replace(/[^\d.]/g, '')
  // 只保留第一个小数点
  const dotIndex = val.indexOf('.')
  if (dotIndex !== -1) {
    val = val.slice(0, dotIndex + 1) + val.slice(dotIndex + 1).replace(/\./g, '')
  }
  // 小数点后最多两位
  const parts = val.split('.')
  if (parts.length === 2) {
    val = parts[0] + '.' + parts[1].slice(0, 2)
  }
  console.log('val: ', val)
  return val
}

const bindValueChange = (event: Event) => {
  const e = event as unknown as {
    detail: { value: number }
  }
  index.value = e.detail.value
  const selectedOption = AMountOpts[index.value]
  selectedValue.value = selectedOption.value
  const num = concernValue.value.split('_')[1] || ''
  concernValue.value = `${selectedValue.value}_${num}`
}

// H5 下 Vue 对聚焦中的 input 会跳过 value 同步，这里直接写底层 DOM 兜底
const syncInputDom = (val: string) => {
  // #ifdef H5
  nextTick(() => {
    const el = inputAmountRef.value?.$el?.querySelector('input') || inputAmountRef.value?.$el
    if (el && el.tagName === 'INPUT' && el.value !== val) {
      el.value = val
    }
  })
  // #endif
  // #ifndef H5
  // 小程序/App：value 未变化时不会刷新输入框，先置空再改回目标值强制刷新
  displayValue.value = ''
  nextTick(() => {
    displayValue.value = val
  })
  // #endif
}

const bindInputValue = (event: Event) => {
  const e = event as unknown as { detail: { value: string } }
  const rawInput = unFormatThousand(e.detail.value)
  // 输入时不格式化千分位，只限制为数字和最多两位小数
  const val = limitDecimal(rawInput)
  // 回写修正后的值，超过两位小数的字符无法输入
  displayValue.value = val
  // 若输入被修正（超出两位小数等），强制同步 DOM，否则 H5 下聚焦中不会刷新
  if (val !== e.detail.value) {
    syncInputDom(val)
  }
  if (!val) {
    concernValue.value = `${selectedValue.value}_`
    return
  }
  concernValue.value = `${selectedValue.value}_${val}`
}

// 聚焦时显示原始数值（去掉千分位）
const bindInputFocus = () => {
  isFocused.value = true
  const raw = unFormatThousand(displayValue.value)
  displayValue.value = raw
  syncInputDom(raw)
}

// 失焦时格式化成千分位
const bindInputBlur = () => {
  console.log('bindInputBlur: ', displayValue.value)
  isFocused.value = false
  displayValue.value = formatThousand(displayValue.value)
  console.log('bindInputBlur: ', displayValue.value)
}

watch(
  () => concernValue.value,
  (val: string) => {
    const num = val.split('_')[1] || ''
    // 聚焦输入中显示原始值，失焦时显示千分位格式
    displayValue.value = isFocused.value ? num : formatThousand(num)
  }
)

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  config.value = getConfig()
  selectedValue.value = AMountOpts[0]?.value || ''
  concernValue.value = `${selectedValue.value}_` // 数值部分置空
  displayValue.value = '' // 输入框默认空
  if (type?.value === 'edit' || type?.value === 'resubmit' || type?.value === 'invalid' || type?.value === 'modify') {
    if (config.value.value) {
      const value = (config.value.value as string)?.split(', ')
      const currency = value?.[0]
      const number = value?.[1]
      const idx = AMountOpts.findIndex((item) => item.value === currency)
      index.value = idx
      selectedValue.value = AMountOpts[idx]?.value || ''
      concernValue.value = `${selectedValue.value}_${number}`
      displayValue.value = formatThousand(number)
    }
  }
})
</script>

<style lang="scss" scoped>
.uni-form-component {
  width: calc(100% - 64rpx);
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
    overflow: hidden;
    .component-style {
      display: flex;
      align-items: center;
      width: 100%;
      float: left;
      position: relative;
      height: 80rpx;
      border: 1px solid rgba(229, 230, 235, 0.6);
      background-color: rgba(249, 250, 251, 1);
      border-radius: 8px;
      padding-left: 20rpx;
      padding-top: 10rpx;
      padding-bottom: 12rpx;
      padding-right: 50rpx;
      font-size: 28rpx;
      box-sizing: border-box;
      .action-result {
        box-sizing: border-box;
        &.fill {
          color: #10141c;
        }
        &.empty {
          color: #86909c;
        }
      }
      .suffix-icon {
        width: 18rpx;
        height: 18rpx;
        position: absolute;
        right: 32rpx;
        top: 50%;
        transform: translateY(-50%);
      }
      &:first-child {
        box-sizing: border-box;
        width: calc(50% - 30rpx);
        margin-right: 30rpx;
      }
      &:nth-child(2) {
        box-sizing: border-box;
        width: 50%;
      }
    }
  }
  &.readable {
    .component-label {
      .field-desc {
        .field-label {
          color: #727c88;
        }
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
    margin-left: 32rpx;
    .component-label {
      .field-desc {
        .field-label {
          color: #10141c;
        }
      }
    }
  }
}
</style>
