import type { IPerson } from '@/apis/typings/global'
import store from '@/store'

class Person {
  private result: Map<string, IPerson> = new Map()
  private _defaultPerson: IPerson = {
    account: 'unknown',
    name: '未知用户',
    job_title: '未知岗位',
    departments: '未知部门',
    back_ground: '162.55deg, #368D36 7.86%, #B1D814 91.46%'
  }

  /**
   * 根据名字查询用户信息
   * name的值唯一
   * @param name
   * @returns
   */
  lookup(name: string): IPerson {
    try {
      const cached = this.result.get(name)
      if (cached) {
        return cached
      }
      const userList = store.state.userList
      const find = userList.find((person) => person.name === name)
      if (!find) {
        this.result.set(name, this._defaultPerson)
        return this._defaultPerson
      }
      const result: IPerson = {
        account: find.account,
        name: find.name,
        departments: find.departments,
        job_title: find.job_title,
        back_ground: find.back_ground
      }
      this.result.set(name, result)
      return result
    } catch (error) {
      console.error(error)
      return this._defaultPerson
    }
  }

  /**
   * 根据key查询用户信息
   * key的值唯一
   * @param key
   * @returns
   */
  lookupV2(key: string): IPerson {
    try {
      const cached = this.result.get(key)
      if (cached) {
        return cached
      }
      const userList = store.state.userList
      const find = userList.find((person) => person.account === key)
      if (!find) {
        return this._defaultPerson
      }
      const result: IPerson = {
        account: find.account,
        name: find.name,
        departments: find.departments,
        job_title: find.job_title,
        back_ground: find.back_ground
      }
      this.result.set(key, result)
      return result
    } catch (error) {
      console.error(error)
      return this._defaultPerson
    }
  }
}

const personUtil = new Person()

export default personUtil
