import { StyleSheet, Text, View } from 'react-native';
import type { Receipt } from '../contexts/ReceiptsContext';
import { formatCurrency } from '../utils/formatCurrency';

const MAX_VISIBLE_ITEMS = 3;

/**
 * ReceiptMiniPreview
 * --------------------
 * Used as the default thumbnail on ReceiptCard when no scanned photo
 * (receipt.thumbnailUri) exists — which is most receipts, since only
 * ones made via Scan Receipt have a real photo attached.
 *
 * Deliberately a separate, hand-sized component rather than
 * ReceiptPrintPreview shrunk with a transform — ReceiptPrintPreview's
 * font sizes (11-16px) and padding (20px) are tuned for a full-width
 * card; scaling that down to thumbnail size makes text unreadable and
 * RN's transform:scale doesn't reflow layout to compensate. This
 * version uses its own much smaller type scale from the start.
 */
export default function ReceiptMiniPreview({ receipt }: { receipt: Receipt }) {
  const visibleItems = receipt.items.slice(0, MAX_VISIBLE_ITEMS);
  const remainingCount = receipt.items.length - visibleItems.length;

  return (
    <View style={styles.container}>
      <Text style={styles.businessName} numberOfLines={1}>
        Your Business Name
      </Text>
      <Text style={styles.receiptTitle}>RECEIPT</Text>

      <View style={styles.dashedLine} />

      {visibleItems.map((item) => (
        <Text key={item.id} style={styles.itemLine} numberOfLines={1}>
          {item.name}
        </Text>
      ))}
      {remainingCount > 0 && <Text style={styles.moreText}>+{remainingCount} more</Text>}

      <View style={styles.dashedLine} />

      <Text style={styles.totalText}>₦{formatCurrency(receipt.total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  businessName: { fontSize: 7, color: '#999', marginBottom: 2 },
  receiptTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: '#333', marginBottom: 6 },
  dashedLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginVertical: 4,
  },
  itemLine: { fontSize: 8, color: '#555', alignSelf: 'stretch' },
  moreText: { fontSize: 8, color: '#999', fontStyle: 'italic', marginTop: 2 },
  totalText: { fontSize: 10, fontWeight: '700', color: '#333', marginTop: 4 },
});
