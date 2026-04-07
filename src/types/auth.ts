export interface AuthLoginRequest {
  loginId: string
  password: string
}

export interface AuthLoginResult {
  loginId: string
  created: boolean
  message: string
}

export interface AuthSession {
  loginId: string
}
