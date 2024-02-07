import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import PrivateRoute from "@/components/PrivateRoute";
import ReactHtmlParser from "react-html-parser";
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
  const [options, setOptions] = useState([""]); // Initialize with three empty options
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: [""],
      correctOptionIndex: null,
    },
  ]);

  const router = useRouter();
  const { courseId } = router.query;

  useEffect(() => {
    const fetchModules = async () => {
      try {
        if (courseId) {
          const moduleResponse = await fetch(
            `/api/module?courseId=${courseId}`
          );
          const slideResponse = await fetch(`/api/slide?courseId=${courseId}`);

          const courseModules = await moduleResponse.json();
          const courseSlides = await slideResponse.json();

          if (Array.isArray(courseModules)) {
            setModules(courseModules);

            const allSlides = courseSlides.flatMap((slide) => ({
              ...slide,
              moduleIndex: courseModules.findIndex(
                (module) => module._id === slide.moduleId
              ),
            }));
            setMappedSlides(allSlides);
          } else {
            console.error("Invalid data format for modules:", courseModules);
          }
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
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
    try {
      const module = modules[moduleIndex];
      if (!module || !module._id) {
        console.error("Invalid module");
        return;
      }

      const moduleId = module._id;
      // Check if it's a quiz slide and has necessary information
      if (selectedSlideType === "Quiz Slide" && questions.length > 0) {
        const response = await fetch(`/api/slide?courseId=${courseId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moduleId: moduleId,
            slide_name: newSlideName,
            slide_type: selectedSlideType,
            slide_body: newSlideBody,
            questions: questions,
          }),
        });

        if (!response.ok) {
          console.error("Error adding quiz slide:", response.statusText);
          return;
        }

        const newSlide = await response.json();
        const updatedModules = [...modules];
        const updatedModule = { ...module };

        updatedModule.slides.push(newSlide);
        updatedModules[moduleIndex] = updatedModule;
        setModules(updatedModules);

        setMappedSlides([...mappedSlides, { ...newSlide, moduleIndex }]);
        setShowAddSlideInput(false);
        setNewSlideName("");
        setSelectedModuleIndex(null);
        setSelectedSlideType("Topic Introduction Slide");
        setNewSlideBody("");
        setQuestions([
          { question: "", options: ["", ""], correctOptionIndex: null },
        ]);
      } else {
        console.log("Saving non-quiz slide...");
        const newSlide = {
          /* Your non-quiz slide data */
        };
        const updatedModules = [...modules];
        const updatedModule = { ...module };

        updatedModule.slides.push(newSlide);
        updatedModules[moduleIndex] = updatedModule;
        setModules(updatedModules);

        setMappedSlides([...mappedSlides, { ...newSlide, moduleIndex }]);
        setShowAddSlideInput(false);
        setNewSlideName("");
        setSelectedModuleIndex(null);
        setSelectedSlideType("Topic Introduction Slide");
        setNewSlideBody("");
      }
    } catch (error) {
      console.error("Error adding slide:", error);
    }
  };
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

                  {showAddSlideInput && selectedModuleIndex === moduleIndex && (
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
                        </select>
                        <input
                          type="file"
                          accept="image/*,video/*" // Limit to image and video files
                          onChange={handleFileChange}
                        />
                      </div>
                      <div>
                        <textarea
                          type="text"
                          value={newSlideBody}
                          onChange={(e) => setNewSlideBody(e.target.value)}
                          placeholder="Body"
                          rows={6}
                          cols={30}
                        />
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
                          <button onClick={() => handleSaveSlide(moduleIndex)}>
                            Save Quiz Slide
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.mappedSlides}>
                    {mappedSlides &&
                      mappedSlides
                        .filter((slide) => slide.moduleIndex === moduleIndex)
                        .map((slide, index) => (
                          <div key={index}>
                            <p>Name: {slide.slide_name}</p>
                            <p>Type: {slide.slide_type}</p>
                            <p>Body: {ReactHtmlParser(slide.slide_body)}</p>
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
