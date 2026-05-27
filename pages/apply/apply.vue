<template>
  <view class="container">
    <view class="filter-header">
      <uni-data-select
        v-model="selectedType"
        :localdata="typeList"
        :clear="false"
        class="filter-item"
      ></uni-data-select>

      <uni-data-select
        v-model="selectedStatus"
        :localdata="statusList"
        :clear="false"
        class="filter-item"
      ></uni-data-select>
    </view>
    <view class="list-wrapper">
      <view v-if="filteredDataSource.length == 0" class="empty-box">
        <img class="no_data_img" src="@/static/no_data.svg" alt="icon" />
        <text>暂无数据</text>
      </view>
      <scroll-view
        v-else
        scroll-y
        class="scroll-area"
        @scrolltolower="getData"
        :lower-threshold="50"
      >
        <!-- 
	  有bug，去掉下拉刷新
	  @refresherrefresh="onRefresh"
        style="height: 100vh"
        refresher-enabled="true"
        :refresher-triggered="loading" -->
        <view class="apply-card" v-for="(item, index) in filteredDataSource" :key="index" @click="goToDetail(item)">
          <view class="card-header">
            <text class="title">{{ item.form_name }}</text>
            <status-tag :status="item.status" />
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
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { submittedList } from '@/apis/modules/apply'
import type { SubmittedItem, SubmittedListResponse } from '@/apis/typings/apply'
import { makeToast } from '@/utils/toast'

const loading = ref(false)
const dataSource = ref<SubmittedItem[]>([])
const filteredDataSource = ref<SubmittedItem[]>([])
const toast = makeToast()
const typeList = ref()
const selectedType = ref('all')
const statusList = ref()
const selectedStatus = ref('all')

const pageSize = 10000
var pageNum = 1
var isEnd = false

function getData() {
  if (loading.value || isEnd) return

  loading.value = true

  submittedList({ page_num: pageNum, page_size: pageSize })
    .then((res) => {
      console.log(res)
      const datas = res.message as SubmittedListResponse
      if (datas.submitted_instances.length < pageSize) {
        isEnd = true
      }
      if (pageNum == 1) {
        dataSource.value = [...datas.submitted_instances]
      } else {
        dataSource.value = [...dataSource.value, ...datas.submitted_instances]
      }

      const formNameSet = new Set()
      const statusSet = new Set()

      for (const item of dataSource.value) {
        if (item.form_name) formNameSet.add(item.form_name)
        if (item.status) statusSet.add(item.status)
      }

      typeList.value = [
        { value: 'all', text: '全部单据类型' },
        ...Array.from(formNameSet).map((name) => ({ value: name, text: name }))
      ]

      statusList.value = [
        { value: 'all', text: '全部状态' },
        ...Array.from(statusSet).map((name) => ({ value: name, text: name }))
      ]

      pageNum++
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      loading.value = false
    })
}

watch(
  [selectedType, selectedStatus, dataSource],
  () => {
    filteredDataSource.value = dataSource.value.filter((item: SubmittedItem) => {
      const matchType = selectedType.value === 'all' || item.form_name === selectedType.value

      const matchStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value

      return matchType && matchStatus
    })
  },
  { immediate: true }
)

// 跳转到详情页
const goToDetail = (item: SubmittedItem) => {
  const applicaitonItem = {
    instance_id: item.instance_id,
    instance_type: 'myInitiation' // 由我发起的申请 @：'myInitiation' | 'pending' | 'approved' | 'cc'
  }
  uni.navigateTo({
    url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify(applicaitonItem))}`
  })
}

onShow(() => {
  pageNum = 1
  isEnd = false
  onRefresh()
})

function onRefresh() {
  getData()
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background-color: #f5f7f9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-header {
  flex-shrink: 0;
  display: flex;
  background-color: #fff;
  padding: 20rpx 32rpx;
  justify-content: space-between;
  gap: 14rpx;
  // height: 60rpx;

  .filter-item {
    flex: 1;

    /* 使用 :deep() 穿透组件修改内部的 .uni-select 样式 */
    :deep(.uni-select) {
      border-radius: 50rpx;
      border: 1rpx solid #0000001a;
      height: 68rpx;
      padding: 0 30rpx;
    }

    :deep(.uni-select__input-placeholder) {
      color: #85909f;
      font-size: 28rpx;
    }

    :deep(.uni-select__input-text) {
      color: #85909f;
      font-size: 28rpx;
    }
  }
}

.list-wrapper {
  flex: 1;
  overflow: hidden; 
  padding: 20rpx 30rpx;
  // box-sizing: border-box;
}

.scroll-area {
  height: 100%;
}

.empty-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 800rpx;

  .no_data_img {
    width: 200rpx;
    height: 200rpx;
  }
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
  }

  .card-content {
    margin-bottom: 20rpx;
    font-size: 28rpx;

    .label {
      color: #727c88;
    }

    .value {
      color: #1b1f26;
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1rpx solid #f0f0f0;
    padding-top: 24rpx;

    .time {
      font-size: 24rpx;
      color: #999;
    }

    .detail-link {
      font-size: 26rpx;
      color: #2979ff;
    }
  }
}
</style>
