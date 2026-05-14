<template>
  <view class="container">
    <view class="header">
      <view class="tabs-box">
        <view
          v-for="(item, index) in tabList"
          :key="index"
          class="tab-item"
          :class="{ active: currentTab === index }"
          @tap="switchTab(index)"
        >
          <text>{{ item.name }}</text>
          <view class="line"></view>
        </view>
      </view>

      <view class="search-filter-box">
        <view class="search-bar">
          <image class="search-icon" src="/static/search.svg" mode="aspectFit" />
          <input v-model.trim="searchQuery" type="text" placeholder="搜索单据名称" placeholder-class="ph-color" />
        </view>

        <view class="filter-row">
          <uni-data-select
            v-model="selectedType[currentTab]"
            :localdata="typeList[currentTab]"
            :clear="false"
            class="filter-item"
          ></uni-data-select>

          <uni-data-select
            v-model="selectedStatus[currentTab]"
            :localdata="statusList[currentTab]"
            :clear="false"
            class="filter-item"
          ></uni-data-select>
        </view>
      </view>
    </view>

    <swiper class="swiper-content" :current="currentTab" @change="onSwiperChange">
      <swiper-item v-for="(tabItem, tabIndex) in filteredDataSource" :key="tabIndex">
        <template v-if="tabIndex === currentTab">
          <view class="tab-container" v-if="currentTab === 2">
            <view class="tab-item" :class="{ active: currentReadTab === 0 }" @click="switchReadTab(0)"> 未读消息 </view>
            <view class="tab-item" :class="{ active: currentReadTab === 1 }" @click="switchReadTab(1)"> 已读消息 </view>
          </view>

          <scroll-view scroll-y class="list-content" :class="{ 'tab-0': currentTab === 0, 'tab-1': currentTab === 1 }">
            <view
              class="list-item"
              :class="{ 'is-checked': item.checked }"
              v-for="(item, itemIdx) in currentTab < 2 ? tabItem : tabItem[currentReadTab]"
              :key="itemIdx"
              @click="gotoDetail(item)"
            >
              <view class="item-main" v-if="currentTab === 0">
                <view class="item-container">
                  <view class="item-header">
                    <text class="title">{{ item.form_name }}</text>
                    <status-tag :status="item.status" />
                    <view class="checkbox" :class="{ checked: item.checked }" @click.stop="toggleCheck(item)">
                      <image src="/static/checked.svg" style="width: 18rpx; height: 14rpx" v-if="item.checked" />
                    </view>
                  </view>

                  <view class="user-info">
                    <view
                      class="avatar"
                      :style="{
                        background: `linear-gradient(${item.back_ground})`
                      }"
                      >{{ item.applicant?.slice(-1) }}
                    </view>
                    <text class="name">{{ item.applicant }}</text>
                    <text class="dept">{{ item.application_department }}</text>
                  </view>

                  <view class="item-desc">{{ item.reason }}</view>
                  <view class="item-time">提交时间：{{ item.application_time }}</view>

                  <view class="item-actions">
                    <button class="btn btn-reject" @click.stop="handleReject(item)">拒绝</button>
                    <button class="btn btn-agree" @click.stop="handleAgree(item)">同意</button>
                  </view>
                </view>
              </view>

              <view class="item-main" v-if="currentTab === 1">
                <view class="item-container">
                  <view class="item-header">
                    <text class="title">{{ item.form_name }}</text>
                    <status-tag :status="item.status" style="margin-left: auto" />
                  </view>
                  <view class="user-info">
                    <view
                      class="avatar"
                      :style="{
                        background: `linear-gradient(${item.back_ground})`
                      }"
                      >{{ item.applicant?.slice(-1) }}
                    </view>
                    <text class="name">{{ item.applicant }}</text>
                    <text class="dept">{{ item.application_department }}</text>
                  </view>

                  <view class="item-desc">{{ item.reason }}</view>
                  <view class="item-time">提交时间：{{ item.application_time }}</view>

                  <view class="item-footer">
                    <text class="time" v-if="item.delivery_time">审批时间：{{ item.delivery_time }}</text>
                    <text class="detail-link">查看详情</text>
                  </view>
                </view>
              </view>

              <view
                class="item-main"
                v-if="currentTab === 2"
                :style="{ boxShadow: currentReadTab == 0 ? 'inset 4rpx 0rpx 0rpx 0rpx #F53F3F33' : '' }"
              >
                <view class="dot"  :style="{ visibility: currentReadTab == 0 ? 'visible' : 'hidden' }"></view>
                <view class="item-container-read">
                  <view class="item-header">
                    <text class="title">{{ item.form_name }}</text>
                    <status-tag :status="item.status" style="margin-left: auto" />
                  </view>

                  <view class="user-info">
                    <view
                      class="avatar"
                      :style="{
                        background: `linear-gradient(${item.back_ground})`
                      }"
                      >{{ item.applicant?.slice(-1) }}
                    </view>
                    <text class="name">{{ item.applicant }}</text>
                    <text class="dept">{{ item.application_department }}</text>
                  </view>

                  <view class="item-desc">{{ item.reason }}</view>
                  <view class="item-time">提交时间：{{ item.application_time }}</view>
                  <view class="item-footer">
                    <text class="time"></text>
                    <text class="detail-link">查看详情</text>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </template>
      </swiper-item>
    </swiper>

    <view class="bottom-action-bar" v-if="currentTab === 0">
      <view class="left-info">
        <view class="check-all" @click="toggleAll">
          <view class="checkbox" :class="{ checked: isAllChecked }">
            <image src="/static/checked.svg" style="width: 18rpx; height: 14rpx" v-if="isAllChecked" />
          </view>
          <text>全选</text>
        </view>
      </view>
      <view class="right-btns">
        <button class="btn btn-reject-bulk" @click.stop="handleRejectBatch()">拒绝</button>
        <button class="btn btn-agree-bulk" @click.stop="handleAgreeBatch()">同意</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { makeToast } from '@/hooks/base/toast'
