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
    <div className={`absolute top-0 left-0 flex gap-2 items-center`}>
      {/* SIDEBAR TOGGLE BUTTON */}
      <Button className={``} onClick={onClick}>
        <Sidebar />
      </Button>
      {/* USER NAME */}
      <div className={``}>Hello</div>
    </div>
  );
};
export default ChatHeader;
