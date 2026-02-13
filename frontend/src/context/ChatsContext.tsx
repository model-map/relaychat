"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { IUser, useAuth } from "./AuthContext";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { logAxiosError } from "@/lib/logAxiosError";

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

export interface IChats {
  user: IUser;
  chat: IChat;
}

interface IChatsContext {
  chats: IChats[] | null;
  setChats: React.Dispatch<React.SetStateAction<IChats[] | null>>;
}

interface IChatsProvider {
  children: React.ReactNode;
}

// Create context
const ChatsContext = createContext<IChatsContext | undefined>(undefined);

// Create provider

export const ChatsProvider: React.FC<IChatsProvider> = ({ children }) => {
  const { isAuth } = useAuth();
  const [chats, setChats] = useState<IChats[] | null>(null);

  useEffect(() => {
    if (!isAuth) return;
    // Function to fetch chats
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
    fetchChats();
  }, [isAuth]);

  return (
    <ChatsContext.Provider value={{ chats, setChats }}>
      {children}
    </ChatsContext.Provider>
  );
};

// Custom hook
export const useChats = () => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("Chat context should be used in Chat Provider");
  } else {
    return context;
  }
};
