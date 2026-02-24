"use client";

import Cookies from "js-cookie";
import { toast } from "sonner";
import { logAxiosError } from "@/lib/logAxiosError";
import axios from "axios";
import { IUser } from "@/context/AuthContext";
import { IChats } from "@/context/ChatsContext";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "../../../components/shadcn_ui/button";
import {
  CornerDownRight,
  CornerUpLeft,
  Dot,
  MessageCircle,
  Plus,
  Search,
  UserCircle,
  X,
} from "lucide-react";
import { Input } from "../../../components/shadcn_ui/input";
import { IMessage } from "@/app/chat/page";

interface IChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  showAllUsers: boolean;
  setShowAllUsers: Dispatch<SetStateAction<boolean>>;
  users: IUser[] | null;
  loggedInUser: IUser | null;
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  chats: IChats[] | null;
  setChats: Dispatch<SetStateAction<IChats[] | null>>;
  messages: IMessage[] | null;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
  selectedUser: string | null;
  setSelectedUser: Dispatch<SetStateAction<string | null>>;
  createChat: (id: string) => Promise<void>;
  onlineUsers: string[];
}

const ChatSidebar = ({
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
  createChat,
  onlineUsers,
}: IChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  console.log(`ONLINE USERS: ${onlineUsers}`);

  useEffect(() => {
    // function to fetch chats
    const fetchChat = async () => {
      const token = Cookies.get("token");
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/messages/${selectedUser}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setMessages(data.messages);
        setUser(data.user);
      } catch (error) {
        logAxiosError(error, `Failed to fetch chat`);
      }
    };

    if (selectedUser) {
      fetchChat();
    }
  }, [selectedUser, setMessages, setUser]);

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
      <div className="flex items-center h-14 px-4 border-b border-border/60">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
          </div>

          <h2 className="text-sm font-semibold tracking-tight">
            {showAllUsers ? "New Chat" : "Messages"}
          </h2>
        </div>

        {/* Right: Toggle */}
        <Button
          variant={showAllUsers ? "secondary" : "default"}
          size="icon"
          onClick={() => setShowAllUsers((prev) => !prev)}
          className="ml-auto h-9 w-9"
        >
          {showAllUsers ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
      {/* Chat sidebar main section */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUsers ? (
          // User search bar
          <div className="space-y-4">
            <div className="relative mt-4 px-4">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

              <Input
                type="text"
                id="search"
                name="search"
                placeholder="Search users"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-10 h-9 text-sm bg-muted/40 focus:bg-background"
              />
            </div>
            {/* All users list */}
            <div className="flex-1 overflow-y-auto">
              <ul className="py-2">
                {users
                  ?.filter(
                    (u) =>
                      u._id !== loggedInUser?._id &&
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((u) => (
                    <li key={u._id}>
                      <button
                        onClick={() => createChat(u._id)}
                        className="
                          w-full
                          flex items-center gap-3
                          px-4 py-3
                          text-left
                          transition-colors
                          hover:bg-accent/60
                          focus-visible:outline-none
                          focus-visible:bg-accent
                        "
                      >
                        {/* Avatar */}
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted shrink-0">
                          <UserCircle className="w-5 h-5 text-muted-foreground" />
                          {/* ONLINE INDICATOR */}
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {u.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Start conversation
                          </div>
                        </div>
                        {/* ONLINE INDICATOR */}
                        {onlineUsers.includes(u?._id) && (
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                        )}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          // Existing Chats section
          <div className="space-y-2 mt-4 overflow-y-auto h-full pb-4">
            {chats.map((chat) => {
              const latestMessage = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isSentByMe = latestMessage?.sender === loggedInUser?._id;
              const unseenCount = chat.chat.unseenCount || 0;

              return (
                <Button
                  key={chat.chat._id}
                  onClick={() => setSelectedUser(chat.chat._id)}
                  variant="ghost"
                  className={`
                    w-full
                    justify-start
                    px-4 py-3
                    h-auto
                    rounded-none
                    transition-colors
                    ${isSelected ? "bg-accent" : "hover:bg-accent/60"}
                  `}
                >
                  <div className="flex w-full items-center gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate text-sm font-medium">
                            {chat.user.name}
                          </span>
                          {/* MESSAGE RECEIVED/SENT ARROW ICON */}
                          {isSentByMe ? (
                            <CornerDownRight
                              size={14}
                              className="shrink-0 text-muted-foreground"
                            />
                          ) : (
                            <CornerUpLeft
                              size={14}
                              className="shrink-0 text-muted-foreground"
                            />
                          )}
                        </div>

                        {unseenCount > 0 && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            {unseenCount > 99 ? "99+" : unseenCount}
                          </span>
                        )}
                      </div>

                      <div
                        className={`mt-0.5 truncate text-xs ${
                          isSelected
                            ? "text-muted-foreground"
                            : "text-muted-foreground/80"
                        }`}
                      >
                        {latestMessage?.text ?? "No messages yet"}
                      </div>
                    </div>
                    {/* ONLINE INDICATOR */}
                    {onlineUsers.includes(chat.user?._id) && (
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
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
export default ChatSidebar;
