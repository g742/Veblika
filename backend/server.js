require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const Deployment = require("./models/Deployment")

const { Queue } = require("bullmq")
const IORedis = require("ioredis")

const app = express()
app.use(cors())
app.use(express.json())

// Redis connection
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
})

// Queue
const deployQueue = new Queue("deployments", { connection })

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err))

// POST /api/deploy
app.post("/api/deploy", async (req, res) => {
  const { clientName, domain, image } = req.body

  const deployment = await Deployment.create({
    clientName,
    domain,
    image,
    status: "Pending",
  })

  // push job to queue
  await deployQueue.add("deploy", {
    id: deployment._id.toString(),
    image,
  })

  console.log("Deployment queued:", deployment._id)

  res.json({
    id: deployment._id,
    status: "Pending",
  })
})

// GET /api/status/:id
app.get("/api/status/:id", async (req, res) => {
  const deployment = await Deployment.findById(req.params.id)

  if (!deployment) {
    return res.status(404).json({ error: "Not found" })
  }

  res.json({
    status: deployment.status,
  })
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})
