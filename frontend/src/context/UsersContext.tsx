"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { IUser, useAuth } from "./AuthContext";
import { logAxiosError } from "@/lib/logAxiosError";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

interface IUsersContext {
  users: IUser[] | null;
  setUsers: React.Dispatch<React.SetStateAction<IUser[] | null>>;
}

interface IUsersProvider {
  children: React.ReactNode;
}

// Create context
const UsersContext = createContext<IUsersContext | undefined>(undefined);

// Create provider
export const UsersProvider: React.FC<IUsersProvider> = ({ children }) => {
  const { isAuth } = useAuth();
  const [users, setUsers] = useState<IUser[] | null>(null);

  // USE EFFECT TO FETCH USERS AFTER USER IS AUTHENTICATED

  useEffect(() => {
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

    if (!isAuth) {
      return;
    }
    fetchUsers();
  }, [isAuth]);

  return (
    <UsersContext.Provider value={{ users, setUsers }}>
      {children}
    </UsersContext.Provider>
  );
};

// Create custom hook
export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("Users context must be used in users provider");
  } else {
    return context;
  }
};
