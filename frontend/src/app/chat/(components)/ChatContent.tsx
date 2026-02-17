import { IChats } from "@/context/ChatsContext";
import { MessageCircle } from "lucide-react";

interface IChatContent {
  sidebarOpen: boolean;
  chats: IChats[] | null;
  selectedUser: string | null;
}

const ChatContent = ({ sidebarOpen, chats, selectedUser }: IChatContent) => {
  return (
    <div
      className={`flex flex-col items-center gap-2
        transition-all duration-300 ease-in-out
    ${sidebarOpen ? "mr-70" : "mr-0"}
    `}
    >
      {chats?.length === 0 && (
        <>
          <MessageCircle className="h-8 w-8" />
          <p className="text-sm">
            No conversations found yet.
            <br />
            Click <span className="font-medium">+</span> to start a new
            conversation.
          </p>
        </>
      )}
      {!selectedUser && chats?.length !== 0 && (
        <>
          <MessageCircle className="h-8 w-8" />
          <p className="text-sm">Select a chat to continue the conversation.</p>
        </>
      )}
    </div>
  );
};
export default ChatContent;
