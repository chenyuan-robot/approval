export interface IGlobal {
  name: string
}

interface FSFileItem {
  path: string
  name: string
  size: number
}

export interface FSFileSuccess {
  errMsg: string
  list: FSFileItem[]
}

export interface TempFile {
  size: number
}

export interface ChooseImageResponse {
  tempFilePaths: string[]
  tempFiles: TempFile[]
}
