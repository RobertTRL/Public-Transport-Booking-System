import { useState } from 'react'
import '../styles/user.css'

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const [profile, setProfile] = useState({
    name: 'Stephen Muasya',
    email: 'stephen@example.com',
    phone: '+254 700 000 000',
    accountType: 'Passenger',
  })

  const [savedProfile, setSavedProfile] = useState(profile)

  const handleChange = (event) => {
    const { name, value } = event.target

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))
  }

 const handleSubmit = (event) => {
  event.preventDefault()

  setSavedProfile(profile)
  setIsEditing(false)

  console.log('Profile updated:', profile)
}

  return (
    <main className="profile-page">
      <section className="profile-container">

        <div className="profile-heading">
          <div>
            <h1>Profile</h1>
            <p>Manage your personal information and account settings.</p>
          </div>
        </div>

        <div className="profile-card">

          <div className="profile-top">
            <div className="profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>

              <span className="profile-badge">
                {profile.accountType}
              </span>
            </div>
          </div>

          <div className="profile-divider"></div>

          <form onSubmit={handleSubmit} className="profile-form">

            <div className="profile-form-group">
              <label htmlFor="name">Full name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone">Phone number</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-form-group">
              <label>Account type</label>

              <input
                type="text"
                value={profile.accountType}
                disabled
              />
            </div>

            <div className="profile-actions">

              {!isEditing ? (
                <button
                  type="button"
                  className="profile-button primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="profile-button secondary"
                    onClick={() => {
                     setProfile(savedProfile)
                          setIsEditing(false)
                       }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-button primary"
                  >
                    Save Changes
                  </button>
                </>
              )}

            </div>

          </form>

        </div>

        <div className="profile-card account-settings">

          <h2>Account Settings</h2>

          <p>
            Manage your account security and session.
          </p>

          <div className="settings-actions">

            <button className="profile-button secondary">
              Change Password
            </button>

            <button className="profile-button danger">
              Log out
            </button>

          </div>

        </div>

      </section>
    </main>
  )
}

export default ProfilePage