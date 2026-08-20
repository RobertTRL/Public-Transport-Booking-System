import { Link } from 'react-router-dom'
import '../styles/auth.css'

function Login() {
  const handleSubmit = (event) => {
    event.preventDefault()

    // Authentication will be connected to the backend later.
    console.log('Login form submitted')
  }

  const handleGoogleLogin = () => {
    // Google authentication will be implemented by the backend team.
    console.log('Continue with Google')
  }

  return (
    <main className="auth-page">
       <div className="transport-route route-one">
    <span className="route-stop"></span>
    <span className="route-stop"></span>
    <span className="route-stop"></span>
  </div>
      <section className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">PT</div>

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

              <a href="#" className="forgot-password">
                Forgot password?
              </a>
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

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login