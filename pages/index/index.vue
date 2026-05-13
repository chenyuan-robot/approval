<template>
  <view v-if="loading" class="loading">加载中...</view>
  <view class="container" v-else>
    <view class="filter-header">
      <view class="search-bar">
        <image class="search-icon" src="/static/search.svg" mode="aspectFit" />
        <input v-model.trim="searchQuery" type="text" placeholder="搜索单据名称" placeholder-class="ph-color" />
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!--      <view class="section">
        <view class="section-title">我常用的</view>
        <view class="grid-wrap white-bg">
          <view class="grid-item" v-for="(item, index) in frequentList" :key="index">
            <view class="icon-box" :style="{ backgroundColor: item.color }"></view>
            <text class="grid-text">{{ item.name }}</text>
          </view>
        </view>
      </view> -->

      <view class="section" v-for="(item1, idx1) in filteredDataSource" :key="item1.code + idx1">
        <view class="section-title">{{ item1.name }}</view>
        <view class="card-wrap">
          <view
            class="func-card"
            v-for="(item2, idx2) in item1.form_list"
            :key="item2.code + idx2"
            @click="goToForm(item2.code)"
          >
            <image class="card-icon" :src="item2.icon ? item2.icon : '/static/icon_1.svg'" mode="aspectFit"> </image>
            <view class="card-info">
              <text class="card-title">{{ item2.name }}</text>
              <text class="card-desc">{{ item2.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { treeWithForm } from '@/apis/modules/home'
import { makeToast } from '@/hooks/base/toast'
import { queryUserList } from '@/apis/modules/global'
import { useStore } from 'vuex'
import _head from 'lodash/first'

const store = useStore()
const loading = ref(true)
const dataSource = ref()
const searchQuery = ref('')
const toast = makeToast()

// 跳转到创建页
const goToForm = (id) => {
  uni.navigateTo({
    url: `/pages/form/form?id=${id}`
  })
}

function getData() {
  toast.loading('')

  treeWithForm({})
    .then((res) => {
      console.log(res)

      var _dataSource = []
      const documents = res.message.documents
      for (var index = 0; index < documents.length; index++) {
        var element = documents[index]

        var item = {
          id: element.id,
          name: element.name,
          code: element.code,
          form_list: []
        }

        const form_groups = element.form_groups
        for (var index1 = 0; index1 < form_groups.length; index1++) {
          item.form_list.push(...form_groups[index1].form_list)
        }

        _dataSource.push(item)
      }
      console.log(_dataSource)
      dataSource.value = _dataSource
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      loading.value = false
      toast.hiddenLoading()
    })
}

const filteredDataSource = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  if (!keyword) return dataSource.value

  return dataSource.value
    .map((item1) => {
      const filteredList = item1.form_list.filter((item2) => item2.name.toLowerCase().includes(keyword))
      if (filteredList.length > 0) {
        return {
          ...item1,
          form_list: filteredList
        }
      }
      return null
    })
    .filter((item) => item !== null)
})

onMounted(() => {
  getData()
})

const getUserList = () => {
  queryUserList()
    .then((res) => {
      if (res.code === 200) {
        const lists = (res.message?.persons || []).map((user) => ({
          name: user.name,
          account: user.account,
          job_title: user.job_title || '未知',
          departments: _head(user.departments ?? ['未知部门']),
          back_ground: user.back_ground || '162.55deg, #368D36 7.86%, #B1D814 91.46%'
        }))
        store.commit('SET_USER_LIST', lists)
      } else {
        console.error('查询失败：', res.message)
      }
    })
    .catch((err) => {
      console.error('查询失败：', err)
    })
}

onLoad(() => {
  getUserList()
})
</script>

<style lang="scss" scoped>
.loading {
  padding: 32rpx;
  text-align: center;
  color: #999;
}

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
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  background-color: #fff;
  gap: 30rpx;

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

.scroll-content {
  padding: 32rpx 32rpx;
  box-sizing: border-box;
}

.section {
  margin-bottom: 0rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1b1f26;
    margin-bottom: 10rpx;
  }
}

.white-bg {
  background-color: #fff;
  border-radius: 32rpx;
  padding: 40rpx 0;
}

.grid-wrap {
  display: flex;
  flex-wrap: wrap;

  .grid-item {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;

    .icon-box {
      width: 160rpx;
      height: 160rpx;
      border-radius: 40rpx;
      margin-bottom: 24rpx;
    }

    .grid-text {
      font-size: 48rpx;
      color: #333;
    }
  }
}

.card-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .func-card {
    width: calc(50% - 26rpx);
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx 24rpx;
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    box-sizing: border-box;
    margin-right: 16rpx;

    .card-icon {
      width: 64rpx;
      height: 64rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
    }

    .card-info {
      display: flex;
      flex-direction: column;

      .card-title {
        font-size: 30rpx;
        color: #333;
        font-weight: 400;
        margin-bottom: 2rpx;
        color: #1b1f26;
        word-break: break-all;
        word-wrap: break-word;
      }

      .card-desc {
        font-size: 24rpx;
        color: #727c88;
        font-weight: 400;
      }
    }
  }
}
</style>
