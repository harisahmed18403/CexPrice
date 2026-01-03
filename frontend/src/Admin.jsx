import { useState } from "react"

export default function Admin() {
  const [message, setMessage] = useState("")

  const refreshCex = async () => {
    const res = await fetch("http://localhost:5000/api/cex-refresh", {
      method: "POST",
      credentials: "include"
    })
    const data = await res.json()
    if (res.ok) setMessage(data.message)
    else setMessage(data.error)
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Admin</h2>
      <button onClick={refreshCex}>Refresh CEX Products</button>
      <p>{message}</p>
    </div>
  )
}
