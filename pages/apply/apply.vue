<template>
  <view class="container">
    <view class="filter-header">
      <ui-data-select v-model="selectedType" :localdata="typeList" :clear="false" class="filter-item"></ui-data-select>

      <ui-data-select
        v-model="selectedStatus"
        :localdata="statusList"
        :clear="false"
        class="filter-item"
      ></ui-data-select>
    </view>
    <view class="list-wrapper">
      <view v-if="dataSource.length == 0" class="empty-box">
        <img class="no_data_img" src="@/static/no_data.svg" alt="icon" />
        <text>暂无数据</text>
      </view>
      <scroll-view v-else scroll-y class="scroll-area" @scrolltolower="getData" :lower-threshold="50">
        <!-- 
	  有bug，去掉下拉刷新
	  @refresherrefresh="onRefresh"
        style="height: 100vh"
        refresher-enabled="true"
        :refresher-triggered="loading" -->
        <view class="apply-card" v-for="(item, index) in dataSource" :key="index">
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
            <view class="operation-btns">
              <text class="detail-link" v-if="getStatusType(item.status) !== 'draft'" @click="goToDetail(item)"
                >详情</text
              >
              <view v-if="getStatusType(item.status) === 'pass'" class="operation-flags">
                <text class="detail-link" v-if="item.operation_flags.can_invalid" @click="handleInvalid(item)"
                  >作废</text
                >
                <text class="detail-link" v-if="item.operation_flags.can_modify" @click="handleModify(item)">变更</text>
              </view>
              <text
                class="detail-link"
                v-if="
                  getStatusType(item.status) === 'reject' ||
                  getStatusType(item.status) === 'withdraw' ||
                  getStatusType(item.status) === 'terminate'
                "
                @click="reSubmit(item)"
                >再次提交</text
              >
              <text class="detail-link" v-if="getStatusType(item.status) === 'draft'" @click="goToEdit(item)"
                >编辑</text
              >
              <text
                class="detail-link delete"
                @click="handlerDelete(item)"
                v-if="
                  getStatusType(item.status) === 'reject' ||
                  getStatusType(item.status) === 'withdraw' ||
                  getStatusType(item.status) === 'draft' ||
                  getStatusType(item.status) === 'terminate'
                "
                >删除</text
              >
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { submittedList } from '@/apis/modules/apply'
import type { SubmittedItem, SubmittedListResponse } from '@/apis/typings/apply'
import { makeToast } from '@/utils/toast'
import { getStatusType, STATUS_MAP } from '@/hooks/base/status'
import { deleteApproval } from '@/apis/modules/detail'

const loading = ref(false)
const dataSource = ref<SubmittedItem[]>([])
const filteredDataSource = ref<SubmittedItem[]>([])
const toast = makeToast()
const typeList = ref([{ value: 'all', text: '全部单据类型' }])
const selectedType = ref('all')
const statusList = ref([
        { value: 'all', text: '全部状态' },
        ...Object.keys(STATUS_MAP).map(text => ({
            value: text,
            text
          }))
    ])
const selectedStatus = ref('all')

const pageSize = 10
var pageNum = 1
var isEnd = false

onMounted(() => {
  console.log(statusList.value)
})

function getData() {
  if (loading.value || isEnd) return
  loading.value = true
  const param = {page_num: pageNum, page_size: pageSize}
  if (selectedStatus.value !== 'all') {
    param.status = [selectedStatus.value]
  }
  submittedList(param)
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

      // const formNameSet = new Set()
      // const statusSet = new Set()

      // for (const item of dataSource.value) {
      //   if (item.form_name) formNameSet.add(item.form_name)
      //   if (item.status) statusSet.add(item.status)
      // }

      // typeList.value = [
      //   { value: 'all', text: '全部单据类型' },
      //   ...Array.from(formNameSet).map((name) => ({ value: name, text: name }))
      // ]

      // statusList.value = [
      //   { value: 'all', text: '全部状态' },
      //   ...Array.from(statusSet).map((name) => ({ value: name, text: name }))
      // ]

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
  [selectedType, selectedStatus],
  () => {
    isEnd = false
    pageNum = 1
    getData()
  },
  { immediate: true }
)

// watch(
//   [selectedType, selectedStatus, dataSource],
//   () => {
//     filteredDataSource.value = dataSource.value.filter((item: SubmittedItem) => {
//       const matchType = selectedType.value === 'all' || item.form_name === selectedType.value

//       const matchStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value

//       return matchType && matchStatus
//     })
//   },
//   { immediate: true }
// )

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

// 跳转到表单页
const goToEdit = (item: SubmittedItem) => {
  console.log('goToEdit', item)
  uni.navigateTo({
    url: `/pages/form/form?id=${item.instance_id}&type=edit&workflow_code=${item.workflow_cfg.workflow_code}&workflow_version=${item.workflow_cfg.workflow_version}`
  })
}

// 再次提交
const reSubmit = (item: SubmittedItem) => {
  console.log('reSubmit', item)
  uni.navigateTo({
    url: `/pages/form/form?id=${item.instance_id}&type=resubmit`
  })
}

// 作废
const handleInvalid = (item: SubmittedItem) => {
  console.log('handleInvalid', item)
  uni.navigateTo({
    url: `/pages/form/form?id=${item.instance_id}&type=invalid`
  })
}

// 变更
const handleModify = (item: SubmittedItem) => {
  console.log('handleModify', item)
  uni.navigateTo({
    url: `/pages/form/form?id=${item.instance_id}&type=modify`
  })
}

// 删除单据
const handlerDelete = (item: SubmittedItem) => {
  console.log('delete', item)
  uni.showModal({
    title: '提示',
    content: '确认删除当前单据吗？',
    success: function (res) {
      if (res.confirm) {
        deleteApproval(item.instance_id)
          .then((res) => {
            if (res.code === 200) {
              pageNum = 1
              loading.value = false
              isEnd = false
              onRefresh()
              toast.success('删除成功')
            } else {
              toast.info((res.message as string) ?? '删除失败')
            }
          })
          .catch((error) => {
            console.error('删除失败：', error)
          })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
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

    .operation-btns {
      display: flex;
      gap: 20rpx;
      .operation-flags {
        display: flex;
        gap: 20rpx;
        position: relative;
      }
      .detail-link {
        font-size: 24rpx;
        color: #2979ff;
        &.delete {
          color: #f53f3f;
        }
      }
    }
  }
}
</style>
