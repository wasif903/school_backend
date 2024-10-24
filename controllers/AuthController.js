import prisma from "../utils/prisma.js";

const HandleGetUsers = async (req, reply) => {
    try {
        reply.status(200).send({ message: "Working Fine" });
    } catch (error) {
        console.log(error);
        reply.status(500).send({ message: 'Internal Server Error' });
    }
}



const HandleCreateAdmin = async (req, reply) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
            picture: Joi.string().uri().optional(),
        });

        const { error, value } = validateData(schema, req.body);

        if (error) {
            return reply.status(400).send({ message: error });
        }

        const { name, email, phone, picture } = value;

        const existingAdmin = await prisma.adminSchema.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            return reply.status(409).send({ message: 'Admin with the same email already exists' });
        }
        const admin = await prisma.adminSchema.create({
            data: { name, email, phone, picture },
        });

        const token = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            picture: admin.picture,
        }

        reply.status(201).send({ token, message: "Registered Successfully" });
    } catch (error) {
        console.error(error);
        reply.status(500).send({ message: 'Internal Server Error' });
    }
};






export { HandleGetUsers, HandleCreateAdmin };
