/* Temporary auth for MVP, to be replace with server cookie session 
(localStorage inappropriate for user object in production),
 currently instead of server request, updates global state and deletes token 
from local storage */
import { useAuthContext } from "./useAuthContext";
import { useMaterialsContext } from "./useMaterialsContext";
import { useState } from "react";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const { dispatch: dispatchMaterials } = useMaterialsContext();
  const [logoutError, setLogoutError] = useState(null);
  const logout = () => {
    // Error handling for a synchronous function
    try {
      // Remove user from storage
      localStorage.removeItem("user");
      localStorage.removeItem("allTags");

      // Dispatch logout action
      dispatch({ type: "LOGOUT" });
      dispatchMaterials({ type: "SET_MATERIALS", payload: null });
    } catch (error) {
      setLogoutError("An error occured. Please try again");
    }
  };

  return { logout, logoutError };
};
