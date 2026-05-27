<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label">{{ props.formItem.label }}</text>
      </view>
    </view>
    <view class="component-value" v-if="props.renderOnly">
      <text class="render-text">{{ config.value }}</text>
    </view>
    <view class="component-value" @click="handleOpenPanel" v-else>
      <picker
        class="component-picker"
        @change="bindValueChange"
        v-if="config.single"
        range-key="name"
        :value="index"
        :range="config.options"
      >
        <view
          class="action-result"
          :style="{
            color: config.options[index]?.name ? 'rgba(16, 20, 28, 1)' : '#86909C'
          }"
        >
          {{ config.options[index]?.name ?? config.placeholder }}
        </view>
      </picker>
      <input
        placeholder-style="color: #86909C; font-size: 28rpx;"
        :value="selectedValue"
        v-else
        class="component-style"
        disabled
        :placeholder="config.placeholder"
      />
      <image class="clear-icon" @click.stop="handleClear" src="/static/clear.svg" mode="aspectFit" />
      <input hidden :name="`COMP_SELECTION_BOX___${props.formItem.sequence}`" :value="selectedValue" />
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
  selectedValue.value = ''
  index.value = -1
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
        errorMessage: `请选择${props.formItem.label}`
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
    value: single
      ? ((titleItem?.form_value as string) ?? '')
      : Array.isArray(titleItem?.form_values)
        ? titleItem?.form_values?.join(', ')
        : ''
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
  .field-sub-desc {
    color: #4e5969;
    font-size: 22rpx;
    margin-top: 10rpx;
    margin-left: 16rpx;
  }
  .component-value {
    display: flex;
    align-items: center;
    position: relative;
    .component-picker {
      width: 100%;
      border: 1px solid rgba(229, 230, 235, 0.6);
      background-color: rgba(249, 250, 251, 1);
      border-radius: 8px;
      padding-left: 20rpx;
      padding-right: 50rpx;
      font-size: 28rpx;
      box-sizing: border-box;
      height: 64rpx;
      display: flex;
      align-items: center;
      .action-result {
        font-size: 28rpx;
        box-sizing: border-box;
      }
    }
    .component-style {
      pointer-events: none;
      width: 100%;
      border: 1px solid rgba(229, 230, 235, 0.6);
      background-color: rgba(249, 250, 251, 1);
      border-radius: 8px;
      padding-left: 20rpx;
      padding-right: 50rpx;
      font-size: 28rpx;
      box-sizing: border-box;
      color: rgba(16, 20, 28, 1);
    }
    .clear-icon {
      width: 18rpx;
      height: 18rpx;
      position: absolute;
      right: 32rpx;
      top: 50%;
      transform: translateY(-50%);
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
