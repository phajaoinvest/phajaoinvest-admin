/**
 * Stocks Store
 * Manages stock data with API integration
 */

import { create } from "zustand";
import { stocksApi, stockPicksAdminApi } from "@/lib/api";
import { StockPickStatus } from "@/lib/types/common";
import type {
  Stock,
  StockPick,
  StockFilters,
  StockPickFilters,
  PaginationParams,
  PaginationMeta,
} from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

interface StocksState {
  // Stocks data
  stocks: Stock[];
  currentStock: Stock | null;
  stocksPagination: PaginationMeta;
  stocksFilters: StockFilters;

  // Stock picks data
  stockPicks: StockPick[];
  currentStockPick: StockPick | null;
  stockPicksPagination: PaginationMeta;
  stockPicksFilters: StockPickFilters;
  pendingApprovals: StockPick[];

  // Loading states
  isLoading: boolean;
  isLoadingPicks: boolean;
  isLoadingPending: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error
  error: string | null;

  // Stock actions
  fetchStocks: (params?: PaginationParams & StockFilters) => Promise<void>;
  fetchStockById: (id: string) => Promise<Stock | null>;
  createStock: (data: Parameters<typeof stocksApi.create>[0]) => Promise<Stock>;
  updateStock: (
    id: string,
    data: Parameters<typeof stocksApi.update>[1]
  ) => Promise<Stock>;
  deleteStock: (id: string) => Promise<void>;
  setStocksFilters: (filters: Partial<StockFilters>) => void;

  // Stock picks actions
  fetchStockPicks: (
    params?: PaginationParams & StockPickFilters
  ) => Promise<void>;
  fetchPendingApprovals: () => Promise<void>;
  createStockPick: (
    data: Parameters<typeof stockPicksAdminApi.create>[0]
  ) => Promise<StockPick>;
  updateStockPick: (
    id: string,
    data: Parameters<typeof stockPicksAdminApi.update>[1]
  ) => Promise<StockPick>;
  deleteStockPick: (id: string) => Promise<void>;
  approveStockPick: (id: string) => Promise<void>;
  rejectStockPick: (id: string, reason: string) => Promise<void>;
  setStockPicksFilters: (filters: Partial<StockPickFilters>) => void;

