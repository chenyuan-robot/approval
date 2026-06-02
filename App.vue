<script lang="ts">
import store from './store'
import { makeToast } from '@/utils/toast'
import { useNetworkMonitor } from '@/hooks/useNetworkMonitor'

export default {
  onLaunch: function (launchInfo: Record<string, string>) {
    const toast = makeToast()
    // #ifndef MP-LARK
    console.log('App Launch', launchInfo)
    const data = {
      user_name: '陈远',
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI2OGE2ZDJhZWYzNDdkNGNlOGE2ZWMwODgzY2VhYTg2OCIsIm5hbWUiOiLpmYjov5wiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImRoYUp0RiJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc4MDU3OTQxM30.pHTjvkXYGYoHwtTouqvz0NMNcdZesqQWsjcj-9euSD8rz6SozpSklpncdxb36X-5P2U_0Q_4LJ3rogNjmf7wv9Z0uXNhgNbwzajM_Lj2Xu7ItGve9fN66_xL5H9hcLLEkwmU-RtvdzIazKcTI7rK00dOU_tPDAB_8glww9_R3xanEPCPog0o-z25S01WCDgz09qjP-IvD9XExVcM91W3z9ubYvlOxCErbQwPvG-mP8_2JDc-IzPXKHYvgqjyacKn_BwSKmaZa8QYtBIqg3nSEknm2RPsgMO_8ghYdkNIP7ZP44WzKJShVfTsIlpyiylrdEh0pnv4FBA8ojuQtIFB5Q'
    }

    if (launchInfo['referrerInfo']['extraData']['access_token'] != undefined) {
      data['access_token'] = launchInfo['referrerInfo']['extraData']['access_token']
      data['user_name'] = launchInfo['referrerInfo']['extraData']['user_name']
    }

    store.commit('user/SET_STATE', data)
    // 宿主传入数据后跳转
    uni.reLaunch({ url: '/pages/index/index' })
    // #endif

    // 全局网络监听
    useNetworkMonitor({
      onConnected(type) {
        console.log('网络已连接', type)
      },
      onDisconnected(type) {
        console.log('网络断开', type)
        toast.info('网络已断开', 2000)
      },
      onRestore(type) {
        console.log('网络恢复', type)
        toast.info('网络已恢复', 2000)
      }
    })
  },

  onShow: function (options: {
    path?: string
    query?: {
      path?: string
      instance_id?: string
      type?: string
    }
  }) {
    const toast = makeToast()
    // 获取热启动参数
    // #ifdef MP-LARK
    const path = options?.query?.path ?? ''
    toast.info(path, 3000)
    if (path === 'pages/detail/detail') {
      const instance_id = options?.query?.instance_id ?? ''
      const instance_type = options?.query?.type ?? ''
      setTimeout(() => {
        toast.info(instance_id, 2000)
      }, 3000)
      if (instance_id) {
        // toast.info(instance_id, 2000)
        // setTimeout(() => {
        //   toast.info(instance_type, 2000)
        // }, 3000)
        store.commit('instance/SET_STATE', { instance_id, instance_type })
      } else {
        toast.info('instance_id is empty', 2000)
      }
    }
    // #endif
  },

  onHide: function () {
    console.log('App Hide')
    store.commit('instance/RESET_STATE')
  }
}
</script>

<style>
/*每个页面公共css */
</style>
