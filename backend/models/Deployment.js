const mongoose = require("mongoose")

const deploymentSchema = new mongoose.Schema(
  {
    clientName: String,
    domain: String,
    image: String,
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Deployment", deploymentSchema)
