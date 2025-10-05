import http from "http";
import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


