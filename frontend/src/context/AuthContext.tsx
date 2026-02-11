"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import log from "loglevel";
import { api } from "@/lib/api";
import { logAxiosError } from "@/lib/logAxiosError";

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
  users: IUser[] | null;
  authLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  setUsers: React.Dispatch<React.SetStateAction<IUser[] | null>>;
  setAuthLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logOut: () => void;
  chats: IChat[] | null;
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
  const [users, setUsers] = useState<IUser[] | null>(null);
  const [chats, setChats] = useState<IChat[] | null>(null);

  // Logout function to use as event-handler for Logging out
  function logOut() {
    Cookies.remove("token");
    setUser(null);
    setUsers(null);
    setChats(null);
    setIsAuth(false);
    toast.success("Logged out");
  }

  // USE EFFECT FOR CHECK USER AUTH
  async function fetchUser() {
    // Checking if token exists
    const token = Cookies.get("token");
    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      const { data } = api.get(
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

  // USE EFFECT TO FETCH USERS AND CHATS AFTER USER IS AUTHENTICATED
  async function fetchUsers() {
    const token = Cookies.get("token");
    if (!token) {
      return;
    }
    try {
      const { data } = await api.get(
        `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1/user/all`,
      );
      setUsers(data);
    } catch (error) {
      logAxiosError(error, "Failed to fetch users");
    }
  }
  async function fetchChats() {
    const token = Cookies.get("token");
    if (!token) {
      return;
    }
    try {
      const { data } = await api.get(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chat/all`,
      );
      setChats(data.chats);
    } catch (error) {
      logAxiosError(error, "Failed to fetch chats");
    }
  }
  useEffect(() => {
    if (!isAuth) {
      return;
    }
    fetchUsers();
    fetchChats();
  }, [isAuth]);

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        user,
        users,
        setUser,
        setUsers,
        isAuth,
        setIsAuth,
        logOut,
        chats,
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
