<template>
	<view class="container">
		<view class="header">
			<view class="tabs-box">
				<view v-for="(item, index) in tabList" :key="index" class="tab-item"
					:class="{ active: currentTab === index }" @tap="switchTab(index)">
					<text>{{ item.name }}</text>
					<view class="line"></view>
				</view>

			</view>

			<view class="search-filter-box">
				<view class="search-bar">
					<image class="search-icon" src="/static/search.svg" mode="aspectFit" />
					<input v-model.trim="searchQuery" type="text" placeholder="搜索单据号" placeholder-class="ph-color" />
				</view>

				<view class="filter-row">
					<view class="f-item">全部单据类型 <text class="arrow">▼</text></view>
					<view class="f-item">全部状态 <text class="arrow">▼</text></view>
				</view>
			</view>
		</view>

		<swiper class="swiper-content" :current="currentTab" @change="onSwiperChange">
			<swiper-item v-for="(tabItem, index) in dataSource" :key="index">
				<view class="tab-container" v-if="currentTab == 2">
					<view class="tab-item" :class="{ active: currentReadTab === 0 }" @click="switchReadTab(0)">
						未读消息
					</view>
					<view class="tab-item" :class="{ active: currentReadTab === 1 }" @click="switchReadTab(1)">
						已读消息
					</view>
				</view>

				<scroll-view scroll-y class="list-content" <!--
					:style="{ paddingBottom: currentTab === 0 ? '120rpx' : '20rpx' }" -->
					<view class="list-item" :class="{ 'is-checked': item.checked }"
						v-for="(item, index) in (currentTab < 2 ? tabItem : tabItem[currentReadTab])" :key="index"
						@click="toggleCheck(index)">
						<view class="checkbox" :class="{ checked: item.checked }" v-if="currentTab === 0">
							<text class="check-mark" v-if="item.checked">✓</text>
						</view>

						<view class="item-main">
							<view class="item-header">
								<text class="title">{{ item.form_name }}</text>
								<text class="tag pending">待审批</text>
							</view>

							<view class="user-info">
								<image class="avatar" src="https://via.placeholder.com/40" />
								<text class="name">{{ item.applicant }}</text>
								<text class="dept">{{ item.application_department }}</text>
							</view>

							<view class="item-desc">{{ item.reason }}</view>
							<view class="item-time">提交时间：{{ item.application_time }}</view>

							<view class="item-actions" v-if="currentTab === 0">
								<button class="btn btn-reject" @click.stop="handleReject(item)">拒绝</button>
								<button class="btn btn-agree" @click.stop="handleAgree(item)">同意</button>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>


		<!-- 		<view class="bottom-action-bar" v-if="currentTab === 0">
			<view class="left-info">
				<view class="check-all" @click="toggleAll">
					<view class="checkbox" :class="{ checked: isAllChecked }">
						<text class="check-mark" v-if="isAllChecked">✓</text>
					</view>
					<text>全选</text>
				</view>
				<view class="summary">
					<text>已勾选 <text class="highlight">{{ checkedCount }}</text> 条</text>
					<text class="amount-wrap" v-if="totalAmount > 0">总金额：<text class="amount">¥
							{{ totalAmount }}</text></text>
				</view>
			</view>
			<view class="right-btns">
				<button class="btn btn-reject-bulk">拒绝</button>
				<button class="btn btn-agree-bulk">同意</button>
			</view>
		</view> -->
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
		makeToast
	} from "@/hooks/base/toast";
	import {
		approvedList,
		ccList
	} from "@/apis/modules/center";
	import type { ApprovedItem } from '@/apis/typings/center';
	import { getStatusText } from "@/hooks/business/status"

	const dataSource = ref([[], [], [[], []]])  // 格式 [[],[],[]]
	const filteredDataSource = ref()
	const toast = makeToast()

	const currentTab = ref(0);
	const currentReadTab = ref(0)

	const typeList = ref([])
	const selectedType = ref([])
	const statusList = ref([])
	const selectedStatus = ref([])


	const tabList = ref([
		{ name: '待审批' },
		{ name: '已审批' },
		{ name: '抄送我的' },
	])

	const switchTab = (index : number) => {
		currentTab.value = index
		getData()
	}

	const onSwiperChange = (e) => {
		currentTab.value = e.detail.current
		getData()
	}

	function getData() {
		const tabIndex = currentTab.value
		if (tabIndex < 2 && dataSource.value[tabIndex].length > 0) {
			return
		}
		if (tabIndex == 2 && dataSource.value[tabIndex][currentReadTab.value].length > 0) {
			return
		}
		toast.loading('')
		switch (tabIndex) {
			case 0:
			case 1:
				let approved = tabIndex == 0 ? false : true
				approvedList({ page_num: 1, page_size: 10000, approved: approved })
					.then((res) => {
						console.log(res)
						const result = res.message.approval_instances
						dataSource.value[tabIndex] = result

						const formNameSet = new Set()
						const statusSet = new Set()

						for (const item of result) {
							if (item.form_name) formNameSet.add(item.form_name)
							if (item.status) statusSet.add(item.status)
						}

						typeList.value[tabIndex] = [
							{ value: 'all', text: '全部单据类型' },
							...Array.from(formNameSet).map(name => ({ value: name, text: name }))
						]

						statusList.value[tabIndex] = [
							{ value: 'all', text: '全部状态' },
							...Array.from(statusSet).map(name => ({ value: name, text: getStatusText(name) }))
						]

						selectedType.value[tabIndex] = 'all'
						selectedStatus.value[tabIndex] = 'all'
					})
					.catch((err) => {
						console.error(err)
					})
					.finally(() => {
						toast.hiddenLoading()
					})
				break;
			case 2:
				let read = currentReadTab.value == 0 ? false : true
				ccList({ page_num: 1, page_size: 10000, read: read })
					.then((res) => {
						console.log(res)
						const result = res.message.cc_instances
						dataSource.value[tabIndex][currentReadTab.value] = result

						const formNameSet = new Set()
						const statusSet = new Set()

						for (const item of result) {
							if (item.form_name) formNameSet.add(item.form_name)
							if (item.status) statusSet.add(item.status)
						}

						//TODO 区分已读未读消息
						typeList.value[tabIndex] = [
							{ value: 'all', text: '全部单据类型' },
							...Array.from(formNameSet).map(name => ({ value: name, text: name }))
						]

						statusList.value[tabIndex] = [
							{ value: 'all', text: '全部状态' },
							...Array.from(statusSet).map(name => ({ value: name, text: getStatusText(name) }))
						]

						selectedType.value[tabIndex] = 'all'
						selectedStatus.value[tabIndex] = 'all'
					})
					.catch((err) => {
						console.error(err)
					})
					.finally(() => {
						toast.hiddenLoading()
					})
				break;
		}
	}

	const toggleCheck = (index : number) => {
		const item = dataSource.value[currentTab.value][index]
		item.checked = !item.checked
	};

	const switchReadTab = (flag : number) => {
		currentReadTab.value = flag
		getData()
	}

	// watch(
	// 	[selectedType, selectedStatus],
	// 	() => {
	// 		filteredDataSource.value = dataSource.value[currentTab].filter((item : ApprovedItem) => {
	// 			const matchType =
	// 				selectedType.value === 'all' || item.form_name === selectedType.value

	// 			const matchStatus =
	// 				selectedStatus.value === 'all' || item.status === selectedStatus.value

	// 			return matchType && matchStatus
	// 		})
	// 	},
	// 	{ immediate: true },
	// )



	// // 计算属性
	// const checkedCount = computed(() => listData.value.filter(item => item.checked).length);
	// const totalAmount = computed(() => {
	// 	return listData.value
	// 		.filter(item => item.checked)
	// 		.reduce((sum, item) => sum + (item.amount || 0), 0)
	// 		.toFixed(2);
	// });
	// const isAllChecked = computed(() => listData.value.length > 0 && listData.value.every(item => item.checked));


	// const toggleAll = () => {
	// 	const targetState = !isAllChecked.value;
	// 	listData.value.forEach(item => {
	// 		item.checked = targetState;
	// 	});
	// };

	const handleReject = (item) => {
		uni.showToast({
			title: '已拒绝',
			icon: 'none'
		});
	};

	const handleAgree = (item) => {
		uni.showToast({
			title: '已同意',
			icon: 'success'
		});
	};

	onMounted(() => {
		getData()
	})
