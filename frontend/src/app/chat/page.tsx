"use client";

import ChatSidebar from "@/app/chat/(components)/ChatSidebar";
import { Spinner } from "@/components/shadcn_ui/spinner";
import { IUser, useAuth } from "@/context/AuthContext";
import { useChats } from "@/context/ChatsContext";
import { useUsers } from "@/context/UsersContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatHeader from "./(components)/ChatHeader";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import { logAxiosError } from "@/lib/logAxiosError";
import ChatContent from "./(components)/ChatContent";
import { useSocket } from "@/context/SocketContext";

export interface IMessage {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatApp = () => {
  const router = useRouter();
  // Contexts
  const { isAuth, authLoading, user: loggedInUser } = useAuth();
  const { chats, setChats } = useChats();
  const { users } = useUsers();
  const { onlineUsers } = useSocket();

  // States
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<IMessage[] | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !isAuth) {
      router.replace("/login");
    }
  }, [isAuth, authLoading, router]);

  // Controller to create chat
  const createChat = async (id: string) => {
    const token = Cookies.get("token");
    if (!token) {
      return;
    }
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chat/new`,
        {
          id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSelectedUser(data.chat._id);
      setShowAllUsers(false);
      const foundUser = users?.find((u) => u._id === id);
      if (!foundUser) return; // stop if user not found

      // only run if chat doesn't already exist in `chats`
      if (!chats?.some((u) => u.chat._id === data.chat._id)) {
        setChats((prev) => [
          ...(prev ?? []),
          {
            user: foundUser,
            chat: data.chat,
          },
        ]);
      }

      toast.success(data.message);
    } catch (error) {
      logAxiosError(error, "Failed to create chat");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col`}>
      {/* SIDEBAR */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={users}
        loggedInUser={loggedInUser}
        user={user}
        setUser={setUser}
        chats={chats}
        setChats={setChats}
        messages={messages}
        setMessages={setMessages}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />
      {/* MAIN COLUMN */}
      <div className={` flex flex-col items-center justify-center flex-1`}>
        <ChatHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
          user={user}
          onlineUsers={onlineUsers}
        />

        <ChatContent
          sidebarOpen={sidebarOpen}
          chats={chats}
          selectedUser={selectedUser}
          message={message}
          setMessage={setMessage}
          messages={messages}
          setMessages={setMessages}
          loggedInUser={loggedInUser}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
        />
      </div>
    </div>
  );
};
export default ChatApp;
