import prisma from "../utils/prisma.js";

// create deduction policy
const HandleCreatePolicy = async (req, reply) => {
  try {
    const { branchId, adminId } = req.params;
    const {
      policyType,
      eventsList,    // Make sure this is coming from frontend
      exceptionsList,
      ...rest
    } = req.body;

    if (!req.body.policyName || req.body.policyName.trim() === '') {
      return reply.status(400).send({
        message: "Policy name cannot be empty."
      });
    }

    const policyExists = await prisma.deductionPolicy.findFirst({
      where: {
        policyName: req.body.policyName,
      }
    });

    if (policyExists) {
      return reply.status(400).send({
        message: "Policy already exists."
      });
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
                }
              }
            }
          }))
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
                }
              }
            }
          }))
        }
      },
      include: {
        events: {
          include: {
            event: true
          }
        },
        exceptionsList: {
          include: {
            exception: true
          }
        }
      }
    });

    reply.status(201).send({ message: "Policy created successfully!" });
  } catch (error) {
    console.error("Error creating policy:", error);
    reply.status(500).send({
      error: "An error occurred while creating the policy",
      details: error.message,
    });
  }
};


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


export { HandleCreatePolicy };


// HandleCreateException, HandleCreateEvents, HandleGetExceptions, HandleGetEvents















// const HandleCreatePolicy = async (req, reply) => {
//   try {
//     const { branchId, adminId } = req.params;

//     const {
//       policyName,
//       policyType,
//       policyDescription,
//       deductionAmountType,
//       applicableType,
//       deductedType,
//       selectedAllowance,
//       chKSalary,
//       chKOther,
//       chKHour,
//       chKMint,
//       chKSpecificTime,
//       deductionAmount,
//       validFrom,
//       validTo,
//       gracePeriod,
//       lateCount,
//       startTime,
//       endTime,
//       graceTime,
//       exceptions, // string
//       chkSpecificEvent,
//       selectedClass,
//       aplicableClass,
//       aplicableTeachers,
//       studentCheck,
//       sectionCheck,
//       staffCheck,
//       aplicableStaff,
//       selectedStaff,
//       aplicableHr,
//       aplicableFinance,
//       selectedTeacher,
//       selectedHr,
//       selectedFinance,
//       aplicableSection,
//       selectedSection,
//       remarks,
//       lastUpdatedBy,
//       lastUpdatedDate,
//       events, // array of event IDs
//       exceptionsList // array of exception IDs
//     } = req.body;

//     const policy = await prisma.policy.create({
//       data: {
//         policyName,
//         policyType,
//         policyDescription,
//         deductionAmountType,
//         applicableType,
//         deductedType,
//         selectedAllowance,
//         chKSalary,
//         chKOther,
//         chKHour,
//         chKMint,
//         chKSpecificTime,
//         deductionAmount,
//         validFrom,
//         validTo,
//         gracePeriod,
//         lateCount,
//         startTime,
//         endTime,
//         graceTime,
//         exceptions,
//         chkSpecificEvent,
//         selectedClass,
//         aplicableClass,
//         aplicableTeachers,
//         studentCheck,
//         sectionCheck,
//         staffCheck,
//         aplicableStaff,
//         selectedStaff,
//         aplicableHr,
//         aplicableFinance,
//         selectedTeacher,
//         selectedHr,
//         selectedFinance,
//         aplicableSection,
//         selectedSection,
//         remarks,
//         lastUpdatedBy,
//         lastUpdatedDate,
//         branchId: {
//           connect: { id: branchId }
//         },
//         adminId: {
//           connect: { id: adminId }
//         },
//         // Connect many-to-many events
//         events: {
//           create: events.map(eventId => ({
//             event: {
//               connect: { id: eventId }
//             }
//           }))
//         },
//         // Connect many-to-many exceptions
//         exceptionsList: {
//           create: exceptionsList.map(exceptionId => ({
//             exception: {
//               connect: { id: exceptionId }
//             }
//           }))
//         }
//       },
//       include: {
//         events: true,
//         exceptionsList: true
//       }
//     });

//     reply.status(201).send(policy);
//   } catch (error) {
//     console.error("Error creating policy:", error);
//     reply
//       .status(500)
//       .send({ error: "An error occurred while creating the policy" });
//   }
// };