import { SendResponse } from "./sendResponse.js";

// searchMode: true ho to pure search results laega (no pagination, all matches up to 1000).
// searchMode: false ya na ho to normal pagination chalta rahega.

// utils/listHandler.js
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
    const nextCursor = isSearchMode ? null : hasMore ? results[results.length - 1].id : null;
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

// const listHandler = async ({
//   prismaModel,
//   req,
//   reply,
//   searchableFields = [],
//   filterFields = [],
//   include = {},
//   defaultSortBy = "createdAt",
//   defaultSortOrder = "desc",
// }) => {
//   try {
//     const {
//       limit = 10,
//       search,
//       sortBy = defaultSortBy,
//       sortOrder = defaultSortOrder,
//       cursor,
//       page = 1,
//       ...filters
//     } = req.query;

//     const take = Number(limit);
//     const currentPage = Number(page);

//     // Build dynamic where clause
//     const where = {};

//     if (search && searchableFields.length > 0) {
//       where.OR = searchableFields.map((field) => ({
//         [field]: {
//           contains: search,
//         },
//       }));
//     }

//     filterFields.forEach((field) => {
//       if (filters[field]) {
//         where[field] = filters[field];
//       }
//     });

//     const totalItems = await prismaModel.count({ where });
//     const totalPages = Math.ceil(totalItems / take);

//     const cursorObj = cursor ? { id: Number(cursor) } : undefined;

//     const results = await prismaModel.findMany({
//       where,
//       take: take + 1,
//       ...(cursorObj && { cursor: cursorObj, skip: 1 }),
//       orderBy: {
//         [sortBy]: sortOrder,
//       },
//       include,
//     });

//     const hasMore = results.length > take;
//     const nextCursor = hasMore ? results[results.length - 1].id : null;
//     if (hasMore) results.pop();

//     return SendResponse(reply, 200, true, "Data fetched successfully", {
//       results,
//       pagination: {
//         currentPage,
//         totalPages,
//         totalItems,
//         itemsPerPage: take,
//         nextCursor,
//         hasMore,
//       },
//     });
//   } catch (error) {
//     console.error("Generic list error:", {
//       error: error.message,
//       query: req.query,
//     });
//     return SendResponse(reply, 500, false, "Failed to fetch list data");
//   }
// };

export default listHandler;
