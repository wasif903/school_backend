import {
  HandleCreateFeeStructure,
  HandleCreateParent,
  HandleCreateStudent,
  HandleGetFeeStatus,
  HandlePayFee
} from "../controllers/ParentController.js";

export const ClassRoutes = async (fastify, options) => {
  fastify.post("/create-parent", HandleCreateParent);
  fastify.post("/create-student", HandleCreateStudent);
  fastify.post("/create-fee-structure", HandleCreateFeeStructure);
  fastify.post("/pay-fee", HandlePayFee);
  fastify.post("/get-fee-status/:studentId/:year", HandleGetFeeStatus);
};
