// Temporary auth for MVP, to be replaced with server cookie session
import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  /* Exported for controlling display server-side validation 
    error messages when redundant in Login*/
  const clearError = () => {
    setError(null);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    // Simple error handling
    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
      localStorage.removeItem("user");
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
  return { login, isLoading, error, clearError };
};
