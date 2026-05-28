<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value" @click="handleOpenPanel">
      <text class="render-text" v-if="props.renderOnly">{{ config.value }}</text>
      <view v-else style="width: 100%">
        <picker
          class="component-style"
          @change="bindValueChange"
          v-if="config.single"
          style="height: 80rpx"
          range-key="name"
          :value="index"
          :range="config.options"
        >
          <view :class="['action-result', config.options[index]?.name ? 'fill' : 'empty']">
            {{ config.options[index]?.name ?? config.placeholder }}
          </view>
        </picker>
        <input
          placeholder-style="color: #86909C; font-size: 28rpx;"
          :value="selectedValue"
          v-else
          style="height: 80rpx; pointer-events: none"
          class="component-style"
          disabled
          :placeholder="config.placeholder"
        />
        <image
          class="suffix-icon"
          :src="`${selectedValue ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
          mode="aspectFit"
          @click.stop="handleClear"
        />
        <input hidden :name="`COMP_SELECTION_BOX___${props.formItem.sequence}`" :value="selectedValue" />
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
        <view class="opt-list" v-for="option in newOpts" :key="option.name" @click="handleClick(option)">
          <text class="check-icon" v-if="option.checked">√</text>
          <text class="text">{{ option.name }}</text>
        </view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'

interface OptionItem {
  name: string
  checked: boolean
}

defineOptions({
  name: 'SelectionBox',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const index = ref<number>(-1)
const popup = ref()
const selectedValue = ref<string>('')
const selectedLists = ref<string[]>([])
const scrollHeight = uni.getSystemInfoSync().windowHeight - 200

const handleClick = (opt: OptionItem) => {
  const index = selectedLists.value.findIndex((item) => item === opt.name)
  if (index > -1) {
    selectedLists.value.splice(index, 1)
  } else {
    selectedLists.value.push(opt.name)
  }
  selectedValue.value = selectedLists.value.join(',')
}

const handleClear = () => {
  if (selectedValue.value) {
    selectedValue.value = ''
    index.value = -1
    selectedLists.value = []
  }
}

const handleOpenPanel = () => {
  console.log(config.value.single)
  if (!config.value.single) {
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
  const selectedOption = config.value.options[index.value]
  selectedValue.value = selectedOption.name
}

const newOpts = computed(() => {
  return config.value.options.map((opt) => {
    return {
      ...opt,
      checked: selectedLists.value.includes(opt.name)
    }
  })
})

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const sectionOptions = props.formItem.values.find((item) => item.name === '选择列表')
  const defaultSelcetion = props.formItem.values.find((item) => item.name === '默认值')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  formRulesUtil.depRules({
    name: `COMP_SELECTION_BOX___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  const single = selectionMode === '单项' // 是否单选
  return {
    placeholder: placeholder || '请选择',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    single: single,
    options: ((sectionOptions?.selection_list as string[]) ?? []).map((opt) => {
      return {
        name: opt,
        checked: false
      }
    }),
    defaultValue: defaultSelcetion?.specific_value ?? [],
    required: required,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
    value: single
      ? ((titleItem?.form_value as string) ?? '')
      : Array.isArray(titleItem?.form_values)
        ? titleItem?.form_values?.join(', ')
        : ''
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
