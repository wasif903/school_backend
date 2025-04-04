import { HandleCreatePolicy } from "../controllers/PolicyControllers.js";

  
  export const PolicyRoutes = async (fastify, options) => {

    fastify.post("/:branchId/:adminId/create-new-policy", HandleCreatePolicy)
    
  };
  