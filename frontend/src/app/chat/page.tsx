"use client";

import ChatSidebar from "@/components/ChatSidebar";
import { Button } from "@/components/shadcn_ui/button";
import { Spinner } from "@/components/shadcn_ui/spinner";
import { IUser, useAuth } from "@/context/AuthContext";
import { useChats } from "@/context/ChatsContext";
import { useUsers } from "@/context/UsersContext";
import { Sidebar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface IMessage {
  _id: string;
  chatId: string;
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

  // States
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
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

  const onClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-secondary-foreground relative overflow-hidden">
      <Button className="" onClick={onClick}>
        <Sidebar />
      </Button>
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
    </div>
  );
};
export default ChatApp;
