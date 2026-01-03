import { useState } from "react"

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (res.ok) {
      setMessage("Logged in")
      onLogin()
    } else {
      setMessage(data.error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <p>{message}</p>
    </form>
  )
}
