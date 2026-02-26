"use client";

import Sidebar from "@/app/chat/(sidebar)/Sidebar";
import { Spinner } from "@/components/shadcn_ui/spinner";
import { IUser, useAuth } from "@/context/AuthContext";
import { useChats } from "@/context/ChatsContext";
import { useUsers } from "@/context/UsersContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ISocketContext, useSocket } from "@/context/SocketContext";
import ChatHeader from "@/app/chat/(main)/ChatHeader";
import ChatContent from "@/app/chat/(main)/ChatContent";

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

export interface ISocketTypingData {
  chatId: string;
  userId: string;
}

const ChatApp = () => {
  const router = useRouter();
  // Contexts
  const { isAuth, authLoading, user: loggedInUser } = useAuth();
  const { chats, setChats } = useChats();
  const { users } = useUsers();
  const { onlineUsers } = useSocket() as Pick<ISocketContext, "onlineUsers">;

  // States
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<IMessage[] | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuth) {
      router.replace("/login");
    }
  }, [isAuth, authLoading, router]);

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
      <Sidebar
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
        onlineUsers={onlineUsers}
      />
      {/* MAIN COLUMN */}
      <div className={` flex flex-col items-center justify-center flex-1`}>
        {/* MAIN SECTION - CHAT ChatHeader */}
        <ChatHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          typingUsers={typingUsers}
          user={user}
          onlineUsers={onlineUsers}
          selectedUser={selectedUser}
        />
        {/* MAIN SECTION */}
        <ChatContent
          sidebarOpen={sidebarOpen}
          chats={chats}
          selectedUser={selectedUser}
          message={message}
          setMessage={setMessage}
          messages={messages}
          setMessages={setMessages}
          loggedInUser={loggedInUser}
          typingUsers={typingUsers}
          setTypingUsers={setTypingUsers}
          user={user}
        />
      </div>
    </div>
  );
};
export default ChatApp;
