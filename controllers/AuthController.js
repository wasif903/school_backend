import Joi from "joi";
import prisma from "../utils/prisma.js";
import validateData from "../utils/validator.js";

const HandleGetUsers = async (req, reply) => {
  try {
    reply.status(200).send({ message: "Working Fine" });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleCreateAdmin = async (req, reply) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      phone: Joi.string()
        .pattern(/^[0-9]+$/)
        .min(10)
        .max(15)
        .required(),
      password: Joi.string().min(8).required().messages({
        "any.required": "Password is required",
        "string.min": "Password must be at least 8 characters long",
      }),
      picture: Joi.string().uri().optional(),
    });

    const { error, value } = validateData(schema, req.body);

    if (error) {
      return reply.status(400).send({ message: error });
    }

    const { name, email, phone, picture, password } = value;

    const existingAdmin = await prisma.adminSchema.findUnique({
      where: { email },
    });
    if (existingAdmin) {
      return reply
        .status(409)
        .send({ message: "Admin with the same email already exists" });
    }
    const admin = await prisma.adminSchema.create({
      data: { name, email, phone, picture, password },
    });

    const token = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      password: admin.password,
      picture: admin.picture,
    };

    reply.status(201).send({ token, message: "Registered Successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
const HandleLogin = async (req, reply) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required",
      }),
      branchId: Joi.number().required(),
    });

    const validateData = (schema, data) => {
      const { error, value } = schema.validate(data, { abortEarly: false });
      return { error, value };
    };

    const { error, value } = validateData(schema, req.body);

    if (error) {
      // const messages = error.details
      //   ? error.details.map(e => e.message)
      //   : ["Invalid data"];
      return reply.status(400).send({ message: error });
    }

    const { email, password, branchId } = value;

    const admin = await prisma.adminSchema.findUnique({
      where: { email },
    });

    const findBranch = await prisma.branch.findFirst({
      where: {
        id: parseInt(branchId),
      },
    });

    if (!findBranch) {
      return reply.status(404).send({ message: "Invalid Branch Id" });
    }

    if (!admin || admin.password !== password) {
      return reply.status(401).send({ message: "Invalid email or password" });
    }

    reply.status(200).send({
      message: "Login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        picture: admin.picture,
        branch: findBranch,
      },
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleCreateRoles = async (req, reply) => {
  try {
    const { adminID } = req.params;

    const findAdmin = await prisma.adminSchema.findUnique({
      where: { id: parseInt(adminID) },
    });
    if (!adminID || !findAdmin) {
      return reply.status(404).send({ message: "Invalid Request" });
    }

    const roleSchema = Joi.object({
      roleName: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      branchId: Joi.number().required(),
      Permission: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            permission: Joi.array().items(Joi.string()).required(),
          })
        )
        .required(),
    });

    const { error, value } = roleSchema.validate(req.body);
    if (error) {
      return reply.status(400).send({ message: error.details[0].message });
    }

    const { roleName, username, password, branchId, Permission } = value;

    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(branchId) },
    });
    if (!branch) {
      return reply.status(404).send({ message: "Branch not found" });
    }

    const newRole = await prisma.roles.create({
      data: {
        roleName,
        username,
        password,
        branchId,
        adminId: adminID,
      },
    });

    const permissionNames = Permission.flatMap(
      (permission) => permission.permission
    );

    const permissions = await prisma.permission.findMany({
      where: {
        name: { in: permissionNames },
      },
    });

    await prisma.roles.update({
      where: { id: newRole.id },
      data: {
        Permission: {
          connect: permissions.map((permission) => ({ id: permission.id })),
        },
      },
    });

    return reply.status(201).send({
      message: "Role created successfully",
      data: newRole,
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const HandleGetRolesByBranch = async (req, reply) => {
  try {
    const { adminID, branchId } = req.params;

    const { page = 1, limit = 10, search } = req.query;

    const findAdmin = await prisma.adminSchema.findUnique({
      where: { id: parseInt(adminID) },
    });
    if (!adminID || !findAdmin) {
      return reply.status(404).send({ message: "Invalid Request" });
    }

    const findBranch = await prisma.branch.findUnique({
      where: {
        id: parseInt(branchId),
      },
    });

    if (!branchId || !findBranch) {
      return reply.status(400).send({ message: "Branch ID is required" });
    }
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const whereClause = {
      branchId: parseInt(branchId),
      AND: [],
    };

    if (search) {
      whereClause.AND.push({
        OR: [
          {
            username: {
              contains: search, // Partial match on username
              mode: "insensitive", // Case insensitive
            },
          },
          {
            roleName: {
              contains: search, // Partial match on roleName
              mode: "insensitive", // Case insensitive
            },
          },
        ],
      });
    }

    const roles = await prisma.roles.findMany({
      where: whereClause,
      include: {
        Permission: true,
        branch: true,
        admin: true,
      },
      skip: skip,
      take: take,
    });

    const totalCount = await prisma.roles.count({
      where: whereClause,
    });

    if (roles.length === 0) {
      return reply
        .status(404)
        .send({ message: "No roles found for the provided branch" });
    }

    return reply.status(200).send({
      message: "Roles retrieved successfully",
      data: roles,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export {
  HandleGetUsers,
  HandleCreateAdmin,
  HandleLogin,
  HandleCreateRoles,
  HandleGetRolesByBranch,
};
