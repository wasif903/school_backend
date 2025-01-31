import Joi from "joi";
import prisma from "../utils/prisma.js";
import validateData from "../utils/validator.js";
import { parseMultipartFiles, saveUploadedFiles } from "../utils/fileUpload.js";

import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import SaveBase64Image from "../utils/Base64Converter.js";

// const HandleNewAdmission = async (req, reply) => {
//   try {
//     const { branchId } = req.params;

//     if (!branchId) {
//       return reply.status(400).send({ message: "Branch Id is required!" });
//     }

//     const parentSchema = Joi.object({
//       firstName: Joi.string().required().min(3),
//       lastName: Joi.string().required().min(3),
//       cnic: Joi.string().required(),
//       occupation: Joi.string().required().min(3),
//       companyName: Joi.string().required(),
//       salary: Joi.number().required(),
//       email: Joi.string().email().required(),
//       phone: Joi.string().required().min(9).max(12),
//       houseNumber: Joi.string().required(),
//       buildingName: Joi.string().required(),
//       area: Joi.string().required(),
//       block: Joi.string().required(),
//       city: Joi.string().required(),
//       students: Joi.array()
//         .items(
//           Joi.object({
//             firstName: Joi.string().required().min(3),
//             lastName: Joi.string().required().min(3),
//             age: Joi.number().required().min(3),
//             dob: Joi.string().required(),
//             gender: Joi.string().required(),
//             classId: Joi.number().required(),
//             gradeId: Joi.number().required(),
//             noOfSibling: Joi.number().required(),
//             hasSiblingsEnrolled: Joi.boolean().required(),
//             feeCards: Joi.array().items(
//               Joi.object({
//                 items: Joi.array().items(
//                   Joi.object({
//                     feeType: Joi.string().required(),
//                     amount: Joi.number().required(),
//                     paymentType: Joi.string().required(),
//                     dueDate: Joi.string().required()
//                   })
//                 )
//               })
//             )
//           })
//         )
//         .min(1)
//     });

//     const { error, value } = validateData(parentSchema, req.body);

//     if (error) {
//       return reply.status(400).send({ message: error.details[0].message });
//     }

//     const {
//       firstName,
//       lastName,
//       cnic,
//       occupation,
//       companyName,
//       salary,
//       email,
//       phone,
//       houseNumber,
//       buildingName,
//       area,
//       block,
//       city,
//       students
//     } = value;

//     const existingParent = await prisma.parent.findFirst({
//       where: {
//         cnic,
//         branchId: parseInt(branchId)
//       }
//     });

//     if (existingParent) {
//       return reply
//         .status(400)
//         .send({ message: "Parent already exists with this CNIC." });
//     }

//     const result = await prisma.$transaction(async prisma => {
//       const newParent = await prisma.parent.create({
//         data: {
//           branchId: parseInt(branchId),
//           firstName,
//           lastName,
//           cnic,
//           occupation,
//           companyName,
//           salary,
//           email,
//           phone,
//           houseNumber,
//           buildingName,
//           area,
//           block,
//           city
//         }
//       });

//       const studentsData = await Promise.all(
//         students.map(async student => {
//           const { feeCards, ...studentData } = student;

//           const newStudent = await prisma.student.create({
//             data: {
//               ...studentData,
//               parentId: newParent.id
//             }
//           });

//           if (feeCards) {
//             await Promise.all(
//               feeCards.map(async feeCard => {
//                 const { items } = feeCard;

//                 const newFeeCard = await prisma.feeCard.create({
//                   data: {
//                     studentId: newStudent.id
//                   }
//                 });

//                 if (items) {
//                   await prisma.feeItem.createMany({
//                     data: items.map(item => ({
//                       ...item,
//                       feeCardId: newFeeCard.id
//                     }))
//                   });
//                 }
//               })
//             );
//           }

//           return newStudent;
//         })
//       );

//       return { parent: newParent, students: studentsData };
//     });

//     reply.status(200).send({
//       message: "Parent and students created successfully.",
//       parent: result.parent,
//       students: result.students
//     });
//   } catch (error) {
//     console.error(error);
//     reply.status(500).send({ message: "Internal Server Error" });
//   }
// };

