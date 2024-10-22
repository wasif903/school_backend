import { authRoutes } from "./AuthRoutes.js";

const prefix = '/api';

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix: prefix })
}

// 003419