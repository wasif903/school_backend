import Fastify from "fastify";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { registerRoutes } from "./routes/index.js";
import { connectToDatabase } from "./utils/db.js";
// import fastifySocketIO from "";
import fastifyCors from "@fastify/cors";

dotenv.config();

const start = async () => {
  const app = Fastify();

  const PORT = process.env.PORT;

  app.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });

  await registerRoutes(app);
  await connectToDatabase();

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Application started on http://localhost:${PORT}`);
    }
  });
};

start();
