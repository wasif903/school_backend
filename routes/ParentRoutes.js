import {
  HandleGetBranchParents,
  HandleGetStudentData,
  HandleNewAdmission
} from "../controllers/ParentController.js";

export const ParentRoutes = async (fastify, options) => {
  fastify.post("/:branchId/create-new-admission", HandleNewAdmission);
  fastify.get("/:branchId/get-branch-parents", HandleGetBranchParents);
  fastify.get("/:branchId/get-branch-students", HandleGetStudentData);
};
