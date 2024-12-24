import { useEffect, useState } from "react";
import { useMaterialsContext } from "../../hooks/useMaterialsContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import CancelButton from "../../components/CancelButton/CancelButton";
import ExperimentalAllTagsSelect from "../../components/ExperimentalAllTagsSelect/ExperimentalAllTagsSelect";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DOMPurify from "../../utils/dompurifyConfig";

import styles from "./CreateNew.module.css";

const CreateNew = (notify) => {
  const { dispatch } = useMaterialsContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [trySubmit, setTrySubmit] = useState(false);
  // Prevent form submission with empty fields
  const [isFormValid, setIsFormValid] = useState(false);
  // Set state for aria Live mesages for screen readers
  const [createNewMsg, setCreateNewMsg] = useState("");

  // Screen Reader announcement of page on page load
  useEffect(() => {
    setCreateNewMsg("Now on create new document screen.");
  }, []);

  // Validate fields filled out
  useEffect(() => {
    if (title && content && selectedTags.length > 0) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [title, content, selectedTags]);

  // Handle changes to the selected tags
  const handleTagsChange = (tags) => {
    if (tags && tags.length) {
      setSelectedTags(tags);
    } else {
      console.log("handleTagsChange called without tags entered");
      /* Update only if selectedTags not already empty array,
         also prevent submission if all selected tags deleted */
      if (selectedTags.length !== 0) {
        setSelectedTags([]);
      }
    }
  };

  const handleTitleChange = (e) => {
    const sanitizedTitleInput = DOMPurify.sanitize(e.target.value);
    setTitle(sanitizedTitleInput);
  };

  const handleContentChange = (e) => {
    const sanitizedContentInput = DOMPurify.sanitize(e.target.value);
    setContent(sanitizedContentInput);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    if (!isFormValid) {
      setTrySubmit(true);
      return;
    }

    const material = { title, content, tags: selectedTags };

    const response = await fetch("/api/materials", {
      method: "POST",
      body: JSON.stringify(material),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
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
      setTitle("");
      setContent("");
      setError(null);
      setEmptyFields([]);
      dispatch({ type: "CREATE_MATERIAL", payload: json });
      navigate("/");
      toast.success("New document has been saved");
    }
  };

  /* Dynamic error message checks which fields are missing, 
   stores in array, passes to error message to render */
  const missingFields = () => {
    let fields = [];
    if (!title) fields.push("Title");
    if (!content) fields.push("Content");
    if (selectedTags.length === 0) fields.push("Tags");
    return fields;
  };

  return (
    <>
      {/* Visually hidden aria-live message*/}
      <div aria-live="polite" className="aria-live-hidden">
        {createNewMsg}
      </div>

      <main className={styles.createNewFormWrapper}>
        <h2
          aria-label="Create new document screen"
          className={styles["main__h2"]}>
          Create new document screen
        </h2>
        <form
          className="content-detail-edit-create-containers"
          onSubmit={handleSubmit}>
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
              Type or paste the title here:
            </label>
            <textarea
              id="title"
              rows={3}
              onChange={handleTitleChange}
              value={title}
              className={
                (trySubmit && !title) || emptyFields.includes("title")
                  ? "error"
                  : "primary"
              }
            />
          </section>

          <section>
            <label htmlFor="content" className="document-form-headings">
              Type or paste content here:
            </label>
            <textarea
              id="content"
              rows={8}
              onChange={handleContentChange}
              value={content}
              className={
                (trySubmit && !content) || emptyFields.includes("content")
                  ? "error"
                  : "primary"
              }
            />
          </section>

          <section>
            <label
              htmlFor="tags-select"
              className={`${styles.createNewTagLabel} document-form-headings`}>
              Add tags here (max. 15 chars):
            </label>
            <div className={styles.tagsSectionContainer}>
              <div
                className={
                  trySubmit && selectedTags.length === 0 ? "error" : ""
                }>
                <ExperimentalAllTagsSelect
                  id="tags-select"
                  onTagsChange={handleTagsChange}
                />
              </div>
            </div>
          </section>

          <section className="content-detail-edit-create-btns">
            <CancelButton />
            <button className={`${styles.saveBtn} save-btn`} type="submit">
              Save
            </button>
          </section>
        </form>
      </main>
    </>
  );
};

export default CreateNew;
