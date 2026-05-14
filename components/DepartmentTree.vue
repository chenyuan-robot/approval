<template>
	<view class="department-tree">
		<view v-for="item in departments" :key="item.key" class="department-item">
			<view class="department-row" :class="{ 'department-row-selected': selectedKeys.includes(item.key) }"
				@click="handleSelect(item)">
				<view v-if="item.children && item.children.length > 0" class="expand-icon"
					:class="{ 'expand-icon-open': expandedKeys.includes(item.key) }" @click.stop="handleExpand(item)">
					▶
				</view>
				<view v-else class="expand-icon-placeholder"></view>
				<text class="department-name">{{ item.name }}</text>
			</view>
			<view v-if="item.children && item.children.length > 0 && expandedKeys.includes(item.key)"
				class="department-children">
				<DepartmentTree :departments="item.children" :selected-keys="selectedKeys"
					@select="handleChildSelect" />
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { defineProps, defineEmits, ref } from 'vue'
	import type { DepartmentsResponse } from '@/apis/typings/global'

	const props = defineProps<{
		departments : DepartmentsResponse[]
		selectedKeys : string[]
	}>()

	const emit = defineEmits<{
		select : [key: string, item: DepartmentsResponse]
	}>()

	const expandedKeys = ref<string[]>([])

	const handleExpand = (item : DepartmentsResponse) => {
		const index = expandedKeys.value.indexOf(item.key)
		if (index > -1) {
			expandedKeys.value.splice(index, 1)
		} else {
			expandedKeys.value.push(item.key)
		}
	}

	const handleSelect = (item : DepartmentsResponse) => {
		emit('select', item.key, item)
	}

	const handleChildSelect = (key : string, item : DepartmentsResponse) => {
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
		padding: 12px 16px;
		border-bottom: 1px solid #f0f0f0;
	}

	.department-row-selected {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.expand-icon {
		width: 24px;
		height: 24px;
		font-size: 12px;
		transition: transform 0.2s;
		margin-right: 8px;
		justify-content: center;
		align-items: center;
		display: flex;
	}

	.expand-icon-open {
		transform: rotate(90deg);
	}

	.expand-icon-placeholder {
		width: 24px;
	}

	.department-children {
		padding-left: 24px;
	}
</style>