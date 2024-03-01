import dbConnect from '../../utils/dbConnect';
import Course from '../../models/course';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { courseId, moduleId } = req.query; // Extracting moduleId from the query parameters

  // Check if courseId is provided
  if (!courseId) {
    return res.status(400).json({ error: 'Missing courseId parameter' });
  }

  try {
    await dbConnect();

    if (req.method === 'POST') {
      try {
        const { module_name, details } = req.body;
        if (!module_name) {
          return res.status(400).json({ error: 'Module name and description are required' });
        }
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }
        const newModule = {
          module_name,
          details,
          slides: [],  // initialize slides as an empty array
        };
        course.modules.push(newModule);
        await course.save();
        res.json(newModule);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else if (req.method === 'GET') {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(courseId);
      if (!isValidObjectId) {
        return res.status(400).json({ error: 'Invalid courseId format' });
      }
      try {
        const course = await Course.findById(new mongoose.Types.ObjectId(courseId));
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }
        const modules = course.modules || [];
        res.json(modules);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else if (req.method === 'DELETE') { // Handling DELETE method
      try {
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }
        const moduleIndex = course.modules.findIndex(module => module._id.toString() === moduleId);
        if (moduleIndex === -1) {
          return res.status(404).json({ error: 'Module not found' });
        }
        course.modules.splice(moduleIndex, 1); // Remove the module from the modules array
        await course.save();
        res.status(200).json({ message: 'Module deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
