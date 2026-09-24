import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'rceipt:receipts';

export interface ReceiptItem {
  id: string;
  name: string;
  qty: string;
  unitPrice: string;
  description: string;
  imageUri: string | null;
}

export interface Receipt {
  id: string;
  name: string; // what shows on the Home grid — the customer name from create-receipt
  date: string; // ISO string — format for display wherever it's shown, don't store a formatted string
  thumbnailUri: string | null; // the scanned receipt photo, if one was attached
  customerEmail: string;
  shipTo: string;
  paymentMethod: string;
  taxPercent: number;
  total: number;
  items: ReceiptItem[];
}

interface ReceiptsContextValue {
  receipts: Receipt[];
  isLoading: boolean;
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceipt: (id: string, receipt: Receipt) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
}

const ReceiptsContext = createContext<ReceiptsContextValue | undefined>(undefined);

/**
 * ReceiptsProvider
 * -----------------
 * Wrap the whole app in this (in app/_layout.tsx) so every screen shares
 * the same receipts list instead of each screen holding its own copy.
 * Loads whatever was saved from a previous session once, on mount, and
 * persists to AsyncStorage on every write.
 *
 * This is intentionally simple — one JSON blob under one key, rewritten
 * in full on every change. That's fine at the scale of "one person's
 * receipts on their own phone." If this project ever needs to handle a
 * genuinely large number of receipts, or multiple devices/sync, this is
 * the file that would need to become a real database (e.g. expo-sqlite)
 * or move to a real backend — but there's no reason to build that now
 * for a problem you don't have yet.
 */
export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setReceipts(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load receipts from storage:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const addReceipt = async (receipt: Receipt) => {
    // New receipts go first, so a receipt shows up at the top of
    // "Recent Receipts" immediately after creating it.
    const updated = [receipt, ...receipts];
    setReceipts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save receipt to storage:', error);
    }
  };

  const updateReceipt = async (id: string, updatedReceipt: Receipt) => {
    const updated = receipts.map((receipt) => (receipt.id === id ? updatedReceipt : receipt));
    setReceipts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update receipt in storage:', error);
    }
  };

  const deleteReceipt = async (id: string) => {
    const updated = receipts.filter((receipt) => receipt.id !== id);
    setReceipts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete receipt from storage:', error);
    }
  };

  return (
    <ReceiptsContext.Provider value={{ receipts, isLoading, addReceipt, updateReceipt, deleteReceipt }}>
      {children}
    </ReceiptsContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptsContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
}
