<template>
	<view class="container">
		<view class="filter-header">
			<uni-data-select v-model="selectedType" :localdata="typeList" :clear="false"
				class="filter-item"></uni-data-select>

			<uni-data-select v-model="selectedStatus" :localdata="statusList" :clear="false"
				class="filter-item"></uni-data-select>
		</view>
		<view class="list-wrapper">
			<scroll-view scroll-y @refresherrefresh="onRefresh" style="height: 100vh;" refresher-enabled="true"
				:refresher-triggered="loading">
				<view class="apply-card" v-for="(item, index) in filteredDataSource" :key="index"
					@click="goToDetail(item.instance_id)">
					<view class="card-header">
						<text class="title">{{ item.form_name }}</text>
						<text class="status-tag"
							:class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</text>
					</view>

					<view class="card-content" v-if="item.reason">
						<text class="label">事由：</text>
						<text class="value">{{ item.reason }}</text>
					</view>

					<view class="card-footer">
						<text class="time">提交时间：{{ item.application_time }}</text>
						<text class="detail-link">查看详情</text>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import {
		ref,
		computed,
		onMounted,
		watch
	} from 'vue';
	import {
		submittedList
	} from "@/apis/modules/apply"
	import type { SubmittedItem, SubmittedListResponse } from '@/apis/typings/apply'
	import {
		makeToast
	} from "@/hooks/base/toast"
	import { getStatusText } from "@/hooks/business/status"

	const loading = ref(false)
	const dataSource = ref([])
	const filteredDataSource = ref()
	const toast = makeToast()
	const typeList = ref()
	const selectedType = ref()
	const statusList = ref()
	const selectedStatus = ref()

	function getData() {
		loading.value = true

		submittedList({ page_num: 1, page_size: 10000 })
			.then((res) => {
				console.log(res)
				dataSource.value = res.message.submitted_instances

				const formNameSet = new Set()
				const statusSet = new Set()

				for (const item of dataSource.value) {
					if (item.form_name) formNameSet.add(item.form_name)
					if (item.status) statusSet.add(item.status)
				}

				typeList.value = [
					{ value: 'all', text: '全部单据类型' },
					...Array.from(formNameSet).map(name => ({ value: name, text: name }))
				]

				statusList.value = [
					{ value: 'all', text: '全部状态' },
					...Array.from(statusSet).map(name => ({ value: name, text: getStatusText(name) }))
				]

				selectedType.value = 'all'
				selectedStatus.value = 'all'
			})
			.catch((err) => {
				console.error(err)
			})
			.finally(() => {
				loading.value = false
			})
	}

	watch(
		[selectedType, selectedStatus],
		() => {
			filteredDataSource.value = dataSource.value.filter((item : SubmittedItem) => {
				const matchType =
					selectedType.value === 'all' || item.form_name === selectedType.value

				const matchStatus =
					selectedStatus.value === 'all' || item.status === selectedStatus.value

				return matchType && matchStatus
			})
		},
		{ immediate: true },
	)

	const getStatusClass = (status : String) => {
		return "tag-" + status;
	};

	// 跳转到详情页
	const goToDetail = (id : string) => {
		uni.navigateTo({
			url: `/pages/detail/detail?id=${id}`
		});
	};

	onMounted(() => {
		onRefresh()
	})

	function onRefresh() {
		getData()
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #F5F7F9;
		display: flex;
		flex-direction: column;
	}

	.filter-header {
		position: sticky;
		top: 0;
		z-index: 999;
		display: flex;
		background-color: #fff;
		padding: 20rpx 32rpx;
		justify-content: space-between;
		gap: 14rpx;

		.filter-item {
			flex: 1;

			/* 使用 :deep() 穿透组件修改内部的 .uni-select 样式 */
			:deep(.uni-select) {
				border-radius: 50rpx;
				border: 1rpx solid #e5e5e5;
				height: 68rpx;
				padding: 0 30rpx;
			}

			:deep(.uni-select__input-placeholder) {
				color: #888;
				font-size: 28rpx;
			}

			:deep(.uni-select__input-text) {
				color: #888;
				font-size: 28rpx;
			}
		}
	}

	.list-wrapper {
		width: auto;
		padding: 20rpx 30rpx;
	}

	.apply-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;

			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.status-tag {
				font-size: 24rpx;
				padding: 6rpx 16rpx;
				border-radius: 8rpx;

				&.tag-in_progress {
					background-color: rgba(62, 63, 237, 0.1);
					color: #3e3fed;
				}

				&.tag-pass {
					background-color: rgba(0, 177, 39, 0.1);
					color: #00B42A;
				}

				&.tag-withdraw {
					background-color: rgba(255, 128, 0, 0.1);
					color: #FF7D00;
				}

				&.tag-reject {
					background-color: rgba(245, 63, 63, 0.1);
					color: #F53F3F;
				}

				&.tag-draft {
					background-color: rgba(31, 89, 244, 0.1);
					color: #1f59f4;
				}

				&.tag-terminate {
					background-color: #FCF1F0;
					color: #CF2F23;
				}

				&.tag-return {
					background-color: #F1F2F3;
					color: #636A78;
				}

				&.tag-exception {
					background-color: #FEECEC;
					color: #FF1B1F;
				}

				&.tag-invalid {
					background-color: #F1F2F3;
					color: #636A78;
				}
			}
		}

		.card-content {
			margin-bottom: 20rpx;
			font-size: 28rpx;

			.label {
				color: #727C88;
			}

			.value {
				color: #1B1F26;
			}
		}

		.card-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-top: 1rpx solid #F0F0F0;
			padding-top: 24rpx;

			.time {
				font-size: 24rpx;
				color: #999;
			}

			.detail-link {
				font-size: 26rpx;
				color: #2979FF;
			}
		}
	}
</style>