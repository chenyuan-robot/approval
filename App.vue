<script lang="ts">
import store from './store'
import { makeToast } from '@/utils/toast'

export default {
  onLaunch: function (launchInfo: Record<string, string>) {
    // #ifndef MP-LARK
    console.log('App Launch', launchInfo)
    //todo 需要由宿主传进来
    // const data = {
    //   access_token:
    //     'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI3MzZlZmM3ODc0ZjA4YzE4ZDY3NTViYWRjZGYyYjY5MSIsIm5hbWUiOiLmnZzpmLPpmLMiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc3ODIwOTI2MH0.k_JTCsstezcbhJzntFmTstCItqhmA10EzRph-YmtX6ObrE6NRE_WsHNHmJDZkS5BqHLmWppgi88ZSB2NCSd1-oes7NfJCvC5Pqk4OD2XzumCjr1j0BBIeVmFimO7V4EG2nhZG1832s9uAoaxG7hCYrcbWkMsLAq3h1PNqCItrURisQxPGt4FX3aT-1GASZPrarNL4GDGoL8UET7CbA3cPDJ1Ixka4MnFU202HKT80LLza36waTGwLNDwqxLNQGvWT3AfTfD-xULpCbkd96EN6b-eT3oKhkncwD42xbklFQCGCRU9d8HyCtHdDz27BFO2phAFatZSzdcHPMvQfkpTfQ'
    // }

    const data = {
      user_name: '陈远',
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI2OGE2ZDJhZWYzNDdkNGNlOGE2ZWMwODgzY2VhYTg2OCIsIm5hbWUiOiLpmYjov5wiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImRoYUp0RiJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc4MDQwNjQ2NX0.utg8Jc_9Q6t-F2sfjwAzkhtoXJwxoR8P9dLqoH5hbVDtqh2gXe0_ldjRzoOraKQSR64MA5NwVTttcdStihWTnD5RD9XiqKL0f2LpWFHwss8Cqepc9yHmTosBJGw7dx8McSTWwIICajqfakLNt771iLXaKhjadRrK7XtgBjPYNIt8j7YqSd9iq0EhbX8qtlVg040K3eo4mHS-xxYRb-Z0WJJ8SpTkXqLCXfmOoppXA7hiySRYrlNse6Nwxee1oAs2H6r3RsI2kK-qjiVOBNCAisYHQXiptvF-8Pk8kqpzlWN2iwIPkg2QmjxjtmD1LeHAkGmolzmiX0OM7E3plbOm_Q'
    }

    if (launchInfo['referrerInfo']['extraData']['access_token'] != undefined) {
      data['access_token'] = launchInfo['referrerInfo']['extraData']['access_token']
      data['user_name'] = launchInfo['referrerInfo']['extraData']['user_name']
    }

    store.commit('user/SET_STATE', data)
    // 宿主传入数据后跳转
    uni.reLaunch({ url: '/pages/index/index' })
    // #endif
  },

  onShow: function (options: {
    path?: string
    query?: {
      path?: string
      instance_id?: string
      type?: string
      [key: string]: any
    }
  }) {
    // 获取热启动参数
    // #ifdef MP-LARK
    const toast = makeToast()
    const path = options?.query?.path ?? ''
    if (path === 'pages/detail/detail') {
      const instance_id = options?.query?.instance_id ?? ''
      const instance_type = options?.query?.type ?? ''
      if (instance_id) {
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
