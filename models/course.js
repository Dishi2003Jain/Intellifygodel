// models/course.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  course_name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  modules: [
    {
      module_name: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
      slides: [
        {
          moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          slide_name: {
            type: String,
            required: true,
          },
          slide_type: {
            type: String,
            enum: ['Topic Introduction Slide', 'Content Slide', 'Quiz Slide'],
            required: true,
          },
          slide_body: {
            type: String, // Assuming you want to store HTML content as a string
          }, 
          questions: [
            {
              question: {
                type: String,
              },
              options: [
                {
                  type: String,
                },
              ],
              correctOptionIndex: {
                type: Number,
              },
            },
          ],      
          slug: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
});

courseSchema.path('modules.slides').schema.path('questions').validate(function (value) {
  // Check if questions are present, then validate the required fields
  if (value && value.length > 0) {
    return value.every((question) => {
      return question.question && question.options && question.correctOptionIndex !== undefined;
    });
  }
  return true;
}, 'Questions, Options, and Correct Option Index are required for Quiz Slide.');

const Course = mongoose.models.Course
  ? mongoose.model('Course')
  : mongoose.model('Course', courseSchema);

export default Course;
