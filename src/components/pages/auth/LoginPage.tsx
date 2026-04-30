import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import logo from '../../../assets/logo.png'

export const LoginPage = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.errors[0] ?? 'ログインに失敗しました')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1><img src={logo} width="180" alt="SubS" /></h1>
        <p className="login-subtitle">マッチングを始めよう</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>
          <div className="login-field">
            <label>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="パスワードを入力"
              disabled={loading}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
