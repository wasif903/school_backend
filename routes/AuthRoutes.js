import { HandleGetUsers } from "../controllers/AuthController.js";


export const authRoutes = async (fastify, options) => {
    fastify.get("/users", HandleGetUsers)
}