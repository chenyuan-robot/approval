<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value" @click="handlerOpenPanel">
      <text class="render-text" v-if="props.renderOnly">{{ displayValue }}</text>
      <view v-else style="width: 100%">
        <picker
          class="component-style"
          v-if="config.single"
          :range="options"
          range-key="name"
          style="height: 80rpx"
          mode="selector"
          :disabled="config.disabled"
          :value="index"
          @change="bindValueChange"
        >
          <view :class="['action-result', options[index]?.name ? 'fill' : 'empty']">
            {{ options[index]?.name ?? config.placeholder }}
          </view>
        </picker>
        <input
          :value="displayValue"
          v-else
          placeholder-style="color: #86909C; font-size: 28rpx;"
          class="component-style"
          style="height: 80rpx; pointer-events: none"
          disabled
          :placeholder="config.placeholder"
        />
        <image
          v-if="!config.disabled"
          class="suffix-icon"
          :src="`${selectedValue ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
          mode="aspectFit"
          @click.stop="handleClear"
        />
        <input hidden :name="`COMP_VALUE_LIST___${props.formItem.sequence}`" :value="selectedValue" />
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
  <ui-popup
    ref="popup"
    type="bottom"
    style="z-index: 9999"
    background-color="#fff"
    border-radius="10px 10px 0 0"
    :mask-closable="true"
  >
    <view class="popup-content">
      <scroll-view
        scroll-top="0"
        scroll-y
        scroll-with-animation
        :show-scrollbar="false"
        class="overlay-content"
        @click.stop
        :style="{ maxHeight: scrollHeight + 'px' }"
      >
        <view class="opt-list" v-for="option in newOpts" :key="option.code" @click="handleClick(option)">
          <image
            :src="`${option.checked ? '/static/checked_rect.svg' : '/static/uncheck_rect.svg'} `"
            mode="aspectFit"
            style="width: 32rpx; height: 32rpx; margin-right: 16rpx; vertical-align: middle"
          />
          <text class="text">{{ option.name }}</text>
        </view>
      </scroll-view>
    </view>
  </ui-popup>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, inject } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import { queryConditionNodeValueList } from '@/apis/modules/form'
import type { ConditionNodeValueListItem } from '@/apis/typings/form'
import { formRulesUtil } from '@/pages/form/utils/rules'
import { makeToast } from '@/utils/toast'

interface OptionItem extends ConditionNodeValueListItem {
  checked: boolean
}

interface FormConfig {
  placeholder: string
  showTitle: boolean
  showFieldDesc: boolean
  desc: string
  required: boolean
  single: boolean
  disabled: boolean
  value: string
}

