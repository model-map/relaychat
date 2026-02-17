import { IChats } from "@/context/ChatsContext";
import { MessageCircle } from "lucide-react";
import { IMessage } from "../page";
import { Input } from "@/components/shadcn_ui/input";

interface IChatContent {
  sidebarOpen: boolean;
  chats: IChats[] | null;
  selectedUser: string | null;
  messages: IMessage[] | null;
}

const ChatContent = ({
  sidebarOpen,
  chats,
  selectedUser,
  messages,
}: IChatContent) => {
  // COMMON WRAPPER CLASS
  const wrapperClass = `flex-1 flex flex-col gap-2 transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-70" : "ml-0"}`;

  // If user is not a participant of any chat
  if (chats?.length === 0) {
    return (
      <div className={wrapperClass}>
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
      <div className={wrapperClass}>
        <MessageCircle className="h-8 w-8" />
        <p className="text-sm">Select a chat to continue the conversation.</p>
      </div>
    );
  }

  // If user is a participant of chats and has selected one
  return (
    <div className={`${wrapperClass} pb-5`}>
      {/* FOR EMPTY CONVERSATION */}
      {!messages ||
        (messages.length == 0 && (
          <div className="flex flex-col items-center justify-center gap-4 mt-auto">
            <MessageCircle className="h-8 w-8" />
            <p className="text-sm">Send a message to start the conversation.</p>
          </div>
        ))}

      {messages && messages.length > 0 && (
        // CHAT BUBBLES HERE
        <div className="overflow-y-scroll flex flex-col h-[80vh] space-y-5 py-10 justify-end">
          {/* SENDER'S CHAT MESSAGE ON THE LEFT */}
          <div className="self-end bg-chart-4 text-shadow-chart-4 rounded-xl py-2 px-4 w-fit max-w-[60%] wrap-break-word ml-75 mr-10">
            {messages[0]?.text}
            Hello
          </div>
          {/* USER'S CHAT MESSAGE ON THE RIGHT */}
          <div className="self-start bg-chart-2 text-shadow-chart-4 rounded-xl py-2 px-4 w-fit max-w-[60%] wrap-break-word ml-10">
            {messages[0]?.text}
            THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS
            THIS THIS THIS THIS THISTHIS THIS THIS THIS THIS THIS THIS THIS THIS
            THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS
            THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS THIS
            THIS THIS THIS THIS
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="flex w-full mt-auto px-10">
        <Input
          className="rounded-xl"
          type="text"
          placeholder="send a message"
        ></Input>
      </div>
    </div>
  );
};
export default ChatContent;