</script>

<style lang="scss" scoped>
	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #F5F7F9;
	}

	.header {
		position: sticky;
		top: 0;
		z-index: 999;
	}

	.tabs-box {
		display: flex;
		justify-content: space-around;
		height: 80rpx;
		line-height: 80rpx;
		background: #fff;
		//border-bottom: 1rpx solid #eee;

		.tab-item {
			position: relative;
			font-size: 28rpx;

			&.active {
				color: #1262EE;

				.line {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 4rpx;
					background: #1262EE;
				}
			}
		}
	}

	.swiper-content {
		flex: 1;
		/* 自动撑开剩余高度 */
	}



	.search-filter-box {
		background-color: #fff;
		padding: 20rpx 30rpx;

		.search-bar {
			background-color: #F5F7F9;
			border-radius: 16rpx;
			padding: 20rpx 16rpx;
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

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
				color: #BDC5CF;
			}
		}

		.filter-row {
			display: flex;
			justify-content: space-between;

			.f-item {
				width: 48%;
				background-color: #F5F7F9;
				border-radius: 12rpx;
				padding: 16rpx 0;
				text-align: center;
				font-size: 26rpx;
				color: #666;

				.arrow {
					font-size: 20rpx;
					margin-left: 10rpx;
					color: #ccc;
				}
			}
		}
	}

	.tab-container {
		display: flex;
		gap: 24rpx;
		/* 两个 Tab 之间的间距 */
		padding: 24rpx 32rpx 0rpx 32rpx;

		.tab-item {
			padding: 8px 24px;
			border: 1px solid #ccc;
			/* 未选中时的边框 */
			border-radius: 8rpx;
			/* 圆角 */
			color: #666;
			/* 未选中时的文字颜色 */
			font-size: 14px;
			cursor: pointer;
			transition: all 0.3s ease;
			/* 过渡动画 */
		}

		.tab-item.active {
			border-color: #007AFF;
			/* 选中时的边框颜色（蓝色） */
			color: #007AFF;
			/* 选中时的文字颜色（蓝色） */
			background-color: #EAF4FF;
			/* 可选：选中时的背景色（浅蓝） */
		}
	}



	.list-content {
		flex: 1;
		padding: 20rpx 30rpx;
		box-sizing: border-box;
	}

	.list-item {
		display: flex;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border: 2rpx solid transparent;
		transition: all 0.3s;

		&.is-checked {
			border-color: #2979FF;
		}

		.checkbox {
			width: 36rpx;
			height: 36rpx;
			border: 2rpx solid #ccc;
			border-radius: 50%;
			margin-right: 20rpx;
			margin-top: 6rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			&.checked {
				background-color: #2979FF;
				border-color: #2979FF;

				.check-mark {
					color: #fff;
					font-size: 24rpx;
				}
			}
		}

		.item-main {
			flex: 1;
			overflow: hidden;
		}

		.item-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;

			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.tag.pending {
				font-size: 24rpx;
				color: #2979FF;
				background: rgba(41, 121, 255, 0.1);
				padding: 4rpx 12rpx;
				border-radius: 8rpx;
			}
		}

		.user-info {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;

			.avatar {
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				margin-right: 12rpx;
			}

			.name {
				font-size: 26rpx;
				color: #333;
				margin-right: 16rpx;
				font-weight: 500;
			}

			.dept {
				font-size: 24rpx;
				color: #999;
			}
		}

		.item-desc {
			font-size: 28rpx;
			color: #666;
			line-height: 1.5;
			margin-bottom: 16rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}

		.item-time {
			font-size: 24rpx;
			color: #999;
			margin-bottom: 20rpx;
		}

		.item-actions {
			display: flex;
			justify-content: flex-end;
			border-top: 1rpx solid #F0F0F0;
			padding-top: 20rpx;

			.btn {
				margin: 0 0 0 20rpx;
				padding: 0 40rpx;
				height: 60rpx;
				line-height: 60rpx;
				font-size: 26rpx;
				border-radius: 30rpx;

				&::after {
					border: none;
				}
			}

			.btn-reject {
				background-color: #F5F7F9;
				color: #666;
			}

			.btn-agree {
				background-color: #2979FF;
				color: #fff;
			}
		}
	}

	.bottom-action-bar {
		position: fixed;
		bottom: 0;
		/* 如果没有系统自带TabBar，这里应加上底部安全区适配 */
		/* 如果有系统tabBar在下方，这里可能需要调整bottom值，例如 bottom: 50px */
		left: 0;
		right: 0;
		height: 110rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
		padding-bottom: env(safe-area-inset-bottom);

		.left-info {
			display: flex;
			align-items: center;

			.check-all {
				display: flex;
				align-items: center;
				margin-right: 30rpx;
				font-size: 28rpx;
				color: #666;

				.checkbox {
					width: 36rpx;
					height: 36rpx;
					border: 2rpx solid #ccc;
					border-radius: 50%;
					margin-right: 12rpx;
					display: flex;
					align-items: center;
					justify-content: center;

					&.checked {
						background-color: #2979FF;
						border-color: #2979FF;

						.check-mark {
							color: #fff;
							font-size: 24rpx;
						}
					}
				}
			}

			.summary {
				font-size: 26rpx;
				color: #333;
				display: flex;
				flex-direction: column;

				.highlight {
					color: #E53935;
					margin: 0 4rpx;
				}

				.amount-wrap {
					font-size: 22rpx;
					margin-top: 4rpx;
				}

				.amount {
					color: #E53935;
					font-size: 28rpx;
					font-weight: bold;
				}
			}
		}

		.right-btns {
			display: flex;

			.btn {
				margin-left: 20rpx;
				padding: 0 40rpx;
				height: 72rpx;
				line-height: 72rpx;
				font-size: 28rpx;
				border-radius: 36rpx;

				&::after {
					border: none;
				}
			}

			.btn-reject-bulk {
				background-color: #fff;
				color: #333;
				border: 2rpx solid #E0E0E0;
			}

			.btn-agree-bulk {
				background-color: #2979FF;
				color: #fff;
			}
		}
	}
</style>