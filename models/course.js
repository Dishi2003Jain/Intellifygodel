import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
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
    enum: ['Topic Introduction Slide', 'Content Slide', 'Quiz Slide','Progress Slide'],
    required: true,
  },
  bodyType: {
    type: String,
    enum: ['Circle', 'Square', 'Tool'],
  },
  slide_body: String, // This will be used for Content Slide and optionally for Topic Introduction Slide
  questions: [
    {
      question: String,
      options: [String],
      correctOptionIndex: Number,
    },
  ], // Used for Topic Introduction Slide
  image: String, // Used for Topic Introduction Slide
  why_learn: String, // Optional for Topic Introduction Slide
  slug: {
    type: String,
    required: true,
  },
});

// Custom validation for different slide types
// slideSchema.pre('validate', function (next) {
//   if (this.slide_type === 'Quiz Slide') {
//     if (!this.questions || this.questions.length === 0) {
//       this.invalidate('questions', 'Questions are required for Quiz Slide.');
//     }
//   } else if (this.slide_type === 'Content Slide') {
//     if (!this.slide_body) {
//       this.invalidate('slide_body', 'Slide body is required for Content Slide.');
//     }
//   } else if (this.slide_type === 'Topic Introduction Slide') {
//     if (!this.title || !this.image || !this.slide_body) {
//       this.invalidate('title', 'Title, Image, and Body are required for Topic Introduction Slide.');
//     }
//   }
//   next();
// });

const moduleSchema = new mongoose.Schema({
  module_name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  bodyTypeCounts: {
    Circle: { type: Number, default: 0 },
    Square: { type: Number, default: 0 },
    Tool: { type: Number, default: 0 },
  },
  slides: [slideSchema],
});

const courseSchema = new mongoose.Schema({
  course_name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  modules: [moduleSchema],
});

const Course = mongoose.models.Course
  ? mongoose.model('Course')
  : mongoose.model('Course', courseSchema);

export default Course;