defineOptions({
  name: 'ValueList',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const toast = makeToast()
const config = ref<FormConfig>({
  placeholder: '',
  showTitle: false,
  showFieldDesc: false,
  desc: '',
  required: false,
  single: false,
  disabled: false,
  value: ''
})
const index = ref<number>(-1)
const options = ref<OptionItem[]>([])
const selectedValue = ref<string>('')
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
const popup = ref()
const selectedLists = ref<string[]>([])

const handleClick = (opt: OptionItem) => {
  const index = selectedLists.value.findIndex((item) => item === opt.code)
  if (index > -1) {
    selectedLists.value.splice(index, 1)
  } else {
    selectedLists.value.push(opt.code)
  }
  selectedValue.value = selectedLists.value.join(',')
  console.log(selectedValue.value)
}

const handlerOpenPanel = () => {
  console.log(!props.renderOnly)
  if (!props.renderOnly && !config.value.single && !config.value.disabled) {
    console.log('打开选择面板')
    popup?.value?.open()
  }
}

const bindValueChange = (event: Event) => {
  const e = event as unknown as {
    detail: {
      value: number
    }
  }
  index.value = e.detail.value
  const selectedOption = options.value[index.value]
  selectedValue.value = selectedOption.code
}

const handleClear = () => {
  if (selectedValue.value) {
    selectedValue.value = ''
    index.value = -1
    selectedLists.value = []
  }
}

const newOpts = computed(() => {
  return options.value.map((opt) => {
    return {
      ...opt,
      checked: selectedLists.value.includes(opt.code)
    }
  })
})

const displayValue = computed(() => {
  let str: string = ''
  selectedLists.value.forEach((item) => {
    const option = options.value.find((opt) => opt.code === item)
    if (option) {
      str += option.name + ', '
    }
  })
  console.log('displayValue:', selectedLists.value)
  return str.slice(0, -2)
})

const getConfig = (): FormConfig => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const single = selectionMode === '单项' // 是否单选
  formRulesUtil.depRules({
    name: `COMP_VALUE_LIST___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    disabled: !((defaultItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false),
    single,
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    required: required,
    value: single
      ? ((titleItem?.form_value as string) ?? '')
      : Array.isArray(titleItem?.form_values)
        ? titleItem?.form_values?.join(',')
        : ''
  }
}

onMounted(() => {
  const type = inject<Ref<FormActionType>>('type')
  config.value = getConfig()
  const sectionOptions = props.formItem.values.find((item) => item.name === '选择列表')
  const selectionRange = props.formItem.values.find((item) => item.name === '选择范围')
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const value = sectionOptions?.value ?? ''
  if (value) {
    const arr = (value as string).split(':')
    queryConditionNodeValueList(arr[0], arr[1])
      .then((res) => {
        if (res.code === 200) {
          let lists: ConditionNodeValueListItem[] = []
          const opts = (res.message as ConditionNodeValueListItem[]) || []
          const specific_value = (selectionRange?.specific_value as string[]) || []
          const isDepart = selectionRange?.value === '部分'
          if (isDepart && specific_value.length > 0) {
            lists = opts.filter((opt) => specific_value.includes(opt.code))
          } else {
            lists = opts
          }
          options.value = lists.map((option) => {
            return {
              ...option,
              checked: false
            }
          })
          if (props.renderOnly) {
            selectedLists.value = config.value.value.split(',')
            return
          }
          console.log('获取到的选项列表：', options.value)
          if (defaultItem?.value === '指定值') {
            const specific_value = (defaultItem?.specific_value as string[]) || []
            if (config.value.single) {
              const specific_index = lists.findIndex((opt) => opt.code === specific_value[0])
              index.value = specific_index
              selectedValue.value = specific_value[0]
              selectedLists.value = specific_value
            } else {
              selectedValue.value = specific_value.join(',')
              selectedLists.value = specific_value
            }
          }
          if (
            type?.value === 'edit' ||
            type?.value === 'resubmit' ||
            type?.value === 'modify' ||
            type?.value === 'invalid'
          ) {
            if (config.value.single) {
              const selectedIndex = options.value.findIndex((opt) => opt.code === config.value.value)
              index.value = selectedIndex
              selectedValue.value = config.value.value
              selectedLists.value = [config.value.value]
            } else {
              selectedValue.value = config.value.value as string
              selectedLists.value = (config.value.value as string).split(',')
            }
          }
        } else {
          uni.showToast({
            title: (res?.message as string) || '获取选项列表失败',
            icon: 'none'
          })
        }
      })
      .catch(() => {
        uni.showToast({
          title: '获取选项列表失败',
          icon: 'none'
        })
      })
  } else {
    toast.info('暂无值列表数据', 2000)
  }
})
</script>

<style lang="scss" scoped>
@import '../../styles/common_select.scss';
.popup-content {
  position: relative;
  z-index: 9999;
  height: 50vh;
  .overlay-content {
    padding: 32rpx;
    .opt-list {
      height: 70rpx;
      display: flex;
      align-items: center;
      .split {
        margin: 0 8rpx;
      }
    }
  }
}
</style>
