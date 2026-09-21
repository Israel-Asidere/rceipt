import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePickerField from '../components/DatePickerField';
import FormInput from '../components/FormInput';
import { useReceipts } from '../contexts/ReceiptsContext';
import { colors, globalStyles } from '../styles/global';
import { formatCurrency } from '../utils/formatCurrency';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const ACTIVE = '#4C7A3B';
const ADD_ITEM_BLUE = '#3F51B5';
const DONE_BG = '#C8E6C9';

// Fixed VAT rate — no longer user-editable, so this is a plain constant
// rather than state. If this ever needs to vary (e.g. per business, or
// per region), it becomes a real input again; until then a constant is
// simpler and can't accidentally be typed into something invalid.
const TAX_PERCENT = 7.5;

interface ReceiptItem {
  id: string;
  name: string;
  qty: string;
  unitPrice: string;
  description: string;
  imageUri: string | null;
}

const SHIP_TO_OPTIONS = ['Enter Address', 'Pickup In Store'];
const PAYMENT_METHOD_OPTIONS = ['Cash', 'Card', 'Bank Transfer', 'Mobile Money'];

/**
 * SelectField
 * -----------
 * Ship To / Payment Method dropdowns. Kept inline here (not extracted)
 * since it's identical between both versions being merged — no reason
 * to touch it.
 */
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = value.length > 0;

  return (
    <>
      <TouchableOpacity
        style={[styles.input, styles.selectInput, { borderColor: isActive ? ACTIVE : colors.textPrimary }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{ fontSize: 15, color: isActive ? ACTIVE : colors.textPrimary }}>{value || label}</Text>
        <Ionicons name="chevron-down" size={18} color={isActive ? ACTIVE : colors.textPrimary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                  {item === value && <Ionicons name="checkmark" size={18} color={ACTIVE} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function CreateReceiptScreen() {
  const { addReceipt } = useReceipts();
  const params = useLocalSearchParams<{ photoUri?: string }>();
  const receiptPhotoUri = typeof params.photoUri === 'string' ? params.photoUri : undefined;

  const [date, setDate] = useState<Date>(() => new Date());
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shipToOption, setShipToOption] = useState('');
  const [shipToAddress, setShipToAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [items, setItems] = useState<ReceiptItem[]>([
    { id: makeId(), name: '', qty: '', unitPrice: '', description: '', imageUri: null },
  ]);
  const [itemsExpanded, setItemsExpanded] = useState(true);

  const updateItem = (id: string, field: keyof ReceiptItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: makeId(), name: '', qty: '', unitPrice: '', description: '', imageUri: null },
    ]);

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const handlePickItemImage = async (id: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      updateItem(id, 'imageUri', result.assets[0].uri);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const taxAmount = subtotal * (TAX_PERCENT / 100);
  const total = subtotal + taxAmount;
  const formattedTotal = formatCurrency(total);

  const handleSave = async () => {
    if (!customerName.trim()) {
      Alert.alert('Missing name', 'Enter a customer name before saving.');
      return;
    }
    const validItems = items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      Alert.alert('No items', 'Add at least one item before saving.');
      return;
    }
    if (shipToOption === 'Enter Address' && !shipToAddress.trim()) {
      Alert.alert('Missing address', 'Enter the shipping address, or choose Pickup In Store instead.');
      return;
    }

    // Resolve what actually gets saved: the typed address if that option
    // was chosen, otherwise the option itself ("Pickup In Store"). Never
    // save the literal words "Enter Address" — that's just the picker
    // label, not a real shipping destination.
    const shipTo = shipToOption === 'Enter Address' ? shipToAddress.trim() : shipToOption;

    // Field names here (`name`, `thumbnailUri`) match what ReceiptCard on
    // Home expects directly — no separate mapping step needed between
    // "what create-receipt collects" and "what the grid displays".
    const newReceiptId = makeId();
    await addReceipt({
      id: newReceiptId,
      name: customerName.trim(),
      date: date.toISOString(),
      thumbnailUri: receiptPhotoUri ?? null,
      customerEmail: customerEmail.trim(),
      shipTo,
      paymentMethod,
      taxPercent: TAX_PERCENT,
      total,
      items: validItems,
    });

    router.replace(`/receipt-created/${newReceiptId}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={globalStyles.backRowHeader}>
        <TouchableOpacity onPress={() => router.back()} style={globalStyles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Create Receipt</Text>

        {receiptPhotoUri && (
          <Image source={{ uri: receiptPhotoUri }} style={styles.receiptPhoto} resizeMode="cover" />
        )}

        <View style={styles.row}>
          <View style={[styles.rowInputSmall, { zIndex: 20 }]}>
            <DatePickerField
              label="Date"
              value={date}
              onChange={setDate}
              dropdownWidth={320}
            />
          </View>
          <View style={styles.rowInputLarge}>
            <FormInput label="Customer Name" value={customerName} onChangeText={setCustomerName} />
          </View>
        </View>

        <FormInput
          label="Customer Email"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
        />

        {/* ---- Item Details accordion ---- */}
        <TouchableOpacity
          style={[styles.sectionHeader, { borderColor: itemsExpanded ? ACTIVE : colors.surface }]}
          onPress={() => setItemsExpanded((prev) => !prev)}
        >
          <Text style={[styles.sectionHeaderText, { color: colors.textPrimary }]}>
            Item Details
          </Text>
          <Ionicons
            name={itemsExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={itemsExpanded ? ACTIVE : colors.textPrimary}
          />
        </TouchableOpacity>

        {itemsExpanded && (
          <View style={[styles.itemsPanel, { borderColor: ACTIVE }]}>
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemIndex}>{index + 1}.</Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    style={styles.itemRemoveButton}
                  >
                    {items.length > 1 ? (
                      <Ionicons name="close-circle-outline" size={20} color={colors.alert} />
                    ) : null}
                  </TouchableOpacity>
                </View>

                <View style={styles.itemRow}>
                  <View style={styles.itemNameInput}>
                    <FormInput
                      label="Item Name"
                      required
                      value={item.name}
                      onChangeText={(t) => updateItem(item.id, 'name', t)}
                    />
                  </View>
                  <View style={styles.itemQtyInput}>
                    <FormInput
                      label="Qty"
                      required
                      value={item.qty}
                      onChangeText={(t) => updateItem(item.id, 'qty', t)}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.itemPriceInput}>
                    <FormInput
                      label="Unit Price"
                      required
                      value={item.unitPrice}
                      onChangeText={(t) => updateItem(item.id, 'unitPrice', t)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <FormInput
                  label="Description"
                  value={item.description}
                  onChangeText={(t) => updateItem(item.id, 'description', t)}
                  multiline
                />

                <TouchableOpacity
                  style={[styles.selectImageButton, item.imageUri && { borderColor: ACTIVE }]}
                  onPress={() => handlePickItemImage(item.id)}
                >
                  {item.imageUri ? (
                    <>
                      <Image source={{ uri: item.imageUri }} style={styles.itemThumbnail} />
                      <Text style={[styles.selectImageText, { color: ACTIVE }]} numberOfLines={1}>
                        {item.imageUri.split('/').pop()}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={18} color={colors.textPrimary} />
                      <Text style={styles.selectImageText}>Select Image</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.itemsPanelActions}>
              <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addItemButtonText}>Add New Item</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneButton} onPress={() => setItemsExpanded(false)}>
                <Ionicons name="checkmark" size={18} color={ACTIVE} />
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <SelectField label="Ship To" value={shipToOption} options={SHIP_TO_OPTIONS} onChange={setShipToOption} />
        {shipToOption === 'Enter Address' && (
          <>
            <View style={{ height: 12 }} />
            <FormInput
              label="Shipping Address"
              value={shipToAddress}
              onChangeText={setShipToAddress}
            />
          </>
        )}
        <View style={{ height: 12 }} />
        <SelectField
          label="Payment Method"
          value={paymentMethod}
          options={PAYMENT_METHOD_OPTIONS}
          onChange={setPaymentMethod}
        />

        <View style={[styles.row, { marginTop: 10 }]}>
          <View style={[styles.rowInputSmall, styles.vatLabelWrapper]}>
            <Text style={styles.vatLabelText}>VAT (7.5%)</Text>
          </View>
          <View style={[styles.input, styles.rowInputLarge, styles.totalDisplay, { height: 40 }]}>
            <Text style={styles.totalDisplayText}>
              {total > 0 ? `₦${formattedTotal}` : 'Total'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleSave}>
          <Text style={styles.createButtonText}>CREATE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { paddingBottom: 40 },

  backText: { fontSize: 16, color: '#fff' },

  body: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },

  receiptPhoto: { width: '100%', height: 160, borderRadius: 8, marginBottom: 16 },

  row: { flexDirection: 'row', gap: 8, marginBottom: 0 },
  rowInputSmall: { flex: 1 },
  rowInputLarge: { flex: 2 },

  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputMultiline: { minHeight: 44, textAlignVertical: 'top' },

  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionHeaderText: { fontSize: 14, fontWeight: '600' },

  itemsPanel: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#ECECEC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surface,
    padding: 10,
  },
  itemCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  itemIndex: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  itemRemoveButton: { padding: 2 },
  itemRow: { flexDirection: 'row', gap: 6 },
  itemNameInput: { flex: 2 },
  itemQtyInput: { flex: 1 },
  itemPriceInput: { flex: 1 },

  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  itemThumbnail: { width: 24, height: 24, borderRadius: 4 },
  selectImageText: { fontSize: 13, color: colors.textPrimary, maxWidth: 140 },

  itemsPanelActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ADD_ITEM_BLUE,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addItemButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DONE_BG,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  doneButtonText: { color: ACTIVE, fontWeight: '600', fontSize: 13 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '50%',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  modalOptionText: { fontSize: 15, color: colors.textPrimary },

  totalDisplay: { justifyContent: 'center' },
  totalDisplayText: { fontSize: 17, color: colors.textPrimary, fontWeight: '600' },

  vatLabelWrapper: { justifyContent: 'center', height: 40 },
  vatLabelText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },

  createButton: {
    backgroundColor: ACTIVE,
    borderRadius: 3,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
