"use client";

import { IUser } from "@/context/AuthContext";
import { IChats } from "@/context/ChatsContext";
import { Dispatch, SetStateAction } from "react";

import { MessageCircle, X } from "lucide-react";
import { IMessage } from "@/app/chat/page";
import SidebarHeader from "./SidebarHeader";
import UserSearch from "./UserSearch";
import Chats from "./Chats";
import { Button } from "@/components/shadcn_ui/button";

interface ISidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  showAllUsers: boolean;
  setShowAllUsers: Dispatch<SetStateAction<boolean>>;
  loggedInUser: IUser | null;
  user: IUser | null;
  users: IUser[] | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  chats: IChats[] | null;
  setChats: Dispatch<SetStateAction<IChats[] | null>>;
  messages: IMessage[] | null;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
  selectedUser: string | null;
  setSelectedUser: Dispatch<SetStateAction<string | null>>;
  onlineUsers: string[];
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  showAllUsers,
  setShowAllUsers,
  users,
  loggedInUser,
  user,
  setUser,
  chats,
  setChats,
  messages,
  setMessages,
  selectedUser,
  setSelectedUser,
  onlineUsers,
}: ISidebarProps) => {
  return (
    <aside
      className={`
    fixed inset-y-0 left-0 z-40
    w-72
    flex flex-col
    bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80
    border-r border-border/60
    shadow-sm
    transition-transform duration-300 ease-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-end h-14 px-4 border-b border-border/60 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="h-9 w-9"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {/* Sidebar title with new chat/messages toggle button */}
      <SidebarHeader
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
      />
      {/* Chat sidebar main section */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUsers ? (
          // User search bar
          <UserSearch
            users={users}
            chats={chats}
            loggedInUser={loggedInUser}
            onlineUsers={onlineUsers}
            setChats={setChats}
            setSelectedUser={setSelectedUser}
            setShowAllUsers={setShowAllUsers}
          />
        ) : chats && chats.length > 0 ? (
          // Existing Chats section
          <Chats
            chats={chats}
            loggedInUser={loggedInUser}
            onlineUsers={onlineUsers}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setMessages={setMessages}
            setUser={setUser}
          />
        ) : (
          // IF NO EXISTING CONVERSATIONS FOUND
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start a new chat using the + button above
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
