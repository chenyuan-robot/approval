<template>
  <view class="container">
    <scroll-view ref="scrollRef" scroll-with-animation scroll-y class="scroll-content">
      <view class="card-section header-card">
        <view class="main-title">
          <text>{{ instanceDetail.form_name }}</text>
          <text class="status-tag passed">{{ instanceDetail.status }}</text>
        </view>
        <view class="sub-info">申请编号：{{ instanceDetail?.form_instance_code?.split('_')?.[2] ?? '' }}</view>
        <view class="sub-info">提交时间：{{ instanceDetail?.application_time ?? '' }}</view>
      </view>

      <view class="card-section detail-card">
        <view class="user-row">
          <view
            class="avatar"
            :style="{
              background: `linear-gradient(${instanceDetail.back_ground})`
            }"
            >{{ instanceDetail.applicant?.slice(-1) }}
          </view>
          <view class="user-info">
            <text class="name">{{ instanceDetail.applicant }}</text>
            <text class="dept">{{ instanceDetail.department }}</text>
          </view>
        </view>
        <view v-for="formItem in formItems" :key="formItem.sequence" class="uni-form-item">
          <Renderer :formItem="formItem" />
        </view>
      </view>
      <view class="card-section timeline-card">
        <view class="section-title">审批记录</view>
        <view class="timeline">
          <TimeLine v-for="item in histories" :key="item.serial_number" :history="item" class="timeline-item" />
        </view>
        <text v-if="histories.length === 0">暂无审批记录</text>
      </view>
    </scroll-view>

    <view class="bottom-action-bar">
      <button class="btn btn-primary" hover-class="btn-primary-hover" @click="toComment">评论</button>
      <button class="btn btn-primary" hover-class="btn-primary-hover">拒绝</button>
      <button class="btn btn-light" hover-class="btn-light-hover">同意</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { InstanceHistoryItem, PageOptions } from './typings'
import { queryInstanceDetail, queryInstanceHistory } from '@/apis/modules/detail'
import type { InstanceDetail } from './typings'
import personUtil from '@/utils/person'
import Renderer from './Renderer.vue'
import type { FormItem } from './../form/typings'
import { makeToast } from '@/hooks/base/toast'
import type { OperateHistoryResponse } from '@/apis/typings/detail'
import { getTimeAgo } from '@/utils'
import TimeLine from './components/TimeLine.vue'
import bus from '@/utils/bus'

const toast = makeToast()
const instanceDetail = ref<InstanceDetail>({} as InstanceDetail)
const formItems = ref<FormItem[]>([])
const histories = ref<InstanceHistoryItem[]>([])

const getApprovalHistory = (id: string) => {
  queryInstanceHistory(id)
    .then((res) => {
      if (res.code === 200) {
        const datas = res.message as OperateHistoryResponse
        const mapHistory = datas.instance_history.map((data) => {
          const operate_time = data.operate_time
          const result = personUtil.lookup(data.operate_user)
          return {
            ...data,
            job_title: result.job_title,
            back_ground: result.back_ground,
            time_ago: getTimeAgo(operate_time),
            is_read: false
          }
        })
        histories.value = mapHistory
        console.log('获取审批历史成功：', mapHistory)
      } else {
        toast.info((res.message as string) ?? '获取审批历史失败')
      }
    })
    .catch((error) => {
      console.error('获取审批历史失败：', error)
    })
}

const getInstance = (id: string, applicant: string, application_time: string) => {
  queryInstanceDetail(id)
    .then((res) => {
      if (res.code === 200) {
        const result = personUtil.lookup(applicant)
        const message = res.message || {}
        instanceDetail.value = {
          ...message,
          applicant: applicant || '',
          application_time: application_time || '',
          department: result.departments,
          back_ground: result.back_ground
        }
        let depItems: FormItem[] = []
        const formInstance = message.form_instance || []
        formInstance.forEach((instance) => {
          depItems.push({
            label: instance.values.find((item) => item.name === '标题')?.value as string,
            sequence: instance.sequence,
            component_code: instance.component_code,
            values: instance.values
          })
        })
        formItems.value = depItems
      } else {
        console.error('获取单据详情失败：', res.message)
      }
    })
    .catch((error) => {
      console.error('获取单据详情失败：', error)
    })
}

const toComment = () => {
  uni.navigateTo({
    url: `/pages/comment/index?id=${instanceDetail.value.instance_code}`
  })
}

// onLoad 生命周期接收路由参数
onLoad((options?: PageOptions) => {
  const obj = JSON.parse(decodeURIComponent(options?.data ?? '{}'))
  if (obj?.instance_id) {
    const { instance_id, applicant, application_time } = obj
    getInstance(instance_id, applicant, application_time)
    getApprovalHistory(instance_id)
  }
})

onMounted(() => {
  bus.on('detail:refresh-history', () => {
    getApprovalHistory(instanceDetail.value.form_instance_code)
    // 滚动到最底部
  })
})
</script>

<style lang="scss" scoped>
.container {
  // height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f6f8;
}
.scroll-content {
  flex: 1;
  padding: 20rpx 30rpx;
  box-sizing: border-box;
  padding-bottom: 140rpx; /* 为底部操作栏留白 */
}
.card-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

/* 顶部信息 */
.header-card {
  .main-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
    .status-tag {
      font-size: 26rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-weight: normal;
      &.passed {
        background-color: rgba(24, 181, 158, 0.1);
        color: #18b59e;
      }
    }
  }
  .sub-info {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 8rpx;
  }
}

/* 详情信息 */
.detail-card {
  .user-row {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    .avatar {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      color: #fff;
    }
    .user-info {
      display: flex;
      align-items: center;
      .name {
        font-size: 30rpx;
        font-weight: bold;
        margin-right: 16rpx;
      }
      .dept {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
  .uni-form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 26rpx 0;
  }
}

/* 时间轴 (核心样式) */
.timeline-card {
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }
  .timeline {
    padding-left: 20rpx;
  }
}

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);

  .btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
    border-radius: 8rpx;
    text-align: center;
    margin: 0 10rpx;
    &::after {
      border: none;
    }
  }
  .btn-primary {
    background-color: #f5f7f9;
    color: #666;
  }
  .btn-light {
    background-color: #2979ff;
    color: #fff;
  }
  .btn-primary-hover {
    background-color: #f0f0f0;
  }
  .btn-light-hover {
    background-color: #009eff;
  }
}
</style>
