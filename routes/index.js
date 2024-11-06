import { authRoutes } from "./AuthRoutes.js";
import { branchRoutes } from "./BranchRoutes.js";
import { ClassRoutes } from "./ClassRoutes.js";

const prefix = '/api';

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix: prefix })
    fastify.register(branchRoutes, { prefix: prefix.concat('/branch') })
    fastify.register(ClassRoutes, { prefix: prefix.concat('/class') })
}

