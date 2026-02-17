import { IChats } from "@/context/ChatsContext";
import { MessageCircle } from "lucide-react";

interface IChatContent {
  sidebarOpen: boolean;
  chats: IChats[] | null;
  selectedUser: string | null;
}

const ChatContent = ({ sidebarOpen, chats, selectedUser }: IChatContent) => {
  // If user is not a participant of any chat
  if (chats?.length === 0) {
    return (
      <div
        className={`flex flex-col items-center gap-2
        transition-all duration-300 ease-in-out
    ${sidebarOpen ? "ml-70" : "ml-0"}
    `}
      >
        <MessageCircle className="h-8 w-8" />
        <p className="text-sm">
          No conversations found yet.
          <br />
          Click <span className="font-medium">+</span> to start a new
          conversation.
        </p>
      </div>
    );
  }

  // If user is a participant of chats but hasn't select any
  if (!selectedUser && chats?.length !== 0) {
    return (
      <div
        className={`flex flex-col items-center gap-2
        transition-all duration-300 ease-in-out
    ${sidebarOpen ? "ml-70" : "ml-0"}
    `}
      >
        <MessageCircle className="h-8 w-8" />
        <p className="text-sm">Select a chat to continue the conversation.</p>
      </div>
    );
  }

  // If user is a participant of chats and has selected one
  return (
    <div
      className={`flex flex-col items-center gap-2
        transition-all duration-300 ease-in-out
    ${sidebarOpen ? "ml-70" : "ml-0"}
    `}
    ></div>
  );
};
export default ChatContent;
