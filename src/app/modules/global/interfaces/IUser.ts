export interface IUser {
  id?: number
  userId: number
  email: string
  fullName: string
  role: 'BASIC' | 'ADMIN'
  active?: boolean
}

export interface IUserUpdateRequest {
  email?: string
  fullName?: string
}
