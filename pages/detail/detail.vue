<template>
  <view class="container">
    <scroll-view scroll-y class="scroll-content">
      
      <view class="card-section header-card">
        <view class="main-title">
          <text>请假申请</text>
          <text class="status-tag passed">已通过</text>
        </view>
        <view class="sub-info">申请编号：SP20230615001</view>
        <view class="sub-info">提交时间：2025-07-19 10:09:30</view>
      </view>

      <view class="card-section detail-card">
        <view class="user-row">
          <image class="avatar" src="https://via.placeholder.com/60" />
          <view class="user-info">
            <text class="name">Jake</text>
            <text class="dept">数字化及软件工程部</text>
          </view>
        </view>
        
        <view class="info-item">
          <view class="label">请假类型</view>
          <view class="value bold">年假</view>
        </view>
        
        <view class="info-item">
          <view class="label">开始时间</view>
          <view class="value time-range">
            <text>2025-10-20 11:30</text>
            <text class="to">至</text>
            <text>2025-10-23 16:30</text>
          </view>
          <view class="sub-value">共 3 天 (含周末2天)</view>
        </view>
        
        <view class="info-item">
          <view class="label">请假事由</view>
          <view class="value">因家里有急事需要回去处理，需要请假5天，还望领导审批，谢谢！</view>
        </view>
        
        <view class="info-item">
          <view class="label">工作安排</view>
          <view class="value">
            1.假期期间工作已交接给同事王华<br/>
            2.紧急事务可联系电话：13800138000
          </view>
        </view>
        
        <view class="info-item attachment-box">
          <view class="label">附件</view>
          <view class="file-item">
            <view class="file-left">
              <text class="file-icon">📄</text>
              <text class="file-name">zujianku请假证明.pdf</text>
            </view>
            <text class="download-icon">📥</text>
          </view>
        </view>
      </view>

      <view class="card-section timeline-card">
        <view class="section-title">审批记录</view>
        <view class="timeline">
          <view class="timeline-item">
            <view class="tail"></view>
            <view class="node node-blue"></view>
            <view class="content">
              <view class="step-title">提交</view>
              <view class="person-box">
                <image class="mini-avatar" src="https://via.placeholder.com/40" />
                <view class="person-info">
                  <view class="p-top"><text class="p-name">Jake</text> <text class="p-role">产品组</text></view>
                  <view class="p-status blue">已提交</view>
                </view>
                <view class="p-time">
                  <text>9个月前</text>
                  <text class="date">2025年3月15日</text>
                </view>
              </view>
            </view>
          </view>
          <view class="timeline-item">
            <view class="tail"></view>
            <view class="node node-blue"></view>
            <view class="content">
              <view class="step-title">审批</view>
              <view class="person-box">
                <image class="mini-avatar" src="https://via.placeholder.com/40" />
                <view class="person-info">
                  <view class="p-top"><text class="p-name">Robin</text> <text class="p-role">高级产品经理</text></view>
                  <view class="p-status green">已同意</view>
                </view>
                <view class="p-time">
                  <text>9个月前</text>
                  <text class="date">2025年3月15日</text>
                </view>
              </view>
              <view class="comment-bubble">已确认请假事宜，了解工作安排，同意请假，请其余审批人员配合审批。</view>
            </view>
          </view>
          <view class="timeline-item current">
            <view class="node node-gray"></view>
            <view class="content">
              <view class="step-title">审批</view>
              <view class="person-box">
                <image class="mini-avatar" src="https://via.placeholder.com/40" />
                <view class="person-info">
                  <view class="p-top"><text class="p-name">李经理</text> <text class="p-role">产品总监</text></view>
                  <view class="p-status gray">○ 未读</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

    </scroll-view>

    <view class="bottom-action-bar">
      <button class="btn btn-reject">拒绝</button>
      <button class="btn btn-agree">同意</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 声明一个响应式变量来存储接收到的单据 ID
const documentId = ref('');
// 假设这是详情数据
const detailData = ref({});

// onLoad 生命周期接收路由参数
onLoad((options) => {
  if (options.id) {
    documentId.value = options.id;
    console.log('从列表页接收到的单据ID是:', documentId.value);
    
    // 拿到 ID 后，调用后端的接口获取审批详情
    fetchDetailData(documentId.value);
  }
});

