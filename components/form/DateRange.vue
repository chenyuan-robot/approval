<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value">
      <view v-if="props.renderOnly" class="detail-container">
        <text class="render-text">{{ config.value?.[0] ?? '' }}</text>
        <text class="render-splite">至</text>
        <text class="render-text">{{ config.value?.[1] ?? '' }}</text>
      </view>
      <view v-else class="form-container">
        <view class="start-date">
          <picker
            class="component-style"
            :style="{
              height: '80rpx',
              width:
                config.dateType === '年' || config.dateType === '年-月' || config.dateType === '年-月-日'
                  ? '100%'
                  : '70%'
            }"
            :name="
              config.dateType === '年-月-日 时-分' || config.dateType === '年-月-日 上午/下午'
                ? ''
                : `COMP_DATE_RANGE___${props.formItem.sequence}_start`
            "
            mode="date"
            :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
            :value="startDate"
            :start="getDate('start')"
            :end="getDate('end')"
            :disabled="config.disabled"
            @change="bindDateChange($event, 'start')"
          >
            <view :class="['action-result', startDate === '0' ? 'empty' : 'fill']">
              {{ startDate === '0' ? '请选择开始时间' : startDate }}
            </view>
            <image
              class="suffix-icon"
              v-if="!config.disabled"
              :src="`${startDate !== '0' ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
              mode="aspectFit"
              @click.stop="handleClearStartDate"
            />
          </picker>
          <view class="right" v-if="config.dateType === '年-月-日 时-分' || config.dateType === '年-月-日 上午/下午'">
            <picker
              v-if="config.dateType === '年-月-日 时-分'"
              class="component-time-style"
              mode="time"
              :value="startDateDeparture === '0' ? '00:00' : startDateDeparture"
              :disabled="config.disabled"
              @change="bindDepartureChange($event, 'start')"
            >
              <view :class="['action-result', startDateDeparture === '0' ? 'empty' : 'fill']">
                {{ startDateDeparture === '0' ? '请选择' : startDateDeparture }}
              </view>
            </picker>
            <picker
              v-else
              class="component-time-style"
              mode="selector"
              :range="departureRange"
              :value="Math.max(0, departureRange.indexOf(startDateDeparture === '0' ? '' : startDateDeparture))"
              :disabled="config.disabled"
              @change="bindDepartureChange($event, 'start')"
            >
              <view :class="['action-result', startDateDeparture === '0' ? 'empty' : 'fill']">
                {{ startDateDeparture === '0' ? '请选择' : startDateDeparture }}
              </view>
            </picker>
            <input
              hidden
              :name="`COMP_DATE_RANGE___${props.formItem.sequence}_concern_start`"
              :value="concernStartValue"
            />
          </view>
        </view>
        <view class="end-date">
          <picker
            class="component-style"
            :style="{
              height: '80rpx',
              width:
                config.dateType === '年' || config.dateType === '年-月' || config.dateType === '年-月-日'
                  ? '100%'
                  : '70%'
            }"
            :name="
              config.dateType === '年-月-日 时-分' || config.dateType === '年-月-日 上午/下午'
                ? ''
                : `COMP_DATE_RANGE___${props.formItem.sequence}_end`
            "
            mode="date"
            :fields="`${config.dateType === '年' ? 'year' : config.dateType === '年-月' ? 'month' : 'day'}`"
            :value="endDate"
            :start="getDate('start')"
            :end="getDate('end')"
            :disabled="config.disabled"
            @change="bindDateChange($event, 'end')"
          >
            <view :class="['action-result', endDate === '0' ? 'empty' : 'fill']">
              {{ endDate === '0' ? '请选择结束时间' : endDate }}
            </view>
            <image
              v-if="!config.disabled"
              class="suffix-icon"
              :src="`${endDate !== '0' ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
              mode="aspectFit"
              @click.stop="handleClearEndDate"
            />
          </picker>
          <view class="right" v-if="config.dateType === '年-月-日 时-分' || config.dateType === '年-月-日 上午/下午'">
            <picker
              v-if="config.dateType === '年-月-日 时-分'"
              class="component-time-style"
              mode="time"
              :value="endDateDeparture === '0' ? '00:00' : endDateDeparture"
              :disabled="config.disabled"
              @change="bindDepartureChange($event, 'end')"
            >
              <view :class="['action-result', endDateDeparture === '0' ? 'empty' : 'fill']">
                {{ endDateDeparture === '0' ? '请选择' : endDateDeparture }}
              </view>
            </picker>
            <picker
              v-else
              class="component-time-style"
              mode="selector"
              :range="departureRange"
              :value="Math.max(0, departureRange.indexOf(endDateDeparture === '0' ? '' : endDateDeparture))"
              :disabled="config.disabled"
              @change="bindDepartureChange($event, 'end')"
            >
              <view :class="['action-result', endDateDeparture === '0' ? 'empty' : 'fill']">
                {{ endDateDeparture === '0' ? '请选择' : endDateDeparture }}
              </view>
            </picker>
            <input hidden :name="`COMP_DATE_RANGE___${props.formItem.sequence}_concern_end`" :value="concernEndValue" />
          </view>
        </view>
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    <view
      class="field-sub-desc"
      v-if="
        (config.dateType === '年-月-日' ||
          config.dateType === '年-月-日 时-分' ||
          config.dateType === '年-月-日 上午/下午') &&
        config.showBetween &&
        between > 0
      "
    >
      <text v-if="config.dateType === '年-月-日 时-分'">共{{ between }}小时</text>
      <text v-else>共{{ between }}天</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'
