import { join } from "path";
import fs from "fs";

// Function to parse multipart form data (files + fields)
export const parseMultipartFiles = async (req, reply) => {
  const files = {}; // To store file details
  const fields = {}; // To store non-file fields

  // Parse multipart data
  const parts = req.parts(); // Assuming you're using Fastify's multipart parsing
  for await (const part of parts) {
    if (part.file) {
      const fileName = `${Date.now()}-${part.filename}`;
      const uploadPath = join(process.cwd(), "uploads", fileName);

      // Save the file to disk
      await new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(uploadPath);
        part.file.pipe(stream); // Pipe file stream to the destination
        part.file.on("end", resolve); // Resolve on stream end
        part.file.on("error", reject); // Reject on error
      });

      // Save file metadata
      files[part.fieldname] = {
        filename: fileName,
        mimetype: part.mimetype,
        path: uploadPath,
      };
    } else {
      // Save non-file fields
      fields[part.fieldname] = part.value;
    }
  }

  req.files = files; // Attach parsed file data to req.files
  req.fields = fields; // Attach non-file fields to req.fields
};

// Function to save an uploaded file to a directory
export const saveUploadedFiles = async (file, folder) => {
  if (!file) return null; // Skip if no file is provided

  // Ensure the folder exists, if not, create it
  const uploadDir = join(process.cwd(), "uploads", folder);
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // Generate a unique file name
  const fileName = `${Date.now()}-${file.filename}`;
  const filePath = join(uploadDir, fileName);

  // Save the file to disk
  await fs.promises.writeFile(filePath, await file.toBuffer()); // Assuming `file.toBuffer()` exists in your environment
  return filePath; // Return the file path where it is saved
};
