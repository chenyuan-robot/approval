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
      <view v-else>
        <!-- <view v-for="formItem in config.combination_fields" :key="formItem.sequence" class="uni-form-item">
          <view v-if="formItem.component_code === 'COMP_AMOUNT'">
            <Amount :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_START_END_DATE'">
            <StartEndDate :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_HAPPEN_DATE'">
            <HappenDate :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_ALLOCATION_BUDGET'">
            <AllocationBudget :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_SECRET_MULTI_INPUT'">
            <SecretMultiInput :formItem="formItem" :isReview="false" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_COST_BEAR'">
            <CostBear :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_SECRET_ATTACHMENT'">
            <SecretAttachment :formItem="formItem" :isReview="false" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_SUBSTITUTE'">
            <Substitute :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_INVOICE'">
            <Invoice :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_REASON'">
            <Reason :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_MULTI_INPUT'">
            <MultiInput :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_DEPARTMENT_SELECT'">
            <DepartmentSelect :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_SINGLE_INPUT'">
            <SingleInput :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_VALUE_LIST'">
            <ValueList :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_SWITCH'">
            <ASwitch :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_NUMBER'">
            <ANumber :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_CITY'">
            <City :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_SELECTION_BOX'">
            <SelectionBox :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_ATTACHMENT'">
            <Attachment :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_DATE'">
            <ADate :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_COMPANY_SELECT'">
            <CompanySelect :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_USER_SELECT'">
            <UserSelect :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_DATE_RANGE'">
            <DateRange :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_DESC'">
            <DescInput :formItem="formItem" />
          </view>
          <view v-else-if="formItem.component_code === 'COMP_FORMULA'">
            <Formula :formItem="formItem" />
          </view>
        </view> -->
      </view>
    </view>
    <view class="field-sub-desc" v-if="config.showFieldDesc">{{ config.desc }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import type { FormActionType, FormItem } from '../../pages/form/typings'
import { formRulesUtil } from '@/pages/form/utils/rules'
import ANumber from '@/components/form/ANumber.vue'
import Attachment from '@/components/form/Attachment.vue'
import ValueList from '@/components/form/ValueList.vue'
import City from '@/components/form/City.vue'
import DateRange from '@/components/form/DateRange.vue'
import AllocationBudget from '@/components/form/AllocationBudget.vue'
import HappenDate from '@/components/form/HappenDate.vue'
import Substitute from '@/components/form/Substitute.vue'
import SecretAttachment from '@/components/form/SecretAttachment.vue'
import Reason from '@/components/form/Reason.vue'
import SecretMultiInput from '@/components/form/SecretMultiInput.vue'
import Invoice from '@/components/form/Invoice.vue'
import DescInput from '@/components/form/DescInput.vue'
import Formula from '@/components/form/Formula.vue'
import ADate from '@/components/form/ADate.vue'
import Amount from '@/components/form/Amount.vue'
import ASwitch from '@/components/form/ASwitch.vue'
import MultiInput from '@/components/form/MultiInput.vue'
import SelectionBox from '@/components/form/SelectionBox.vue'
import SingleInput from '@/components/form/SingleInput.vue'
import StartEndDate from '@/components/form/StartEndDate.vue'
import UserSelect from '@/components/form/UserSelect.vue'
import CostBear from '@/components/form/CostBear.vue'
import CompanySelect from '@/components/form/CompanySelect.vue'
import DepartmentSelect from '@/components/form/DepartmentSelect.vue'
import { combination_fields } from './mock'

interface FormConfig {
  placeholder: string
  showTitle: boolean
  disabled: boolean
  showFieldDesc: boolean
  desc: string
  required: boolean
  value: string
  combination_fields: Array<FormItem>
}

defineOptions({
  name: 'AForm',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
  renderOnly?: boolean
}>()

const selectedDate = ref<string>('0')
const config = ref<FormConfig>({
  placeholder: '',
  disabled: false,
  showTitle: false,
  showFieldDesc: false,
  desc: '',
  required: false,
  value: '',
  combination_fields: []
})

const getConfig = (): FormConfig => {
  console.log('formItem values: ', props.formItem.values)
  const placeholder = props.formItem.values.find((item) => item.name === '录入提示')?.value as string
  const fieldDesc = props.formItem.values.find((item) => item.name === '字段说明')
  const showFieldDesc = (fieldDesc?.extra_option_config as { default_value?: boolean })?.default_value ?? false
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
  console.log('fieldAttr: ', titleItem?.combination_fields ?? [])
  return {
    placeholder: placeholder || '请选择日期',
    disabled: !((defaultItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false),
    showTitle: (titleItem?.extra_option_config as { default_value?: boolean })?.default_value ?? false,
    showFieldDesc: showFieldDesc,
    desc: fieldDesc?.value as string,
    required: required,
    combination_fields: combination_fields ?? [],
    value: (titleItem?.form_value as string) ?? ''
  }
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
