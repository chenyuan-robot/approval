<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <text v-if="props.renderOnly" class="render-text">{{ config.value }}</text>
      <picker
        v-else
        class="component-style"
        :name="`COMP_DATE___${props.formItem.sequence}`"
        style="height: 80rpx"
        mode="date"
        :disabled="config.disabled"
        :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
        :value="selectedDate"
        :start="getDate('start')"
        :end="getDate('end')"
        @change="bindDateChange($event)"
      >
        <view :class="['action-result', selectedDate === '0' ? 'empty' : 'fill']">
          {{ selectedDate === '0' ? config.placeholder : selectedDate }}
        </view>
      </picker>
      <image
        v-if="!props.renderOnly || !config.disabled"
        class="suffix-icon"
        :src="`${selectedDate !== '0' ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
        mode="aspectFit"
        @click.stop="handleClear"
      />
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'
import dayjs from 'dayjs'

interface FormConfig {
  placeholder: string
  dateType: string
  showTitle: boolean
  disabled: boolean
  showFieldDesc: boolean
  desc: string
  required: boolean
  value: string
}

defineOptions({
  name: 'ADate',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const selectedDate = ref<string>('0')
const config = ref<FormConfig>({
  placeholder: '',
  dateType: '',
  disabled: false,
  showTitle: false,
  showFieldDesc: false,
  desc: '',
  required: false,
  value: ''
})

const getConfig = (): FormConfig => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
  const fieldStyle = props.formItem.values.find((item) => item.name === '字段样式')
  const dateType = fieldStyle?.value ?? '年'
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  formRulesUtil.depRules({
    name: `COMP_DATE___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^(?!0$).*$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择日期',
    dateType: dateType as string,
    disabled: !((defaultItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false),
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    value: (titleItem?.form_value as string) ?? ''
  }
}

const handleClear = () => {
  if (selectedDate.value !== '0') {
    selectedDate.value = '0'
  }
}

const getDate = (type: 'start' | 'end'): string => {
  let value: string = ''
  const optionDate = props.formItem.values.find((item) => item.name === '可选日期')
  const optionDateValue = optionDate?.value as string | null
  console.log('optionDateValue: ', optionDateValue)
  const today = dayjs()
  if (optionDateValue === null || optionDateValue === '所以日期' || optionDateValue === '自定义') {
    value =
      type === 'start' ? today.subtract(10, 'year').format('YYYY-MM-DD') : today.add(10, 'year').format('YYYY-MM-DD')
  } else if (optionDateValue === '本周') {
    // 本周：周一开始，周日结束（按中国习惯）
    if (type === 'start') {
      const dayOfWeek = today.day() // 0=Sun, 1=Mon, ..., 6=Sat
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      value = today.subtract(diff, 'day').format('YYYY-MM-DD')
    } else {
      const dayOfWeek = today.day()
      const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
      value = today.add(diff, 'day').format('YYYY-MM-DD')
    }
  } else if (optionDateValue === '本月') {
    if (type === 'start') {
      value = today.startOf('month').format('YYYY-MM-DD')
    } else {
      value = today.endOf('month').format('YYYY-MM-DD')
    }
  } else if (optionDateValue === '最近7天') {
    if (type === 'start') {
      value = today.subtract(6, 'day').format('YYYY-MM-DD')
    } else {
      value = today.format('YYYY-MM-DD')
    }
  } else if (optionDateValue === '最近1个月') {
    if (type === 'start') {
      value = today.subtract(1, 'month').format('YYYY-MM-DD')
    } else {
      value = today.format('YYYY-MM-DD')
    }
  } else if (optionDateValue === '最近3个月') {
    if (type === 'start') {
      value = today.subtract(3, 'month').format('YYYY-MM-DD')
    } else {
      value = today.format('YYYY-MM-DD')
    }
  } else if (optionDateValue === '最近半年') {
    if (type === 'start') {
      value = today.subtract(6, 'month').format('YYYY-MM-DD')
    } else {
      value = today.format('YYYY-MM-DD')
    }
  } else if (optionDateValue === '最近一年') {
    if (type === 'start') {
      value = today.subtract(1, 'year').format('YYYY-MM-DD')
    } else {
      value = today.format('YYYY-MM-DD')
    }
  } else if (optionDateValue === '当天') {
    value = today.format('YYYY-MM-DD')
  } else if (optionDateValue === '当天及以后日期') {
    if (type === 'start') {
      value = today.format('YYYY-MM-DD')
    } else {
      value = today.add(10, 'year').format('YYYY-MM-DD')
    }
  } else {
    value =
      type === 'start' ? today.subtract(10, 'year').format('YYYY-MM-DD') : today.add(10, 'year').format('YYYY-MM-DD')
  }
  return value
}

const bindDateChange = (event: Event) => {
  const e = event as unknown as {
    detail: {
      value: string
    }
  }
  selectedDate.value = e.detail.value
}

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  config.value = getConfig()
  if (type?.value === 'edit' || type?.value === 'resubmit' || type?.value === 'invalid' || type?.value === 'modify') {
    const formValue = config.value.value as string
    if (formValue) {
      selectedDate.value = formValue
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../styles/common_select.scss';
</style>
