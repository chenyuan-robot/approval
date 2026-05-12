/**
 * IBaseResponse
 */
export interface IBaseResponse<T> {
  code: number
  message: T
  data?: T
}

export interface CustomRequestOptions extends UniNamespace.RequestOptions {
  data?:
    | {
        download?: boolean
        [key: string]: unknown
      }
    | string
    | ArrayBuffer
}