import { approvedList, ccList, agreeOperation, rejectOperation } from '@/apis/modules/center'
import type { ApprovedItem } from '@/apis/typings/center'
import personUtil from '@/utils/person'
import bus from '@/utils/bus'
import { onShow } from '@dcloudio/uni-app'

const dataSource = ref([[], [], [[], []]])
const toast = makeToast()

const currentTab = ref(0)
const currentReadTab = ref(0)
const searchQuery = ref('')

// 三个 Tab 的下拉选项和选中值状态
const typeList = ref([[], [], []])
const selectedType = ref(['all', 'all', 'all'])
const statusList = ref([[], [], []])
const selectedStatus = ref(['all', 'all', 'all'])

const tabList = ref([{ name: '待审批' }, { name: '已审批' }, { name: '抄送我的' }])

const switchTab = (index: number) => {
  currentTab.value = index
  getData()
}

const onSwiperChange = (e: any) => {
  currentTab.value = e.detail.current
  getData()
}

function getData() {
  const tabIndex = currentTab.value
  // 不缓存
  // if (tabIndex < 2 && dataSource.value[tabIndex].length > 0) return
  toast.loading('')
  switch (tabIndex) {
    case 0:
    case 1:
      let approved = tabIndex === 0 ? false : true
      approvedList({ page_num: 1, page_size: 10000, approved: approved })
        .then((res: any) => {
          const result = res.message.approval_instances
          for (var index = 0; index < result.length; index++) {
            var element = result[index]
            const r = personUtil.lookup(element.applicant_person_key)
            element.back_ground = r.back_ground
          }

          dataSource.value[tabIndex] = result

          const formNameSet = new Set()
          const statusSet = new Set()

          for (const item of result) {
            if (item.form_name) formNameSet.add(item.form_name)
            if (item.status) statusSet.add(item.status)
          }

          typeList.value[tabIndex] = [
            { value: 'all', text: '全部单据类型' },
            ...Array.from(formNameSet).map((name) => ({ value: name, text: name }))
          ]

          statusList.value[tabIndex] = [
            { value: 'all', text: '全部状态' },
            ...Array.from(statusSet).map((name) => ({ value: name, text: name }))
          ]

          selectedType.value[tabIndex] = 'all'
          selectedStatus.value[tabIndex] = 'all'
        })
        .catch((err: any) => console.error(err))
        .finally(() => toast.hiddenLoading())
      break
    case 2:
      let read = currentReadTab.value === 0 ? false : true
      ccList({ page_num: 1, page_size: 10000, read: read })
        .then((res: any) => {
          const result = res.message.cc_instances

          for (var index = 0; index < result.length; index++) {
            var element = result[index]
            const r = personUtil.lookup(element.applicant_person_key)
            element.back_ground = r.back_ground
          }

          dataSource.value[tabIndex][currentReadTab.value] = result

          const formNameSet = new Set()
          const statusSet = new Set()

          for (const item of result) {
            if (item.form_name) formNameSet.add(item.form_name)
            if (item.status) statusSet.add(item.status)
          }

          typeList.value[tabIndex] = [
            { value: 'all', text: '全部单据类型' },
            ...Array.from(formNameSet).map((name) => ({ value: name, text: name }))
          ]

          statusList.value[tabIndex] = [
            { value: 'all', text: '全部状态' },
            ...Array.from(statusSet).map((name) => ({ value: name, text: name }))
          ]

          selectedType.value[tabIndex] = 'all'
          selectedStatus.value[tabIndex] = 'all'
        })
        .catch((err: any) => console.error(err))
        .finally(() => toast.hiddenLoading())
      break
  }
}

