const express = require('express')
const cookieParser = require("cookie-parser")
const cors=require("cors")

const app = express()

const DEFAULT_FRONTEND_URL = "http://localhost:5173"

function describeEnvValue(name, value) {
  return {
    name,
    json: JSON.stringify(value) || "undefined",
    utf8Bytes: Buffer.from(value || "", "utf8").toJSON().data,
  }
}

function getCorsOrigin() {
  const rawFrontendUrl = process.env.FRONTEND_URL
  const frontendUrl = rawFrontendUrl || DEFAULT_FRONTEND_URL

  const rawDiagnostic = describeEnvValue("FRONTEND_URL", rawFrontendUrl)
  console.log("[cors] FRONTEND_URL diagnostic:", JSON.stringify(rawDiagnostic))

  const sanitizedFrontendUrl = frontendUrl.trim().replace(/[\r\n]/g, "")

  try {
    const parsedFrontendUrl = new URL(sanitizedFrontendUrl)

    if (!["http:", "https:"].includes(parsedFrontendUrl.protocol)) {
      throw new Error(`Unsupported protocol "${parsedFrontendUrl.protocol}"`)
    }

    if (sanitizedFrontendUrl !== frontendUrl) {
      console.warn("[cors] FRONTEND_URL sanitized before use:", JSON.stringify({
        before: describeEnvValue("FRONTEND_URL", frontendUrl),
        after: describeEnvValue("FRONTEND_URL", sanitizedFrontendUrl),
      }))
    }

    return parsedFrontendUrl.origin
  } catch (error) {
    console.error("[cors] Invalid FRONTEND_URL. Refusing to start with an unsafe Access-Control-Allow-Origin value.", JSON.stringify({
      raw: describeEnvValue("FRONTEND_URL", rawFrontendUrl),
      effective: describeEnvValue("FRONTEND_URL_EFFECTIVE", frontendUrl),
      sanitized: describeEnvValue("FRONTEND_URL_SANITIZED", sanitizedFrontendUrl),
      reason: error.message,
    }))

    throw new Error(`Invalid FRONTEND_URL for CORS: ${JSON.stringify(frontendUrl)}. ${error.message}`)
  }
}

const corsOrigin = getCorsOrigin()


app.use(express.json()) //middleware
app.use(cookieParser())
app.use(cors({
  origin: corsOrigin,
  credentials: true
}))

/* require all the routes here*/
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// using all the routes here
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)


module.exports = app 
