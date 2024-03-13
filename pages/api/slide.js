import dbConnect from '../../utils/dbConnect';
import Course from '../../models/course';
import mongoose from 'mongoose';
import slugify from 'slugify';

export default async function handler(req, res) {
  const { courseId, slideId } = req.query; // Assuming slideId is passed as a query parameter for DELETE request

  await dbConnect();

  switch (req.method) {
    case 'POST':
      // Handle creation of a new slide
      return handlePostRequest(req, res, courseId);
    case 'GET':
      // Handle fetching slides
      return handleGetRequest(res, courseId);
    case 'DELETE':
      // Handle deletion of a slide
      return handleDeleteRequest(res, courseId, slideId);
      case 'PUT':
        if (req.query.action === 'moveUp' || req.query.action === 'moveDown') {
          return handleMoveSlide(req, res, courseId, slideId, req.query.action);
        } else {
          return handlePutRequest(req, res);
        }
    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handlePostRequest(req, res, courseId) {
  const { moduleId, slide_name, slide_type, slide_body, questions, bodyType , why_learn , concepts} = req.body;
   
  if (!moduleId || !slide_name || !slide_type || !courseId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const module = course.modules.find((module) => module._id.equals(moduleId));

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (!module.bodyTypeCounts) {
      module.bodyTypeCounts = { Circle: 0, Square: 0, Tool: 0 };
    }

    module.bodyTypeCounts[bodyType] = (module.bodyTypeCounts[bodyType] || 0) + 1;

    const slideSlug = slugify(slide_name, { lower: true });
    const newSlide = {
      moduleId,
      slide_name,
      slide_type,
      slide_body,
      questions: questions || [],
      slug: slideSlug,
      bodyType,
      why_learn,
      concepts,
    };

    module.slides.push(newSlide);
    await course.save();

    return res.status(201).json(newSlide);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGetRequest(res, courseId) {
  if (!courseId || !/^[0-9a-fA-F]{24}$/.test(courseId)) {
    return res.status(400).json({ error: 'Invalid courseId format' });
  }

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let allSlides = [];
    course.modules.forEach((module) => {
      allSlides = allSlides.concat(module.slides);
    });

    return res.json(allSlides);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleDeleteRequest(res, courseId, slideId) {
  console.log('Deleting slide with ID:', slideId); // Debug log
  if (!slideId || !/^[0-9a-fA-F]{24}$/.test(slideId)) {
    return res.status(400).json({ error: 'Invalid slideId format' });
  }

try {

  const course = await Course.findOne({ "modules.slides._id": slideId });

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const module = course.modules.find(mod => mod.slides.some(slide => slide._id.equals(slideId)));
  
  if (!module) {
    return res.status(404).json({ error: 'Module not found for the slide' });
  }

  const result = await Course.updateOne(
    { _id: courseId, "modules._id": module._id },
    { $pull: { "modules.$.slides": { _id: slideId } } }
  );

  if (result.modifiedCount === 0) {
    return res.status(404).json({ error: 'Slide not found' });
  }

  return res.status(200).json({ message: 'Slide deleted successfully' });
} catch (error) {
  console.error('Error deleting slide:', error);
  return res.status(500).json({ error: 'Internal Server Error' });
}

}

async function handleMoveSlide(req, res, courseId, slideId, action) {
  if (!mongoose.Types.ObjectId.isValid(slideId)) {
    return res.status(400).json({ error: 'Invalid slideId format' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let moved = false;
    course.modules.forEach((module) => {
      const slideIndex = module.slides.findIndex(slide => slide._id.toString() === slideId);
      if (slideIndex !== -1) {
        if (action === 'moveUp' && slideIndex > 0) {
          [module.slides[slideIndex], module.slides[slideIndex - 1]] = [module.slides[slideIndex - 1], module.slides[slideIndex]];
          moved = true;
        } else if (action === 'moveDown' && slideIndex < module.slides.length - 1) {
          [module.slides[slideIndex], module.slides[slideIndex + 1]] = [module.slides[slideIndex + 1], module.slides[slideIndex]];
          moved = true;
        }
      }
    });

    if (!moved) {
      return res.status(404).json({ error: 'Unable to move slide' });
    }

    await course.save();
    res.status(200).json({ message: `Slide moved ${action} successfully` });
  } catch (error) {
    console.error('Error moving slide:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


async function handlePutRequest(req, res) {
  const { courseId, slideId } = req.query;
  const updateData = req.body; // Contains the updated slide data

  try {
    const course = await Course.findOne({ "modules.slides._id": slideId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the module and slide to update
    course.modules.forEach(module => {
      const slide = module.slides.id(slideId);
      if (slide) {
        Object.assign(slide, updateData); // Update slide data
      }
    });

    await course.save(); // Save the updated course document
    return res.status(200).json({ message: 'Slide updated successfully' });
  } catch (error) {
    console.error('Error updating slide:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
