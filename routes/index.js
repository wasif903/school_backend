import { authRoutes } from "./AuthRoutes.js";
import { ClassRoutes } from "./ClassRoutes.js";

const prefix = '/api';

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix: prefix })
    fastify.register(ClassRoutes, { prefix: prefix.concat('/class') })
}

// 003419