import dayjs from 'dayjs'
import { makeToast } from '@/utils/toast'

interface FormConfig {
  placeholder: string
  dateType: string
  showTitle: boolean
  disabled: boolean
  showBetween: boolean
  showFieldDesc: boolean
  desc: string
  required: boolean
  value: string[]
}

defineOptions({
  name: 'DateRange',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const config = ref<FormConfig>({
  placeholder: '',
  dateType: '年',
  showTitle: false,
  showFieldDesc: false,
  disabled: false,
  showBetween: false,
  desc: '',
  required: false,
  value: ['', '']
})
const between = ref<number>(0)
const toast = makeToast()
const startDate = ref<string>('0')
const startDateDeparture = ref<string>('0')
const endDate = ref<string>('0')
const endDateDeparture = ref<string>('0')
const departureRange = ['上午', '下午']
const concernStartValue = ref<string>('')
const concernEndValue = ref<string>('')

const parseAmPmStr = (str: string) => {
  if (str.includes('上午')) {
    return str.replace(' 上午', ' 08:00')
  } else if (str.includes('下午')) {
    return str.replace(' 下午', ' 14:00')
  }
  return str
}

const getHalfDayDiff = (s1: string, s2: string): number => {
  const t1 = dayjs(parseAmPmStr(s1))
  const t2 = dayjs(parseAmPmStr(s2))

  const d1 = t1.format('YYYY-MM-DD')
  const d2 = t2.format('YYYY-MM-DD')

  const is1Am = s1.endsWith('上午')
  const is2Am = s2.endsWith('上午')

  // 1. 同一天
  if (d1 === d2) {
    if (is1Am === is2Am) {
      // 同为上午 / 同为下午
      return 0.5
    } else {
      // 一上午一下午
      return 1
    }
  }

  // 2. 不同日期
  const dayDiff = Math.abs(t1.diff(t2, 'day'))
  let halfAdd = is1Am === is2Am ? 0.5 : 1
  return dayDiff + halfAdd
}

const getConfig = (): FormConfig => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const fieldStyle = props.formItem.values.find((item) => item.name === '字段样式')
  const dateType = fieldStyle?.value ?? '年'
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const showBetween = (fieldAttr?.value as string)?.includes('是否自动计算') ?? false
  if (showBetween && Array.isArray(titleItem?.form_values) && titleItem?.form_values?.[0]) {
    if (dateType === '年-月-日') {
      const diffDays = Math.abs(dayjs(titleItem?.form_values?.[0]).diff(dayjs(titleItem?.form_values?.[1]), 'day'))
      console.log(diffDays) // 输出：29
      between.value = diffDays + 1
    } else if (dateType === '年-月-日 时-分') {
      const start = dayjs(titleItem?.form_values?.[0])
      const end = dayjs(titleItem?.form_values?.[1])
      const diffHours = Math.abs(start.diff(end, 'hour'))
      between.value = diffHours
    } else if (dateType === '年-月-日 上午/下午') {
      between.value = getHalfDayDiff(titleItem?.form_values?.[0], titleItem?.form_values?.[1])
    }
  }

  // 该表单项校验规则
  if (dateType === '年-月-日 时-分' || dateType === '年-月-日 上午/下午') {
    formRulesUtil.depRules({
      name: `COMP_DATE_RANGE___${props.formItem.sequence}_concern_start`,
      rules: [
        {
          ruleType: required ? '^(?!0\s).+ (?!0$).+$' : '.*',
          errorMessage: `请选择开始时间`
        }
      ]
    })
    formRulesUtil.depRules({
      name: `COMP_DATE_RANGE___${props.formItem.sequence}_concern_end`,
      rules: [
        {
          ruleType: required ? '^(?!0\s).+ (?!0$).+$' : '.*',
          errorMessage: `请选择结束时间`
        }
      ]
    })
  } else {
    formRulesUtil.depRules({
      name: `COMP_DATE_RANGE___${props.formItem.sequence}_start`,
      rules: [
        {
          ruleType: required ? '^(?!0$).*$' : '.*',
          errorMessage: `请选择开始时间`
        }
      ]
    })
    formRulesUtil.depRules({
      name: `COMP_DATE_RANGE___${props.formItem.sequence}_end`,
      rules: [
        {
          ruleType: required ? '^(?!0$).*$' : '.*',
          errorMessage: `请选择结束时间`
        }
      ]
    })
  }

  return {
    placeholder: placeholder || '请选择日期范围',
    dateType: dateType as string,
    showBetween,
    disabled: !((defaultItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false),
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    value: (titleItem?.form_values as string[]) ?? ['', '']
  }
}

watch(
  () => startDate.value,
  () => {
    if (startDate.value !== '0' && endDate.value !== '0') {
      const startTimeStamp = dayjs(startDate.value).unix()
      const endTimeStamp = dayjs(endDate.value).unix()
      if (startTimeStamp > endTimeStamp) {
        endDate.value = '0'
        endDateDeparture.value = '0'
        concernEndValue.value = ''
        toast.error('开始时间不能大于结束时间', 2000)
        return
      }
    }
    if (config.value.showBetween && startDate.value !== '0' && endDate.value !== '0') {
      if (config.value.dateType === '年-月-日') {
        const diffDays = Math.abs(dayjs(startDate.value).diff(dayjs(endDate.value), 'day'))
        between.value = diffDays + 1
      } else {
        if (startDateDeparture.value !== '0' && endDateDeparture.value !== '0') {
          const start = `${startDate.value} ${startDateDeparture.value}`
          const end = `${endDate.value} ${endDateDeparture.value}`
          if (config.value.dateType === '年-月-日 上午/下午') {
            between.value = getHalfDayDiff(start, end)
          } else if (config.value.dateType === '年-月-日 时-分') {
            const diffHours = Math.abs(dayjs(start).diff(dayjs(end), 'hour'))
            between.value = diffHours
          }
        }
      }
    }
  }
)

watch(
  () => startDateDeparture.value,
  () => {
    if (config.value.showBetween && startDate.value !== '0' && endDate.value !== '0') {
      if (config.value.dateType === '年-月-日') {
        const diffDays = Math.abs(dayjs(startDate.value).diff(dayjs(endDate.value), 'day'))
        between.value = diffDays + 1
      } else {
        if (startDateDeparture.value !== '0' && endDateDeparture.value !== '0') {
          const start = `${startDate.value} ${startDateDeparture.value}`
          const end = `${endDate.value} ${endDateDeparture.value}`
          if (config.value.dateType === '年-月-日 上午/下午') {
            between.value = getHalfDayDiff(start, end)
          } else if (config.value.dateType === '年-月-日 时-分') {
            const diffHours = Math.abs(dayjs(start).diff(dayjs(end), 'hour'))
            between.value = diffHours
          }
        }
      }
    }
  }
)

watch(
  () => endDate.value,
  () => {
    if (startDate.value !== '0' && endDate.value !== '0') {
      const startTimeStamp = dayjs(startDate.value).unix()
      const endTimeStamp = dayjs(endDate.value).unix()
      if (startTimeStamp > endTimeStamp) {
        startDate.value = '0'
        startDateDeparture.value = '0'
        concernStartValue.value = ''
        toast.error('结束时间不能小于开始时间', 2000)
        return
      }
    }
    if (config.value.showBetween && startDate.value !== '0' && endDate.value !== '0') {
      if (config.value.dateType === '年-月-日') {
        const diffDays = Math.abs(dayjs(startDate.value).diff(dayjs(endDate.value), 'day'))
        between.value = diffDays + 1
      } else {
        if (startDateDeparture.value !== '0' && endDateDeparture.value !== '0') {
          const start = `${startDate.value} ${startDateDeparture.value}`
          const end = `${endDate.value} ${endDateDeparture.value}`
          if (config.value.dateType === '年-月-日 上午/下午') {
            between.value = getHalfDayDiff(start, end)
          } else if (config.value.dateType === '年-月-日 时-分') {
            const diffHours = Math.abs(dayjs(start).diff(dayjs(end), 'hour'))
            between.value = diffHours
            console.log('between', diffHours)
          }
        }
      }
    }
  }
)

watch(
  () => endDateDeparture.value,
  () => {
    if (config.value.showBetween && startDate.value !== '0' && endDate.value !== '0') {
      if (config.value.dateType === '年-月-日') {
        const diffDays = Math.abs(dayjs(startDate.value).diff(dayjs(endDate.value), 'day'))
        between.value = diffDays + 1
      } else {
        if (startDateDeparture.value !== '0' && endDateDeparture.value !== '0') {
          const start = `${startDate.value} ${startDateDeparture.value}`
          const end = `${endDate.value} ${endDateDeparture.value}`
          if (config.value.dateType === '年-月-日 上午/下午') {
            between.value = getHalfDayDiff(start, end)
          } else if (config.value.dateType === '年-月-日 时-分') {
            const diffHours = Math.abs(dayjs(start).diff(dayjs(end), 'hour'))
            between.value = diffHours
          }
        }
      }
    }
  }
)

const getDate = (type: 'start' | 'end'): string => {
  const date = new Date()
  let year = date.getFullYear()
  let month: string | number = date.getMonth() + 1
  let day: string | number = date.getDate()
  if (type === 'start') {
    year = year - 10
  } else if (type === 'end') {
    year = year + 10
  }
  month = month > 9 ? month : '0' + month
  day = day > 9 ? day : '0' + day
  return `${year}-${month}-${day}`
}

const bindDateChange = (event: Event, type: 'start' | 'end') => {
  const e = event as unknown as {
    detail: {
      value: string
    }
  }
  if (type === 'start') {
    startDate.value = e.detail.value
    if (config.value.dateType === '年-月-日 上午/下午' || config.value.dateType === '年-月-日 时-分') {
      if (concernStartValue.value.split(' ').length > 1) {
        concernStartValue.value = `${startDate.value} ${startDateDeparture.value}`
      }
    }
  } else {
    endDate.value = e.detail.value
    if (config.value.dateType === '年-月-日 上午/下午' || config.value.dateType === '年-月-日 时-分') {
      if (concernEndValue.value.split(' ').length > 1) {
        concernEndValue.value = `${endDate.value} ${endDateDeparture.value}`
      }
    }
  }
}

const bindDepartureChange = (event: Event, type: 'start' | 'end') => {
  const e = event as unknown as {
    detail: {
      value: string | number
    }
  }
  // 时-分：mode="time" 直接返回 "HH:mm" 字符串
  // 上午/下午：mode="selector" 返回的是选项下标，需要转成对应文案
  const isAmPm = config.value.dateType === '年-月-日 上午/下午'
  const value = isAmPm ? departureRange[Number(e.detail.value)] : (e.detail.value as string)
  if (type === 'start') {
    console.log(value)
    startDateDeparture.value = value
    concernStartValue.value = `${startDate.value} ${startDateDeparture.value}`
  } else {
    endDateDeparture.value = value
    concernEndValue.value = `${endDate.value} ${endDateDeparture.value}`
  }
}

const handleClearStartDate = () => {
  if (startDate.value !== '0') {
    startDate.value = '0'
    startDateDeparture.value = '0'
  }
}

const handleClearEndDate = () => {
  if (endDate.value !== '0') {
    endDate.value = '0'
    endDateDeparture.value = '0'
  }
}

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  config.value = getConfig()
  if (type?.value === 'edit' || type?.value === 'resubmit' || type?.value === 'invalid' || type?.value === 'modify') {
    if (config.value.value?.[0]) {
      if (config.value.dateType === '年-月-日 上午/下午') {
        const [startDateValue, endDateValue] = config.value.value
        startDate.value = startDateValue.split(' ')[0]
        startDateDeparture.value = startDateValue.split(' ')[1]
        concernStartValue.value = startDateValue
        endDate.value = endDateValue.split(' ')[0]
        endDateDeparture.value = endDateValue.split(' ')[1]
        concernEndValue.value = endDateValue
      } else if (config.value.dateType === '年-月-日 时-分') {
        const [startDateValue, endDateValue] = config.value.value
        startDate.value = startDateValue.split(' ')[0]
        startDateDeparture.value = startDateValue.split(' ')[1]
        concernStartValue.value = startDateValue
        endDate.value = endDateValue.split(' ')[0]
        endDateDeparture.value = endDateValue.split(' ')[1]
        concernEndValue.value = endDateValue
      } else {
        startDate.value = config.value.value[0]
        endDate.value = config.value.value[1]
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../styles/common_range.scss';
</style>
