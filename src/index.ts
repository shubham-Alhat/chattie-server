import server from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