// 模拟获取详情数据的网络请求
const fetchDetailData = (id) => {
  uni.showLoading({ title: '加载中...' });
  
  // 模拟请求延迟
  setTimeout(() => {
    // 这里替换成你的真实业务请求：uni.request(...)
    detailData.value = {
      applyId: 'SP20230615001',
      name: 'Jake',
      type: '年假'
      // ...其他详情字段
    };
    uni.hideLoading();
  }, 500);
};
</script>

<style lang="scss" scoped>
.container {
  // height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F5F6F8;
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
      font-size: 26rpx; padding: 6rpx 16rpx; border-radius: 8rpx; font-weight: normal;
      &.passed { background-color: rgba(24, 181, 158, 0.1); color: #18B59E; }
    }
  }
  .sub-info { font-size: 26rpx; color: #666; margin-bottom: 8rpx; }
}

/* 详情信息 */
.detail-card {
  .user-row {
    display: flex; align-items: center; margin-bottom: 30rpx; padding-bottom: 20rpx; border-bottom: 1rpx solid #F0F0F0;
    .avatar { width: 60rpx; height: 60rpx; border-radius: 50%; margin-right: 20rpx; }
    .user-info { display: flex; align-items: center; .name { font-size: 30rpx; font-weight: bold; margin-right: 16rpx;} .dept { font-size: 26rpx; color: #999; } }
  }
  .info-item {
    margin-bottom: 24rpx;
    .label { font-size: 26rpx; color: #999; margin-bottom: 8rpx; }
    .value { font-size: 28rpx; color: #333; line-height: 1.5; }
    .bold { font-size: 32rpx; font-weight: bold; }
    .time-range { display: flex; align-items: center; .to { margin: 0 20rpx; color: #999; } }
    .sub-value { font-size: 24rpx; color: #999; margin-top: 8rpx; }
  }
  .attachment-box {
    .file-item {
      display: flex; justify-content: space-between; align-items: center; background-color: #F5F7F9; padding: 20rpx; border-radius: 12rpx; margin-top: 10rpx;
      .file-left { display: flex; align-items: center; .file-icon { margin-right: 12rpx; font-size: 32rpx;} .file-name { font-size: 28rpx; color: #2979FF;} }
      .download-icon { color: #2979FF; font-size: 32rpx; }
    }
  }
}

/* 时间轴 (核心样式) */
.timeline-card {
  .section-title { font-size: 30rpx; font-weight: bold; margin-bottom: 30rpx; }
  .timeline {
    padding-left: 20rpx;
    .timeline-item {
      position: relative; padding-bottom: 40rpx;
      &.current { padding-bottom: 0; .tail { display: none; } }
      .tail { position: absolute; left: 0rpx; top: 30rpx; bottom: 0; width: 1rpx; background-color: #E9EAED; }
      .node { position: absolute; left: 0; top: 8rpx; width: 20rpx; height: 20rpx; border-radius: 50%; border: 4rpx solid #fff; box-shadow: 0 0 0 2rpx #2979FF; background: #fff; }
      .node-blue { box-shadow: 0 0 0 4rpx #2979FF; }
      .node-gray { box-shadow: 0 0 0 2rpx #ccc; }
      
      .content {
        padding-left: 40rpx;
        .step-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
        .person-box {
          display: flex; align-items: flex-start;
          .mini-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; margin-right: 16rpx; }
          .person-info {
            flex: 1;
            .p-top { display: flex; align-items: center; margin-bottom: 6rpx; .p-name { font-size: 28rpx; color: #333; margin-right: 10rpx; } .p-role { font-size: 22rpx; color: #999; } }
            .p-status { font-size: 24rpx; &.blue { color: #2979FF; } &.green { color: #18B59E; } &.gray { color: #999; } }
          }
          .p-time { display: flex; flex-direction: column; align-items: flex-end; font-size: 22rpx; color: #999; .date { margin-top: 4rpx; } }
        }
        .comment-bubble { background-color: #F8F9FA; padding: 20rpx; border-radius: 12rpx; font-size: 26rpx; color: #666; margin-top: 16rpx; line-height: 1.5; }
      }
    }
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
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  padding-bottom: env(safe-area-inset-bottom);
  
  .btn {
    flex: 1; height: 80rpx; line-height: 80rpx; font-size: 30rpx; border-radius: 40rpx; text-align: center; margin: 0 10rpx;
    &::after { border: none; }
  }
  .btn-reject { background-color: #F5F7F9; color: #666; }
  .btn-agree { background-color: #2979FF; color: #fff; }
}
</style>