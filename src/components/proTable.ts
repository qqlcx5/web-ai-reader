export interface ProTableSearchOption {
  label: string
  value: string | number
}

export interface ProTableSearchConfig {
  type: 'input' | 'select'
  options?: ProTableSearchOption[]
}

export interface ProTableColumn {
  label?: string
  prop?: string
  type?: 'index' | 'selection'
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  search?: ProTableSearchConfig
}

export interface ProTableResponse<T = Record<string, unknown>> {
  data: {
    list: T[]
    total: number
  }
}

export type ProTableRequestApi = (
  params: Record<string, unknown>,
) => Promise<ProTableResponse>
