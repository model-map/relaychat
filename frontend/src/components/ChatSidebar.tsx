import { IUser } from "@/context/AuthContext";
import { IChat } from "@/context/ChatsContext";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./shadcn_ui/button";
import { MessageCircle, X } from "lucide-react";

interface IChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  showAllUsers: boolean;
  setShowAllUsers: Dispatch<SetStateAction<boolean>>;
  users: IUser[] | null;
  loggedInUser: IUser | null;
  chats: IChat[] | null;
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
    fixed top-0 left-0 z-20 h-screen w-80
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
            className="w-5 h-5 bg-primary hover:cursor-pointer hover:bg-secondary-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </Button>
        </div>
      </div>
      {/* SHOW ALL USERS */}
      <div className="flex items-center gap-3 mt-2 ml-2">
        <div className="p-2 bg-blue-400 justify-between rounded-full">
          <MessageCircle className="w-5 h-5 text-black" />
        </div>
        <h2 className="text-xl font-bold text-primary">
          {showAllUsers ? "New Chat" : "Messages"}
        </h2>
      </div>
    </aside>
  );
};
export default ChatSidebar;
