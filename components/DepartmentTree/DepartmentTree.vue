<template>
  <view class="department-tree">
    <view v-for="item in departments" :key="item.key" class="department-item">
      <view
        class="department-row"
        @click="handleExpand(item)"
      >
        <image
          :src="`${selectedKeys.includes(item.key) ? '/static/checked_rect.svg' : '/static/uncheck_rect.svg'} `"
          mode="aspectFit"
          style="width: 32rpx; height: 32rpx; margin-right: 16rpx;"
          @click.stop="handleSelect(item)"
        />
        <text class="department-name">{{ item.name }}</text>
        <view
          v-if="item.children && item.children.length > 0"
          class="expand-icon"
          :class="{ 'expand-icon-open': expandedKeys.includes(item.key) }"
          @click.stop="handleExpand(item)"
        >
          <image
            :src="`${'/static/arrow_down.svg'} `"
            style="width: 20rpx;"
            mode="aspectFit"
          />
        </view>
        <view v-else class="expand-icon-placeholder"></view>
      </view>
      <view
        v-show="item.children && item.children.length > 0 && expandedKeys.includes(item.key)"
        class="department-children"
      >
        <DepartmentTree
          :key="item.key"
          :departments="item.children"
          :selected-keys="selectedKeys"
          @select="handleChildSelect"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import type { DepartmentsResponse } from '@/apis/typings/global'
import DepartmentTree from '@/components/DepartmentTree/DepartmentTree.vue'

defineOptions({
  name: 'DepartmentTree'
})

const props = defineProps<{
  departments: DepartmentsResponse[]
  selectedKeys: string[]
}>()

const emit = defineEmits<{
  select: [key: string, item: DepartmentsResponse]
}>()

const expandedKeys = ref<string[]>([])

const handleExpand = (item: DepartmentsResponse) => {
  const index = expandedKeys.value.indexOf(item.key)
  if (index > -1) {
    expandedKeys.value = expandedKeys.value.filter((k) => k !== item.key)
  } else {
    expandedKeys.value = [...expandedKeys.value, item.key]
  }
}

const handleSelect = (item: DepartmentsResponse) => {
  emit('select', item.key, item)
}

const handleChildSelect = (key: string, item: DepartmentsResponse) => {
  emit('select', key, item)
}
</script>

<style scoped>
.department-tree {
  width: 100%;
}

.department-item {
  width: 100%;
}

.department-row {
  display: flex;
  align-items: center;
  padding: 22rpx 0rpx;
  border-bottom: 2rpx solid #E5E6EB66;
}

.expand-icon {
  width: 48rpx;
  height: 48rpx;
  font-size: 24rpx;
  margin-left: auto;
  justify-content: center;
  align-items: center;
  display: flex;
  transform: rotate(-90deg);
}

.expand-icon-open {
  transform: rotate(0deg);
}

.expand-icon-placeholder {
  width: 48rpx;
}

.department-children {
  padding-left: 48rpx;
}

.department-name {
  font-size: 28rpx;
  color: #10141C;
}

</style>
