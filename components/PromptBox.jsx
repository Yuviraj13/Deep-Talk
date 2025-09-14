"use client";

import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext();

  // Send message on Enter (but allow Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    e?.preventDefault?.();
    const promptCopy = prompt;

    try {
      if (!user) return toast.error("Login to send message");
      if (isLoading) return toast.error("Wait for the previous prompt response");
      if (!selectedChat?._id) return toast.error("No chat selected");

      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt,
        timeStamp: Date.now(),
      };

      // Save user prompt to the correct chat
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );

      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt,
      });

      if (!data.success) {
        toast.error(data.message);
        setPrompt(promptCopy);
        return;
      }

      // Typing effect for assistant response
      const messageTokens = data.data.content.split(" ");
      const baseAssistantMsg = {
        role: "assistant",
        content: "",
        timeStamp: Date.now(),
      };

      // Add an empty assistant message first
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, baseAssistantMsg],
      }));

      // Reveal tokens one by one
      messageTokens.forEach((_, i) => {
        setTimeout(() => {
          setSelectedChat((prev) => {
            const updated = [...prev.messages];
            updated[updated.length - 1] = {
              ...baseAssistantMsg,
              content: messageTokens.slice(0, i + 1).join(" "),
            };
            return { ...prev, messages: updated };
          });
        }, i * 100);
      });
    } catch (error) {
      console.error("ERROR", error);
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepTalk"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {/* Extra options can go here */}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="arrow"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
