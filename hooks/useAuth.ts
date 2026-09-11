import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getCurrentUser, logoutUser } from "@/services/authService";

export const useAuth = () => {
  const { user, isAuthenticated, setUser, updateUser, logout: clearStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("@sromojibi_token") : null;
    if (token && !user) {
      getCurrentUser()
        .then((userData) => {
          if (userData) {
            setUser({
              id: userData.id,
              fullName: userData.fullName ?? "",
              username: userData.username,
              email: userData.email,
              emailVerified: userData.emailVerified,
              role: userData.role,
              image: userData.image,
              token,
            });
          } else {
            clearStore();
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user, setUser, clearStore]);

  const logout = async () => {
    await logoutUser();
    clearStore();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    updateUser,
    logout,
  };
};
