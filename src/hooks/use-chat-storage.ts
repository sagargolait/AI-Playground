"use client";

import { useEffect } from "react";
import { useChatContext } from "@/contexts/chat-context";
import { openDB } from "idb";

const DB_NAME = "chat-db";
const STORE_NAME = "conversations";

export function useChatStorage() {
  const { state, dispatch } = useChatContext();

  useEffect(() => {
    const initDB = async () => {
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id" });
          }
        },
      });

      const conversations = await db.getAll(STORE_NAME);
      conversations.forEach((conversation) => {
        dispatch({ type: "ADD_CONVERSATION", payload: conversation });
      });
    };

    initDB();
  }, [dispatch]);

  useEffect(() => {
    const saveConversations = async () => {
      const db = await openDB(DB_NAME, 1);
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      await Promise.all(
        state.conversations.map((conversation) => store.put(conversation))
      );
    };

    if (state.conversations.length) {
      saveConversations();
    }
  }, [state.conversations]);
}
