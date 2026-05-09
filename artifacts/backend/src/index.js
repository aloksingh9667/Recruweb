import app from "./app.js";
import { connectDB } from "./lib/db.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.PORT);
if (!port) throw new Error("PORT env var required");

await connectDB();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error starting server");
    process.exit(1);
  }
  logger.info({ port }, "Recruweb API server listening");
});
