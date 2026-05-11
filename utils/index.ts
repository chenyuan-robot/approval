import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'

dayjs.extend(relativeTime)

/**
 * 把日期转为友好的相对时间：昨天、2天前、3个月前...
 * @param {string} dateStr - 日期字符串 如 2026-05-11 13:45:45
 * @returns {string}
 */
export const getTimeAgo = (dateStr: string): string => {
  const today = dayjs()
  const target = dayjs(dateStr)
  if (!target.isValid()) return '日期无效'
  let text = target.from(today, true)
  text = text
    .replace('a few seconds', '刚刚')
    .replace('a second', '1秒前')
    .replace('seconds', '秒前')
    .replace('a minute', '1分钟前')
    .replace('minutes', '分钟前')
    .replace('an hour', '1小时前')
    .replace('hours', '小时前')
    .replace('a day', '昨天')
    .replace('days', '天前')
    .replace('a month', '1个月前')
    .replace('months', '个月前')
    .replace('a year', '1年前')
    .replace('years', '年前')

  return text
}
