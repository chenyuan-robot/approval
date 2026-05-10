/**
 * IBaseResponse
 */
export interface IBaseResponse<T> {
  code: number
  message: T
  data?: T
}
