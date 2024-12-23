import Joi from "joi";
import prisma from "../utils/prisma.js";
import validateData from "../utils/validator.js";

const HandleCreateClass = async (req, reply) => {
  try {
    const schema = Joi.object({
      className: Joi.string().required().messages({
        "any.required": "Class name is required"
      }),
      branchId: Joi.number().integer().required().messages({
        "any.required": "Branch ID is required"
      }),
      grades: Joi.array()
        .items(
          Joi.object({
            gradeLetter: Joi.string().required().messages({
              "any.required": "Grade letter is required"
            }),
            studentCapacity: Joi.number().required().messages({
              "any.required": "Student capacity is required"
            })
          })
        )
        .min(1)
        .required()
        .messages({
          "array.min": "At least one grade is required",
          "any.required": "Grades are required"
        })
    });

    console.log("Request body:", req.body);

    const { error, value } = validateData(schema, req.body || {});

    if (error) {
      console.error("Validation error object:", error);
      return reply.status(400).send({ message: error });
    }

    const { className, branchId, grades } = value;

    const findClass = await prisma.class.findUnique({
      where: { className }
    });

    if (findClass) {
      return reply
        .status(400)
        .send({ message: "Class with this number already exists" });
    }

    const createClass = await prisma.class.create({
      data: {
        className,
        branchId,
        grades: {
          create: grades
        }
      },
      include: { grades: true }
    });

    reply
      .status(200)
      .send({ message: "Class Created Successfully", class: createClass });
  } catch (error) {
    console.error("Unexpected error:", error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleAddGradesToClass = async (req, reply) => {
  try {
    const { id } = req.params;
    const schema = Joi.object({
      branchId: Joi.number().integer().required().messages({
        "any.required": "Branch ID is required",
        "number.base": "Branch ID must be a number"
      }),
      grades: Joi.array()
        .items(
          Joi.object({
            gradeLetter: Joi.string().required().messages({
              "any.required": "grade letter is required"
            }),
            studentCapacity: Joi.number().required().messages({
              "any.required": "student capacity is required",
              "number.base": "student capacity must be a number"
            })
          })
        )
        .min(1)
        .required()
        .messages({
          "any.required": "grades array is required"
        })
    });

    const { error, value } = validateData(schema, req.body);
    console.log(req.body);
    console.log(error);
    console.log(value);
    if (error) {
      return reply
        .status(400)
        .send({ message: error.details.map(e => e.message) });
    }

    const { branchId, grades } = value;

    const existingClass = await prisma.class.findUnique({
      where: { id: Number(id), branchId }
    });

    if (!existingClass) {
      return reply
        .status(404)
        .send({ message: "Class not found in this branch" });
    }

    const createGrades = await prisma.grade.createMany({
      data: grades.map(grade => ({
        ...grade,
        classId: existingClass.id
      })),
      skipDuplicates: true
    });

    reply.status(200).send({
      message: "Grades added successfully",
      gradesAdded: createGrades.count
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleBulkCreateClass = async (req, reply) => {
  try {
    // Validation schema
    const schema = Joi.array().items(
      Joi.object({
        branchId: Joi.number().integer().required().messages({
          "any.required": "Branch ID is required",
          "number.base": "Branch ID must be a number",
        }),
        className: Joi.string().required(),
        grades: Joi.array()
          .items(
            Joi.object({
              gradeLetter: Joi.string().required().messages({
                "any.required": "Grade letter is required",
                "string.base": "Grade letter must be a string",
              }),
              studentCapacity: Joi.number().integer().required().messages({
                "any.required": "Student capacity is required",
                "number.base": "Student capacity must be a number",
              }),
            })
          )
          .min(1)
          .required()
          .messages({
            "array.min": "At least one grade is required for each class",
          }),
      })
    );

    // Check if req.body exists and is an array
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return reply.status(400).send({
        message: "Request body must be a non-empty array",
      });
    }

    // Validate input
    const { error, value } = validateData(schema, req.body);

    if (error) {
      return reply.status(400).send({
        message: error.details.map((e) => e.message),
      });
    }

    const createdClasses = [];

    // Start transaction
    await prisma.$transaction(async (prisma) => {
      for (const item of value) {
        const { branchId, className, grades } = item;

        // Ensure grades exists and is an array
        if (!grades || !Array.isArray(grades)) {
          throw new Error(`Grades must be a non-empty array for class number ${className}`);
        }

        // Check if className already exists
        const existingClass = await prisma.class.findUnique({
          where: { className },
        });

        if (existingClass) {
          throw new Error(`Class number ${className} already exists.`);
        }

        // Create class
        const createdClass = await prisma.class.create({
          data: { branchId, className },
        });

        // Create grades
        const createdGrades = await prisma.grade.createMany({
          data: grades.map((grade) => ({
            ...grade,
            classId: createdClass.id,
          })),
          skipDuplicates: true,
        });

        createdClasses.push({
          class: createdClass,
          gradesCreated: createdGrades.count,
        });
      }
    });

    // Success response
    reply.status(200).send({
      message: "Classes and grades created successfully",
      createdClasses,
    });
  } catch (error) {
    console.error("Error:", error.message || error);

    if (error.message?.includes("already exists")) {
      return reply.status(409).send({ message: error.message });
    }

    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleCreateGrade = async (req, reply) => {
  try {
    const schema = Joi.object({
      branchId: Joi.number().integer().required().messages({
        "any.required": "Branch ID is required",
        "number.base": "Branch ID must be a number"
      }),
      classId: Joi.number().integer().required().messages({
        "any.required": "Class ID is required",
        "number.base": "Class ID must be a number"
      }),
      gradeLetter: Joi.string().max(2).required().messages({
        "any.required": "Grade letter is required"
      }),
      studentCapacity: Joi.number().integer().min(1).required().messages({
        "any.required": "Student capacity is required",
        "number.base": "Student capacity must be a number",
        "number.min": "Student capacity must be at least 1"
      })
    });

    const { error, value } = validateData(schema, req.body);

    if (error) {
      return reply
        .status(400)
        .send({ message: error.details.map(e => e.message) });
    }

    const { branchId, classId, gradeLetter, studentCapacity } = value;

    const findClass = await prisma.class.findUnique({
      where: { id: classId, branchId }
    });

    if (!findClass) {
      return reply
        .status(400)
        .send({ message: "Class with this ID does not exist in this branch" });
    }

    const existingGrade = await prisma.grade.findFirst({
      where: {
        gradeLetter,
        classId
      }
    });

    if (existingGrade) {
      return reply.status(400).send({
        message: `A grade with the letter "${gradeLetter}" already exists for this class.`
      });
    }

    const createGrade = await prisma.grade.create({
      data: {
        gradeLetter,
        studentCapacity,
        classId
      }
    });

    reply.status(200).send({
      message: "Grade created successfully",
      grade: createGrade
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetClasses = async (req, reply) => {
  try {
    const branchId = parseInt(req.query.branchId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const classes = await prisma.class.findMany({
      where: { branchId },
      include: {
        grades: {
          select: {
            id: true,
            studentCapacity: true,
            gradeLetter: true,
          }
        }
      },
      skip,
      take: limit
    });

    const result = classes.map(classItem => {
      const gradesCount = classItem.grades.length;
      const totalCapacity = classItem.grades.reduce(
        (sum, grade) => sum + grade.studentCapacity,
        0
      );
      return {
        id: classItem.id,
        className: classItem.className,
        gradesCount,
        gradeLetter: classItem.grades.map(grade => grade.gradeLetter),
        studentCapacity: classItem.grades.map(grade => grade.studentCapacity),
        totalCapacity
      };
    });

    const totalClasses = await prisma.class.count({
      where: { branchId }
    });

    const totalPages = Math.ceil(totalClasses / limit);

    reply.status(200).send({
      classes: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalClasses,
        limit
      }
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetSingleClass = async (req, reply) => {
  try {
    const { id } = req.params;
    const branchId = parseInt(req.query.branchId);

    const singleClass = await prisma.class.findFirst({
      where: { id: parseInt(id), branchId },
      include: {
        grades: true
      }
    });

    if (!singleClass) {
      return reply
        .status(404)
        .send({ message: "Class not found in this branch" });
    }

    reply.status(200).send(singleClass);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export {
  HandleCreateClass,
  HandleBulkCreateClass,
  HandleCreateGrade,
  HandleGetClasses,
  HandleGetSingleClass,
  HandleAddGradesToClass
};
