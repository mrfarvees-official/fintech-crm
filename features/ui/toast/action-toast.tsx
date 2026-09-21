"use client";
import { useEffect, useRef } from "react";
import { useToast } from "./toast-context";

export type ActionToastState =
  | { denied?: boolean; message?: string }
  | undefined;

export function ActionToast({ state }: { state: ActionToastState }) {
  const { toast } = useToast();
  const last = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!state?.message || state.message === last.current) return;
    last.current = state.message;
    toast(state.message, state.denied ? "error" : "success");
  }, [state, toast]);

  return null;
}
