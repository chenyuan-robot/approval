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
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtzMSJ9.eyJrZXkiOiI2OGE2ZDJhZWYzNDdkNGNlOGE2ZWMwODgzY2VhYTg2OCIsIm5hbWUiOiLpmYjov5wiLCJ0ZW5hbnQiOiLphbflk4fnp5HmioAiLCJ0bnRrZXkiOiJjb3dhcm9ib3QiLCJtYWluZ3JvdXAiOiI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImdyb3VwcyI6WyI4YjNiNGVjZWI5YjBmYjFhMGU5MWVjZjQxYjZkYmE5YyIsImRoYUp0RiJdLCJhZG1pbiI6ZmFsc2UsImV4cCI6MTc3ODY2NTU2N30.ShSM2nGzq7w9jaML5Fhb6XaV-9bQcI1g-9kcEMYWVJGesyu9Is-eOtFMEOcLmsGrRJackO3mrW12PhSa1BbMXMyDf3avOhqB7pfyvi-HA0SFCrMrByhXhjyc9DhtCIerp4W3KkEC6nSzLBzwkm5fG0cXrkiyfSF7DiA8RpLvUpTJ7vPpEhGaSUQlOnW59BKcpAdOGzDhlKUV14W6_vn_NvxqojhlRgEM_Z3Tl7ygTumsJ-bPvus1LXjX7yoTU6SQz9meffiqjH0OoR6VN7bovJdHAxS8MsVNmVk_VU-0o3E-rwa64aLtxAfCBhR44GzqIeVpsHtxHiG35_WlllxuhA'
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
