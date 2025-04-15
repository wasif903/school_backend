import prisma from "../utils/prisma.js";
import { SendResponse } from "../utils/sendResponse.js";

// create deduction policy
const HandleCreatePolicy = async (req, reply) => {
  try {
    const { branchId, adminId } = req.params;
    const {
      policyType,
      eventsList, // Make sure this is coming from frontend
      exceptionsList,
      ...rest
    } = req.body;

    if (!req.body.policyName || req.body.policyName.trim() === "") {
      SendResponse(reply, 400, false, "Policy name cannot be empty.");
    }

    const policyExists = await prisma.deductionPolicy.findFirst({
      where: {
        policyName: req.body.policyName,
      },
    });

    if (policyExists) {
      SendResponse(reply, 400, false, "Policy already exists.");
    }

    // const policy = await prisma.deductionPolicy.create({
    await prisma.deductionPolicy.create({
      data: {
        ...rest,
        policyType: Array.isArray(policyType) ? policyType[0] : policyType,
        branchId: Number(branchId),
        adminId: Number(adminId),

        // Connect or create EVENTS
        events: {
          create: eventsList.map((event) => ({
            event: {
              connectOrCreate: {
                where: { eventName: event.eventName },
                create: {
                  eventName: event.eventName,
                  eventDescription: event.eventDescription,
                },
              },
            },
          })),
        },

        // Connect or create EXCEPTIONS
        exceptionsList: {
          create: exceptionsList.map((exception) => ({
            exception: {
              connectOrCreate: {
                where: { exceptionType: exception.exceptionType },
                create: {
                  exceptionType: exception.exceptionType,
                  leaveType: exception.leaveType,
                  limit: exception.limit,
                  exceptionDetails: exception.exceptionDetails,
                },
              },
            },
          })),
        },
      },
      include: {
        events: {
          include: {
            event: true,
          },
        },
        exceptionsList: {
          include: {
            exception: true,
          },
        },
      },
    });

    SendResponse(reply, 201, true, "Policy created successfully!");
  } catch (error) {
    // console.error("Error creating policy:", error);
    SendResponse(
      reply,
      500,
      false,
      "An error occurred while creating the policy"
    );
  }
};

// get all policies
const HandleGetPolicies = async (req, reply) => {
  try {
    const {
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      policyType,
      cursor,
      page = 1 // for UI display
    } = req.query;

    const take = Number(limit);
    const currentPage = Number(page);

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { policyName: { contains: search } },
        { policyDescription: { contains: search } }
      ];
    }
    if (policyType) {
      where.policyType = policyType;
    }

    // Get total count (for pagination UI)
    const totalItems = await prisma.deductionPolicy.count({ where });
    const totalPages = Math.ceil(totalItems / take);

    // Prepare cursor if provided
    const cursorObj = cursor ? { id: Number(cursor) } : undefined;

    // Get paginated data
    const policies = await prisma.deductionPolicy.findMany({
      where,
      take: take + 1,
      ...(cursorObj && { cursor: cursorObj, skip: 1 }),
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        events: {
          select: {
            event: true,
          }
        },
        exceptionsList: {
          select: {
            exception: true,
          }
        }
      },
    });

    const hasMore = policies.length > take;
    const nextCursor = hasMore ? policies[policies.length - 1].id : null;

    if (hasMore) policies.pop();

    SendResponse(reply, 200, true, "Policies retrieved successfully", {
      data: policies,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: take,
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    console.error("Error fetching policies:", error);
    SendResponse(reply, 500, false, "Failed to retrieve policies");
  }
};


// const HandleGetPolicies = async (req, reply) => {
//   try {
//     const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', policyType } = req.query;
//     const skip = (page - 1) * limit;

//     // Build where clause for filtering
//     const where = {};
//     if (search) {
//       where.OR = [
//         { policyName: { contains: search } },
//         { policyDescription: { contains: search } }
//       ];
//     }
//     if (policyType) {
//       where.policyType = policyType;
//     }

//     // Get total count for pagination
//     const totalCount = await prisma.deductionPolicy.count({ where });
//     const totalPages = Math.ceil(totalCount / limit);

//     // Get policies with pagination, sorting and filtering
//     const policies = await prisma.deductionPolicy.findMany({
//       where,
//       skip: Number(skip),
//       take: Number(limit),
//       orderBy: {
//         [sortBy]: sortOrder
//       },
//       include: {
//         events: {
//           include: {
//             event: true,
//           },
//         },
//         exceptionsList: {
//           include: {
//             exception: true,
//           },
//         },
//       },
//     });

//     SendResponse(reply, 200, true, "Policies retrieved successfully", {
//       data: policies,
//       pagination: {
//         currentPage: Number(page),
//         totalPages,
//         totalItems: totalCount,
//         itemsPerPage: Number(limit)
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching policies:", error);
//     SendResponse(reply, 500, false, "Failed to retrieve policies");
//   }
// };

export { HandleCreatePolicy, HandleGetPolicies };

// post/create exceptions
// const HandleCreateException = async (req, reply) => {
//   try {
//     const { exceptionType, leaveType, limit, exceptionDetails } = req.body;
//     const newException = await prisma.exceptionsList.create({
//       data: {
//         exceptionType,
//         leaveType,
//         limit,
//         exceptionDetails,
//       }
//     })
//     reply.status(201).send(newException);
//   } catch (error) {
//     console.log(error)
//     reply.status(500).send({ error: "Failed to create exception" });
//   }
// }

// post/create events
// const HandleCreateEvents = async (req, reply) => {
//   try {
//     const { eventName, eventDescription } = req.body;

//     const newEvent = await prisma.events.create({
//       data: {
//         eventName,
//         eventDescription,
//       }
//     })
//     reply.status(201).send(newEvent);
//   } catch (error) {
//     console.log(error);
//     reply.status(500).send({ error: "Failed to create event" });
//   }
// }

// get exceptions
// const HandleGetExceptions = async (req, reply) => {
//   try {
//     const getExceptions = await prisma.exceptionsList.findMany();
//     reply.status(200).send(getExceptions);
//   } catch (error) {
//     console.log(error);
//     reply.status(500).send({ error: "Failed to get exceptions" });
//   }
// }

// get events
// const HandleGetEvents = async (req, reply) => {
//   try {
//     const getEvents = await prisma.events.findMany();
//     reply.status(200).send(getEvents);
//   } catch (error) {
//     console.log(error)
//     reply.status(500).send({ error: "Failed to get events" });
//   }
// }
