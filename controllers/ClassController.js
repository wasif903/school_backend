import Joi from "joi";
import prisma from "../utils/prisma.js";
import validateData from "../utils/validator.js";

const HandleCreateClass = async (req, reply) => {
  try {
    const schema = Joi.object({
      classNumber: Joi.number().max(2).required().messages({
        "any.required": "Class number is required"
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

    const { error, value } = validateData(schema, req.body);

    if (error) {
      return reply
        .status(400)
        .send({ message: error.details.map(e => e.message) });
    }

    const { classNumber, grades } = value;

    const findClass = await prisma.class.findUnique({
      where: { classNumber }
    });

    if (findClass) {
      return reply
        .status(400)
        .send({ message: "Class with this number already exists" });
    }

    const createClass = await prisma.class.create({
      data: {
        classNumber,
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
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleAddGradesToClass = async (req, reply) => {
  try {
    const { id } = req.params; 

    const schema = Joi.object({
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

    if (error) {
      return reply
        .status(400)
        .send({ message: error.details.map(e => e.message) });
    }

    const { grades } = value;

    const existingClass = await prisma.class.findUnique({
      where: { id: Number(id) } 
    });

    if (!existingClass) {
      return reply.status(404).send({ message: "Class not found" });
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
    const schema = Joi.array().items(
      Joi.object({
        classNumber: Joi.number().max(2).required().messages({
          "any.required": "class number is required",
          "number.base": "class number must be a number"
        }),
        grades: Joi.array()
          .items(
            Joi.object({
              gradeLetter: Joi.string().required().messages({
                "any.required": "grade letter is required",
                "string.base": "grade letter must be a string"
              }),
              studentCapacity: Joi.number().integer().required().messages({
                "any.required": "student capacity is required",
                "number.base": "student capacity must be a number"
              })
            })
          )
          .required()
          .min(1)
          .messages({
            "array.min": "at least one grade is required for each class"
          })
      })
    );

    const { error, value } = validateData(schema, req.body);

    if (error) {
      return reply
        .status(400)
        .send({ message: error.details.map(e => e.message) });
    }

    const classNumbers = value.map(item => item.classNumber);

    const duplicateClassNumbers = classNumbers.filter(
      (num, index, arr) => arr.indexOf(num) !== index
    );
    if (duplicateClassNumbers.length) {
      return reply.status(400).send({
        message: `Duplicate class numbers in request: ${duplicateClassNumbers.join(
          ", "
        )}`
      });
    }

    const existingClasses = await prisma.class.findMany({
      where: { classNumber: { in: classNumbers } }
    });
    if (existingClasses.length) {
      const existingNumbers = existingClasses.map(c => c.classNumber);
      return reply.status(400).send({
        message: `Classes with these numbers already exist: ${existingNumbers.join(
          ", "
        )}`
      });
    }

    const createdClasses = [];
    await prisma.$transaction(async prisma => {
      for (const { classNumber, grades } of value) {
        const createdClass = await prisma.class.create({
          data: { classNumber }
        });

        const createdGrades = await prisma.grade.createMany({
          data: grades.map(grade => ({
            ...grade,
            classId: createdClass.id
          })),
          skipDuplicates: true
        });

        createdClasses.push({
          class: createdClass,
          gradesCreated: createdGrades.count
        });
      }
    });

    reply.status(200).send({
      message: "Classes and grades created successfully",
      createdClasses
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleCreateGrade = async (req, reply) => {
  try {
    const schema = Joi.object({
      classId: Joi.number().integer().required().messages({
        "any.required": "class ID is required",
        "number.base": "class ID must be a number"
      }),
      gradeLetter: Joi.string().max(2).required().messages({
        "any.required": "grade letter is required"
      }),
      studentCapacity: Joi.number().integer().min(1).required().messages({
        "any.required": "student capacity is required",
        "number.base": "student capacity must be a number",
        "number.min": "student capacity must be at least 1"
      })
    });

    const { error, value } = validateData(schema, req.body);

    if (error) {
      return reply
        .status(400)
        .send({ message: error.details.map(e => e.message) });
    }

    const { classId, gradeLetter, studentCapacity } = value;

    // Check if the class exists
    const findClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!findClass) {
      return reply
        .status(400)
        .send({ message: "Class with this ID does not exist" });
    }

    // Check for existing grade with the same gradeLetter and classId
    const existingGrade = await prisma.grade.findUnique({
      where: {
        gradeLetter_classId: {
          gradeLetter,
          classId
        }
      }
    });

    if (existingGrade) {
      return reply.status(400).send({
        message: `Grade with letter "${gradeLetter}" for class ID ${classId} already exists.`
      });
    }

    // Create the grade
    const createGrade = await prisma.grade.create({
      data: {
        gradeLetter,
        studentCapacity,
        classId
      }
    });

    reply.status(200).send({
      message: "Grade Created Successfully",
      grade: createGrade
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetClasses = async (req, reply) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        grades: {
          select: {
            id: true,
            studentCapacity: true
          }
        }
      }
    });

    const result = classes.map(classItem => {
      const gradesCount = classItem.grades.length;
      const totalCapacity = classItem.grades.reduce(
        (sum, grade) => sum + grade.studentCapacity,
        0
      );
      return {
        id: classItem.id,
        classNumber: classItem.classNumber,
        gradesCount,
        totalCapacity
      };
    });

    reply.status(200).send(result);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetSingleClass = async (req, reply) => {
  try {
    const classId = parseInt(req.params.id);

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        grades: {
          select: {
            id: true,
            gradeLetter: true,
            studentCapacity: true
          }
        }
      }
    });

    if (!classData) {
      return reply.status(404).send({ message: "Class not found" });
    }

    const response = {
      id: classData.id,
      classNumber: classData.classNumber,
      grades: classData.grades.map(grade => ({
        id: grade.id,
        gradeLetter: grade.gradeLetter,
        studentCapacity: grade.studentCapacity
      }))
    };

    reply.status(200).send(response);
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