const gotoDetail = (item: any) => {
  //跳转详情页
  const canApprove: boolean = currentTab.value !== 1
  const applicaitonItem = {
    instance_id: item.instance_id,
    form_instance_code: item.form_instance_code,
    applicant: item.applicant,
    application_time: item.application_time,
    permission: {
      pass: canApprove,
      reject: canApprove,
      transfer: canApprove,
      return: canApprove,
      withdraw: false,
      comment: true,
      sign: canApprove
    }
  }
  uni.navigateTo({
    url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify(applicaitonItem))}`
  })
}

const toggleCheck = (item: any) => {
  if (currentTab.value !== 0) return
  item.checked = !item.checked
}

const switchReadTab = (flag: number) => {
  currentReadTab.value = flag
  getData()
}

const filteredDataSource = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  return dataSource.value.map((tabData, tabIndex) => {
    const typeVal = selectedType.value[tabIndex] || 'all'
    const statusVal = selectedStatus.value[tabIndex] || 'all'

    const filterFn = (item: any) => {
      const matchKeyword = !keyword || (item.form_name && item.form_name.toLowerCase().includes(keyword))
      const matchType = typeVal === 'all' || item.form_name === typeVal
      const matchStatus = statusVal === 'all' || item.status === statusVal
      return matchKeyword && matchType && matchStatus
    }

    if (tabIndex < 2) {
      return (tabData || []).filter(filterFn)
    } else {
      const unreadData = (tabData[0] || []).filter(filterFn)
      const readData = (tabData[1] || []).filter(filterFn)
      return [unreadData, readData]
    }
  })
})

const isAllChecked = computed(() => {
  const currentVisibleData = filteredDataSource.value[0] || []
  return currentVisibleData.length > 0 && currentVisibleData.every((item: any) => item.checked)
})

const toggleAll = () => {
  const targetState = !isAllChecked.value
  const currentVisibleData = filteredDataSource.value[0] || []
  currentVisibleData.forEach((item: any) => {
    item.checked = targetState
  })
}

const handleReject = (item: ApprovedItem) => {
  toast.loading('')
  rejectOperation([item.instance_id])
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({ title: '已拒绝', icon: 'success' })
        getData()
      } else {
        uni.showToast({ title: '请求失败：' + res.message, icon: 'error' })
      }
    })
    .catch((err: any) => console.error(err))
    .finally(() => toast.hiddenLoading())
}

const handleAgree = (item: ApprovedItem) => {
  toast.loading('')
  agreeOperation([item.instance_id])
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({ title: '已同意', icon: 'success' })
        getData()
      } else {
        uni.showToast({ title: '请求失败：' + res.message, icon: 'error' })
      }
    })
    .catch((err: any) => console.error(err))
    .finally(() => toast.hiddenLoading())
}

const handleAgreeBatch = () => {
  if (currentTab.value !== 0) return
  const instance_id_list = []
  const dataList = filteredDataSource.value[0]
  for (var index = 0; index < dataList.length; index++) {
    var item = dataList[index]
    if (item.checked) {
      instance_id_list.push(item.instance_id)
    }
  }
  if (instance_id_list.length == 0) return

  toast.loading('')
  agreeOperation(instance_id_list)
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({ title: '已同意', icon: 'success' })
        getData()
      } else {
        uni.showToast({ title: '请求失败：' + res.message, icon: 'error' })
      }
    })
    .catch((err: any) => console.error(err))
    .finally(() => toast.hiddenLoading())
}

const handleRejectBatch = () => {
  if (currentTab.value !== 0) return
  const instance_id_list = []
  const dataList = filteredDataSource.value[0]
  for (var index = 0; index < dataList.length; index++) {
    var item = dataList[index]
    if (item.checked) {
      instance_id_list.push(item.instance_id)
    }
  }
  if (instance_id_list.length == 0) return

  toast.loading('')
  rejectOperation(instance_id_list)
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({ title: '已拒绝', icon: 'success' })
        getData()
      } else {
        uni.showToast({ title: '请求失败：' + res.message, icon: 'error' })
      }
    })
    .catch((err: any) => console.error(err))
    .finally(() => toast.hiddenLoading())
}

onMounted(() => {
  getData()

  // 刷新列表
  bus.on('center:refresh', () => {
    console.log('refreshing data...')
  })
})

onUnmounted(() => {
  bus.off('center:refresh', () => {
    console.log('cleanup refresh listener')
  })
})
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7f9;
  overflow: hidden;
}

.header {
  flex-shrink: 0;
}

.tabs-box {
  display: flex;
  justify-content: space-around;
  height: 80rpx;
  line-height: 80rpx;
  background: #fff;
  //border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    position: relative;
    font-size: 28rpx;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    white-space: nowrap;

    &.active {
      color: #1262ee;

      .line {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #1262ee;
        border-radius: 2rpx;
        transform: translateZ(0) translateX(-50%);
        -webkit-transform: translateZ(0) translateX(-50%);
      }
    }
  }
}

.swiper-content {
  flex: 1;
  height: 0; /* 配合 flex:1 解决部分小程序平台高度计算的 bug */
  background-color: transparent;
}

.search-filter-box {
  background-color: #fff;
  padding: 20rpx 30rpx;
  height: 168rpx;

  .search-bar {
    background-color: #f5f7f9;
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
      color: #bdc5cf;
    }
  }

  .filter-row {
    display: flex;
    background-color: #fff;
    justify-content: space-between;
    gap: 14rpx;

    .filter-item {
      flex: 1;

      :deep(.uni-select) {
        border-radius: 50rpx;
        border: 1rpx solid #0000001A;
        height: 68rpx;
        padding: 0 30rpx;
      }
      
      :deep(.uni-select__input-placeholder) {
        color: #85909F;
        font-size: 28rpx;
      }
      
      :deep(.uni-select__input-text) {
        color: #85909F;
        font-size: 28rpx;
      }
    }
  }
}

.tab-container {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx 0rpx 32rpx;

  .tab-item {
    padding: 10rpx 30rpx;
    border: 0rpx;
    border-radius: 8rpx;
    color: #4B5563;
    background-color: #fff;
    font-size: 24rpx;
    cursor: pointer;
    transition: all 0.3s ease;
	box-shadow: 0 2rpx 4rpx #00000033;
  }

  .tab-item.active {
	border: 1rpx solid #1262EE;
    border-color: #1262EE;
    color: #1262EE;
    background-color: #F6FAFF;
  }
}

.list-content {
  height: 100%;
  padding: 20rpx 30rpx;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.list-content.tab-0 {
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.list-content.tab-1 {
  padding-bottom: calc(10rpx + env(safe-area-inset-bottom));
}

.list-item {
  // display: flex;
  background-color: transparent;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &.is-checked {
    border-color: #2979ff;
  }

  .item-main {
    flex: 1;
    overflow: hidden;
    padding: 0rpx;
    border-radius: 16rpx;
    background-color: #fff;
  }

  .item-container {
    padding: 30rpx;
  }

  .item-container-read {
    padding: 10rpx 30rpx 30rpx 30rpx;
  }

  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-right: 20rpx;
    }

    .checkbox {
      width: 32rpx;
      height: 32rpx;
      border: 2rpx solid #ccc;
      border-radius: 50%;
      margin-top: 6rpx;
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: center;

      &.checked {
        background-color: #2979ff;
        border-color: #2979ff;

        .check-mark {
          color: #fff;
          font-size: 24rpx;
        }
      }
    }
  }

  .item-footer {
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

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .avatar {
      width: 44rpx;
      height: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      border-radius: 50%;
      margin-right: 12rpx;
      color: #fff;
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
    border-top: 1rpx solid #f0f0f0;
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
      background-color: #f5f7f9;
      color: #666;
    }

    .btn-agree {
      background-color: #2979ff;
      color: #fff;
    }
  }

  .dot {
    margin-left: 16rpx;
    margin-top: 12rpx;
    width: 16rpx;
    height: 16rpx;
    background-color: #f53f3f99;
    border-radius: 50%;
  }
}

.bottom-action-bar {
  position: fixed;
  bottom: 0rpx;
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
          background-color: #2979ff;
          border-color: #2979ff;
        }
      }
    }

    .summary {
      font-size: 26rpx;
      color: #333;
      display: flex;
      flex-direction: column;

      .highlight {
        color: #e53935;
        margin: 0 4rpx;
      }

      .amount-wrap {
        font-size: 22rpx;
        margin-top: 4rpx;
      }

      .amount {
        color: #e53935;
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
      border: 2rpx solid #e0e0e0;
    }

    .btn-agree-bulk {
      background-color: #2979ff;
      color: #fff;
    }
  }
}
</style>
