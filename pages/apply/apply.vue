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
      <scroll-view
        scroll-y
      >
	  <!-- 
	  有bug，去掉下拉刷新
	  @refresherrefresh="onRefresh"
        style="height: 100vh"
        refresher-enabled="true"
        :refresher-triggered="loading" -->
        <view
          class="apply-card"
          v-for="(item, index) in filteredDataSource"
          :key="index"
          @click="goToDetail(item.form_instance_code, item.applicant, item.application_time)"
        >
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
import { ref, computed, onMounted, watch } from 'vue'
import { submittedList } from '@/apis/modules/apply'
import type { SubmittedItem, SubmittedListResponse } from '@/apis/typings/apply'
import { makeToast } from '@/hooks/base/toast'

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
        ...Array.from(formNameSet).map((name) => ({ value: name, text: name }))
      ]

      statusList.value = [
        { value: 'all', text: '全部状态' },
        ...Array.from(statusSet).map((name) => ({ value: name, text: name }))
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
    filteredDataSource.value = dataSource.value.filter((item: SubmittedItem) => {
      const matchType = selectedType.value === 'all' || item.form_name === selectedType.value

      const matchStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value

      return matchType && matchStatus
    })
  },
  { immediate: true }
)

// 跳转到详情页
const goToDetail = (instance_id: string, applicant: string, application_time: string) => {
  const applicaitonItem = {
    submitted: true,
    instance_id,
    applicant,
    application_time,
    permission: {
      pass: false,
      reject: false,
      transfer: false,
      return: false,
      withdraw: true,
      comment: false,
      sign: false
    }
  }
  uni.navigateTo({
    url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify(applicaitonItem))}`
  })
}

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
  background-color: #f5f7f9;
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
