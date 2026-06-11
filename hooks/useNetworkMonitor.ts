/**
 * 全局网络状态监听（uni-app 全端可用，修复所有bug）
 */
import { onLaunch, onHide, onShow } from '@dcloudio/uni-app'

type NetworkType = 'none' | 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown'

interface NetworkStatus {
  networkType: NetworkType
  isConnected: boolean
}

interface NetworkMonitorOptions {
  onConnected?: (networkType: NetworkType) => void
  onDisconnected?: (networkType: NetworkType) => void
  onRestore?: (networkType: NetworkType) => void
}

export function useNetworkMonitor(options: NetworkMonitorOptions) {
  const { onConnected, onDisconnected, onRestore } = options

  // 上一次网络状态
  let prevState: NetworkStatus | null = null
  // 是否曾经断网
  let wasDisconnected = false

  // 网络状态变化回调
  const networkListener = (res: UniApp.OnNetworkStatusChangeSuccess) => {
    const { networkType, isConnected } = res
    const current: NetworkStatus = {
      networkType: networkType as NetworkType,
      isConnected
    }

    // 首次初始化
    if (!prevState) {
      prevState = current
      if (!isConnected) {
        wasDisconnected = true
        onDisconnected?.(networkType as NetworkType)
      } else {
        onConnected?.(networkType as NetworkType)
      }
      return
    }

    // 状态没变不处理
    if (prevState.isConnected === current.isConnected) {
      prevState = current
      return
    }

    // 断开网络
    if (!isConnected) {
      wasDisconnected = true
      onDisconnected?.(networkType as NetworkType)
    } else {
      if (wasDisconnected) {
        onRestore?.(networkType as NetworkType)
        wasDisconnected = false
      }
      onConnected?.(networkType as NetworkType)
    }

    prevState = current
  }

  onLaunch(() => {
    try {
      // 绑定监听
      uni.onNetworkStatusChange(networkListener)
      // 获取初始网络状态
      uni.getNetworkType({
        success: (res) => {
          networkListener({
            networkType: res.networkType,
            isConnected: res.networkType !== 'none'
          })
        },
        fail: (err) => {
          console.error('获取网络状态失败', err)
        }
      })
    } catch (e) {
      console.error('网络监听初始化失败', e)
    }
  })

  // 应用关闭/切后台：移除监听（防止内存泄漏）
  onHide(() => {
    try {
      uni.offNetworkStatusChange(networkListener)
    } catch (e) {
      console.error('网络监听初始化失败', e)
    }
  })

  // 应用切回前台：重新绑定
  onShow(() => {
    try {
      uni.offNetworkStatusChange(networkListener)
      uni.onNetworkStatusChange(networkListener)
    } catch (e) {
      console.error('网络监听初始化失败', e)
    }
  })

  // 手动停止方法
  const stop = () => {
    try {
      uni.offNetworkStatusChange(networkListener)
    } catch (e) {
      console.error('网络监听初始化失败', e)
    }
  }

  return stop
}
