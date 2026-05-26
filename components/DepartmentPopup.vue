<template>
	<uni-popup ref="popup" type="bottom" style="z-index: 9999" background-color="#fff" border-radius="10px 10px 0 0"
		:mask-closable="true">

		<view class="popup-content">
			<!-- <view class="filter-header">
				<view class="search-bar">
					<image class="search-icon" src="/static/search.svg" mode="aspectFit" />
					<input v-model.trim="searchQuery" type="text" placeholder="搜索部门" placeholder-class="ph-color" />
				</view>
			</view> -->
			<scroll-view scroll-top="0" scroll-y scroll-with-animation :show-scrollbar="false" class="overlay-content"
				@click.stop :style="{ maxHeight: scrollHeight + 'px' }">
				<DepartmentTree :departments="departmentList" :selected-keys="selectedKeys"
					@select="handleDepartmentSelect" />
			</scroll-view>
		</view>
	</uni-popup>
</template>

<script setup lang="ts">
	import type { DepartmentsResponse } from '@/apis/typings/global'
	import { computed, ref, onMounted } from 'vue'
	import { useStore } from 'vuex'

	const store = useStore()

	defineOptions({
		name: 'DepartmentPopup'
	})

	const props = defineProps({
    single: { type: Boolean, default: false, required: false }
	})

	const popup = ref()
	const selectedDepartments = ref<string[]>([])
	const searchQuery = ref<string>('')
	const scrollHeight = uni.getSystemInfoSync().windowHeight - 200
	const selectedKeys = ref<string[]>([])

	const handleDepartmentSelect = (key : string, item : DepartmentsResponse) => {
		if (props.single) {
		  selectedKeys.value = [key]
		  emit('update:modelValue', item)
		  close()
		  return
		}
    const index = selectedKeys.value.indexOf(key)
		if (index > -1) {
			selectedKeys.value.splice(index, 1)
		} else {
			selectedKeys.value.push(key)
		}
		emit('update:modelValue', item)
	}


	const departmentList = computed(() => {
		if (!store.state.departments) {
			return []
		}
		let filterDepartments : DepartmentsResponse[] = [...store.state.departments]
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase()
			filterDepartments = filterDepartments.filter(item => {
				const nameMatch = item.name?.toLowerCase().includes(query)
				return nameMatch
			})
		}
		return filterDepartments.map((item) => {
			return {
				...item,
				checked: selectedKeys.value.includes(item.key)
			}
		})
	})

	const emit = defineEmits(['update:modelValue'])

	const open = () => {
		popup.value?.open()
	}

	const close = () => {
		searchQuery.value = ''
		popup.value?.close()
	}

	defineExpose({
		open,
		close
	})

</script>

<style lang="scss" scoped>
	.popup-content {
		position: relative;
		z-index: 9999;
		height: 80vh;
		background-color: #f5f7f9;

		.overlay-content {
			padding: 32rpx;

			.user-list {
				height: 80rpx;

				.check-icon {
					margin-right: 16rpx;
				}

				.split {
					margin: 0 8rpx;
				}
			}
		}

		.filter-header {
			padding: 20rpx 32rpx;
			background-color: #fff;

			.search-bar {
				background-color: #f5f7f9;
				border-radius: 16rpx;
				padding: 20rpx 16rpx;
				display: flex;
				align-items: center;

				.search-icon {
					margin-right: 20rpx;
					width: 28rpx;
					height: 28rpx;
				}

				input {
					flex: 1;
					font-size: 28rpx;
				}

				.ph-color {
					color: #bdc5cf;
				}
			}
		}
	}
</style>