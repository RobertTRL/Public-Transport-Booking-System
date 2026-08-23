import { Link, useNavigate } from 'react-router-dom'
import '../styles/auth.css'

function Login() {
  const navigateToDashboard = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()

    // Authentication will be connected to the backend later.
    console.log('Login form submitted')
    navigateToDashboard("/dashboard")
    console.log('Moved to dashboard')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your Public Transport account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="password-label">
              <label htmlFor="password">Password</label>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Sign in
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login