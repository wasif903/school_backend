import {
  HandleCreateAdmin,
  HandleCreateRoles,
  HandleGetRolesByBranch,
  HandleGetUsers,
  HandleLogin,
} from "../controllers/AuthController.js";

export const authRoutes = async (fastify, options) => {
  fastify.get("/users", HandleGetUsers);
  fastify.post("/signup-admin", HandleCreateAdmin);
  fastify.post("/login", HandleLogin);
  fastify.post("/create-roles/:adminID", HandleCreateRoles);
  fastify.get("/get-roles/:adminID/:branchId", HandleGetRolesByBranch);
};
