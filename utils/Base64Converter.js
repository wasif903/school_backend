import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp'; 



const SaveBase64Image = async (base64String, folder, fileName) => {
    try {
      // Remove base64 meta information (e.g., 'data:image/jpeg;base64,')
      const base64Data = base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
  
      // Generate a file path for saving the image
      const filePath = path.join(__dirname, `uploads/${folder}`, fileName);
      
      // Ensure the folder exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
  
      // Save the image to disk
      await fs.writeFile(filePath, buffer);
  
      return filePath;
    } catch (error) {
      throw new Error('Error saving image: ' + error.message);
    }
  };


  export default SaveBase64Image