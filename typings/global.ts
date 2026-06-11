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

export interface FSFileError {}
