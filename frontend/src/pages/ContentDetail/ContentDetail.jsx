import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Edit from "./Edit";
import CancelButton from "../../components/CancelButton/CancelButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import styles from "./ContentDetail.module.css";

const ContentDetail = () => {
  // Set state for aria Live mesages for screen readers
  const [contentDetailMsg, setContentDetailMsg] = useState("");

  const { _id } = useParams();
  const {
    data: material,
    error,
    isPending,
  } = useFetch("/api/materials/" + _id);
  const [isEditing, setIsEditing] = useState(false);

  function handleUpdateClick() {
    setIsEditing(true);
  }

  function handleUpdateComplete() {
    setIsEditing(false);
  }

  // For Screen Readers 
  useEffect(() => {
    if (!material) {
      // Announce the page has loaded and the document is being retrieved
      setContentDetailMsg(
        "Now on the read-only document screen. Loading document details..."
      );
    } else {
      // Announce the page content when it's available
      setContentDetailMsg(
        `Now on the read-only document screen. Title: ${
          material.title
        }. Content: ${material.content}. Tags: ${material.tags.join(", ")}.`
      );
    }
  }, [material]);

  const editIcon = <FontAwesomeIcon icon={faPenToSquare} />;

  return (
    <>
      <main>
      
        {/* Visually hidden aria-live message*/}
        <div aria-live="polite" className="aria-live-hidden">
          {contentDetailMsg}
        </div>

        <div className={styles.contentDetailWrapper}>
          <h2>Selected Document:</h2>
          <div className="content-detail-edit-create-containers">
            {isEditing ? (
              <Edit
                material={material}
                onUpdateComplete={handleUpdateComplete}
              />
            ) : (
              <div>
                {isPending && <div>Loading...</div>}
                {error && <div>{error}</div>}
                {material && (
                  <article>
                    <div
                      className={`${styles.contentDetailTitleLabel} document-form-headings`}>
                      Title
                    </div>
                    <div className={styles.contentDetailTitle}>
                      {material.title}
                    </div>
                    <div
                      className={`${styles.contentDetailTitleLabel} document-form-headings`}>
                      Content
                    </div>
                    <div className={styles.contentDetailContent}>
                      {material.content}
                    </div>
                    <div
                      className={`${styles.contentDetailTagsLabel} document-form-headings`}>
                      Tags:
                    </div>
                    <div
                      className="content-detail-tags-container"
                      aria-label="List of tags">
                      {material.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={` ${styles.tags} ${styles.tagChip} tags tag-chip`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                )}
                <section className="content-detail-edit-create-btns">
                  <CancelButton />
                  <button
                    className={`go-to-edit-btn ${styles.goToEditBtn}`}
                    onClick={handleUpdateClick}>
                    {editIcon} Edit
                  </button>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ContentDetail;
