<template>
  <view class="uni-form-component"> DepartmentSelect </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItem } from '../../pages/form/typings'

defineOptions({
  name: 'DepartmentSelect',
  inheritAttrs: false
})

const props = defineProps<{
  formItem: FormItem
}>()
</script>

<style lang="scss" scoped></style>
