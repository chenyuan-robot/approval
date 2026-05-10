type ArrayFormat = 'indices' | 'brackets' | 'repeat' | 'comma'
type PlainObject = Record<string, unknown>

interface StringifyOptions {
  arrayFormat?: ArrayFormat // 数组格式
  encode?: boolean // 是否对 key/value 做 URL 编码
  strictRFC3986?: boolean // 更严格的 RFC3986 编码（把 !'()* 也编码）
  skipNull?: boolean // 跳过值为 null 的项
  skipUndefined?: boolean // 跳过值为 undefined 的项
  skipEmptyString?: boolean // 跳过值为 "" 的项
  sort?: boolean | ((a: string, b: string) => number) // key 排序
  serializeDate?: (d: Date) => string // 日期序列化
  encoder?: (str: string) => string // 自定义编码器（优先级高于 encode/strict）
}

export function stringify(input: unknown, opts: StringifyOptions = {}): string {
  const {
    arrayFormat = 'indices',
    encode = true,
    strictRFC3986 = false,
    skipNull = false,
    skipUndefined = true,
    skipEmptyString = false,
    sort = true,
    serializeDate = (d) => d.toISOString(),
    encoder
  } = opts

  const isPlainObj = (v: unknown): v is PlainObject => Object.prototype.toString.call(v) === '[object Object]'

  const defaultEncoder = (str: string) => {
    if (!encode) return str
    const enc = encodeURIComponent(str)
    // RFC3986: 进一步编码 !'()* 这类字符
    return strictRFC3986 ? enc.replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`) : enc
  }

  const enc = encoder ?? defaultEncoder

  const push = (acc: string[], key: string, value: unknown) => {
    // 过滤值
    if (value === undefined && skipUndefined) return
    if (value === null && skipNull) return
    if (value === '' && skipEmptyString) return

    // 规范化原子值
    let v: string
    if (value === null) v = 'null'
    else if (value instanceof Date) v = serializeDate(value)
    else if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'bigint') v = String(value)
    else if (typeof value === 'string') v = value
    else v = String(value) // 兜底

    acc.push(`${enc(key)}=${enc(v)}`)
  }

  const build = (keyPrefix: string, value: unknown, acc: string[]) => {
    if (value === undefined && skipUndefined) return
    if (value === '' && skipEmptyString) return
    if (value === null) {
      // null 作为空值键，或跳过，或 "null" ——这里与 push 对齐：留给 push 决定
      push(acc, keyPrefix, value)
      return
    }

    if (Array.isArray(value)) {
      if (arrayFormat === 'comma') {
        // comma 格式：key=a,b,c；注意需要把数组项转为原子串
        const parts = value
          .filter((v) => !(v === undefined && skipUndefined))
          .map((v) => {
            if (v === null && skipNull) return undefined
            if (v instanceof Date) return serializeDate(v)
            if (v === '' && skipEmptyString) return undefined
            if (v === null) return 'null'
            return String(v)
          })
          .filter((v): v is string => v !== undefined)
        push(acc, keyPrefix, parts.join(','))
        return
      }

      for (let i = 0; i < value.length; i++) {
        const v = value[i]
        if (v === undefined && skipUndefined) continue
        if (arrayFormat === 'indices') {
          build(`${keyPrefix}[${i}]`, v, acc)
        } else if (arrayFormat === 'brackets') {
          build(`${keyPrefix}[]`, v, acc)
        } else {
          // repeat
          build(keyPrefix, v, acc)
        }
      }
      return
    }

    if (isPlainObj(value)) {
      // 子键排序
      const keys = Object.keys(value as PlainObject)
      if (sort) {
        keys.sort(typeof sort === 'function' ? sort : undefined)
      }
      for (const k of keys) {
        const v = (value as PlainObject)[k]
        const nextKey = keyPrefix ? `${keyPrefix}[${k}]` : k
        build(nextKey, v, acc)
      }
      return
    }

    // 基本类型
    push(acc, keyPrefix, value)
  }

  // 顶层：对象或原子
  const acc: string[] = []
  if (isPlainObj(input)) {
    const topKeys = Object.keys(input as PlainObject)
    if (sort) topKeys.sort(typeof sort === 'function' ? sort : undefined)
    for (const k of topKeys) {
      build(k, (input as PlainObject)[k], acc)
    }
  } else {
    // 顶层不是对象：给一个默认 key
    build('value', input, acc)
  }

  return acc.join('&')
}
