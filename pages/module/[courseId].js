import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import PrivateRoute from "@/components/PrivateRoute";
import ReactHtmlParser from "react-html-parser";
import { FaArrowUp } from "react-icons/fa6";
import { FaArrowDown } from "react-icons/fa6";
const Module = () => {
  const [showAddModulePopup, setShowAddModulePopup] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [modules, setModules] = useState([]);
  const [showAddSlideInput, setShowAddSlideInput] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);
  const [newSlideName, setNewSlideName] = useState("");
  const [selectedSlideType, setSelectedSlideType] = useState(
    "Topic Introduction Slide"
  );
  const [newSlideBody, setNewSlideBody] = useState("");
  const [newSlideMedia, setNewSlideMedia] = useState("");
  const [mappedSlides, setMappedSlides] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [options, setOptions] = useState([""]); 
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [bodyType, setBodyType] = useState("Circle");
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: [""],
      correctOptionIndex: null,
    },
  ]);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const router = useRouter();
  const { courseId } = router.query;

  useEffect(() => {
    const fetchModulesAndSlides = async () => {
      try {
        if (courseId) {
          const moduleResponse = await fetch(`/api/module?courseId=${courseId}`);
          const slideResponse = await fetch(`/api/slide?courseId=${courseId}`);
  
          const courseModules = await moduleResponse.json();
          const courseSlides = await slideResponse.json();
  
          if (Array.isArray(courseModules)) {
            setModules(courseModules);
          } else {
            console.error("Invalid data format for modules:", courseModules);
          }
  
          if (Array.isArray(courseSlides)) {
            // Process slides to find their respective moduleIndex
            const allSlides = courseSlides.map((slide) => ({
              ...slide,
              moduleIndex: courseModules.findIndex(
                (module) => module._id === slide.moduleId
              ),
            }));
            setMappedSlides(allSlides);
          } else {
            console.error("Invalid data format for slides:", courseSlides);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchModulesAndSlides();
  });
  


  const handleAddModule = () => {
    setShowAddModulePopup(true);
  };
  
  const handleClosePopup = () => {
    setShowAddModulePopup(false);
  };
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", ""], correctOptionIndex: null },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };
  const handleQuestionChange = (e, index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleSaveModule = async () => {
    try {
      const response = await fetch(`/api/module?courseId=${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module_name: newModuleName,
          slides: [],
        }),
      });

      if (response.ok) {
        const newModule = await response.json();
        setModules([...modules, newModule]);
        handleClosePopup();
      } else {
        console.error("Error adding module:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding module:", error);
    }
  };

  const handleAddSlide = (moduleIndex) => {
    setShowAddSlideInput(true);
    setSelectedModuleIndex(moduleIndex);
    setNewSlideName('');
    setNewSlideBody('');
    setNewSlideMedia('');
    setQuestions([{ question: "", options: [""], correctOptionIndex: null }]);
  };
  
  const handleOptionChange = (e, questionIndex, optionIndex) => {
    // Clone the questions array
    const updatedQuestions = [...questions];
    // Ensure we're working with a valid question and option indices
    if (questionIndex >= 0 && optionIndex >= 0) {
      // Access the specific question
      const question = updatedQuestions[questionIndex];
      // Clone the options array for immutability
      const updatedOptions = [...question.options];
      // Update the specific option
      updatedOptions[optionIndex] = e.target.value;
      // Update the question's options
      question.options = updatedOptions;
      // Update the state
      setQuestions(updatedQuestions);
    }
  };
  

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = questions.map((question, index) => {
      if (index === questionIndex) {
        // Add a new empty string to the options array
        return { ...question, options: [...question.options, ""] };
      }
      return question;
    });
  
    setQuestions(updatedQuestions);
  };
  
  const handleSaveSlide = async (moduleIndex) => {
    // Determine if we are adding a new slide or updating an existing one
    const isEditing = editingSlideId !== null;
    const method = isEditing ? "PUT" : "POST"; // Use PUT for update, POST for add
    let url = `/api/slide?courseId=${courseId}`;
  
    // If updating, append the slideId to the URL
    if (isEditing) {
      url += `&slideId=${encodeURIComponent(editingSlideId)}`;
    }
  
    const payload = {
      moduleId: modules[moduleIndex]._id, // Assuming the module ID is needed for both adding and updating
      slide_type: selectedSlideType,
      slide_name: newSlideName,
      slide_body: newSlideBody,
      // Add other fields like why_learn, bodyType, questions as needed
      why_learn: newSlideMedia ? newSlideMedia : undefined,
      bodyType: bodyType,
      questions: questions,
    };
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        // Handle errors, for example, show a message to the user
        console.error("Failed to save slide:", await response.text());
        return;
      }
      const savedSlide = await response.json(); // Assuming the server returns the saved slide
      console.log('Slide saved:', savedSlide);
      if (!isEditing) {
        const updatedModules = [...modules];
        const updatedModule = { ...updatedModules[moduleIndex] };
        updatedModule.slides.push(savedSlide); // Assuming the server returns the full slide
        updatedModules[moduleIndex] = updatedModule;
        setModules(updatedModules);
      } else{
        setShowAddSlideInput(false);
      }
  
      // Reset form and editing state
      resetFormAndEditingState();
    } catch (error) {
      console.error("Error saving slide:", error);
    }
  };
  
  const resetFormAndEditingState = () => {
    // Reset form fields to their initial states
    setNewSlideName('');
    setNewSlideBody('');
    setSelectedSlideType('Topic Introduction Slide');
    setNewSlideMedia('');
    setQuestions([{ question: "", options: ["", ""], correctOptionIndex: null }]);
    setShowAddSlideInput(false);
    setEditingSlideId(null); // Exit editing mode
  };
  
  // const handleSaveSlide = async (moduleIndex) => {
  //   try {
  //     const module = modules[moduleIndex];
  //     if (!module || !module._id) {
  //       console.error("Invalid module");
  //       return;
  //     }
  //     console.log(newSlideName);
  //     const moduleId = module._id;
  //     // Check if it's a quiz slide and has necessary information
  //     if (selectedSlideType === "Quiz Slide" && questions.length > 0) {
  //       const response = await fetch(`/api/slide?courseId=${courseId}`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           moduleId: moduleId,
  //           slide_name: newSlideName,
  //           slide_type: selectedSlideType,
  //           questions: questions,
  //           bodyType:bodyType,
  //           slide_body:newSlideBody,
  //         }),
  //       });

  //       if (!response.ok) {
  //         console.error("Error adding quiz slide:", response.statusText);
  //         return;
  //       }

  //       const newSlide = await response.json();
  //       const updatedModules = [...modules];
  //       const updatedModule = { ...module };

  //       updatedModule.slides.push(newSlide);
  //       updatedModules[moduleIndex] = updatedModule;
  //       setModules(updatedModules);

  //       setMappedSlides([...mappedSlides, { ...newSlide, moduleIndex }]);
  //       setShowAddSlideInput(false);
  //       setNewSlideName("");
  //       setSelectedModuleIndex(null);
  //       setSelectedSlideType("Topic Introduction Slide");
  //       setNewSlideBody("");
  //       setQuestions([
  //         { question: "", options: ["", ""], correctOptionIndex: null },
  //       ]);
  //     } else {
  //       console.log("Saving non-quiz slide...");
  //       const response = await fetch(`/api/slide?courseId=${courseId}`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           moduleId: moduleId,
  //           slide_name: newSlideName,
  //           slide_type: selectedSlideType,
  //           slide_body:newSlideBody,
  //           bodyType:bodyType
  //         }),
  //       });

  //       if (!response.ok) {
  //         console.error("Error adding quiz slide:", response.statusText);
  //         return;
  //       }
  //       const updatedModules = [...modules];
  //       const updatedModule = { ...module };
  //       updatedModule.slides.push(newSlide);
  //       updatedModules[moduleIndex] = updatedModule;
  //       setModules(updatedModules);
  //       setMappedSlides([...mappedSlides, { ...newSlide, moduleIndex }]);
  //       setShowAddSlideInput(false);
  //       setNewSlideName("");
  //       setSelectedModuleIndex(null);
  //       setSelectedSlideType("Topic Introduction Slide");
  //       setNewSlideBody("");
  //     }
  //   } catch (error) {
  //     console.error("Error adding slide:", error);
  //   }
  // };
  const handleCorrectOptionIndexChange = (e, questionIndex) => {
    const updatedQuestions = questions.map((question, qIndex) => {
      if (qIndex === questionIndex) {
        return {
          ...question,
          correctOptionIndex: parseInt(e.target.value, 10),
        };
      }
      return question;
    });
    setQuestions(updatedQuestions);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewSlideMedia(file);
  };

  const handleRemoveSlide = async (slideId, moduleIndex) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      try {
        console.log(courseId,slideId);
        const url = `/api/slide?courseId=${courseId}&slideId=${encodeURIComponent(slideId)}`;

        const response = await fetch(url, {
          method: 'DELETE',
        });
        if (response.ok) {
          // On successful backend deletion, update frontend state
          const updatedModules = modules.map((module, index) => {
            if (index === moduleIndex) {
              // Remove the slide from the module's slides
              return {
                ...module,
                slides: module.slides.filter(slide => slide._id !== slideId),
              };
            }
            return module;
          });
  
          setModules(updatedModules);
          // Optionally, if you keep a separate state for all slides, update that as well
          const updatedMappedSlides = mappedSlides.filter(slide => slide._id !== slideId);
          setMappedSlides(updatedMappedSlides);
          alert('Slide removed successfully');
        } else {
          // Handle failure response
          const errorResponse = await response.json();
          console.error('Failed to delete the slide:', errorResponse.error);
        }
      } catch (error) {
        console.error('Error deleting slide:', error);
      }
    }
  };
  
  const handleEditButtonClick = (slideId , moduleIndex) => {
    const slideToEdit = mappedSlides.find(slide => slide._id === slideId);
    if (!slideToEdit) {
      console.error('Slide not found for editing:', slideId);
      return;
    }

    if (slideToEdit) {
      setShowAddSlideInput(true); 
      console.log(showAddSlideInput);
      setSelectedModuleIndex(moduleIndex); 
      setNewSlideName(slideToEdit.slide_name);
      setNewSlideBody(slideToEdit.slide_body);
      setSelectedSlideType(slideToEdit.slide_type);
      setEditingSlideId(slideId);
    }
  };
    
  const handleduplicateslideClick = async (slideId, moduleIndex) => {
    const slideToDuplicate = mappedSlides.find(slide => slide._id === slideId);
    if (!slideToDuplicate) {
      console.error('Slide not found for duplication:', slideId);
      return;
    }
  
    const duplicateSlideData = {
      ...slideToDuplicate,
      slide_name: `${slideToDuplicate.slide_name} (Copy)`,
    };
    delete duplicateSlideData._id; 
    try {
      const response = await fetch(`/api/slide?courseId=${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateSlideData),
      });
  
      if (response.ok) {
        const newSlide = await response.json();
        const updatedModules = [...modules];
        const updatedModule = updatedModules[moduleIndex];
        if (updatedModule.slides) {
          updatedModule.slides.push(newSlide);
          setModules(updatedModules);
        }
        const updatedMappedSlides = [...mappedSlides, { ...newSlide, moduleIndex }];
        setMappedSlides(updatedMappedSlides); 
        alert('Slide duplicated successfully');
      } else {
        console.error('Failed to duplicate the slide:', await response.text());
      }
    } catch (error) {
      console.error('Error duplicating slide:', error);
    }
  };
  
  const handleMoveSlideUp = async (slideId, moduleIndex) => {
    try {
      const response = await fetch(`/api/slide?courseId=${courseId}&slideId=${slideId}&action=moveUp`, {
        method: 'PUT',
      });
      if (response.ok) {
        // Optionally: Fetch updated slides or manipulate state locally to reflect changes
        console.log('Slide moved up successfully');
        // Refresh your slides here
      } else {
        console.error('Failed to move slide up');
      }
    } catch (error) {
      console.error('Error moving slide up:', error);
    }
  };
  
  const handleMoveSlideDown = async (slideId, moduleIndex) => {
    try {
      const response = await fetch(`/api/slide?courseId=${courseId}&slideId=${slideId}&action=moveDown`, {
        method: 'PUT',
      });
      if (response.ok) {
        // Optionally: Fetch updated slides or manipulate state locally to reflect changes
        console.log('Slide moved down successfully');
        // Refresh your slides here
      } else {
        console.error('Failed to move slide down');
      }
    } catch (error) {
      console.error('Error moving slide down:', error);
    }
  };
  
  return (
    <PrivateRoute>
      <div className={styles.modulecontainer}>
        <div className={styles.moduleheader}>
          <h1>Module Page for Course: {courseId}</h1>
          <button className={styles.addModuleButton} onClick={handleAddModule}>
            Add Module
          </button>

          {showAddModulePopup && (
            <div className={styles.popup}>
              <div className={styles.popupContent}>
                <label htmlFor="newModuleName">
                  <h3>Module Name:</h3>
                </label>
                <input
                  type="text"
                  id="newModuleName"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                />

                <div className={styles.popupButtons}>
                  <button onClick={handleSaveModule}>Save</button>
                  <button onClick={handleClosePopup}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.modulebody}>
          {modules &&
            modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className={styles.moduledetails}>
                <div>
                  <h3>Module Name</h3>
                  <p>{module.module_name}</p>
                  <button
                    className={styles.slidebutton}
                    onClick={() => handleAddSlide(moduleIndex)}
                  >
                    Add Slides
                  </button>

                  {
  showAddSlideInput && selectedModuleIndex === moduleIndex && (
    <div className={styles.slideInputContainer}>
      <div>
        <input
          type="text"
          value={newSlideName}
          onChange={(e) => setNewSlideName(e.target.value)}
          placeholder="Title"
          style={{ width: "50%", marginBottom: "10px" }}
        />
        <select
          id="slideType"
          value={selectedSlideType}
          onChange={(e) => setSelectedSlideType(e.target.value)}
        >
          <option value="Topic Introduction Slide">
            Topic Introduction Slide
          </option>
          <option value="Content Slide">Content Slide</option>
          <option value="Quiz Slide">Quiz Slide</option>
          <option value="Progress Slide">Progress Slide</option>
        </select>

        {selectedSlideType === 'Progress Slide' && (
  <select
    value={bodyType}
    onChange={(e) => setBodyType(e.target.value)}
  >
    <option value="Circle">Circle</option>
    <option value="Square">Square</option>
    <option value="Tool">Tool</option>
  </select>
)}

        {selectedSlideType !== 'Quiz Slide' && (
          <input
            type="file"
            accept="image/*,video/*" // Limit to image and video files for Topic Introduction Slide
            onChange={handleFileChange}
            style={{ display: selectedSlideType === 'Topic Introduction Slide' ? 'block' : 'none' }}
          />
        )}
      </div>
      <div>
        {['Topic Introduction Slide', 'Content Slide'].includes(selectedSlideType) && (
          <textarea
            type="text"
            value={newSlideBody}
            onChange={(e) => setNewSlideBody(e.target.value)}
            placeholder="Body"
            rows={6}
            cols={30}
          />
        )}
        {selectedSlideType === 'Topic Introduction Slide' && (
          <input
            type="text"
            value={newSlideMedia}
            onChange={(e) => setNewSlideMedia(e.target.value)}
            placeholder="Why learn this? (optional)"
            style={{ width: "50%", marginTop: "10px" }}
          />
        )}
      </div>
      {selectedSlideType === "Quiz Slide" && (
                        <div>
                          <h3>Add Questions</h3>
                          {questions.map((question, questionIndex) => (
                            <div key={`question-${questionIndex}`}>
                              <textarea
                                value={question.question}
                                onChange={(e) =>
                                  handleQuestionChange(e, questionIndex)
                                }
                                placeholder="Enter question"
                              />
                              <div>
                                {question.options.map((option, optionIndex) => (
                                  <input
                                    key={`option-${questionIndex}-${optionIndex}`}
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        e,
                                        questionIndex,
                                        optionIndex
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                ))}
                                <button
                                  onClick={() => handleAddOption(questionIndex)}
                                >
                                  Add Option
                                </button>
                                <div>
      <label>Correct Option: </label>
      <select
        value={question.correctOptionIndex || ""}
        onChange={(e) => handleCorrectOptionIndexChange(e, questionIndex)}
      >
        <option value="">Select Correct Option</option>
        {question.options.map((_, index) => (
          <option key={index} value={index}>
            Option {index + 1}
          </option>
        ))}
      </select>
    </div>
                              </div>
                            </div>
                          ))}

                          <button onClick={handleAddQuestion}>
                            Add Question
                          </button>
                        </div>
                      )}
      <button onClick={() => handleSaveSlide(moduleIndex)}>
        Save Slide
      </button>
    </div>
  )
}
                  <div className={styles.mappedSlides}>
                    {mappedSlides &&
                      mappedSlides
                        .filter((slide) => slide.moduleIndex === moduleIndex)
                        .map((slide, index) => (
                          <div key={index} className={styles.individualslide}>
                           <FaArrowUp onClick={() => handleMoveSlideUp(slide._id, moduleIndex)} style={{ cursor: 'pointer' }} />
                            <div>
                            <p>Name: {slide.slide_name}</p>
                            <p>Type: {slide.slide_type}</p>
                            <p>Body: {ReactHtmlParser(slide.slide_body)}</p>
                            <div className={styles.slidebuttons}>
                            <button onClick={() => handleRemoveSlide(slide._id, moduleIndex)} style={{cursor:'pointer'}} className={styles.slidebtn}>Remove</button>
                            <button onClick={() => handleEditButtonClick(slide._id , moduleIndex)} style={{cursor:'pointer'}} className={styles.slidebtn}>Edit</button>
                             <button onClick={() => handleduplicateslideClick(slide._id , moduleIndex)} style={{cursor:'pointer'}} className={styles.slidebtn}>Duplicate</button>
                            {/*<button onClick={() => handleaddinbetweenslideClick(slide._id , moduleIndex)} style={{cursor:'pointer'}} className={styles.slidebtn}>Add</button> */}
                            </div>
                            </div>
                            <FaArrowDown onClick={() => handleMoveSlideDown(slide._id, moduleIndex)} style={{ cursor: 'pointer' }} />
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default Module;
