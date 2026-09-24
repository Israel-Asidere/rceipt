import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Receipt } from '../contexts/ReceiptsContext';
import ReceiptMiniPreview from './ReceiptMiniPreview';

export interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

/**
 * ReceiptCard
 * -----------
 * One tile in the "Recent Receipts" grid. Now driven directly by the
 * Receipt type from ReceiptsContext — thumbnailUri is a plain string (or
 * null) since it comes from real storage, not a require()'d asset, so it
 * always gets wrapped in `{ uri: ... }` rather than passed straight to
 * Image's source prop. `date` is stored as an ISO string (so it sorts
 * and serializes cleanly); formatting for display happens here, at the
 * one place it's actually shown, rather than storing a pre-formatted
 * string that would need to change if the display format ever does.
 */
export default function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const formattedDate = new Date(receipt.date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.thumbnailWrapper}>
        {receipt.thumbnailUri ? (
          <Image source={{ uri: receipt.thumbnailUri }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          // Most receipts are made via Create Receipt, not Scan Receipt,
          // so most won't have a real photo — this mini printed-receipt
          // look is the default rather than a blank gray box.
          <ReceiptMiniPreview receipt={receipt} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{receipt.name}</Text>
      <Text style={styles.date}>{formattedDate}</Text>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  thumbnailWrapper: {
    backgroundColor: '#d8d8d8',
    borderRadius: 6,
    overflow: 'hidden',
    aspectRatio: 0.78,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  date: {
    marginTop: 2,
    fontSize: 12,
    color: '#33502E',
  },
});
