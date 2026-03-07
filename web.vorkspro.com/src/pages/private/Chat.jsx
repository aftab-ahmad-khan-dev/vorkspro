import React, { useEffect, useMemo, useState } from "react";
import { Search, Check, CheckCheck, Circle, Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import ProfilePicture from "@/components/ProfilePicture";
import {
  fetchConversations,
  searchChatUsers,
  getOrCreateDirectConversation,
  fetchMessages,
  sendMessage,
  markConversationRead,
} from "@/api/chat";
import { jwtDecode } from "jwt-decode";
import { getAppSocket } from "@/utils/socket";

function TickIcon({
  deliveredTo = [],
  readBy = [],
  participants = [],
  currentUserId,
}) {
  const otherIds = useMemo(
    () =>
      participants
        .map((id) => String(id))
        .filter((id) => id !== String(currentUserId)),
    [participants, currentUserId],
  );
  const deliveredStrs = (deliveredTo || []).map((id) => String(id));
  const readStrs = (readBy || []).map((id) => String(id));

  const allDelivered =
    otherIds.length > 0 && otherIds.every((id) => deliveredStrs.includes(id));
  const allRead =
    otherIds.length > 0 && otherIds.every((id) => readStrs.includes(id));

  if (allRead) {
    return (
      <CheckCheck className='h-4 w-4 shrink-0 text-blue-400' aria-label='Read' />
    );
  }
  if (allDelivered) {
    return (
      <CheckCheck className='h-4 w-4 shrink-0 opacity-90' aria-label='Delivered' />
    );
  }
  return <Check className='h-4 w-4 shrink-0 opacity-90' aria-label='Sent' />;
}

export default function Chat() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const currentUserId = decoded?._id || decoded?.userId || decoded?.id || null;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [presence, setPresence] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);

  // Load conversations
  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch(() => {});
  }, []);

  // Setup socket connection & listeners
  useEffect(() => {
    if (!token) return;
    const s = getAppSocket(token);

    if (currentUserId) {
      s.emit("join", currentUserId);
    }

    const handlePresence = ({ userId, online }) => {
      setPresence((prev) => ({
        ...prev,
        [userId]: { ...(prev[userId] || {}), online },
      }));
    };

    const handleChatMessage = (msg) => {
      setMessages((prev) =>
        msg.conversation === activeConversation?._id ? [...prev, msg] : prev,
      );
    };

    const handleChatRead = ({ conversationId, userId }) => {
      if (conversationId !== activeConversation?._id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.sender._id === currentUserId
            ? {
                ...m,
                readBy: m.readBy?.includes(userId)
                  ? m.readBy
                  : [...(m.readBy || []), userId],
              }
            : m,
        ),
      );
    };

    s.on("presence:update", handlePresence);
    s.on("chat:message", handleChatMessage);
    s.on("chat:read", handleChatRead);

    return () => {
      s.off("presence:update", handlePresence);
      s.off("chat:message", handleChatMessage);
      s.off("chat:read", handleChatRead);
    };
  }, [token, currentUserId, activeConversation?._id]);

  useEffect(() => {
    const close = (e) => {
      if (
        showEmoji &&
        !e.target.closest(".chat-emoji-picker") &&
        !e.target.closest(".chat-emoji-btn")
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showEmoji]);

  const openConversation = async (conv) => {
    try {
      setActiveConversation(conv);
      const s = getAppSocket(token);
      s.emit("chat:joinConversation", conv._id);
      const msgs = await fetchMessages(conv._id);
      setMessages(msgs || []);
      await markConversationRead(conv._id);
    } catch (err) {
      console.error("Failed to open conversation", err);
    }
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    const users = await searchChatUsers(value.trim());
    setSearchResults(users);
  };

  const startDirectChat = async (targetUser) => {
    try {
      const conv = await getOrCreateDirectConversation(targetUser._id);
      if (!conv) return;
      const participantsFull = conv.participants || [];
      const participantIds = participantsFull.map((p) => p._id || p);
      const normalized = { ...conv, participants: participantsFull, participantIds };
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === normalized._id);
        if (exists) return prev;
        return [normalized, ...prev];
      });
      setSearchResults([]);
      setSearchTerm("");
      openConversation(normalized);
    } catch (err) {
      console.error("Failed to start direct chat", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;
    const body = messageInput.trim();
    setMessageInput("");
    try {
      await sendMessage(activeConversation._id, body);
      // Message will appear via socket `chat:message`
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const activeParticipantIds =
    activeConversation?.participantIds ||
    activeConversation?.participants?.map((p) => p._id || p) ||
    [];
  const otherParticipantId =
    activeConversation &&
    activeParticipantIds.find((p) => String(p) !== String(currentUserId));
  const otherParticipant =
    activeConversation && Array.isArray(activeConversation.participants)
      ? activeConversation.participants.find(
          (p) => String(p._id || p) === String(otherParticipantId),
        ) || null
      : null;
  const listConversation = activeConversation?._id
    ? conversations.find(
        (conv) => String(conv._id) === String(activeConversation._id),
      )
    : null;
  const listOtherUser =
    listConversation &&
    Array.isArray(listConversation.participants) &&
    otherParticipantId
      ? listConversation.participants.find(
          (p) => String(p._id || p) === String(otherParticipantId),
        )
      : null;
  const recipientName =
    activeConversation?.title ||
    (otherParticipant && typeof otherParticipant === "object"
      ? `${otherParticipant.firstName || ""} ${otherParticipant.lastName || ""}`.trim() ||
        otherParticipant.email ||
        "Unknown"
      : listOtherUser && typeof listOtherUser === "object"
        ? `${listOtherUser.firstName || ""} ${listOtherUser.lastName || ""}`.trim() ||
          listOtherUser.email ||
          "Unknown"
        : "Direct chat");

  return (
    <div className='h-full flex flex-col md:flex-row gap-4'>
      {/* Sidebar: conversations + search */}
      <div className='w-full md:w-80 border border-[var(--border)] rounded-xl bg-[var(--card)] flex flex-col'>
        <div className='p-3 border-b border-[var(--border)]'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]' />
            <input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Search or start a chat...'
              className='w-full pl-9 pr-3 text-white py-2 text-sm rounded-lg bg-[var(--muted)]/40 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]'
            />
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className='border-b border-[var(--border)] max-h-60 overflow-y-auto'>
            {searchResults.map((u) => (
              <button
                key={u._id}
                onClick={() => startDirectChat(u)}
                className='w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--muted)]/40 text-left'
              >
                <ProfilePicture
                  name={`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}
                  profilePicture={u.profilePicture}
                  size={32}
                />
                <div className='flex-1'>
                  <div className='text-sm font-medium text-[var(--foreground)]'>
                    {u.firstName} {u.lastName}
                  </div>
                  <div className='text-xs text-[var(--muted-foreground)]'>
                    {u.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className='flex-1 overflow-y-auto'>
          {conversations.map((c) => {
            const participantIds =
              c.participantIds ||
              c.participants?.map((p) => (p._id ? p._id : p)) ||
              [];
            const otherId = participantIds.find((id) => id !== currentUserId);
            const isOnline = otherId && presence[otherId]?.online;
            const lastMessageTime = c.lastMessageAt
              ? new Date(c.lastMessageAt).toLocaleTimeString()
              : "";
            const otherUser =
              Array.isArray(c.participants) && otherId
                ? c.participants.find((p) => (p._id || p) === otherId)
                : null;
            const title =
              c.title ||
              (otherUser
                ? `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() ||
                  otherUser.email
                : "Direct chat");

            return (
              <button
                key={c._id}
                onClick={() => openConversation(c)}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--muted)]/30 ${
                  activeConversation?._id === c._id ? "bg-[var(--muted)]/40" : ""
                }`}
              >
                <div className='relative shrink-0'>
                  <ProfilePicture
                    name={title}
                    profilePicture={otherUser?.profilePicture}
                    size={36}
                  />
                  {isOnline && (
                    <span className='absolute -right-0 -bottom-0 h-3 w-3 rounded-full bg-emerald-500 border border-[var(--card)]' />
                  )}
                </div>
                <div className='flex-1 min-w-0 text-left'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-semibold text-[var(--foreground)] truncate'>
                      {title}
                    </span>
                    <span className='text-[10px] text-[var(--muted-foreground)]'>
                      {lastMessageTime}
                    </span>
                  </div>
                  <div className='flex items-center justify-between gap-2 mt-0.5'>
                    <span className='text-xs text-[var(--muted-foreground)] truncate'>
                      {c.lastMessagePreview || "No messages yet"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chat area */}
      <div className='flex-1 border border-[var(--border)] rounded-xl bg-[var(--card)] flex flex-col min-h-[320px]'>
        {activeConversation ? (
          <>
            <div className='px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]'>
              <div className='flex items-center gap-3'>
                <ProfilePicture
                  name={recipientName}
                  profilePicture={otherParticipant?.profilePicture}
                  size={40}
                />
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    {recipientName}
                  </span>
                  {otherParticipantId && (
                    <span className='text-xs text-[var(--muted-foreground)] flex items-center gap-1'>
                      <Circle
                        className={`h-2 w-2 ${
                          presence[otherParticipantId]?.online
                            ? "text-emerald-500"
                            : "text-[var(--muted-foreground)]"
                        }`}
                        fill={
                          presence[otherParticipantId]?.online
                            ? "currentColor"
                            : "none"
                        }
                      />
                      {presence[otherParticipantId]?.online ? "Online" : "Offline"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[var(--background)]/30'>
              {messages.map((m) => {
                const isMine = m.sender?._id === currentUserId;
                const senderName = m.sender
                  ? `${m.sender.firstName || ""} ${m.sender.lastName || ""}`.trim() ||
                    m.sender.email
                  : "User";
                return (
                  <div
                    key={m._id}
                    className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                  >
                    {!isMine && (
                      <ProfilePicture
                        name={senderName}
                        profilePicture={m.sender?.profilePicture}
                        size={28}
                        className='shrink-0'
                      />
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMine
                          ? "bg-[var(--button)] text-[var(--button-foreground)] rounded-br-md"
                          : "bg-[var(--muted)]/90 text-[var(--foreground)] rounded-bl-md"
                      }`}
                    >
                      <div>{m.body}</div>
                      <div className='flex items-center justify-end gap-1 mt-1 text-[10px] opacity-80'>
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          <TickIcon
                            deliveredTo={m.deliveredTo || []}
                            readBy={m.readBy || []}
                            participants={activeParticipantIds}
                            currentUserId={currentUserId}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSend}
              className='p-3 border-t border-[var(--border)] bg-[var(--card)]'
            >
              <div className='flex items-end gap-2 relative'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmoji((prev) => !prev);
                  }}
                  className='chat-emoji-btn h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60 transition-colors'
                  aria-label='Add emoji'
                >
                  <Smile className='h-5 w-5' />
                </button>
                {showEmoji && (
                  <div className='absolute bottom-12 left-0 z-20 chat-emoji-picker'>
                    <EmojiPicker
                      onEmojiClick={(e) => setMessageInput((prev) => prev + e.emoji)}
                      theme={
                        document.documentElement.classList.contains("dark")
                          ? "dark"
                          : "light"
                      }
                      width={320}
                      height={360}
                    />
                  </div>
                )}
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onFocus={() => setShowEmoji(false)}
                  placeholder='Type a message...'
                  className='flex-1 rounded-2xl text-white placeholder:text-white bg-[var(--muted)]/40 border border-[var(--border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50'
                />
                <button
                  type='submit'
                  className='h-9 w-9 shrink-0 rounded-full bg-[var(--button)] text-[var(--button-foreground)] flex items-center justify-center hover:bg-[var(--button)]/90 transition-all hover:scale-105 active:scale-95'
                >
                  <Send className='h-4 w-4' />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-sm text-[var(--muted-foreground)]'>
            Select a conversation or search to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
