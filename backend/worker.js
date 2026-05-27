const { Worker } = require("bullmq")
const IORedis = require("ioredis")
const mongoose = require("mongoose")
const Deployment = require("./models/Deployment")

// ✅ MongoDB CONNECT (IMPORTANT FIX)
mongoose
  .connect("mongodb://127.0.0.1:27017/controlpanel")
  .then(() => console.log("MongoDB Connected in Worker"))
  .catch((err) => console.log("Mongo Error:", err))

// Redis connection
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
})

const worker = new Worker(
  "deployments",
  async (job) => {
    const { id, image } = job.data

    console.log("Processing:", id)

    await Deployment.findByIdAndUpdate(id, {
      status: "Running",
    })

    await new Promise((r) => setTimeout(r, 3000))

    console.log("Running docker image:", image)

    await Deployment.findByIdAndUpdate(id, {
      status: "Completed",
    })

    console.log("Completed:", id)
  },
  { connection }
)

worker.on("failed", (job, err) => {
  console.log("Job failed:", job?.id, err.message)
})

console.log("Worker running...")
