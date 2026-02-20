import { Button } from "@/components/shadcn_ui/button";
import { Input } from "@/components/shadcn_ui/input";
import { SendHorizonal } from "lucide-react";
import { IMessage } from "../page";
import { Dispatch, SetStateAction } from "react";
import { logAxiosError } from "@/lib/logAxiosError";
import axios from "axios";
import Cookies from "js-cookie";

interface IMessageInput {
  selectedUser: string | null;
  message: string | null;
  setMessage: Dispatch<SetStateAction<string | null>>;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  setMessages,
}: IMessageInput) => {
  // send message
  const sendMessage = async (
    e: React.SubmitEvent<HTMLFormElement>,
    message?: string,
    image?: File | null,
  ) => {
    e.preventDefault();

    if ((!message || !message.trim()) && !image) return;
    if (!selectedUser) return;

    const token = Cookies.get("token");
    if (!token) return;
    try {
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
    } catch (error) {
      logAxiosError(error, "Failed to send message");
    }
  };

  return (
    <form
      className="flex gap-2 w-[80%] ml-auto mt-auto px-10 mb-5"
      onSubmit={(e) => (message ? sendMessage(e, message) : "")}
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
  );
};
export default MessageInput;
