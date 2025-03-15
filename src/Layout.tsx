import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import { useUser } from "./context/UserContext";

export default function Layout() {
  const { registerUser, setLoading, isAuthenticated } = useUser();
  useEffect(() => {
    console.log("User profile fetching");
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/profile`,
          {
            withCredentials: true,
          }
        );
        console.log("profile response", res.data);
        if (res.data.success) {
          registerUser(res.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);
  return <Outlet />;
}
