import type { FormValue } from '../typings'

/**
 * 表单规则工具类
 */
class FormRulesUtil {
  public rules: FormValue[] = []

  public depRules(rule: FormValue) {
    this.rules.push(rule)
    console.log('当前规则列表：', this.rules)
  }

  public clearRules() {
    this.rules = []
  }
}

export const formRulesUtil = new FormRulesUtil()
