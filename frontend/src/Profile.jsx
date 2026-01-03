import { useState } from "react"

export default function Profile({ user, refreshUser }) {
  const [username, setUsername] = useState(user.username)
  const [aboutMe, setAboutMe] = useState(user.about_me || "")
  const [message, setMessage] = useState("")

  const handleSave = async () => {
    const res = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, about_me: aboutMe })
    })
    const data = await res.json()
    if (res.ok) {
      setMessage("Profile updated")
      refreshUser()
    } else {
      setMessage(data.error)
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Profile</h2>
      <input value={username} onChange={e=>setUsername(e.target.value)} />
      <input value={aboutMe} onChange={e=>setAboutMe(e.target.value)} />
      <button onClick={handleSave}>Save</button>
      <p>{message}</p>
    </div>
  )
}
