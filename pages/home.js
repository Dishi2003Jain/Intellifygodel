import { useState, useEffect } from 'react';
import styles from '@/styles/Home.module.css';
import Link from 'next/link';
import slugify from 'slugify';
import PrivateRoute from '@/components/PrivateRoute';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [showAddCoursePopup, setShowAddCoursePopup] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [contentSnippet, setContentSnippet] = useState('');
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/course');
        const newCourses = await response.json();
        setCourses(newCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleAddCourse = () => {
    setShowAddCoursePopup(true);
  };

  const handleClosePopup = () => {
    setShowAddCoursePopup(false);
  };

  const handleSaveCourse = async () => {
    try {
      // Generate a slug based on the course name (you can use a library for this)
      const newCourseSlug = slugify(newCourseName, { lower: true });

      const response = await fetch('/api/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_name: newCourseName,
          slug: newCourseSlug,
          modules: [],
        }),
      });
  
      if (response.ok) {
        const newCourse = await response.json();
        setCourses([...courses, newCourse]);
        console.log('Saving course:', newCourseName);
        setNewCourseName('');
        handleClosePopup();
      } else {
        console.error('Error adding course:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };
  
  const fetchModulesForCourse = async (courseId) => {
    console.log(courseId);
    try {
      const response = await fetch(`/api/course?courseId=${courseId}`);
      const modules = await response.json();
      console.log('Modules for course:', modules);
      // Handle the modules data as needed
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };
  
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        const outputFiles = result.outputFiles || [];
        console.log(outputFiles);
        handleSaveCourse(); 
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const file = event.target.file.files[0];
    handleFileUpload(file);
  };
  return (
    <PrivateRoute>
    <div className={styles.container}>
      <button className={styles.addButton} onClick={handleAddCourse}>
        Add Course
      </button>
      {showAddCoursePopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <label htmlFor="newCourseName">
              <h3>Course Name:</h3>
            </label>
            <input
              type="text"
              id="newCourseName"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
    
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" required />
        <button type="submit">Upload File</button>
      </form>
      {contentSnippet && (
        <div>
          <h2>File Content Snippet</h2>
          <p>{contentSnippet}</p>
        </div>
      )}
       <div className={styles.popupButtons}>
              {/* <button onClick={handleSaveCourse}>Save</button> */}
              <button onClick={handleClosePopup}>Close</button>
            </div>
        </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.sno}>Serial no</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <Link href={`/module/${course._id}`} target='_blank'>
                  <button
                    type="button"
                    style={{ zIndex: showAddCoursePopup ? '-1' : '' }}
                    className={styles.courseButton}
                    onClick={() => fetchModulesForCourse(course._id)}
                  >
                    {course.course_name}
                  </button>
                </Link>
              </td>
              <td>
                <button
                  type="button"
                  style={{ zIndex: showAddCoursePopup ? '-1' : '' }}
                  className={styles.actionbutton}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </PrivateRoute>
  );
}

