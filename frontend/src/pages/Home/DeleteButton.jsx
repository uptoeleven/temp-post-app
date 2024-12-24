import { useState, useRef } from "react";
import { useMaterialsContext } from "../../hooks/useMaterialsContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faFloppyDisk,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./DeleteButton.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeleteButton = ({ _id }) => {
  const { dispatch } = useMaterialsContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const dialog = document.getElementById("dialog");
  const [ariaLiveMessage, setAriaLiveMessage] = useState("");
  // Used to handle focus on least destructive button
  const cancelDeleteBtnRef = useRef(null);

  const handleDeleteClick = () => {
    dialog.showModal(dialog);
    // Handle focus on least destructive button
    if (cancelDeleteBtnRef.current) {
      cancelDeleteBtnRef.current.focus();
    }
  };

  const handleFocusYesDelete = () => {
    setAriaLiveMessage("Focus is on the confirm delete button");
  };

  const handleFocusNoKeepIt = () => {
    setAriaLiveMessage("Focus is on the cancel delete button");
  };

  const handleConfirmDelete = async () => {
    dialog.close(dialog);
    if (!user) {
      return;
    }

    const response = await fetch(`api/materials/${_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_MATERIAL", payload: json });
      navigate("/");
      toast.success("Document deleted");
    }
  };

  const handleCancelDelete = () => {
    dialog.close(dialog);
  };

  const deleteIcon = (
    <FontAwesomeIcon icon={faTrashCan} size="xl" role="presentation" />
  );

  const saveIcon = (
    <FontAwesomeIcon
      icon={faFloppyDisk}
      className={styles.dialogBtnIcon}
      role="presentation"
    />
  );

  const confirmYesDeleteIcon = (
    <FontAwesomeIcon
      icon={faTrash}
      className={styles.dialogBtnIcon}
      role="presentation"
    />
  );

  return (
    <div className={styles.deleteDiv}>
      <button className={styles.deleteTableButton} onClick={handleDeleteClick}>
        {deleteIcon}
      </button>

      <dialog
        role="alertdialog"
        aria-label="Confirm deletion?"
        aria-modal="true"
        id="dialog"
        className={styles.dialogConfirmDelete}>
        <h2 className={styles.confirmDelete}>Confirm Deletion</h2>
        <p>
          <strong>Do you want to delete this item?</strong>
        </p>
        <p>Choosing the delete button here cannot be undone.</p>

        {/* Visually hidden aria-live message*/}
        <div aria-live="polite" className="aria-live-hidden">
          {ariaLiveMessage}
        </div>

        <div className={styles.confirmDeleteBtns}>
          <button
            className={styles.yesDeleteBtn}
            onClick={handleConfirmDelete}
            onFocus={handleFocusYesDelete}>
            {confirmYesDeleteIcon} Yes, delete
          </button>
          <button
            ref={cancelDeleteBtnRef}
            className={styles.noCancelDeleteBtn}
            onClick={handleCancelDelete}
            onFocus={handleFocusNoKeepIt}>
            {saveIcon} No - Keep it
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default DeleteButton;
