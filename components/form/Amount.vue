<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="field-label">{{ props.formItem.label }}</text>
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
      </view>
    </view>
    <view class="component-value" v-if="props.renderOnly">
      <text class="render-text">{{ formatThousand(config.value) }}</text>
    </view>
    <view class="component-value" v-else>
      <picker :range="AMountOpts" :value="index" range-key="label" @change="bindValueChange">
        <view class="input-result">{{ AMountOpts[index]?.label || '请选择' }}</view>
      </picker>
      <input
        placeholder-style="color: #adb5bd; font-size: 28rpx;"
        class="component-style"
        :placeholder="config.placeholder"
        :value="displayValue"
        @input="bindInputValue"
      />
      <input hidden :name="`COMP_AMOUNT___${props.formItem.sequence}_picker`" :value="concernValue" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AMountOpts } from '../../pages/form/data'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

defineOptions({
  name: 'Amount',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = computed(() => {
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
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      },
      {
        ruleType: '^[^_]+_\\d+(\\.\\d{0,2})?$',
        errorMessage: `${props.formItem.label}最多可输入两位小数`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入金额',
    required: required,
    showThousand,
    value: Array.isArray(titleItem?.form_values) ? titleItem?.form_values?.join(', ') : ''
  }
})

const index = ref<number>(0)
const selectedValue = ref<string>('')
const concernValue = ref<string>('')
const displayValue = ref<string>('')

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

const bindInputValue = (event: Event) => {
  const e = event as unknown as { detail: { value: string } }
  let val = unFormatThousand(e.detail.value)
  if (!val) {
    displayValue.value = ''
    concernValue.value = `${selectedValue.value}_`
    return
  }
  concernValue.value = `${selectedValue.value}_${val}`
  displayValue.value = formatThousand(val)
}

onMounted(() => {
  selectedValue.value = AMountOpts[0]?.value || ''
  concernValue.value = `${selectedValue.value}_` // 数值部分置空
  displayValue.value = '' // 输入框默认空
})

watch(
  () => concernValue.value,
  (val) => {
    const num = val.split('_')[1] || ''
    displayValue.value = formatThousand(num)
  }
)
</script>

<style lang="scss" scoped>
.uni-form-component {
  .component-label {
    margin-left: 32rpx;
    color: #374151;
    .field-desc {
      font-size: 32rpx;
      .required {
        color: #e53e3e;
        font-size: 28rpx;
        position: relative;
        left: 5rpx;
        top: -6rpx;
      }
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
      color: #31373d;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 0rpx 20rpx;
      height: 64rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
    .component-style {
      width: 240rpx;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 12rpx 20rpx;
      height: 64rpx;
      font-size: 28rpx;
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
