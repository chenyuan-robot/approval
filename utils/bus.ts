import mitt from 'mitt'

// 事件总线

// 定义事件类型
type Events = {
  'detail:refresh-history': void
  'center:refresh': void
}

const bus = mitt<Events>()

export default bus
