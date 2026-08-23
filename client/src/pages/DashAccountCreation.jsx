import { Link } from 'react-router-dom'
import '../styles/auth.css'

function AccountCreation() {
  const handleSubmit = (event) => {
    event.preventDefault()

    // Account creation will be connected to the backend later.
    console.log('Account creation form submitted')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Create your operator account</h1>
          <p>Set up your account to manage routes and services</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Create account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default AccountCreation