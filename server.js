import express from "express";
import dotenv from "dotenv";
import router from "./routes/index.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./swagger.js";
import cors from "cors";
import "./config/connectDB.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true, // Note: This will not work with "*" as origin. See explanation below.
  })
);

app.use("", router);

const specs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req, resp) => {
  resp.send("KGH TIP API BE");
});

const port = process.env.port;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
});
