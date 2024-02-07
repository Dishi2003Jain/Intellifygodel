// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';


export const config = {
  api: {
    bodyParser: false,
  },
};

export default function upload(req, res) {
  const form = new IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    // Example custom file path generation
    // Use a timestamp and original file name for uniqueness
    console.log("something")
    console.log(files)
    const originalFileName = String(files.file[0].originalFilename);
    console.log(files.file[0].originalFilename)
    const fileExtension = path.extname(originalFileName);
    const customFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    const targetDir = path.join(process.cwd(), 'public/uploads');
    console.log(targetDir)

    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const customFilePath = path.join(targetDir, customFileName);

    // Move the file from the temporary path to the custom file path
    fs.rename(files.file[0].filepath, customFilePath, (error) => {
      if (error) {
        console.error('Error moving the file:', error);
        return res.status(500).json({ error: 'Failed to move the file' });
      }
      const scriptPath = path.join(process.cwd(), 'scripts/epub_converter.py');
      const outputDir = path.join(process.cwd(), 'public/converted_output'); // Example output directory
      
  // Execute the Python script with the path to the uploaded file
  execFile('python3', [scriptPath, customFilePath,outputDir], (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing Python script:', error);
      return res.status(500).json({ error: 'Failed to execute Python script', details: stderr });
    }
    fs.readdir(outputDir, (readError, fileNames) => {
      if (readError) {
        console.error('Error reading output directory:', readError);
        return res.status(500).json({ error: 'Failed to read output directory' });
      }

      console.log('Files in the output directory:', fileNames);

      res.status(200).json({ message: 'File uploaded successfully', path: customFilePath, outputFiles: fileNames });
    });
   });
  });
 });
}