  // Common actions
  clearError: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialStocksFilters: StockFilters = {};
const initialStockPicksFilters: StockPickFilters = {};
const initialPagination: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

// ============================================================================
// Store
// ============================================================================

export const useStocksStore = create<StocksState>((set, get) => ({
  // Initial state
  stocks: [],
  currentStock: null,
  stocksPagination: initialPagination,
  stocksFilters: initialStocksFilters,
  stockPicks: [],
  currentStockPick: null,
  stockPicksPagination: initialPagination,
  stockPicksFilters: initialStockPicksFilters,
  pendingApprovals: [],
  isLoading: false,
  isLoadingPicks: false,
  isLoadingPending: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // ========== Stock Actions ==========

  fetchStocks: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const { stocksFilters } = get();
      const response = await stocksApi.getAll({ ...stocksFilters, ...params });

      set({
        stocks: response.data,
        stocksPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      const message =
        (error as { message?: string })?.message || "Failed to fetch stocks";
      set({ error: message, isLoading: false });
    }
  },

  fetchStockById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await stocksApi.getById(id);
      set({ currentStock: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const message =
        (error as { message?: string })?.message || "Failed to fetch stock";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createStock: async (data) => {
    set({ isCreating: true, error: null });

    try {
      const response = await stocksApi.create(data);
      set((state) => ({
        stocks: [response.data, ...state.stocks],
        isCreating: false,
      }));
      return response.data;
    } catch (error) {
      const message =
        (error as { message?: string })?.message || "Failed to create stock";
      set({ error: message, isCreating: false });
      throw error;
    }
  },

  updateStock: async (id, data) => {
    set({ isUpdating: true, error: null });

    try {
      const response = await stocksApi.update(id, data);
      set((state) => ({
        stocks: state.stocks.map((s) => (s.id === id ? response.data : s)),
        currentStock:
          state.currentStock?.id === id ? response.data : state.currentStock,
        isUpdating: false,
      }));
      return response.data;
    } catch (error) {
      const message =
        (error as { message?: string })?.message || "Failed to update stock";
      set({ error: message, isUpdating: false });
      throw error;
    }
  },

  deleteStock: async (id) => {
    set({ isDeleting: true, error: null });

    try {
      await stocksApi.delete(id);
      set((state) => ({
        stocks: state.stocks.filter((s) => s.id !== id),
        currentStock: state.currentStock?.id === id ? null : state.currentStock,
        isDeleting: false,
      }));
    } catch (error) {
      const message =
        (error as { message?: string })?.message || "Failed to delete stock";
      set({ error: message, isDeleting: false });
      throw error;
    }
  },

  setStocksFilters: (filters) => {
    set((state) => ({
      stocksFilters: { ...state.stocksFilters, ...filters },
    }));
  },

  // ========== Stock Picks Actions ==========

  fetchStockPicks: async (params) => {
    set({ isLoadingPicks: true, error: null });

    try {
      const { stockPicksFilters } = get();
      const response = await stockPicksAdminApi.getAll({
        ...stockPicksFilters,
        ...params,
      });

      set({
        stockPicks: response.data,
        stockPicksPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoadingPicks: false,
      });
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to fetch stock picks";
      set({ error: message, isLoadingPicks: false });
    }
  },

  fetchPendingApprovals: async () => {
    set({ isLoadingPending: true, error: null });

    try {
      const response = await stockPicksAdminApi.getPendingApprovals();
      set({ pendingApprovals: response.data, isLoadingPending: false });
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to fetch pending approvals";
      set({ error: message, isLoadingPending: false });
    }
  },

  createStockPick: async (data) => {
    set({ isCreating: true, error: null });

    try {
      const response = await stockPicksAdminApi.create(data);
      set((state) => ({
        stockPicks: [response.data, ...state.stockPicks],
        isCreating: false,
      }));
      return response.data;
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to create stock pick";
      set({ error: message, isCreating: false });
      throw error;
    }
  },

  updateStockPick: async (id, data) => {
    set({ isUpdating: true, error: null });

    try {
      const response = await stockPicksAdminApi.update(id, data);
      set((state) => ({
        stockPicks: state.stockPicks.map((sp) =>
          sp.id === id ? response.data : sp
        ),
        currentStockPick:
          state.currentStockPick?.id === id
            ? response.data
            : state.currentStockPick,
        isUpdating: false,
      }));
      return response.data;
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to update stock pick";
      set({ error: message, isUpdating: false });
      throw error;
    }
  },

  deleteStockPick: async (id) => {
    set({ isDeleting: true, error: null });

    try {
      await stockPicksAdminApi.delete(id);
      set((state) => ({
        stockPicks: state.stockPicks.filter((sp) => sp.id !== id),
        currentStockPick:
          state.currentStockPick?.id === id ? null : state.currentStockPick,
        isDeleting: false,
      }));
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to delete stock pick";
      set({ error: message, isDeleting: false });
      throw error;
    }
  },

  approveStockPick: async (id) => {
    set({ isUpdating: true, error: null });

    try {
      await stockPicksAdminApi.approve(id);
      set((state) => ({
        pendingApprovals: state.pendingApprovals.filter((sp) => sp.id !== id),
        stockPicks: state.stockPicks.map(
          (sp): StockPick =>
            sp.id === id ? { ...sp, status: StockPickStatus.APPROVED } : sp
        ),
        isUpdating: false,
      }));
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to approve stock pick";
      set({ error: message, isUpdating: false });
      throw error;
    }
  },

  rejectStockPick: async (id, reason) => {
    set({ isUpdating: true, error: null });

    try {
      await stockPicksAdminApi.reject(id, reason);
      set((state) => ({
        pendingApprovals: state.pendingApprovals.filter((sp) => sp.id !== id),
        stockPicks: state.stockPicks.map(
          (sp): StockPick =>
            sp.id === id ? { ...sp, status: StockPickStatus.REJECTED } : sp
        ),
        isUpdating: false,
      }));
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to reject stock pick";
      set({ error: message, isUpdating: false });
      throw error;
    }
  },

  setStockPicksFilters: (filters) => {
    set((state) => ({
      stockPicksFilters: { ...state.stockPicksFilters, ...filters },
    }));
  },

  // ========== Common Actions ==========

  clearError: () => {
    set({ error: null });
  },
}));
