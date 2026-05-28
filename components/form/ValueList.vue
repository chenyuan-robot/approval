<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value" @click="handlerOpenPanel">
      <text class="render-text" v-if="props.renderOnly">{{ config.value }}</text>
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
          :value="selectedValue"
          v-else
          placeholder-style="color: #86909C; font-size: 28rpx;"
          class="component-style"
          style="height: 80rpx; pointer-events: none"
          disabled
          :placeholder="config.placeholder"
        />
        <image
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
  <uni-popup
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
          <text class="check-icon" v-if="option.checked">√</text>
          <text class="text">{{ option.name }}</text>
        </view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { queryConditionNodeValueList } from '@/apis/modules/form'
import type { ConditionNodeValueListItem } from '@/apis/typings/form'
import { formRulesUtil } from '@/pages/form/utils/rules'

interface OptionItem extends ConditionNodeValueListItem {
  checked: boolean
}

defineOptions({
  name: 'ValueList',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const index = ref<number>(0)
const options = ref<OptionItem[]>([])
const selectedValue = ref<string>('')
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
const popup = ref()
const selectedLists = ref<string[]>([])

const handleClick = (opt: OptionItem) => {
  const index = selectedLists.value.findIndex((item) => item === opt.name)
  if (index > -1) {
    selectedLists.value.splice(index, 1)
  } else {
    selectedLists.value.push(opt.name)
  }
  selectedValue.value = selectedLists.value.join(',')
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
  selectedValue.value = selectedOption.name
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
      checked: selectedLists.value.includes(opt.name)
    }
  })
})

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
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
    disabled: !(defaultItem?.extra_option_config?.default_value ?? false),
    single,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    required: required,
    value: single
      ? ((titleItem?.form_value as string) ?? '')
      : Array.isArray(titleItem?.form_values)
        ? titleItem?.form_values?.join(', ')
        : ''
  }
})

onMounted(() => {
  console.log('sectionOptions: ', props.renderOnly)
  if (props.renderOnly) return
  const sectionOptions = props.formItem.values.find((item) => item.name === '选择列表')
  const value = sectionOptions?.value ?? ''
  console.log('sectionOptions11: ', value)
  if (value) {
    const arr = (value as string).split(':')
    queryConditionNodeValueList(arr[0], arr[1])
      .then((res) => {
        if (res.code === 200) {
          options.value = ((res.message as ConditionNodeValueListItem[]) || []).map((option) => {
            return {
              ...option,
              checked: false
            }
          })
          console.log('获取到的选项列表：', options.value)
          selectedValue.value = options.value[0]?.name ?? ''
          if (selectedValue.value) {
            selectedLists.value = [selectedValue.value]
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
      height: 60rpx;
      .check-icon {
        margin-right: 16rpx;
      }
      .split {
        margin: 0 8rpx;
      }
    }
  }
}
</style>
