<template>
  <view class="container">
    <scroll-view ref="scrollRef" scroll-with-animation scroll-y class="scroll-content">
      <view class="card-section header-card">
        <view class="main-title">
          <text class="form-title">{{ instanceDetail.form_name }}</text>
          <status-tag :status="instanceDetail.status" />
        </view>
        <view class="sub-info">申请编号：{{ instanceDetail?.form_instance_code ?? '-' }}</view>
        <image src="/static/underline.png" alt="附件" class="underline" />
        <view class="sub-info">提交时间：{{ instanceDetail?.application_time ?? '-' }}</view>
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
          <Renderer style="width: 100%" :formItem="formItem" />
        </view>
        <view v-if="!formItems.length" class="no-data">暂未数据</view>
      </view>
      <view class="card-section timeline-card">
        <view class="section-title">审批记录</view>
        <view class="timeline">
          <TimeLine
            v-for="(item, index) in histories"
            :key="item.serial_number"
            :history="item"
            :nodeIndex="index"
            :nodeCount="histories.length"
            class="timeline-item"
          />
        </view>
        <text v-if="histories.length === 0">暂无审批记录</text>
      </view>
    </scroll-view>

    <view class="bottom-action-bar">
      <!-- <button class="btn btn-primary" hover-class="btn-primary-hover" v-if="permission.comment" @click="toComment">
        评论
      </button> -->
      <button class="btn btn-primary" hover-class="btn-primary-hover" v-if="permission.return" @click="handlerReturn">
        退回
      </button>
      <button class="btn btn-primary" hover-class="btn-primary-hover" v-if="permission.sign" @click="handlerSign">
        加签
      </button>
      <button
        class="btn btn-primary"
        hover-class="btn-primary-hover"
        v-if="permission.transfer"
        @click="handlerTransfer"
      >
        转交审批
      </button>
      <button class="btn btn-primary" hover-class="btn-primary-hover" v-if="permission.reject" @click="handlerReject">
        拒绝
      </button>
      <button class="btn btn-light" hover-class="btn-light-hover" v-if="permission.pass" @click="handlerAgree">
        同意
      </button>
      <button
        :class="['btn', 'btn-light']"
        hover-class="btn-light-hover"
        v-if="isMyInitiation && getStatusType(instanceDetail.status) === 'in_progress'"
        @click="handlerWithdraw"
      >
        撤回
      </button>
      <button
        :class="['btn', 'btn-error']"
        hover-class="btn-error-hover"
        v-if="isMyInitiation && getStatusType(instanceDetail.status) === 'withdraw'"
        @click="handlerDelete"
      >
        删除
      </button>
      <button class="btn btn-primary" hover-class="btn-primary-hover" @click="handlerBack">返回</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, toRefs, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { InstanceHistoryItem, PageOptions } from './typings'
import {
  deleteApproval,
  queryInstanceDetail,
  queryInstanceHistory,
  withdrawApproval,
  ccReadReport
} from '@/apis/modules/detail'
import type { InstanceDetail } from './typings'
import personUtil from '@/utils/person'
import Renderer from './Renderer.vue'
import type { FormItem } from './../form/typings'
import { makeToast } from '@/utils/toast'
import type { OperateHistoryResponse } from '@/apis/typings/detail'
import { getTimeAgo } from '@/utils'
import TimeLine from './components/TimeLine.vue'
import bus from '@/utils/bus'
import { useStore } from 'vuex'
import type { StoreState } from '@/store/types'
import { getStatusType } from '@/hooks/base/status'
import { ccList } from '@/apis/modules/center'
import type { CCListResponse } from '@/apis/typings/center'

type InstanceType = 'myInitiation' | 'pending' | 'approved' | 'cc'

const store = useStore()
const toast = makeToast()
const instanceDetail = ref<InstanceDetail>({} as InstanceDetail)
const formItems = ref<FormItem[]>([])
const histories = ref<InstanceHistoryItem[]>([])
const isMyInitiation = ref<boolean>(false) // 本人提交
const permission = reactive({
  pass: false,
  reject: false,
  transfer: false,
  return: false,
  withdraw: false,
  comment: false,
  sign: false
})

const userInfo = computed(() => (store.state as StoreState).user)
const { user_name } = toRefs(userInfo.value)
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

const getInstance = (instance_id: string, type: InstanceType) => {
  queryInstanceDetail(instance_id)
    .then((res) => {
      if (res.code === 200) {
        const message = res.message || {}
        const key = message.applicant || ''
        const find = personUtil.lookupV2(key)
        isMyInitiation.value = find.name === user_name.value
        instanceDetail.value = {
          ...message,
          applicant: find.name,
          application_time: message.application_time,
          task_node_instance_id: '',
          department: find.departments,
          back_ground: find.back_ground
        }
        console.log('获取单据详情成功：', instanceDetail.value)
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
        getApprovalHistory(message.form_instance_code)
        if (isMyInitiation.value && type === 'myInitiation') {
          console.log('【我的申请】点击进入')
          permission.pass = false
          permission.reject = false
          permission.transfer = false
          permission.return = false
          permission.withdraw = true
          permission.comment = false
          permission.sign = false
        } else {
          console.log('【审批中心】点击进入')
          const allow = getStatusType(message.status) === 'in_progress'
          permission.pass = allow
          permission.reject = allow
          permission.transfer = allow
          permission.return = allow
          permission.withdraw = false
          permission.comment = allow
          permission.sign = allow
        }
        // 处理未读消息
        handlerUnRead(instance_id)
      } else {
        console.error('获取单据详情失败：', res.message)
      }
    })
    .catch((error) => {
      console.error('获取单据详情失败：', error)
    })
}

