import { HandleCreateBranch, HandleGetAllBranches, HandleGetBranchById, HandleUpdateBranch } from "../controllers/BranchController.js"



export const branchRoutes = async (fastify, options) => {
    fastify.get("/get-all-branches", HandleGetAllBranches)
    fastify.post("/create-branch/:adminID", HandleCreateBranch);
    fastify.get("/get-single-branches/:branchID", HandleGetBranchById)
    fastify.patch("/update-branch/:branchID", HandleUpdateBranch)
}