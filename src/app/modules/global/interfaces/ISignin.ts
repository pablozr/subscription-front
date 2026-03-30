export interface ISigninRequest {
  email: string
  password: string
}

export interface ISigninResponse {
  message?: string
  data?: unknown
}

export interface ISigninData {
  user: {
    userId: number
    accessId: number
    email: string
    fullName: string
    active: boolean
    role: 'BASIC' | 'ADMIN'
  }
}

/** Form fields; UsersService maps this to the API body. */
export interface IRegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface IGoogleSigninRequest {
  token: string
}

export interface IForgetPasswordRequest {
  email: string
}

export interface IValidateCodeRequest {
  code: string
}

export interface IUpdatePasswordRequest {
  password: string
}
