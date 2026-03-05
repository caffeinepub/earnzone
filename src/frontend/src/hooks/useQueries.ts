import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, WithdrawalRequest } from "../backend.d";
import { useActor } from "./useActor";

// ── Earnings ────────────────────────────────────────────────────────────────

export function useUserEarnings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userEarnings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserEarnings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodaysEarnings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["todaysEarnings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaysEarnings();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Withdrawals ──────────────────────────────────────────────────────────────

export function useUserWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveWithdrawal(index);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pendingWithdrawals"] });
      void queryClient.invalidateQueries({ queryKey: ["userWithdrawals"] });
    },
  });
}

export function useRejectWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectWithdrawal(index);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pendingWithdrawals"] });
      void queryClient.invalidateQueries({ queryKey: ["userWithdrawals"] });
    },
  });
}

// ── Earn Actions ─────────────────────────────────────────────────────────────

export function useSpinLuckyDraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.spinLuckyDraw();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userEarnings"] });
      void queryClient.invalidateQueries({ queryKey: ["todaysEarnings"] });
    },
  });
}

export function useWatchReel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.watchReel();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userEarnings"] });
      void queryClient.invalidateQueries({ queryKey: ["todaysEarnings"] });
    },
  });
}

export function useSubmitSteps() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (steps: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitSteps(steps);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userEarnings"] });
      void queryClient.invalidateQueries({ queryKey: ["todaysEarnings"] });
    },
  });
}

export function useRequestWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      method,
    }: {
      amount: number;
      method: WithdrawalRequest["method"];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestWithdrawal(amount, method);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userWithdrawals"] });
    },
  });
}
