export function makeToast() {
  const info = (msg: string, duration = 1500) => {
    uni.showToast({
      title: msg,
      icon: 'none',
      duration,
      mask: false
    })
  }

  const loading = (msg: string, duration = 10000) => {
    uni.showLoading({
      title: msg,
      duration,
      mask: false
    })
  }

  const success = (msg: string, duration = 1500) => {
    uni.showToast({
      title: msg,
      icon: 'success',
      duration,
      mask: false
    })
  }

  const error = (msg: string, duration = 1500) => {
    uni.showToast({
      title: msg,
      icon: 'error',
      duration,
      mask: false
    })
  }

  const hiddenLoading = () => {
    uni.hideLoading()
  }

  return {
    info,
    loading,
    success,
    error,
    hiddenLoading
  }
}
