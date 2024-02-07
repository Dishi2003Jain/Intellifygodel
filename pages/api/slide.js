// pages/api/slide.js
import dbConnect from '../../utils/dbConnect';
import Course from '../../models/course';
import mongoose from 'mongoose';
import slugify from 'slugify';

export default async function handler(req, res) {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ error: 'Missing courseId parameter' });
  }

  try {
    await dbConnect();

    if (req.method === 'POST') {
      try {
        const { moduleId, slide_name, slide_type, slide_body, questions } = req.body;
        console.log(moduleId,slide_name,slide_type);
        if (!moduleId || !slide_name || !slide_type) {
          return res.status(400).json({ error: 'moduleId, slide_name, and slide_type are required' });
        }
        const course = await Course.findById(courseId);

        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        const module = course.modules.find((module) => module._id.equals(moduleId));

        if (!module) {
          return res.status(404).json({ error: 'Module not found' });
        }
        console.log(questions);
        const slideSlug = slugify(slide_name, { lower: true });
        const newSlide = {
          moduleId,
          slide_name,
          slide_type,
          slide_body,
          questions: questions || [], // Ensure questions array is initialized
          slug: slideSlug,
        };
        console.log(newSlide);
        module.slides.push(newSlide);
        await course.save();

        res.status(201).json(newSlide); // Use status 201 for resource creation
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
        let allSlides = [];

        modules.forEach((module) => {
          allSlides = allSlides.concat(module.slides);
        });

        res.json(allSlides);
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
