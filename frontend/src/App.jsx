import { useEffect, useState } from "react"
import axios from "axios"
import "./App.css"

function App() {
  const [formData, setFormData] = useState({
    clientName: "",
    domain: "",
    image: "",
  })

  const [deploymentId, setDeploymentId] = useState(null)
  const [status, setStatus] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(
        "http://localhost:5000/api/deploy",
        formData
      )

      setDeploymentId(res.data.id)
      setStatus("Pending")
    } catch (err) {
      console.log(err)
      alert("Deployment failed")
    }
  }

  useEffect(() => {
    if (!deploymentId) return

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/status/${deploymentId}`
        )

        setStatus(res.data.status)
      } catch (err) {
        console.log(err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [deploymentId])

  return (
    <div className="container">
      <h1>Hosting Control Panel</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="clientName"
          placeholder="Client Name"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="domain"
          placeholder="Domain"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="image"
          placeholder="Docker Image"
          onChange={handleChange}
          required
        />

        <button type="submit">Deploy</button>
      </form>

      {deploymentId && (
        <div className="status-box">
          <h2>Deployment Status</h2>

          <p>
            <strong>ID:</strong> {deploymentId}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className={status.toLowerCase()}>
              {status}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default App
