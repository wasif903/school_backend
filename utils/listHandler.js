import { SendResponse } from "./sendResponse.js";

// searchMode: true ho to pure search results laega (no pagination, all matches up to 1000).
// searchMode: false ya na ho to normal pagination chalta rahega.

// get data handler
const listHandler = async ({
  prismaModel,
  req,
  reply,
  searchableFields = [],
  filterFields = [],
  include = {},
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
  searchMode = false, // <-- New flag
}) => {
  try {
    const {
      limit = 10,
      search,
      sortBy = defaultSortBy,
      sortOrder = defaultSortOrder,
      cursor,
      page = 1,
      ...filters
    } = req.query;

    const take = Number(limit);
    const currentPage = Number(page);
    const isSearchActive = Boolean(search);
    const isSearchMode = searchMode && isSearchActive;

    // Build dynamic where clause
    const where = {};

    if (isSearchActive && searchableFields.length > 0) {
      where.OR = searchableFields.map((field) => ({
        [field]: {
          contains: search,
        },
      }));
    }

    filterFields.forEach((field) => {
      if (filters[field]) {
        where[field] = filters[field];
      }
    });

    const totalItems = await prismaModel.count({ where });
    const totalPages = isSearchMode ? 1 : Math.ceil(totalItems / take);

    const cursorObj = cursor ? { id: Number(cursor) } : undefined;

    const results = await prismaModel.findMany({
      where,
      ...(isSearchMode
        ? { take: 1000 } // maximum cap to avoid over-fetching
        : {
            take: take + 1,
            ...(cursorObj && { cursor: cursorObj, skip: 1 }),
          }),
      orderBy: {
        [sortBy]: sortOrder,
      },
      include,
    });

    const hasMore = isSearchMode ? false : results.length > take;
    const nextCursor = isSearchMode
      ? null
      : hasMore
      ? results[results.length - 1].id
      : null;
    if (!isSearchMode && hasMore) results.pop();

    return SendResponse(reply, 200, true, "Data fetched successfully", {
      results,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: isSearchMode ? results.length : take,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Generic list error:", {
      error: error.message,
      query: req.query,
    });
    return SendResponse(reply, 500, false, "Failed to fetch list data");
  }
};

// Agar req.params mein id mile to single delete.
// Agar req.body.ids mein ek array mile to bulk delete.

// delete data handler
const deleteHandler = async ({
  prismaModel,
  req,
  reply,
  idParam = "id",
  softDelete = false,
  deletedField = "isDeleted",
  checkOwnership = null, // Optional ownership function
}) => {
  try {
    const { ids } = req.body;
    const id = req.params[idParam];

    let deletedData;

    // Ownership check for bulk
    if (ids && Array.isArray(ids) && ids.length > 0) {
      if (checkOwnership) {
        const isAllowed = await checkOwnership(req.user, ids);
        if (!isAllowed) {
          return SendResponse(
            reply,
            403,
            false,
            "You are not authorized to delete these items"
          );
        }
      }

      if (softDelete) {
        deletedData = await prismaModel.updateMany({
          where: { id: { in: ids } },
          data: { [deletedField]: true },
        });
      } else {
        deletedData = await prismaModel.deleteMany({
          where: { id: { in: ids } },
        });
      }

      return SendResponse(
        reply,
        200,
        true,
        "Items deleted successfully",
        deletedData
      );
    }

    // Ownership check for single
    if (id) {
      if (checkOwnership) {
        const isAllowed = await checkOwnership(req.user, [Number(id)]);
        if (!isAllowed) {
          return SendResponse(
            reply,
            403,
            false,
            "You are not authorized to delete this item"
          );
        }
      }

      if (softDelete) {
        deletedData = await prismaModel.update({
          where: { id: Number(id) },
          data: { [deletedField]: true },
        });
      } else {
        deletedData = await prismaModel.delete({
          where: { id: Number(id) },
        });
      }

      return SendResponse(
        reply,
        200,
        true,
        "Item deleted successfully",
        deletedData
      );
    }

    return SendResponse(
      reply,
      400,
      false,
      "No valid ID(s) provided for deletion"
    );
  } catch (error) {
    console.error("Generic delete error:", {
      message: error.message,
      body: req.body,
      params: req.params,
    });
    return SendResponse(
      reply,
      500,
      false,
      "Something went wrong while deleting"
    );
  }
};

export default { listHandler, deleteHandler };

// delete data handler example

// Single delete
// req.params = { id: "12" }
// fastify.delete("/api/policy/:id", async (req, reply) => {
//   return await deleteHandler({
//     prismaModel: prisma.deductionPolicy,
//     req,
//     reply,
// softDelete: true,
//   });
// });

// // Bulk delete
// req.body = {
//   ids: [12, 15, 18]
// }
// fastify.delete("/api/policy", async (req, reply) => {
//   return await deleteHandler({
//     prismaModel: prisma.deductionPolicy,
//     req,
//     reply,
// softDelete: true,
//   });
// });