const handlerBack = () => {
  if (globalInstanceId.value) {
    uni.switchTab({
      url: '/pages/index/index'
    })
  } else {
    uni.navigateBack()
  }
}

const ccRead = (id: string) => {
  ccReadReport(id)
    .then((res) => {
      if (res.code === 200) {
        bus.emit('center:refresh')
      }
    })
    .catch((error) => {
      console.error('已读上报失败：', error)
    })
}

const handlerUnRead = (instance_id: string) => {
  ccList({ page_num: 1, page_size: 10000, read: false })
    .then((res) => {
      const message = res.message as CCListResponse
      const lists = message.cc_instances || []
      const find = lists.find((item) => item.instance_id === instance_id)
      if (find) {
        ccRead(find.instance_id)
      }
    })
    .catch((err) => console.error(err))
}

/**
 * 审批相关操作-转交
 */
const handlerTransfer = (): void => {
  uni.navigateTo({
    url: `/pages/comment/index?id=${instanceDetail.value.instance_code}&type=transfer`
  })
}

/**
 * 审批相关操作-拒绝
 */
const handlerReject = (): void => {
  uni.navigateTo({
    url: `/pages/comment/index?id=${instanceDetail.value.instance_code}&type=reject`
  })
}

/**
 * 审批相关操作-同意
 */
const handlerAgree = (): void => {
  uni.navigateTo({
    url: `/pages/comment/index?id=${instanceDetail.value.instance_code}&task_node_instance_id=${instanceDetail.value.task_node_instance_id}&type=agree`
  })
}

/**
 * 审批相关操作-退回
 */
const handlerReturn = (): void => {
  uni.navigateTo({
    url: `/pages/comment/index?id=${instanceDetail.value.instance_code}&type=return`
  })
}

/**
 * 审批相关操作-加签
 */
const handlerSign = (): void => {
  uni.navigateTo({
    url: `/pages/comment/index?id=${instanceDetail.value.instance_code}&type=sign`
  })
}

const handlerWithdraw = (): void => {
  const params: Record<string, unknown> = {
    operate_type: 'withdraw',
    instance_id: [
      {
        instance_id: instanceDetail.value.instance_code,
        task_node_instance_id: instanceDetail.value.task_node_instance_id
      }
    ]
  }
  withdrawApproval(params)
    .then((res) => {
      if (res.code === 200) {
        toast.success('撤回成功')
        uni.navigateBack()
      } else {
        toast.info((res.message as string) ?? '撤回失败')
      }
    })
    .catch((error) => {
      console.error('撤回失败：', error)
    })
}

const handlerDelete = (): void => {
  deleteApproval(instanceDetail.value.instance_code)
    .then((res) => {
      if (res.code === 200) {
        toast.success('删除成功')
        uni.navigateBack()
      } else {
        toast.info((res.message as string) ?? '删除失败')
      }
    })
    .catch((error) => {
      console.error('删除失败：', error)
    })
}

// 此处处理飞书消息跳转
const globalInstanceId = computed(() => store.state.instance.instance_id)
watch(globalInstanceId.value, (newVal: string) => {
  if (newVal) {
    const globalInstanceType = store.state.instance.instance_type
    getInstance(globalInstanceId.value, globalInstanceType)
  }
})

// onLoad 生命周期接收路由参数
onLoad((options?: PageOptions) => {
  const obj = JSON.parse(decodeURIComponent(options?.data ?? '{}'))
  // 代表从单据列表进入
  if (obj?.instance_id) {
    console.log('obj:', obj)
    const { instance_id, instance_type } = obj
    getInstance(instance_id, instance_type)
  }
})

onMounted(() => {
  bus.on('detail:refresh-history', () => {
    console.log('refresh history')
    getApprovalHistory(instanceDetail.value.form_instance_code)
    // 滚动到最底部
  })
})

onUnmounted(() => {
  bus.off('detail:refresh-history', () => {
    console.log('cleanup refresh listener')
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
  // flex: 1;
  height: 100vh;
  padding: 20rpx 30rpx;
  box-sizing: border-box;
  padding-bottom: 140rpx; /* 为底部操作栏留白 */
}
.card-section {
  background-color: #fff;
  border-radius: 16rpx;
  // padding: 30rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

/* 顶部信息 */
.header-card {
  .main-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    .form-title {
      font-weight: bold;
      color: #1b1f26;
      font-size: 30rpx;
    }
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
    color: #727c88;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .underline {
    width: 100%;
    height: 1.5rpx;
    display: block;
    margin: 16rpx 0;
  }
}

/* 详情信息 */
.detail-card {
  .user-row {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    // padding-bottom: 20rpx;
    // border-bottom: 1rpx solid #f0f0f0;
    .avatar {
      width: 44rpx;
      height: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      border-radius: 50%;
      margin-right: 16rpx;
      color: #fff;
    }
    .user-info {
      display: flex;
      align-items: center;
      .name {
        color: #1b1f26;
        font-size: 28rpx;
        font-weight: bold;
        margin-right: 12rpx;
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
    // padding: 10rpx 0;
    margin-bottom: 35rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .no-data {
    font-size: 26rpx;
    color: #868e96;
  }
}

/* 时间轴 (核心样式) */
.timeline-card {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #1b1f26;
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
    font-size: 28rpx;
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
  .btn-error {
    background-color: #f53f3f;
    color: #fff;
  }
  .btn-error-hover {
    background-color: #ee5454;
  }
}
</style>
