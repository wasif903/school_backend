import {
  HandleAddGradesToClass,
  HandleBulkCreateClass,
  HandleCreateClass,
  HandleCreateGrade,
  HandleGetClasses,
  HandleGetSingleClass,
  HandleUpdateClass
} from "../controllers/ClassController.js";

export const ClassRoutes = async (fastify, options) => {
  fastify.post("/create-class", HandleCreateClass);
  fastify.patch("/:branchId/update-class/:classId", HandleUpdateClass);
  fastify.post("/bulk-create-class", HandleBulkCreateClass);
  fastify.get("/get-classes", HandleGetClasses);
  fastify.patch("/grades/add-grades/:id", HandleAddGradesToClass);
  fastify.get("/get-single-class/:id", HandleGetSingleClass);
  fastify.post("/grades/create-grades", HandleCreateGrade);
};
