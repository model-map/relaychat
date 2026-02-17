import { Button } from "@/components/shadcn_ui/button";
import { IUser } from "@/context/AuthContext";
import { Sidebar, UserCircle2 } from "lucide-react";
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
    <div
      className={`w-full h-14 
         flex items-center justify-between px-4 border-b bg-background
        transition-all duration-300 ease-in-out
    ${sidebarOpen ? "pl-75" : "pl-5"}
    `}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className="h-9 w-9"
        >
          <Sidebar className="w-5 h-5" />
        </Button>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted">
              <UserCircle2 className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                Active conversation
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">
              No conversation selected
            </span>
            <span className="text-xs text-muted-foreground">
              Choose a chat to begin
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatHeader;
