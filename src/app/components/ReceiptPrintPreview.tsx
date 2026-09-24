import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { Receipt } from '../contexts/ReceiptsContext';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * ReceiptPrintPreview
 * --------------------
 * Renders receipt data styled to look like a physical printed receipt —
 * this is the visual centerpiece both the post-creation confirmation
 * screen and the receipt detail screen are built around.
 *
 * The business logo/name at the top is a placeholder — there's no
 * concept of "the user's business profile" anywhere in this app yet.
 * Once one exists (a Settings field for business name/logo, say), swap
 * the placeholder View + hardcoded text below for real data.
 */
export default function ReceiptPrintPreview({ receipt }: { receipt: Receipt }) {
  const formattedDate = new Date(receipt.date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = new Date(receipt.date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = receipt.items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  return (
    <View style={styles.card}>
      <View style={styles.logoPlaceholder}>
        <Ionicons name="storefront-outline" size={22} color="#999" />
      </View>
      <Text style={styles.businessName}>Your Business Name</Text>

      <Text style={styles.receiptTitle}>RECEIPT</Text>
      <Text style={styles.dateTime}>
        {formattedDate}  {formattedTime}
      </Text>

      <View style={styles.dashedLine} />

      {receipt.items.map((item) => {
        const qty = parseFloat(item.qty) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        return (
          <View key={item.id} style={styles.itemLine}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemAmount}>₦{formatCurrency(qty * price)}</Text>
          </View>
        );
      })}

      <View style={styles.dashedLine} />

      <View style={styles.itemLine}>
        <Text style={styles.subtotalLabel}>Subtotal</Text>
        <Text style={styles.subtotalAmount}>₦{formatCurrency(subtotal)}</Text>
      </View>
      <View style={styles.itemLine}>
        <Text style={styles.subtotalLabel}>Tax ({receipt.taxPercent}%)</Text>
        <Text style={styles.subtotalAmount}>₦{formatCurrency(receipt.total - subtotal)}</Text>
      </View>

      <View style={styles.dashedLine} />

      <View style={styles.itemLine}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>₦{formatCurrency(receipt.total)}</Text>
      </View>

      <Text style={styles.thankYou}>Thank You For Shopping!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 20,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  businessName: { fontSize: 12, color: '#999', marginBottom: 16 },
  receiptTitle: { fontSize: 16, fontWeight: '700', letterSpacing: 2, color: '#333' },
  dateTime: { fontSize: 11, color: '#999', marginTop: 4, marginBottom: 12 },
  dashedLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginVertical: 8,
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 3,
  },
  itemName: { fontSize: 12, color: '#333', flexShrink: 1, marginRight: 8 },
  itemAmount: { fontSize: 12, color: '#333' },
  subtotalLabel: { fontSize: 12, color: '#666' },
  subtotalAmount: { fontSize: 12, color: '#666' },
  totalLabel: { fontSize: 13, fontWeight: '700', color: '#333' },
  totalAmount: { fontSize: 13, fontWeight: '700', color: '#333' },
  thankYou: { fontSize: 11, color: '#999', marginTop: 16, fontStyle: 'italic' },
});
