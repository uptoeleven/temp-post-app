import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useMaterialsContext } from "../../hooks/useMaterialsContext";
import DOMPurify from "../../utils/dompurifyConfig";
import { useNavigate } from "react-router-dom";
import CancelButton from "../../components/CancelButton/CancelButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import ExperimentalAllTagsSelect from "../../components/ExperimentalAllTagsSelect/ExperimentalAllTagsSelect";
import styles from "./Edit.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Edit = ({ material }) => {
  // Initialise state of title, content
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content);
  // Error handling
  const [error, setError] = useState(null);
  // Keep track of any empty form fields
  const [emptyFields, setEmptyFields] = useState([]);

  /* Maintain state for any tags selected from drop-down options, 
  options are all tags from user's document collection */
  const [selectedTags, setSelectedTags] = useState([]);
  // Context hooks for global state management of user and materials
  const { dispatch } = useMaterialsContext();
  const { user } = useAuthContext();
  // Navigation between routes
  const navigate = useNavigate();
  // Maintain  state for existing tags
  const [tags, setTags] = useState(material.tags);
  // Validation: prevent form submission with empty fields
  const [isFormValid, setIsFormValid] = useState(false);
  const [trySubmit, setTrySubmit] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // State for aria live messages
  const [editMsg, setEditMsg] = useState("");

  // Screen readers announcement on page load
  useEffect(() => {
    setEditMsg("Now on edit document screen.");
  }, []);

  const handleTitleChange = (e) => {
    const sanitizedTitleInput = DOMPurify.sanitize(e.target.value);
    setTitle(sanitizedTitleInput);
  };

  const handleContentChange = (e) => {
    const sanitizedContentInput = DOMPurify.sanitize(e.target.value);
    setContent(sanitizedContentInput);
  };

  // Synchronise state when material prop updates
  useEffect(() => {
    setTitle(material.title);
    setContent(material.content);
    setTags(material.tags);
  }, [material]);

  // Validate fields filled out
  useEffect(() => {
    if (title && content && (selectedTags.length > 0 || tags.length > 0)) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [title, content, selectedTags, tags.length]);

  // Allow deletion of an existing tag based on it's index in Tags array
  const deleteTag = (index) => {
    setTags((prevState) => prevState.filter((tag, i) => i !== index));
  };

  // Update the state when tags selected from dropdown
  const handleTagsChange = (newTags) => {
    setSelectedTags(newTags);
  };

  /* Temporary auth for MVP, to be replaced with server cookie session */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Merge existing and new tags
    const everyTag = Array.from(new Set([...tags, ...selectedTags]));
    const updatedMaterial = { title, content, tags: everyTag };

    // Create string of missing fields to pass to editMsg
    // Space around "and" ensures correct pronounciation
    const missing = missingFields().join(" and ");

    // Prevent form submission with empty fields
    if (!isFormValid) {
      setTrySubmit(true);
      setEditMsg("");
      // Announce error(s) to visually impared users
      setEditMsg(`No input for ${missing}. Please fill in before submitting`);
      return;
    }

    const response = await fetch(`/api/materials/${material._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(updatedMaterial),
    });

    const json = await response.json();

    if (!response.ok) {
      // Server-side error handling
      setError(json.error);
      setEmptyFields(json.emptyFields);
      // Client-side error message
      toast.error(
        "An error has occurred, please try again or contact your administrator if the error persists"
      );
    }

 /* Update global state and navigate to homepage, 
    show toast to confirm "work saved" */
    if (response.ok) {
      setError(null);
      setEmptyFields([]);
      dispatch({ type: "UPDATE_MATERIAL", payload: json });
      navigate("/");
      console.log("About to show success toast");
      toast.success("Edits to the document saved");
    } else {
      toast.error(
        "An error has occurred, please try again or contact your administrator if the error persists"
      );
    }
  };

  /* Dynamic error message checks which fields are missing, 
   stores in array, passes to error message to render */
  const missingFields = () => {
    let fields = [];
    if (!title) fields.push("Title");
    if (!content) fields.push("Content");
    if (selectedTags.length === 0 && tags.length === 0) fields.push("Tags");
    return fields;
  };

  const saveIcon = <FontAwesomeIcon icon={faFloppyDisk} />;

  // Limit width of displayed tag
  const trimText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  /* Prevent form submission on accidental double 
  "Enter" key down for ExperimentalAllTagsSelect */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const type = document.activeElement.type;
      if (isDropdownOpen || type === "submit" || type === "button") {
        return;
      }
      e.preventDefault();
    }
  };

  return (
    <>
      {/* Visually hidden aria-live message*/}
      <div aria-live="polite" className="aria-live-hidden">
        {editMsg}
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {(trySubmit && !isFormValid) || error ? (
          <div className="error">
            {trySubmit && !isFormValid ? (
              <>
                Please fill in the following fields:{" "}
                {missingFields().join(", ")}
              </>
            ) : (
              error
            )}
          </div>
        ) : null}

        <section>
          <label htmlFor="title" className="document-form-headings">
            Edit Title:
          </label>
          <textarea
            id="title"
            rows={2}
            value={title}
            onChange={handleTitleChange}
            className={
              (trySubmit && !title) || emptyFields.includes("title")
                ? "error"
                : "primary"
            }
          />
        </section>

        <section>
          <label htmlFor="content" className="document-form-headings">
            Edit Content:
          </label>
          <textarea
            id="content"
            rows={8}
            value={content}
            onChange={handleContentChange}
            className={
              (trySubmit && !content) || emptyFields.includes("content")
                ? "error"
                : "primary"
            }></textarea>
        </section>

        <section className={styles.inputTagsContainer}>
          <h2
            id="edit-tags-heading"
            className={`${styles.editTagsSection} document-form-headings`}>
            Edit Tags:
          </h2>
          {tags.length > 0 && (
            <p id="tags-desc" className={styles.editTagsSection}>
              Tags you already have here - click on the x to delete any you
              don't want:
            </p>
          )}
          <div
            role="group"
            aria-labelledby="edit-tags-heading"
            className={`${styles.editTagsSection} edit-document-tags`}>
            {tags.length > 0 &&
              tags.map((tag, index) => (
                <span
                  key={index}
                  className={`${styles.editExistingTags} tag-chip`}>
                  {trimText(tag, 16)}
                  <button
                    type="button"
                    aria-label={`Delete tag ${tag}`}
                    onClick={() => deleteTag(index)}>
                    X
                  </button>
                </span>
              ))}
          </div>
          {trySubmit && selectedTags.length === 0 && tags.length === 0 && (
            <div className="error">Please add some tags!</div>
          )}
          <label htmlFor="tags-select">Add tags here (max. 15 chars):</label>
          <div className={styles.editTagsSelect}>
            <ExperimentalAllTagsSelect
              id="tags-select"
              onTagsChange={handleTagsChange}
              onMenuOpen={() => setIsDropdownOpen(true)}
              onMenuClose={() => setIsDropdownOpen(false)}
            />
          </div>
        </section>

        <section className="content-detail-edit-create-btns">
          <CancelButton />
          <button className={`${styles.saveBtn} save-btn`} type="submit">
            {saveIcon} Save
          </button>
        </section>
      </form>
    </>
  );
};

export default Edit;
