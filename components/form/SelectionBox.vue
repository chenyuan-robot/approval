<template>
  <view class="selection-box">
    <view class="uni-form-component">
      <view class="component-label">
        <view class="field-desc">
          <text>{{ props.formItem.label }}</text>
          <text class="required" v-if="config.required">*</text>
        </view>
        <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
      </view>
      <view class="component-value" @click="handleOpenPanel">
        <picker
          class="component-picker"
          @change="bindValueChange"
          v-if="config.single"
          range-key="name"
          :value="index"
          :range="config.options"
        >
          <view class="uni-input">{{ config.options[index]?.name ?? config.placeholder }}</view>
        </picker>
        <input :value="selectedValue" v-else class="component-style" disabled :placeholder="config.placeholder" />
        <input hidden :name="`COMP_SELECTION_BOX___${props.formItem.sequence}`" :value="selectedValue" />
      </view>
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
  </view>
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
  formRulesUtil.depRules({
    name: `COMP_SELECTION_BOX___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `请选择${props.formItem.label}`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    single: selectionMode === '单项',
    options: ((sectionOptions?.selection_list as string[]) ?? []).map((opt) => {
      return {
        name: opt,
        checked: false
      }
    }),
    defaultValue: defaultSelcetion?.specific_value ?? [],
    required: required
  }
})
</script>

<style lang="scss" scoped>
.selection-box {
  width: 100%;
  .uni-form-component {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .component-label {
      margin-left: 32rpx;
      color: #374151;
      font-size: 32rpx;
      .field-desc {
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
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        padding: 0rpx 20rpx;
        height: 64rpx;
        font-size: 32rpx;
        box-sizing: border-box;
      }
      .component-picker {
        width: 240rpx;
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        padding: 12rpx 20rpx;
        height: 64rpx;
        font-size: 32rpx;
        box-sizing: border-box;
      }
      .component-style {
        pointer-events: none;
        width: 240rpx;
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        padding: 12rpx 20rpx;
        height: 64rpx;
        font-size: 32rpx;
        box-sizing: border-box;
      }
    }
  }
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
}
</style>
