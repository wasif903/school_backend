import {
  HandleNewAdmission
} from "../controllers/ParentController.js";

export const ParentRoutes = async (fastify, options) => {
  fastify.post("/create-new-admission", HandleNewAdmission);
};
