import { Button } from "@/components/shadcn_ui/button";
import { MessageCircle, Plus, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface ISidebarHeader {
  showAllUsers: boolean;
  setShowAllUsers: Dispatch<SetStateAction<boolean>>;
}

const SidebarHeader = ({ showAllUsers, setShowAllUsers }: ISidebarHeader) => {
  return (
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
  );
};
export default SidebarHeader;
