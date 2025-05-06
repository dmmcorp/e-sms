"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// 5 * 60 * 1000; = 5minutes
// 4 * 60 * 1000; = 4minutes
// MS based. 1000 = 1 seconds
// 10 * 1000 = 10 seconds
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const GRACE_PERIOD_MS = 30 * 1000; // 30 seconds warning period

export const AutoLogout = () => {
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  console.log("Grace Timer Ref:", graceTimerRef);
  console.log("Inactivity Timer Ref:", inactivityTimerRef);

  const performLogout = useCallback(() => {
    console.log("Grace period expired or logout confirmed, logging out...");
    setShowWarningDialog(false);
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    signOut().then(() => {
      router.push("/");
    });
  }, [signOut, router]);

  const handleInactivityTimeout = useCallback(() => {
    console.log("Inactivity detected, showing warning...");
    setShowWarningDialog(true);
    // grace period timer
    graceTimerRef.current = setTimeout(performLogout, GRACE_PERIOD_MS);
  }, [performLogout]);

  const resetTimersAndHideWarning = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }

    setShowWarningDialog(false);

    if (isAuthenticated) {
      inactivityTimerRef.current = setTimeout(
        handleInactivityTimeout,
        INACTIVITY_TIMEOUT_MS
      );
    }
  }, [isAuthenticated, handleInactivityTimeout]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
      }
      setShowWarningDialog(false);
      return;
    }

    resetTimersAndHideWarning();

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    const eventListener = () => {
      resetTimersAndHideWarning();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, eventListener);
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, eventListener);
      });
    };
  }, [resetTimersAndHideWarning, isAuthenticated, isLoading]);

  return (
    <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you still there?</AlertDialogTitle>
          <AlertDialogDescription>
            You've been inactive for a while. You will be logged out soon for
            security reasons. Note: Click or move the mouse to cancel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={performLogout}>
            Log Out Now
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
