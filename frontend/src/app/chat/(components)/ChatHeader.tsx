import { Button } from "@/components/shadcn_ui/button";
import { IUser } from "@/context/AuthContext";
import { Sidebar } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface IChatHeader {
  user: IUser | null;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isTyping: boolean;
}

const ChatHeader = ({
  sidebarOpen,
  setSidebarOpen,
  user,
  isTyping,
}: IChatHeader) => {
  const onClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div>
      <Button
        className={`absolute top-15 z-20
    transition-all duration-300 ease-in-out
    ${sidebarOpen ? "left-65 translate-x-0 opacity-100" : "left-10 -translate-x-full opacity-100"}`}
        onClick={onClick}
      >
        <Sidebar />
      </Button>
    </div>
  );
};
export default ChatHeader;
