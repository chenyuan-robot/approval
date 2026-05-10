<script lang="ts">
import store from './store'

export default {
  onLaunch: function () {
    console.log('App Launch')
    //todo 需要由宿主传进来
    // const data = {
    //   access_token:
    //     'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI3MzZlZmM3ODc0ZjA4YzE4ZDY3NTViYWRjZGYyYjY5MSIsIm5hbWUiOiLmnZzpmLPpmLMiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc3ODIwOTI2MH0.k_JTCsstezcbhJzntFmTstCItqhmA10EzRph-YmtX6ObrE6NRE_WsHNHmJDZkS5BqHLmWppgi88ZSB2NCSd1-oes7NfJCvC5Pqk4OD2XzumCjr1j0BBIeVmFimO7V4EG2nhZG1832s9uAoaxG7hCYrcbWkMsLAq3h1PNqCItrURisQxPGt4FX3aT-1GASZPrarNL4GDGoL8UET7CbA3cPDJ1Ixka4MnFU202HKT80LLza36waTGwLNDwqxLNQGvWT3AfTfD-xULpCbkd96EN6b-eT3oKhkncwD42xbklFQCGCRU9d8HyCtHdDz27BFO2phAFatZSzdcHPMvQfkpTfQ'
    // }
    const data = {
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI3MzZlZmM3ODc0ZjA4YzE4ZDY3NTViYWRjZGYyYjY5MSIsIm5hbWUiOiLmnZzpmLPpmLMiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc3ODM4MjM0MH0.mgC11vcxtJPmY-H_NaCOZMhdE4zbEYxLHgh_jqALvsd3sGwIiYMPdUrBCNGaGS5R7_R4Dd5LWSs6rcR4jJyWpaBldSUB_ImGzTHp2Oi-nBcWDx3O5gqpKpJTkTdOzMfrmW4G0h1B2h94Fc2TbBx1zkGzS8emoTjw_iyLZO_8rjZJjoDJapRLYFycF5da2BJdxOgahdjRHoskhBL1npmEuX_8_f8DfXKmUPohF0PSaaHDhgWsgqWE0SxGkxeGAQgnTADcfVZLbmENJllNb8AfKvcKLFoJN07vas6SIo5532W7do0LQe0aL8FmCGEm0PEp0sUhRD1Uwh-R298ojPgC-Q'
    }
    store.commit('user/SET_STATE', data)
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
