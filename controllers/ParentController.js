import Joi from "joi";
import prisma from "../utils/prisma.js";
import validateData from "../utils/validator.js";

const HandleNewAdmission = async (req, reply) => {
  try {
    const { branchId } = req.params;

    if (!branchId) {
      return reply.status(400).send({ message: "Branch Id is required!" });
    }

    // Parent Validation Schema
    const parentSchema = Joi.object({
      firstName: Joi.string().required().min(3),
      lastName: Joi.string().required().min(3),
      cnic: Joi.string().required(),
      occupation: Joi.string().required().min(3),
      companyName: Joi.string().required(),
      salary: Joi.number().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required().min(9).max(12),
      houseNumber: Joi.string().required(),
      buildingName: Joi.string().required(),
      area: Joi.string().required(),
      block: Joi.string().required(),
      city: Joi.string().required(),
      students: Joi.array()
        .items(
          Joi.object({
            firstName: Joi.string().required().min(3),
            lastName: Joi.string().required().min(3),
            age: Joi.number().required().min(3),
            dob: Joi.string().required(),
            gender: Joi.string().required(),
            classId: Joi.number().required(),
            noOfSibling: Joi.number().required(),
            hasSiblingsEnrolled: Joi.boolean().required(),
            feeCards: Joi.array().items(
              Joi.object({
                items: Joi.array().items(
                  Joi.object({
                    feeType: Joi.string().required(),
                    amount: Joi.number().required()
                  })
                )
              })
            )
          })
        )
        .min(1)
    });

    const { error, value } = validateData(parentSchema, req.body);

    if (error) {
      return reply.status(400).send({ message: error.details[0].message });
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
      houseNumber,
      buildingName,
      area,
      block,
      city,
      students
    } = value;

    // Check if parent already exists
    const existingParent = await prisma.parent.findUnique({
      where: {
        cnic
      }
    });

    if (existingParent) {
      return reply
        .status(400)
        .send({ message: "Parent already exists with this CNIC." });
    }

    // Create Parent
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
        city
      }
    });

    // Process and Create Students, FeeCards, and FeeItems
    const studentsData = await Promise.all(
      students.map(async (student) => {
        const { feeCards, ...studentData } = student;

        // Create Student
        const newStudent = await prisma.student.create({
          data: {
            ...studentData,
            parentId: newParent.id
          }
        });

        // Create FeeCards and FeeItems for the student
        if (feeCards) {
          await Promise.all(
            feeCards.map(async (feeCard) => {
              const { items } = feeCard;

              const newFeeCard = await prisma.feeCard.create({
                data: {
                  studentId: newStudent.id
                }
              });

              if (items) {
                await prisma.feeItem.createMany({
                  data: items.map((item) => ({
                    ...item,
                    feeCardId: newFeeCard.id,
                    status: "unpaid" // Set default status
                  }))
                });
              }
            })
          );
        }

        return newStudent;
      })
    );

    reply.status(200).send({
      message: "Parent and students created successfully.",
      parent: newParent,
      students: studentsData
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export { HandleNewAdmission };



// {
//   "firstName": "John",
//   "lastName": "Doe",
//   "cnic": "12345-6789012-3",
//   "occupation": "Teacher",
//   "companyName": "School",
//   "salary": 50000,
//   "email": "john.doe@example.com",
//   "phone": "1234567890",
//   "houseNumber": "12",
//   "buildingName": "Sunshine Apartments",
//   "area": "Downtown",
//   "block": "A",
//   "city": "Metropolis",
//   "students": [
//       {
//           "firstName": "Alice",
//           "lastName": "Doe",
//           "age": 10,
//           "dob": "2014-05-10",
//           "gender": "Female",
//           "classId": 1,
//           "noOfSibling": 1,
//           "hasSiblingsEnrolled": true,
//           "feeCards": [
//               {
//                   "items": [
//                       { "feeType": "Tuition", "amount": 1000 },
//                       { "feeType": "Books", "amount": 500 }
//                   ]
//               }
//           ]
//       },
//       {
//           "firstName": "Bob",
//           "lastName": "Doe",
//           "age": 12,
//           "dob": "2012-05-10",
//           "gender": "Male",
//           "classId": 2,
//           "noOfSibling": 1,
//           "hasSiblingsEnrolled": true,
//           "feeCards": [
//               {
//                   "items": [
//                       { "feeType": "Tuition", "amount": 1500 },
//                       { "feeType": "Sports Fee", "amount": 800 }
//                   ]
//               }
//           ]
//       }
//   ]
// }
