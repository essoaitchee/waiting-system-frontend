import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface LoginGateModalProps {
  loginId: string
  password: string
  errorMessage: string | null
  isLoading: boolean
  onLoginIdChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
}

function LoginGateModal({
  loginId,
  password,
  errorMessage,
  isLoading,
  onLoginIdChange,
  onPasswordChange,
  onSubmit,
}: LoginGateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Login Required</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">이벤트 참여를 위해 로그인해 주세요</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          등록된 아이디면 바로 로그인되고, 처음 입력한 아이디면 같은 비밀번호로 즉시 가입 후 로그인됩니다.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="아이디"
            value={loginId}
            placeholder="demo-user-olive"
            onChange={(event) => onLoginIdChange(event.target.value)}
          />
          <Input
            label="비밀번호"
            type="password"
            value={password}
            placeholder="비밀번호 입력"
            onChange={(event) => onPasswordChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSubmit()
              }
            }}
          />
        </div>

        {errorMessage ? (
          <div className="mt-4">
            <Alert tone="danger" title="로그인 실패">
              {errorMessage}
            </Alert>
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          <Button size="lg" className="flex-1 bg-orange-500 hover:bg-orange-600" isLoading={isLoading} onClick={onSubmit}>
            로그인 또는 회원가입
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LoginGateModal
