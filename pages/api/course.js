// pages/api/course.js
import dbConnect from '../../utils/dbConnect';
import Course from '../../models/course';
import slugify from 'slugify';
export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const courses = await Course.find();
      res.status(200).json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    const { course_name, slug, modules } = req.body;

    try {
      const courseSlug = slug || slugify(course_name, { lower: true });
      const newCourse = await Course.create({
        course_name,
        slug:courseSlug,
        modules,
      });

      res.status(201).json(newCourse);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
