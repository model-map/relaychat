"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { logAxiosError } from "@/lib/logAxiosError";

export interface IUser {
  _id: string;
  name: string;
  email: string;
}

// Create context and provider types
interface IAuthContext {
  user: IUser | null;
  authLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  setAuthLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IAuthProvider {
  children: React.ReactNode;
}

// Create context
const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<IAuthProvider> = ({ children }) => {
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);

  // USE EFFECT FOR CHECK USER AUTH
  async function fetchUser() {
    // Checking if token exists
    const token = Cookies.get("token");
    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      const { data } = await api.get(
        `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1/me`,
      );
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      logAxiosError(error, "Failed to fetch user");
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        user,
        setUser,
        isAuth,
        setIsAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("App context must be used in a Provider");
  } else {
    return context;
  }
};
