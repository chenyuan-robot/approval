const setItem = (key: string, value: string) => {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    console.warn('storage setItem error: ', e)
  }
}

const getItem = (key: string) => {
  try {
    const value = uni.getStorageSync(key)
    return value
  } catch (e) {
    console.warn('storage getItem error: ', e)
  }
}

const removeItem = (key: string) => {
  try {
    uni.removeStorageSync(key)
  } catch (e) {
    console.warn('storage removeItem error: ', e)
  }
}

const removeAll = () => {
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.warn('storage removeAll error: ', e)
  }
}

export default {
  setItem,
  getItem,
  removeItem,
  removeAll
}
