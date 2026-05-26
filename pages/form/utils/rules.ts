import type { FormValue } from '../typings'

/**
 * 表单规则工具类
 */
class FormRulesUtil {
  public rules: FormValue[] = []

  public depRules(rule: FormValue) {
    const existedRule = this.rules.find((item) => item.name === rule.name)
    if (existedRule) {
      return
    }
    this.rules.push(rule)
    console.log('this.rules', this.rules)
  }

  public clearRules() {
    this.rules = []
  }
}

export const formRulesUtil = new FormRulesUtil()
