import { IChats } from "@/context/ChatsContext";
import { MessageCircle, SendHorizonal } from "lucide-react";
import { IMessage } from "../page";
import { Input } from "@/components/shadcn_ui/input";
import { Button } from "@/components/shadcn_ui/button";
import { IUser } from "@/context/AuthContext";
import Image from "next/image";

interface IChatContent {
  sidebarOpen: boolean;
  chats: IChats[] | null;
  selectedUser: string | null;
  messages: IMessage[] | null;
  loggedInUser: IUser | null;
}

const ChatContent = ({
  sidebarOpen,
  chats,
  selectedUser,
  messages,
  loggedInUser,
}: IChatContent) => {
  // COMMON WRAPPER CLASSES
  const wrapperClass = `flex-1 flex flex-col gap-2 transition-all duration-300 ease-in-out ${sidebarOpen ? "pl-70" : "pl-0"}`;

  const chatBubbleBase = `rounded-xl py-2 px-4 w-fit max-w-[60%] font-medium wrap-break-word`;

  const chatBubbleOutgoing = `self-end bg-chart-4 text-shadow-chart-4 mr-5`;

  const chatBubbleIncoming = `self-start bg-chart-2 text-shadow-chart-4 ml-10`;

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
    <div className={`${wrapperClass} w-full`}>
      {/* FOR EMPTY CONVERSATION */}
      {!messages ||
        (messages.length == 0 && (
          <div className="flex flex-col items-center justify-center mt-auto">
            <MessageCircle className="h-8 w-8" />
            <p className="text-sm">Send a message to start the conversation.</p>
          </div>
        ))}

      {messages && messages.length > 0 && (
        // CHAT BUBBLES HERE
        <div className="overflow-y-scroll flex flex-col h-[80vh] space-y-5 py-10 justify-end">
          {messages.map((message) => {
            return (
              // DECORATING INCOMING/OUTGOING CHAT BUBBLES
              <div
                key={message._id}
                className={`${chatBubbleBase} ${message.sender === loggedInUser?._id ? chatBubbleOutgoing : chatBubbleIncoming}`}
              >
                {message.messageType === "image" && message.image ? (
                  <div className="flex flex-col gap-2 pt-2 pl-2">
                    <Image
                      className="rounded-sm"
                      src={message.image?.url}
                      alt={message.image?.publicId}
                      width={250}
                      height={250}
                    />
                    {message.text}
                  </div>
                ) : (
                  message.text
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="flex gap-2 w-[80%] ml-auto mt-auto px-10 mb-5">
        <Input
          className="rounded-xl"
          type="text"
          placeholder="send a message"
        ></Input>
        <Button className="rounded-full bg-primary/90 hover:bg-primary">
          <SendHorizonal />
        </Button>
      </div>
    </div>
  );
};
export default ChatContent;