const HandleGetBranchParents = async (req, reply) => {
  try {
    const { branchId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    if (!branchId || isNaN(parseInt(branchId))) {
      return reply
        .status(400)
        .send({ message: "Valid Branch ID is required!" });
    }

    const branchIdInt = parseInt(branchId);

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    if (
      isNaN(pageNumber) ||
      pageNumber <= 0 ||
      isNaN(pageSize) ||
      pageSize <= 0
    ) {
      return reply
        .status(400)
        .send({ message: "Page and limit must be positive integers." });
    }

    const offset = (pageNumber - 1) * pageSize;

    const filters = {
      where: {
        branchId: branchIdInt,
        AND: [],
      },
      skip: offset,
      take: pageSize,
    };

    if (search) {
      filters.where.AND.push({
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { cnic: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const parents = await prisma.parent.findMany(filters);

    const totalCount = await prisma.parent.count({
      where: {
        branchId: branchIdInt,
        AND: filters.where.AND,
      },
    });

    reply.status(200).send({
      message: "Branch parents retrieved successfully.",
      data: parents,
      pagination: {
        totalItems: totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetStudentData = async (req, reply) => {
  try {
    const { classId, gradeId, studentName, studentId } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    if (
      isNaN(pageNumber) ||
      pageNumber <= 0 ||
      isNaN(pageSize) ||
      pageSize <= 0
    ) {
      return reply
        .status(400)
        .send({ message: "Page and limit must be positive integers." });
    }

    const offset = (pageNumber - 1) * pageSize;

    const filters = {
      where: {
        AND: [],
      },
      skip: offset,
      take: pageSize,
    };

    if (classId) {
      filters.where.AND.push({ classId });
    }

    if (gradeId) {
      filters.where.AND.push({ gradeId });
    }

    if (studentName) {
      filters.where.AND.push({
        OR: [
          { firstName: { contains: studentName, mode: "insensitive" } },
          { lastName: { contains: studentName, mode: "insensitive" } },
        ],
      });
    }

    if (studentId) {
      filters.where.AND.push({ id: parseInt(studentId) });
    }

    const students = await prisma.student.findMany(filters);

    const totalCount = await prisma.student.count({
      where: {
        AND: filters.where.AND,
      },
    });

    const monthNames = [
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
      "December",
    ];

    const chartData = students.map((student) => {
      const months = monthNames.map((month, index) => {
        return {
          month: month,
          data: Math.floor(Math.random() * 100),
        };
      });

      return {
        studentId: student.id,
        fullName: `${student.firstName} ${student.lastName}`,
        className: student.classId,
        gradeLetter: student.gradeId,
        chartData: months,
      };
    });

    reply.status(200).send({
      message: "Student data retrieved successfully.",
      data: chartData,
      pagination: {
        totalItems: totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

// const HandleNewAdmission = async (req, reply) => {
//   try {
//     const { branchId } = req.params;
//     const data = req.body.data;

//     console.log(data)

//     if (!branchId) {
//       return reply.status(400).send({ message: "Branch Id is required!" });
//     }

//     // Joi schema validation for parent and students
//     const parentSchema = Joi.object({
//       firstName: Joi.string().required().min(3),
//       lastName: Joi.string().required().min(3),
//       cnic: Joi.string().required(),
//       occupation: Joi.string().required().min(3),
//       companyName: Joi.string().required(),
//       salary: Joi.number().required(),
//       email: Joi.string().email().required(),
//       phone: Joi.string().required().min(9).max(12),
//       houseNumber: Joi.string().required(),
//       buildingName: Joi.string().required(),
//       area: Joi.string().required(),
//       block: Joi.string().required(),
//       city: Joi.string().required(),
//       students: Joi.array()
//         .items(
//           Joi.object({
//             firstName: Joi.string().required().min(3),
//             lastName: Joi.string().required().min(3),
//             age: Joi.number().required().min(3),
//             dob: Joi.string().required(),
//             gender: Joi.string().required(),
//             classId: Joi.number().required(),
//             gradeId: Joi.number().required(),
//             noOfSibling: Joi.number().required(),
//             hasSiblingsEnrolled: Joi.boolean().required(),
//             feeCards: Joi.array().items(
//               Joi.object({
//                 items: Joi.array().items(
//                   Joi.object({
//                     feeType: Joi.string().required(),
//                     amount: Joi.number().required(),
//                     paymentType: Joi.string().required(),
//                     dueDate: Joi.string().required(),
//                   })
//                 ),
//               })
//             ),
//           })
//         )
//         .min(1),
//     });

//     const body = typeof data === "string" ? JSON.parse(data) : data;

//     // Validate request body using the parent schema
//     const { error, value } = validateData(parentSchema, body);

//     if (error) {
//       return reply.status(400).send({ message: error });
//     }

//     const {
//       firstName,
//       lastName,
//       cnic,
//       occupation,
//       companyName,
//       salary,
//       email,
//       phone,
//       houseNumber,
//       buildingName,
//       area,
//       block,
//       city,
//       students,
//     } = value;

//     await parseMultipartFiles(req, reply);

//     const parentPicturePath = await saveUploadedFiles(
//       req.files?.parentPicture,
//       "parents"
//     );
//     const studentPicturePaths = await Promise.all(
//       (req.files?.studentPictures || []).map((file) =>
//         saveUploadedFiles(file, "students")
//       )
//     );

//     const existingParent = await prisma.parent.findFirst({
//       where: {
//         cnic,
//         branchId: parseInt(branchId),
//       },
//     });

//     if (existingParent) {
//       return reply
//         .status(400)
//         .send({ message: "Parent already exists with this CNIC." });
//     }

//     const result = await prisma.$transaction(async (prisma) => {
//       const newParent = await prisma.parent.create({
//         data: {
//           branchId: parseInt(branchId),
//           firstName,
//           lastName,
//           cnic,
//           occupation,
//           companyName,
//           salary,
//           email,
//           phone,
//           houseNumber,
//           buildingName,
//           area,
//           block,
//           city,
//           picture: parentPicturePath,
//         },
//       });

//       const studentsData = await Promise.all(
//         students.map(async (student) => {
//           const { feeCards, studentPictures, ...studentData } = student;

//           const newStudent = await prisma.student.create({
//             data: {
//               ...studentData,
//               parentId: newParent.id,
//               picture: studentPicturePaths[0],
//             },
//           });

//           if (feeCards) {
//             await Promise.all(
//               feeCards.map(async (feeCard) => {
//                 const { items } = feeCard;

//                 const newFeeCard = await prisma.feeCard.create({
//                   data: {
//                     studentId: newStudent.id,
//                   },
//                 });

//                 if (items) {
//                   await prisma.feeItem.createMany({
//                     data: items.map((item) => ({
//                       ...item,
//                       feeCardId: newFeeCard.id,
//                     })),
//                   });
//                 }
//               })
//             );
//           }

//           if (studentPictures && studentPictures.length > 0) {
//             await Promise.all(
//               studentPictures.map(async (filePath) => {
//                 await prisma.document.create({
//                   data: {
//                     studentId: newStudent.id,
//                     fileUrl: filePath,
//                   },
//                 });
//               })
//             );
//           }
//           return newStudent;
//         })
//       );

//       return { parent: newParent, students: studentsData };
//     });

//     reply.status(200).send({
//       message: "Parent and students created successfully.",
//       parent: result.parent,
//       students: result.students,
//     });
//   } catch (error) {
//     console.error(error);
//     reply.status(500).send({ message: "Internal Server Error" });
//   }
// };

const HandleNewAdmission = async (req, reply) => {
  try {
    const { branchId } = req.params;
    const data = req.body.data;

    if (!branchId) {
      return reply.status(400).send({ message: "Branch Id is required!" });
    }

    const parentSchema = Joi.object({
      firstName: Joi.string().required().min(3),
      lastName: Joi.string().required().min(3),
      cnic: Joi.string().required(),
      occupation: Joi.string().required().min(3),
      companyName: Joi.string().required(),
      salary: Joi.number().required(),
      email: Joi.string().email().required(),
      picture: Joi.string(),
      phone: Joi.string().required().min(9).max(12),
      houseNumber: Joi.string().required(),
      buildingName: Joi.string().required(),
      area: Joi.string().required(),
      block: Joi.string().required(),
      city: Joi.string().required(),
      student: Joi.object({
        firstName: Joi.string().required().min(3),
        lastName: Joi.string().required().min(3),
        age: Joi.number().required().min(3),
        dob: Joi.string().required(),
        picture: Joi.string(),
        gender: Joi.string().required(),
        classId: Joi.number().required(),
        gradeId: Joi.number().required(),
        noOfSibling: Joi.number().required(),
        hasSiblingsEnrolled: Joi.boolean().required(),
        Documents: Joi.array().items(Joi.string()),
        feeCards: Joi.array().items(
          Joi.object({
            items: Joi.array().items(
              Joi.object({
                feeType: Joi.string().required(),
                amount: Joi.number().required(),
                paymentType: Joi.string().required(),
                dueDate: Joi.string().required(),
              })
            ),
          })
        ),
      }).required(),
    });

    const body = typeof data === "string" ? JSON.parse(data) : data;

    const { error, value } = parentSchema.validate(body);

    if (error) {
      return reply
        .status(400)
        .send({ message: error.details.map((e) => e.message).join(", ") });
    }

    const {
      firstName,
      lastName,
      cnic,
      occupation,
      companyName,
      salary,
      email,
      phone,
      picture,
      houseNumber,
      buildingName,
      area,
      block,
      city,
      student,
    } = value;

    // Handle base64 image saving
    let parentPicturePath;
    if (picture) {
      parentPicturePath = await SaveBase64Image(
        picture,
        "parents",
        `${uuidv4()}.jpg`
      );
    }

    const studentPicturePath = student.picture
      ? await SaveBase64Image(
          student.picture,
          "students",
          `${uuidv4()}_student.jpg`
        )
      : null;

    const existingParent = await prisma.parent.findFirst({
      where: {
        cnic,
        branchId: parseInt(branchId),
      },
    });

    if (existingParent) {
      return reply
        .status(400)
        .send({ message: "Parent already exists with this CNIC." });
    }

    // Check if the classId and gradeId are valid
    const validClass = await prisma.class.findUnique({
      where: {
        id: student.classId,
      },
    });

    const validGrade = await prisma.grade.findUnique({
      where: {
        id: student.gradeId,
      },
    });

    if (!validClass || !validGrade) {
      return reply
        .status(400)
        .send({ message: "Invalid classId or gradeId provided." });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const newParent = await prisma.parent.create({
        data: {
          branchId: parseInt(branchId),
          firstName,
          lastName,
          cnic,
          occupation,
          companyName,
          salary,
          email,
          phone,
          houseNumber,
          buildingName,
          area,
          block,
          city,
          picture: parentPicturePath,
        },
      });

      const { feeCards, studentPictures, ...studentData } = student;

      const newStudent = await prisma.student.create({
        data: {
          ...studentData,
          parentId: newParent.id,
          picture: studentPicturePath,
        },
      });

      if (feeCards) {
        await Promise.all(
          feeCards.map(async (feeCard) => {
            const { items } = feeCard;

            const newFeeCard = await prisma.feeCard.create({
              data: {
                studentId: newStudent.id,
              },
            });

            if (items) {
              await prisma.feeItem.createMany({
                data: items.map((item) => ({
                  ...item,
                  feeCardId: newFeeCard.id,
                })),
              });
            }
          })
        );
      }

      if (studentPictures && studentPictures.length > 0) {
        await Promise.all(
          studentPictures.map(async (filePath) => {
            await prisma.document.create({
              data: {
                studentId: newStudent.id,
                fileUrl: filePath,
              },
            });
          })
        );
      }

      return { parent: newParent, student: newStudent };
    });

    reply.status(200).send({
      message: "Parent and student created successfully.",
      parent: result.parent,
      student: result.student,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export { HandleNewAdmission, HandleGetBranchParents, HandleGetStudentData };
