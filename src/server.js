import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedError,
  forbiddenErrorHandler,
} from "./errorHandlers.js";
import usersRouter from "./api/users/index.js";

const server = express();
const port = process.env.PORT;

server.use(cors());
server.use(express.json());

server.use("/users", usersRouter)

server.use(unauthorizedError);
server.use(forbiddenErrorHandler);
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
