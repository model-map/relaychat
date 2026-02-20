import { IChats } from "@/context/ChatsContext";
import { Check, CheckCheck, MessageCircle } from "lucide-react";
import { IMessage } from "../page";
import { IUser } from "@/context/AuthContext";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import MessageInput from "./MessageInput";
import moment from "moment";

interface IChatContent {
  sidebarOpen: boolean;
  chats: IChats[] | null;
  selectedUser: string | null;
  message: string | null;
  setMessage: Dispatch<SetStateAction<string | null>>;
  messages: IMessage[] | null;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
  loggedInUser: IUser | null;
  isTyping: boolean;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
}

const ChatContent = ({
  sidebarOpen,
  chats,
  selectedUser,
  message,
  setMessage,
  messages,
  setMessages,
  loggedInUser,
  isTyping,
  setIsTyping,
}: IChatContent) => {
  // Use ref for scrolling to bottom at every new message
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // seen feature
  const uniqueMessages = useMemo(() => {
    if (!messages) return;
    const seen = new Set();
    return messages.filter((message) => {
      if (seen.has(message._id)) {
        return false;
      }
      seen.add(message._id);
      return true;
    });
  }, [messages]);

  useLayoutEffect(() => {
    const el = bottomRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [selectedUser, uniqueMessages]);

  // COMMON WRAPPER CLASSES
  const wrapperClass = `flex-1 flex flex-col gap-2 transition-all duration-300 ease-in-out ${sidebarOpen ? "pl-70" : "pl-0"}`;
  const chatBubbleBase = `rounded-xl py-2 px-4 w-fit max-w-[60%] font-medium wrap-break-word`;
  const chatBubbleOutgoing = `self-end bg-chat-outgoing text-chat-outgoing-foreground mr-5`;
  const chatBubbleIncoming = `self-start bg-chat-incoming text-chat-incoming-foreground ml-10`;

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
  if (!selectedUser) {
    return (
      <div className={`${wrapperClass} items-center justify-center`}>
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

      {/* FOR NON-EMPTY CONVERSATIONS */}
      {messages && messages.length > 0 && (
        // MAIN CHAT SECTION WITH CHAT BUBBLES
        <div
          className="overflow-y-scroll flex flex-col h-[80vh] space-y-5 py-10"
          ref={bottomRef}
        >
          {messages.map((message) => {
            return (
              // DECORATING INCOMING/OUTGOING CHAT BUBBLES
              <div key={message._id} className="flex flex-col gap-1">
                <div
                  key={message._id}
                  className={`${chatBubbleBase} ${message.sender === loggedInUser?._id ? chatBubbleOutgoing : chatBubbleIncoming} flex flex-col`}
                >
                  {/* HANDLING TEXT VS IMAGE MESSAGES */}
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
                {/* HANDLING TIMESTAMPS AND SEEN STATUS */}
                <div
                  className={`text-xs text-muted-foreground 
                    ${message.sender === loggedInUser?._id ? "self-end pr-5" : "self-start pl-10"}
                    flex items-center gap-2
                    `}
                >
                  {message.sender === loggedInUser?._id ? (
                    message.seen ? (
                      <>
                        <span>
                          {moment(message.updatedAt).format(
                            "MMM D. hh:mm A",
                          )}{" "}
                        </span>
                        <CheckCheck color="deepskyblue" size={15} />
                      </>
                    ) : (
                      <>
                        <span>
                          {moment(message.createdAt).format("MMM D. hh:mm A")}
                        </span>
                        <Check size={15} />
                      </>
                    )
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM BAR */}
      <MessageInput
        selectedUser={selectedUser}
        message={message}
        setMessage={setMessage}
        setMessages={setMessages}
      />
    </div>
  );
};
export default ChatContent;
