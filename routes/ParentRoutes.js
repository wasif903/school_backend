import {
  HandleGetBranchParents,
  HandleGetStudentData,
  HandleNewAdmission
} from "../controllers/ParentController.js";
import { parseMultipartFiles } from "../utils/fileUpload.js";

export const ParentRoutes = async (fastify, options) => {
  fastify.post(
    "/:branchId/create-new-admission",
    // { preHandler: parseMultipartFiles },
    HandleNewAdmission
  );

  fastify.get("/:branchId/get-branch-parents", HandleGetBranchParents);
  fastify.get("/:branchId/get-branch-students", HandleGetStudentData);
};
