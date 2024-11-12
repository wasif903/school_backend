import Joi from "joi";
import prisma from "../utils/prisma.js";
import validateData from "../utils/validator.js";

const HandleCreateParent = async (request, reply) => {
  const { name, email, phone, branchId } = request.body;
  try {
    if (!branchId) {
      return reply.status(400).send({ error: "branchId is required" });
    }

    const findBranch = await prisma.branch.findFirst({
      where: {
        id: parseInt(branchId)
      }
    });
    if (!findBranch) {
      return reply.status(400).send({ error: "branch not found" });
    }

    if (!name || !email || !phone) {
      return reply
        .status(400)
        .send({ error: "Name, email, and phone are required" });
    }

    const parent = await prisma.parent.create({
      data: {
        branchId,
        name,
        email,
        phone
      }
    });

    return reply.status(201).send({ success: true, data: parent });
  } catch (error) {
    // Handle unique constraint errors (e.g., email must be unique)
    if (error.code === "P2002") {
      return reply
        .status(409)
        .send({ error: "A parent with this email already exists" });
    }

    console.error("Error creating parent:", error);
    return reply
      .status(500)
      .send({ error: "An error occurred while creating the parent" });
  }
};

const HandleCreateStudent = async (request, reply) => {
  const { name, age, parentId, classId } = request.body;

  try {
    if (!name || !age || !parentId || !classId) {
      return reply
        .status(400)
        .send({ error: "Name, age, parentId, and classId are required" });
    }

    const student = await prisma.student.create({
      data: {
        name,
        age,
        parentId,
        classId
      }
    });

    return reply.status(201).send({ success: true, data: student });
  } catch (error) {
    console.error("Error creating student:", error);
    return reply
      .status(500)
      .send({ error: "An error occurred while creating the student" });
  }
};

const HandleCreateFeeStructure = async (request, reply) => {
  const { amount, dueDate, branchId } = request.body;

  try {
    if (!amount || !dueDate || !branchId) {
      return reply
        .status(400)
        .send({ error: "Amount, dueDate, and branchId are required" });
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        amount,
        dueDate: new Date(dueDate),
        branchId
      }
    });

    return reply.status(201).send({ success: true, data: feeStructure });
  } catch (error) {
    if (error.code === "P2002") {
      return reply
        .status(409)
        .send({ error: "A fee structure for this branch already exists" });
    }
    console.error("Error creating fee structure:", error);
    return reply
      .status(500)
      .send({ error: "An error occurred while creating the fee structure" });
  }
};

const HandlePayFee = async (request, reply) => {
  const { studentId, feeStructureId, month, year } = request.body;

  try {
    if (!studentId || !feeStructureId || !month || !year) {
      return reply.status(400).send({
        error: "studentId, feeStructureId, month, and year are required"
      });
    }

    // Check if a payment for this month and year already exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: {
        studentId_month_year: {
          studentId,
          month,
          year
        }
      }
    });

    if (existingPayment) {
      return reply
        .status(409)
        .send({ error: "This month's fee is already paid for this student." });
    }

    // Create the fee payment record
    const feePayment = await prisma.feePayment.create({
      data: {
        studentId,
        feeStructureId,
        month,
        year,
        isPaid: true,
        paidAt: new Date()
      }
    });

    return reply.status(201).send({ success: true, data: feePayment });
  } catch (error) {
    console.error("Error processing fee payment:", error);
    return reply
      .status(500)
      .send({ error: "An error occurred while processing the fee payment" });
  }
};

const HandleGetFeeStatus = async (request, reply) => {
  const { studentId, year } = request.params;

  try {
    // Define all 12 months
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    // Get fee payments for the student for the given year
    const payments = await prisma.feePayment.findMany({
      where: {
        studentId: parseInt(studentId),
        year: parseInt(year)
      },
      select: {
        month: true,
        isPaid: true
      }
    });

    // Create a lookup for the months that are paid
    const paidMonths = payments.reduce((acc, payment) => {
      acc[payment.month] = payment.isPaid;
      return acc;
    }, {});

    // Prepare the response data for each month
    const feeStatus = months.map(month => ({
      month,
      status: paidMonths[month] ? "Paid" : "Unpaid"
    }));

    return reply.status(200).send({ success: true, data: feeStatus });
  } catch (error) {
    console.error("Error retrieving fee status:", error);
    return reply
      .status(500)
      .send({ error: "An error occurred while retrieving fee status" });
  }
};

export {
  HandleCreateParent,
  HandleCreateStudent,
  HandleCreateFeeStructure,
  HandlePayFee,
  HandleGetFeeStatus
};
