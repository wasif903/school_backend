import fastifyMultipart from "@fastify/multipart";
import { authRoutes } from "./AuthRoutes.js";
import { branchRoutes } from "./BranchRoutes.js";
import { ClassRoutes } from "./ClassRoutes.js";
import { ParentRoutes } from "./ParentRoutes.js";

const prefix = "/api";

export const registerRoutes = async fastify => {
  
  //   fastify.register(fastifyMultipart, {
  //   addToBody: true 
  // });

  fastify.register(authRoutes, { prefix: prefix });
  fastify.register(branchRoutes, { prefix: prefix.concat("/branch") });
  fastify.register(ClassRoutes, { prefix: prefix.concat("/class") });
  fastify.register(ParentRoutes, { prefix: prefix.concat("/admission") });
};
