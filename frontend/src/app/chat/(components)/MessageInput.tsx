import { Button } from "@/components/shadcn_ui/button";
import { Input } from "@/components/shadcn_ui/input";
import { Loader2, Paperclip, SendHorizonal } from "lucide-react";
import { IMessage, ISocketTypingData } from "../page";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { logAxiosError } from "@/lib/logAxiosError";
import axios from "axios";
import Cookies from "js-cookie";
import { IUser } from "@/context/AuthContext";
import { throttle } from "throttle-debounce";
import { ISocketContext, useSocket } from "@/context/SocketContext";

interface IMessageInput {
  user: IUser | null;
  loggedInUser: IUser | null;
  selectedUser: string | null;
  message: string | null;
  setMessage: Dispatch<SetStateAction<string | null>>;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
  typingUsers: string[];
  setTypingUsers: Dispatch<SetStateAction<string[]>>;
}

const MessageInput = ({
  user,
  loggedInUser,
  selectedUser,
  message,
  setMessage,
  setMessages,
  typingUsers,
  setTypingUsers,
}: IMessageInput) => {
  // socket for emitting typing events
  const { socket } = useSocket() as Pick<ISocketContext, "socket">;
  // State for storing file
  const [file, setFile] = useState<File | null>(null);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  // useRef for clicking input:file button
  const fileRef = useRef<HTMLInputElement>(null);
  // useRef for typingTimeout
  const typingTimeout = useRef<NodeJS.Timeout>(null);

  // THROTTLED EMIT EVENT FOR TYPING, 3000ms
  const emitTyping = useMemo(
    () =>
      throttle(3000, (chatId: string, userId: string) => {
        if (!socket) return;
        socket.emit("typing", { chatId, userId });
      }),
    [socket],
  );

  // useEffect to create typing, stoppedTyping event listeners when socket changes and change isTyping state
  useEffect(() => {
    if (!socket) return;
    socket.on("typing", (data: ISocketTypingData) => {
      setTypingUsers((prev) =>
        prev.includes(data.chatId) ? prev : [...prev, data.chatId],
      );
    });
    socket.on("stoppedTyping", (data: ISocketTypingData) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.chatId));
    });
    return () => {
      socket.off("typing");
      socket.off("stoppedTyping");
    };
  }, [socket, setTypingUsers, typingUsers]);

  // Handling input change: setting message, typing state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // capturing value in message state
    setMessage(e.target.value);

    // chatId and userId, to send to server for socket typing events
    const chatId = selectedUser;
    const userId = user?._id;

    if (chatId && userId && socket) {
      emitTyping(chatId, userId);
    }

    // Clear timer in typingTimeout if it exists
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set a typing timeout for 5000ms for typing
    typingTimeout.current = setTimeout(() => {
      if (!socket) return;
      socket.emit("stoppedTyping", { chatId, userId });
    }, 5000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files || null;
    if (files && files[0].type.startsWith("image")) {
      setFile(files[0]);
    }
  };

  // send message
  const sendMessage = async (
    e: React.SubmitEvent<HTMLFormElement>,
    message?: string,
    image?: File | null,
  ) => {
    e.preventDefault();

    if (!message?.trim() && !image) return;
    if (!selectedUser) return;

    const token = Cookies.get("token");
    if (!token) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("chatId", selectedUser);
      if (message) {
        formData.append("text", message);
      }
      if (image) {
        formData.append("image", image);
      }
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setMessages((prev) =>
        prev && prev.length > 0 ? [...prev, data.message] : [data.message],
      );
      setMessage("");
      setFile(null);
    } catch (error) {
      logAxiosError(error, "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="flex gap-2 w-full ml-auto mt-auto px-10 mb-5"
      onSubmit={(e) => sendMessage(e, message ?? "", file)}
    >
      <Input
        className="rounded-xl"
        type="text"
        placeholder={file ? `Add a caption` : "Send a message"}
        value={message || ""}
        onChange={(e) => handleChange(e)}
      />
      {/* ATTACH FILES BUTTON */}
      <div>
        <Button
          variant="outline"
          className="rounded-full"
          type="button"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="-rotate-45" />
        </Button>
        <Input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e)}
        ></Input>
      </div>
      {/* SUBMIT BUTTON */}
      <Button
        className="rounded-full bg-primary/90 hover:bg-primary
        disabled:cursor-not-allowed"
        type="submit"
        disabled={IsLoading || (!message && !file)}
      >
        {IsLoading && <Loader2 className="animate-spin" />}
        {!IsLoading && <SendHorizonal />}
      </Button>
    </form>
  );
};
export default MessageInput;
