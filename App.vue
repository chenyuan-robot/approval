<script lang="ts">
import store from './store'

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
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI2OGE2ZDJhZWYzNDdkNGNlOGE2ZWMwODgzY2VhYTg2OCIsIm5hbWUiOiLpmYjov5wiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImRoYUp0RiJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc3OTg2MTQ2N30.gUo-7eD6KL-_CGReOfo4tNBkozr73PP2gjr09JHkfU-YPlJhKzkiCmHGrTVvkZ_HMYIJ1u1CkQMg_wSjxJyspKRnHsRj5uOORE1yCfChAE21IbXJzbpEfBomV0r-REV6Ba6sD5vtIZW_OQw1Kp9uvliiuSXP9SolxEPJqnw5kLLvQSdY-jZGzhV4OW-JUuJHEx9mm8LLlAvv7lVPI7nBCAqumjKFD_Ar60Y0ObJZTsHrC4SvOvZ97JJfOUq9_4TWVldWH-siuu8lw73OJqmVwGlpzMMzIjGEZhuxGBHb5PW7VqIKTONy5gRbFi9Nle_y3winLyIGTN4os68qaPaiBw'
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

  onShow: function () {
    console.log('App Show')
  },

  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
/*每个页面公共css */
</style>
