import { IUser } from "@/context/AuthContext";
import { IChats } from "@/context/ChatsContext";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./shadcn_ui/button";
import {
  CornerDownRight,
  CornerUpLeft,
  MessageCircle,
  Plus,
  Search,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { Input } from "./shadcn_ui/input";

interface IChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  showAllUsers: boolean;
  setShowAllUsers: Dispatch<SetStateAction<boolean>>;
  users: IUser[] | null;
  loggedInUser: IUser | null;
  chats: IChats[] | null;
  selectedUser: string | null;
  setSelectedUser: Dispatch<SetStateAction<string | null>>;
}

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  showAllUsers,
  setShowAllUsers,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
}: IChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <aside
      className={`
    fixed top-0 left-0 z-20 h-screen w-70 lg:w-80
    bg-card text-foreground
    border-r border-border
    transition-all duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-100"}
    flex flex-col
  `}
    >
      {/* HEADER */}
      <div className="p-6">
        <div className="flex justify-end mb-0">
          <Button
            className="w-5 h-5 bg-primary hover:bg-primary/90 hover:cursor-pointer "
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </Button>
        </div>
      </div>
      {/* SHOW ALL USERS */}
      <div className="flex items-center gap-3 mt-2 ml-2">
        <div className="p-2 bg-primary justify-between rounded-sm">
          <MessageCircle
            className="w-5 h-5 text-primary-foreground"
            size="sm"
          />
        </div>
        <h2 className="text-xl font-bold text-primary">
          {showAllUsers ? "New Chat" : "Messages"}
        </h2>
        {/* SHOW ALL USERS BUTTON */}
        <div className="ml-auto mr-2">
          <Button
            className={`p-2.5rounded-sm transition-colors hover:cursor-pointer ${showAllUsers ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
            onClick={() => setShowAllUsers((prev) => !prev)}
            size="sm"
          >
            {showAllUsers ? (
              <X className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      {/* CONTENT */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUsers ? (
          <div className="space-y-4">
            <div className="relative mt-4">
              <Search className="absolute top-1.5 left-2 text-muted-foreground" />
              <Input
                type="text"
                id="search"
                name="search"
                placeholder="Search Users"
                className="text-center"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
            {/* USERS LIST */}
            <div className="h-full overflow-y-auto ">
              <ul className="space-y-2">
                {users
                  ?.filter(
                    (u) =>
                      u._id !== loggedInUser?._id &&
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((u) => (
                    <li key={u._id}>
                      <Button
                        variant="ghost"
                        className="
                        border
    w-full h-auto px-3 py-3
    flex items-center gap-3
    text-left
    hover:bg-accent hover:text-accent-foreground
    focus-visible:bg-accent
    transition-colors
  "
                      >
                        {/* avatar */}
                        <UserCircle className="h-9 w-9 shrink-0 text-muted-foreground" />

                        {/* text */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {u.name}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {/* TODO : online / offline */}
                          </div>
                        </div>

                        {/* TODO : optional status dot */}
                        {/* <span className="h-2 w-2 rounded-full bg-green-500" /> */}
                      </Button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
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
                  variant={`${isSelected ? "default" : "ghost"}`}
                  className={`w-full border justify-start px-3 py-7 rounded-lg
    `}
                >
                  <div className="flex w-full items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-muted-foreground" />
                      </div>

                      {/* online indicator (optional) */}
                      {/* <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" /> */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate font-medium">
                            {chat.user.name}
                          </span>

                          {isSentByMe ? (
                            <CornerDownRight size={14} className="shrink-0 " />
                          ) : (
                            <CornerUpLeft size={14} className="shrink-0" />
                          )}
                        </div>
                        {/* Showing latest message */}
                        {latestMessage && <div></div>}
                        {/* Unseen message count */}
                        <span className="ml-2 rounded-full bg-chart-2 px-2 py-0.5 text-xs text-primary-foreground font-bold">
                          {unseenCount > 99 ? "99+" : unseenCount}
                        </span>
                      </div>
                      <div
                        className={`mt-1 truncate  text-left ${isSelected ? "text-muted" : "text-muted-foreground"}`}
                      >
                        {latestMessage && (
                          <span className="">{latestMessage.text}</span>
                        )}
                      </div>
                      {/* 
                      <p className="truncate text-sm text-muted-foreground">
                        {latestMessage ?? "No messages yet"}
                      </p> */}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground">
            <MessageCircle className="h-8 w-8" />
            <p className="text-sm">
              No conversations found yet.
              <br />
              Click <span className="font-medium">+</span> to start a new
              conversation.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
export default ChatSidebar;
