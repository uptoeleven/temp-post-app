// Temporary auth for MVP, to be replaced with server cookie session
import { useAuthContext } from "./useAuthContext";
import { useState } from "react";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  /* Exported for controlling display server-side validation 
    error messages when redundant in Signup*/
  const clearError = () => {
    setError(null);
  };

  const signup = async (email, password) => {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    }
    if (response.ok) {
      /* Save the user to local storage - 
      for mVP only, to be replaced with server cookie session */
      localStorage.setItem("user", JSON.stringify(json));

      // Update AuthContext
      dispatch({ type: "LOGIN", payload: json });

      setIsLoading(false);
    }
  };

  return { signup, isLoading, error, clearError };
};
