export interface ISigninRequest {
  email: string
  password: string
}

export interface ISigninResponse {
  message: string,
  data: ISigninData
}

export interface ISigninData {
  user: {
    accessId: number;
    email: string;
    fullName: string;
    active: boolean;
    role: 'BASIC' | 'ADMIN';
  }
}

/** Form fields; UsersService maps this to the API body. */
export interface IRegisterRequest {
  fullName: string
  email: string
  password: string
}
