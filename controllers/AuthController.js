const HandleGetUsers = async (req, reply) => {  // 'reply' instead of 'res'
    try {
        reply.status(200).send({ message: "Working Fine" });  // Use 'reply' to send response
    } catch (error) {
        console.log(error);
        reply.status(500).send({ message: 'Internal Server Error' });
    }
}

export { HandleGetUsers };
