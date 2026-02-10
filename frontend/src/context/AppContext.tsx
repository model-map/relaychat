"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import log from "loglevel";

export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface IChat {
  _id: string;
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
  unseenCount: number;
}

export interface Chats {
  _id: string;
  user: IUser;
  chat: IChat;
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

  useEffect(() => {
    async function fetchUser() {
      const token = Cookies.get("token");
      if (!token) {
        return;
      }
      const url = `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1/me`;
      try {
        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data);
        setIsAuth(true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch user - Unknown error";
          log.error(`Failed to fetch user - ${message}`);
        } else if (error instanceof Error) {
          log.error(error.message);
        } else {
          log.error(`Failed to fetch user - Unknown error`);
        }
      } finally {
        setAuthLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authLoading, user, setUser, isAuth, setIsAuth }}
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
