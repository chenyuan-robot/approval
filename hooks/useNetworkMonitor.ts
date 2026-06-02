/**
 * 监听网络变化
 */
import { onMounted, onUnmounted } from 'vue'

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

  let previousNetworkState: NetworkStatus | null = null
  let wasDisconnected = false

  const networkListener = (res: UniApp.OnNetworkStatusChangeSuccess) => {
    const currentIsConnected = res.isConnected && res.networkType !== 'none'
    const previousIsConnected = previousNetworkState?.isConnected ?? null

    // 首次获取状态
    if (previousNetworkState === null) {
      previousNetworkState = {
        networkType: res.networkType as NetworkType,
        isConnected: currentIsConnected
      }
      if (!currentIsConnected) {
        wasDisconnected = true
        onDisconnected?.(res.networkType as NetworkType)
      } else {
        onConnected?.(res.networkType as NetworkType)
      }
      return
    }

    // 状态变化
    if (currentIsConnected !== previousIsConnected) {
      if (currentIsConnected) {
        if (wasDisconnected) {
          onRestore?.(res.networkType as NetworkType)
        }
        onConnected?.(res.networkType as NetworkType)
        wasDisconnected = false
      } else {
        wasDisconnected = true
        onDisconnected?.(res.networkType as NetworkType)
      }
    }

    previousNetworkState = {
      networkType: res.networkType as NetworkType,
      isConnected: currentIsConnected
    }
  }

  onMounted(() => {
    uni.onNetworkStatusChange(networkListener)
    uni.getNetworkType({
      success: (res) => {
        networkListener({
          networkType: res.networkType,
          isConnected: res.networkType !== 'none'
        })
      }
    })
  })

  const stop = () => {
    uni.offNetworkStatusChange(networkListener)
  }

  onUnmounted(stop)
  return stop
}
