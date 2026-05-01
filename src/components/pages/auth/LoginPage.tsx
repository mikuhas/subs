import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import logo from '../../../assets/logo.png'
import { LoadingScreen } from '../../ui/LoadingScreen'

type Mode = 'login' | 'register'

export const LoginPage = () => {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'mens' | 'womens' | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setAge(''); setGender(''); setError('')
  }

  const switchMode = (next: Mode) => { resetForm(); setMode(next) }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }
    setLoading(true)
    setError('')
    const [result] = await Promise.all([
      login(email, password),
      new Promise<void>(resolve => setTimeout(resolve, 1000)),
    ])
    setLoading(false)
    if (!result.success) setError(result.errors[0] ?? 'ログインに失敗しました')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const ageNum = parseInt(age)
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('すべての項目を入力してください')
      return
    }
    if (isNaN(ageNum) || ageNum < 18) {
      setError('年齢は18歳以上で入力してください')
      return
    }
    if (!gender) {
      setError('性別を選択してください')
      return
    }
    setLoading(true)
    setError('')
    const [result] = await Promise.all([
      register(email, password, name, ageNum, gender),
      new Promise<void>(resolve => setTimeout(resolve, 1000)),
    ])
    setLoading(false)
    if (!result.success) setError(result.errors[0] ?? '登録に失敗しました')
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="login-container">
      <div className="login-card">
        <h1><img src={logo} width="180" alt="SubS" /></h1>
        <p className="login-subtitle">マッチングを始めよう</p>

        <div className="login-mode-tabs">
          <button
            className={`login-mode-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >ログイン</button>
          <button
            className={`login-mode-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >新規登録</button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="example@email.com"
              />
            </div>
            <div className="login-field">
              <label>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="パスワードを入力"
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-button">ログイン</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="login-field">
              <label>お名前</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                placeholder="名前を入力"
              />
            </div>
            <div className="login-field">
              <label>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="example@email.com"
              />
            </div>
            <div className="login-field">
              <label>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="6文字以上"
              />
            </div>
            <div className="login-field">
              <label>年齢</label>
              <input
                type="number"
                min={18}
                max={99}
                value={age}
                onChange={e => { setAge(e.target.value); setError('') }}
                placeholder="18以上"
              />
            </div>
            <div className="login-field">
              <label>性別</label>
              <div className="login-gender-options">
                {(['mens', 'womens'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`login-gender-btn ${gender === g ? 'active' : ''}`}
                    onClick={() => { setGender(g); setError('') }}
                  >
                    {g === 'mens' ? 'メンズ' : 'レディース'}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-button">登録する</button>
          </form>
        )}
      </div>
    </div>
  )
}
