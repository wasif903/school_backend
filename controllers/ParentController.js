import Joi from "joi";
import prisma from "../utils/prisma.js";
import validateData from "../utils/validator.js";

const HandleNewAdmission = async (req, reply) => {
  try {
  } catch (error) {
    console.log(error);
    reply.status(500).json({ message: "Internal Server Error" });
  }
};

export { HandleNewAdmission };
