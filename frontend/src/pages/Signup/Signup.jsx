/* Temporary auth for MVP, to be replaced with server cookies session */
import DOMPurify from "../../utils/dompurifyConfig";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../hooks/useSignup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Signup.module.css";

// Custom hook manages input fields error handling
const useInput = (initialValue, externalError) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);

  // Update error state if server-side error
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);
  // Clear display (validation) error message when user re-types in field
  const handleInputChange = (e) => {
    setValue(e.target.value);

    if (error) {
      setError(null);
    }
  };

  return {
    value,
    error,
    handleInputChange,
  };
};

const Signup = () => {
  // Imports from custom useSignin hook
  const { signup, error, isLoading, clearError } = useSignup();
  // Custom input hooks for email and password
  const emailInput = useInput("", error);
  const passwordInput = useInput("", error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    const sanitizedValue = DOMPurify.sanitize(e.target.value);

    setEmail(sanitizedValue);
    emailInput.handleInputChange({ target: { value: sanitizedValue } });
    clearError();
  };

  const handlePasswordChange = (e) => {
    const sanitizedValue = DOMPurify.sanitize(e.target.value);

    setPassword(sanitizedValue);
    passwordInput.handleInputChange({ target: { value: sanitizedValue } });
    clearError();
  };

  // For validation
  const [isFormValid, setIsFormValid] = useState(false);
  const [trySubmit, setTrySubmit] = useState(false);

  // For aria-live region when switching between Login & Signup pages
  const [liveMessage, setLiveMessage] = useState("");

  // Update form validity
  useEffect(() => {
    if (email && password) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setTrySubmit(true);
      return;
    }

    await signup(email, password);
  };

  const navigate = useNavigate();

  /* Navigate & Screen Reader announcement of new page on page load*/
  const goToLogin = () => {
    setLiveMessage("Now on the login form.");
    setTimeout(() => {
      navigate("/Login");
    }, 100);
  };

  // Set error display according to missing fields
  const missingFields = () => {
    let fields = [];
    if (!email) fields.push("Email");
    if (!password) fields.push("Password");
    return fields;
  };

  const signupIcon = <FontAwesomeIcon icon={faUserPlus} />;
  const loginIcon = <FontAwesomeIcon icon={faRightToBracket} />;

  return (
    <>
      <main className={styles.signupWrapper}>
        <form
          className={`${styles.signupForm} signup-form`}
          onSubmit={handleSubmit}>
          <div aria-live="polite">
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
          </div>
          <h2 className="login-signup-title">Signup here:</h2>
          <label htmlFor="email">Email*</label>
          <input
            aria-label="Signup form. Email input box."
            type="email"
            id="email"
            autoComplete="off"
            onChange={handleEmailChange}
            value={email}
            className={
              (trySubmit && !email) || emailInput.error ? "error" : "primary"
            }
            aria-required
          />
          <label htmlFor="password">Password*</label>
          <input
            aria-label="Signup form. Password input box."
            type="password"
            id="password"
            autoComplete="off"
            onChange={handlePasswordChange}
            value={password}
            className={
              (trySubmit && !password) || passwordInput.error
                ? "error"
                : "primary"
            }
            aria-required
          />

          <div>
            <button
              className={`${styles.signupButton} signup-btn`}
              disabled={isLoading}>
              {signupIcon} Signup
            </button>
            {error && <div className="error">{error}</div>}
          </div>
        </form>
        <section className={`${styles.signupSwitchFormsBtns} switch-form-btns`}>
          <div
            aria-live="polite"
            aria-atomic="true"
            className={styles.hiddenAriaLiveMessages}>
            {liveMessage}
          </div>
          <div className="switch-form-text-prompt">
            Already have an account?
          </div>
          <button className="switch-form-btn" onClick={goToLogin}>
            {loginIcon} Login
          </button>
        </section>
      </main>
    </>
  );
};

export default Signup;
