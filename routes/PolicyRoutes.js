import { HandleCreatePolicy, HandleGetPolicies } from "../controllers/PolicyControllers.js";

export const PolicyRoutes = async (fastify, options) => {
  // get apis
  fastify.get("/get-policies", HandleGetPolicies)
  // fastify.get("/get-exceptions", HandleGetExceptions)
  // fastify.get("/get-events", HandleGetEvents)

  // post apis
  fastify.post("/:branchId/:adminId/create-new-policy", HandleCreatePolicy)
  // fastify.post("/exceptions", HandleCreateException)
  // fastify.post("/events", HandleCreateEvents)
};


// HandleCreateEvents, HandleCreateException,
// HandleGetEvents, HandleGetExceptions