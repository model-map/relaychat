import { IChats } from "@/context/ChatsContext";
import { MessageCircle, SendHorizonal } from "lucide-react";
import { IMessage } from "../page";
import { Input } from "@/components/shadcn_ui/input";
import { Button } from "@/components/shadcn_ui/button";
import { IUser } from "@/context/AuthContext";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import Cookies from "js-cookie";
import { logAxiosError } from "@/lib/logAxiosError";
import axios from "axios";

interface IChatContent {
  sidebarOpen: boolean;
  chats: IChats[] | null;
  selectedUser: string | null;
  message: string | null;
  setMessage: Dispatch<SetStateAction<string | null>>;
  messages: IMessage[] | null;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
  loggedInUser: IUser | null;
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

  // send message
  const sendMessage = async (
    e: React.SubmitEvent<HTMLFormElement>,
    chatId: string,
    text?: string,
  ) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/message`,
        {
          chatId,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessages((prev) =>
        prev && prev.length > 0 ? [...prev, data.message] : [data.message],
      );
      setMessage("");
    } catch (error) {
      logAxiosError(error, "Failed to send message");
    }
  };

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

      {messages && messages.length > 0 && (
        // CHAT BUBBLES HERE
        <div
          className="overflow-y-scroll flex flex-col h-[80vh] space-y-5 py-10"
          ref={bottomRef}
        >
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
      <form
        className="flex gap-2 w-[80%] ml-auto mt-auto px-10 mb-5"
        onSubmit={(e) => (message ? sendMessage(e, selectedUser, message) : "")}
      >
        <Input
          className="rounded-xl"
          type="text"
          placeholder="send a message"
          value={message || ""}
          onChange={(e) => setMessage(e.target.value)}
        ></Input>
        <Button
          className="rounded-full bg-primary/90 hover:bg-primary"
          type="submit"
        >
          <SendHorizonal />
        </Button>
      </form>
    </div>
  );
};
export default ChatContent;
