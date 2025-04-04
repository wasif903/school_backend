import prisma from "../utils/prisma.js";

const HandleCreatePolicy = async (req, reply) => {
  try {
    const { branchId, adminId } = req.params;

    const {
      policyName,
      policyType,
      policyDescription,
      deductionAmountType,
      applicableType,
      deductedType,
      selectedAllowance,
      chKSalary,
      chKOther,
      chKHour,
      chKMint,
      chKSpecificTime,
      deductionAmount,
      validFrom,
      validTo,
      gracePeriod,
      lateCount,
      startTime,
      endTime,
      graceTime,
      exceptions, // string
      chkSpecificEvent,
      selectedClass,
      aplicableClass,
      aplicableTeachers,
      studentCheck,
      sectionCheck,
      staffCheck,
      aplicableStaff,
      selectedStaff,
      aplicableHr,
      aplicableFinance,
      selectedTeacher,
      selectedHr,
      selectedFinance,
      aplicableSection,
      selectedSection,
      remarks,
      lastUpdatedBy,
      lastUpdatedDate,
      events, // array of event IDs
      exceptionsList // array of exception IDs
    } = req.body;

    const policy = await prisma.policy.create({
      data: {
        policyName,
        policyType,
        policyDescription,
        deductionAmountType,
        applicableType,
        deductedType,
        selectedAllowance,
        chKSalary,
        chKOther,
        chKHour,
        chKMint,
        chKSpecificTime,
        deductionAmount,
        validFrom,
        validTo,
        gracePeriod,
        lateCount,
        startTime,
        endTime,
        graceTime,
        exceptions,
        chkSpecificEvent,
        selectedClass,
        aplicableClass,
        aplicableTeachers,
        studentCheck,
        sectionCheck,
        staffCheck,
        aplicableStaff,
        selectedStaff,
        aplicableHr,
        aplicableFinance,
        selectedTeacher,
        selectedHr,
        selectedFinance,
        aplicableSection,
        selectedSection,
        remarks,
        lastUpdatedBy,
        lastUpdatedDate,
        branchId: {
          connect: { id: branchId }
        },
        adminId: {
          connect: { id: adminId }
        },
        // Connect many-to-many events
        events: {
          create: events.map(eventId => ({
            event: {
              connect: { id: eventId }
            }
          }))
        },
        // Connect many-to-many exceptions
        exceptionsList: {
          create: exceptionsList.map(exceptionId => ({
            exception: {
              connect: { id: exceptionId }
            }
          }))
        }
      },
      include: {
        events: true,
        exceptionsList: true
      }
    });

    reply.status(201).send(policy);
  } catch (error) {
    console.error("Error creating policy:", error);
    reply
      .status(500)
      .send({ error: "An error occurred while creating the policy" });
  }
};

export { HandleCreatePolicy };
