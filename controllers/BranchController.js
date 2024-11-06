import Joi from "joi";
import prisma from "../utils/prisma.js";

const HandleCreateBranch = async (req, reply) => {
  try {
    const { adminID } = req.params;

    const schema = Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return reply.status(400).send({ message: error.details[0].message });
    }
    const { name, address } = value;

    const admin = await prisma.adminSchema.findUnique({
      where: { id: parseInt(adminID) },
    });

    if (!admin) {
      return reply.status(404).send({ message: "Admin not found" });
    }

    const newBranch = await prisma.branch.create({
      data: {
        name: name,
        address: address,
        adminId: parseInt(adminID),
      },
    });
    reply.status(201).send({ newBranch });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetAllBranches = async (req, reply) => {
  try {
    const branches = await prisma.branch.findMany({
      include: { admin: true },
    });
    reply.status(200).send(branches);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetBranchById = async (req, reply) => {
  try {
    const { branchID } = req.params;
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(branchID) },
      include: { admin: true },
    });

    if (!branch) {
      return reply.status(404).send({ message: "Branch not found" });
    }

    reply.status(200).send(branch);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleUpdateBranch = async (req, reply) => {
  try {
    const { branchID } = req.params;

    const schema = Joi.object({
      name: Joi.string().optional(),
      address: Joi.string().optional(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return reply.status(400).send({ message: error.details[0].message });
    }
    const { name, address } = value;

    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(branchID) },
    });

    if (!branch) {
      return reply.status(404).send({ message: "Branch not found" });
    }

    const validateExistance = await prisma.branch.findFirst({
      where: {
        AND: [
            { id: { not: parseInt(branchID) } },
            {
              OR: [
                { name: name || branch.name },    
                { address: address || branch.address }, 
              ],
            },
          ],
      },
    });

    if (validateExistance) {
      return reply
        .status(400)
        .send({
          message: "Branch with the same name or address already exists",
        });
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: parseInt(branchID) },
      data: { name, address },
    });

    reply.status(200).send(updatedBranch);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export {
  HandleCreateBranch,
  HandleGetAllBranches,
  HandleGetBranchById,
  HandleUpdateBranch,
};
