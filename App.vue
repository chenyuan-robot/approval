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
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI2OGE2ZDJhZWYzNDdkNGNlOGE2ZWMwODgzY2VhYTg2OCIsIm5hbWUiOiLpmYjov5wiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImRoYUp0RiJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc4MTMzNDc5N30.O_jYjLu47b15TfEWGuXNCYk4Agl9F7fCCQ6l0BWsmVUrWl7gtAw80S1xwjwF0idrzeVaWmRKSmv6_PbW7BlcEoOQyBxLxDOhXkso5aruq3rZCNUQgFmjXxbfyoUCqW6NQgC0nhEbuRTNUcfqiJkoWWUOaBPt5t6BnYtAUc1di0DROWJKlvzFmjAtYeRxomZBV4dsYlKg0gyH5uswQrwzkfsVJIlGcwtQyYLn2hfmtUJiyC1SeBip-zSWTZnH7asiGmeagWsOtgkIoOrgKZXnBwzMBbuhxwGqCPIBy_K10bu0GAhyilNLvYpl3xbokbrSojbf4ebbdAUg2FdkJWJK0A'
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
    // #ifdef MP-LARK
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
    // #endif
  },

  onShow: function (options: {
    path?: string
    query?: {
      path?: string
      instance_id?: string
      type?: string
      task_node_instance_id?: string
    }
  }) {
    // 获取热启动参数
    // #ifdef MP-LARK
    setTimeout(() => {
      const path = options?.path ?? ''
      if (path === 'pages/detail/detail') {
        const instance_id = options?.query?.instance_id ?? ''
        const instance_type = options?.query?.type ?? ''
        const task_node_instance_id = options?.query?.task_node_instance_id ?? ''
        if (instance_id && instance_type) {
          store.commit('instance/SET_STATE', { instance_id, instance_type, task_node_instance_id })
        }
      } else if (path === 'pages/form/form') {
        const instance_id = options?.query?.instance_id ?? ''
        const instance_type = options?.query?.type ?? ''
        const task_node_instance_id = options?.query?.task_node_instance_id ?? ''
        if (instance_id && instance_type) {
          store.commit('instance/SET_STATE', { instance_id, instance_type, task_node_instance_id })
        }
      }
    }, 500)
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
