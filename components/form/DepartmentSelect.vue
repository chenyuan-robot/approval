<template>
  <view :class="['uni-form-component', props.renderOnly ? 'readable' : 'editable']">
    <view class="component-label">
      <view class="field-desc">
        <text class="required" v-if="!props.renderOnly && config.required">*</text>
        <text class="field-label" v-if="!config.showTitle">{{ props.formItem.label }}</text>
      </view>
      <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
    </view>
    <view class="component-value" @click="openPanel">
      <text class="render-text" v-if="props.renderOnly">{{ config.value }}</text>
      <view v-else style="width: 100%">
        <input
          :value="selectedValue"
          placeholder-style="color: #86909C; font-size: 28rpx;"
          style="height: 80rpx; pointer-events: none"
          class="component-style"
          disabled
          :placeholder="config.placeholder"
        />
        <image
          class="suffix-icon"
          :src="`${submitValue ? '/static/clear.svg' : '/static/arrow_down.svg'} `"
          mode="aspectFit"
          @click.stop="handleClear"
        />
        <input hidden :name="`COMP_DEPARTMENT_SELECT___${props.formItem.sequence}`" :value="submitValue" />
      </view>
    </view>
  </view>
  <DepartmentPopup ref="departmentPopupRef" @update:modelValue="handleDepartmentSelect" :single="config.single" />
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
  formItem: FormItem
  renderOnly?: boolean
}>()

const departmentPopupRef = ref()
const selectedDepartments = ref<DepartmentsResponse[]>([])
const selectedValue = ref<string>('')
const submitValue = ref<string>('')

const config = computed(() => {
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
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
        errorMessage: `${props.formItem.label}不能为空`
      }
    ]
  })
  return {
    placeholder: placeholder || '请选择',
    showFieldDesc: showFieldDesc,
    showTitle: (titleItem?.extra_option_config as { default_value?: string })?.default_value ?? false,
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
  if (!props.renderOnly) {
    departmentPopupRef?.value?.open()
  }
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
  if (submitValue.value) {
    submitValue.value = ''
    selectedValue.value = ''
  }
}
</script>

<style lang="scss" scoped>
@import './../../styles/common_select.scss';
</style>
