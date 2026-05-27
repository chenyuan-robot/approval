<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="field-label">{{ props.formItem.label }}</text>
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value" v-if="props.renderOnly" >
      <text class="render-text">{{ config.value  }}</text>
    </view>
    <view class="component-value" v-else @click="openPanel">
      <input
        :value="selectedValue"
        placeholder-style="color: #adb5bd; font-size: 28rpx;"
        class="component-style"
        disabled
        :placeholder="config.placeholder"
      />
      <image class="clear-icon" @click.stop="handleClear" src="/static/clear.svg" mode="aspectFit" />
      <input hidden :name="`COMP_DEPARTMENT_SELECT___${props.formItem.sequence}`" :value="submitValue" />
    </view>
  </view>
  <DepartmentPopup 
    ref="departmentPopupRef" 
    @update:modelValue="handleDepartmentSelect"
    :single="config.single"
   />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormItem } from '../../pages/form/typings'
import DepartmentPopup from '@/components/DepartmentPopup.vue'
import type { DepartmentsResponse } from '@/apis/typings/global'
import { useStore } from 'vuex'
import { formRulesUtil } from '@/pages/form/utils/rules'

const store = useStore()

defineOptions({
  name: 'DepartmentSelect',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem,
  renderOnly?: boolean
}>()

const departmentPopupRef = ref()
const selectedDepartments = ref<DepartmentsResponse[]>([])
const selectedValue = ref<string>('')
const submitValue = ref<string>('')

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.placeholder as string
  const fieldAttr = props.formItem.values.find((item) => item.name === '字段属性')
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: string })?.default_value ?? false
  const maxlength = props.formItem.values.find((item) => item.name === '字符数限制')?.value as string
  const defaultItem = props.formItem.values.find((item) => item.name === '默认值')
  const selectionRange = props.formItem.values.find((item) => item.name === '选择范围')
  const required = (fieldAttr?.value as string)?.includes('必填') ?? false
  const titleItem = props.formItem.values.find((item) => item.name === '标题')
  const selectionMode = props.formItem.values.find((item) => item.name === '选择模式')?.value as string
  const formValues = (titleItem?.form_values as string[]) ?? []
  let nameStr: string = ''
  for (const item of formValues) {
    const data = store.state.departmentsMap[item]
    if (data !== undefined) {
      const name: string = data.name
      nameStr += name ? `${name}、` : ''
    }
  }
  nameStr = nameStr.slice(0, -1)
  formRulesUtil.depRules({
    name: `COMP_DEPARTMENT_SELECT___${props.formItem.sequence}`,
    rules: [
      {
        ruleType: required ? '^.+$' : '.*',
        errorMessage: `请选择${props.formItem.label}`
      }
    ]
  })
  return {
    placeholder: placeholder || '请输入内容',
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    defaultValue: defaultItem?.value === '指定值' ? ((defaultItem?.specific_value as string[]) ?? []) : [],
    maxlength: Number(maxlength) || 1000,
    showAll: selectionRange?.value === '全部',
    departUserList: (selectionRange?.specific_value as string[]) ?? [],
    single: selectionMode === '单项',
    required: required,
    value: nameStr
  }
})

const openPanel = (): void => {
  departmentPopupRef?.value?.open()
}

const handleDepartmentSelect = (selectedDepartment: DepartmentsResponse) => {
  if (config.value.single) {
    selectedValue.value = selectedDepartment.name
    submitValue.value = selectedDepartment.key
    return
  }
  const index = selectedDepartments.value.findIndex((item) => item.key === selectedDepartment.key)
  if (index > -1) {
    selectedDepartments.value.splice(index, 1)
  } else {
    selectedDepartments.value.push(selectedDepartment)
  }
  selectedValue.value = selectedDepartments.value.map((item) => item.name).join(', ')
  submitValue.value = selectedDepartments.value.map((item) => item.key).join(', ')
}

const handleClear = () => {
  submitValue.value = ''
  selectedValue.value = ''
}

</script>

<style lang="scss" scoped>
.uni-form-component {
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
    position: relative;
    .component-style {
      pointer-events: none;
      width: 300rpx;
      border: 1px solid #d4d6d9;
      border-radius: 4px;
      padding: 12rpx 50rpx 12rpx 20rpx;
      height: 64rpx;
      font-size: 32rpx;
      box-sizing: border-box;
    }
    .clear-icon {
      width: 18rpx;
      height: 18rpx;
      position: absolute;
      right: 15rpx;
      top: 50%;
      transform: translateY(-50%);
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
