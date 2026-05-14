<template>
  <view class="container">
    <image src="/static/logo.svg" alt="logo" class="logo" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { feishuLogin } from '@/apis/modules/login'
import { APP_ID, APP_SECRET } from '@/constants/common'
import store from '@/store'
import type { LoginResponse } from '@/apis/typings/login'

const login = () => {
  // #ifdef MP-LARK
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  tt.login({
    success: function (res: Record<string, unknown>) {
      if (res.code) {
        feishuLogin({
          code: res.code,
          redirect_uri: 'http://172.16.115.41:5174/',
          app_id: APP_ID,
          app_secret: APP_SECRET,
          tenant_abbr: 'coowa'
        }).then((res) => {
          console.log('user info: ', res)
          if (res.code === 200) {
            const data = res.data as LoginResponse
            store.commit('user/SET_STATE', {
              user_name: data.user.user_name,
              access_token: data.access_token
            })
            uni.reLaunch({ url: '/pages/index/index' })
          } else {
            // 登录失败
            uni.showToast({
              icon: 'none',
              title: `飞书登录失败: ${res.message}`
            })
          }
        })
      } else {
        uni.showToast({
          icon: 'none',
          title: '飞书登录失败  code = null'
        })
      }
    },
    fail: function (err: Record<string, unknown>) {
      console.log('tt.login request fail ', err)
      uni.showToast({
        icon: 'none',
        title: `飞书登录失败: ${err}`
      })
    }
  })
  // #endif
}

onShow(() => {
  // #ifdef MP-LARK
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  tt.checkSession({
    success: async function () {
      login()
    },
    fail: function () {
      login()
    }
  })
  // #endif
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.logo {
  width: 128rpx;
  height: 128rpx;
}
</style>
