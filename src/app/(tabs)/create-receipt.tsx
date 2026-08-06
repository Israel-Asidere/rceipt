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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, globalStyles } from '../styles/global';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// ---- Colors specific to this screen's active/idle states ----
// These aren't in styles/global.ts yet. If colors.primary already IS
// this exact green, ACTIVE can just become an alias for it — kept
// separate for now since the header green in the mock reads slightly
// darker than the button/active-field green.
const ACTIVE = '#4C7A3B'; // focused border/text, filled-value text, CREATE button
const ADD_ITEM_BLUE = '#3F51B5';
const DONE_BG = '#C8E6C9';
const CALENDAR_BG = '#4D4D4D';
const CALENDAR_CHIP_BG = '#666666';
const CALENDAR_CHIP_FADED_TEXT = '#9E9E9E';

interface ReceiptItem {
  id: string;
  name: string;
  qty: string;
  unitPrice: string;
  description: string;
  imageUri: string | null;
}

const SHIP_TO_OPTIONS = ['Home Address', 'Work Address', 'Pickup In Store'];
const PAYMENT_METHOD_OPTIONS = ['Cash', 'Card', 'Bank Transfer', 'Mobile Money'];

function FormInput({
  label,
  required,
  value,
  onChangeText,
  keyboardType,
  multiline,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.trim().length > 0;
  const isActive = focused || hasValue;
  const showOverlayLabel = !focused && !hasValue;

  return (
    <View style={styles.fieldWrapper}>
      {showOverlayLabel && (
        <View style={styles.overlayLabelRow} pointerEvents="none">
          <Text style={styles.overlayLabelText}>{label}</Text>
          {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          {
            borderColor: isActive ? ACTIVE : colors.surface,
            borderWidth: focused ? 2 : 1,
            color: isActive ? ACTIVE : colors.textPrimary,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused && !hasValue ? label : ''}
        placeholderTextColor={ACTIVE}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

/**
 * SelectField
 * -----------
 * Ship To / Payment Method dropdowns. Same idle-vs-active color rule as
 * FormInput, just driven by "has a selection" instead of focus (there's
 * no keyboard focus on a button).
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
        style={[styles.input, styles.selectInput, { borderColor: isActive ? ACTIVE : colors.surface }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{ fontSize: 15, color: isActive ? ACTIVE : colors.text }}>{value || label}</Text>
        <Ionicons name="chevron-down" size={18} color={isActive ? ACTIVE : colors.textSecondary} />
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



const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
}

function getCalendarDays(viewDate: Date): CalendarDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // getDay() is 0=Sun..6=Sat; shift so 0=Mon..6=Sun to match the Mo-Su header.
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), inCurrentMonth: true });
  }
  let nextDay = 1;
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(year, month + 1, nextDay), inCurrentMonth: false });
    nextDay += 1;
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function CalendarPicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}) {
  const [viewDate, setViewDate] = useState(selectedDate);
  const days = getCalendarDays(viewDate);
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const goToPrevMonth = () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPrevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.calendarHeaderText}>
          {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarWeekRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.calendarWeekLabel}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.calendarWeekRow}>
          {week.map((day) => {
            const selected = isSameDay(day.date, selectedDate);
            return (
              <TouchableOpacity
                key={day.date.toISOString()}
                style={[styles.calendarDayChip, selected && styles.calendarDayChipSelected]}
                onPress={() => onSelect(day.date)}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !day.inCurrentMonth && styles.calendarDayTextFaded,
                    selected && styles.calendarDayTextSelected,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function CreateReceiptScreen() {
  const params = useLocalSearchParams<{ photoUri?: string }>();
  const receiptPhotoUri = typeof params.photoUri === 'string' ? params.photoUri : undefined;

  const [date, setDate] = useState(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shipTo, setShipTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [taxPercent, setTaxPercent] = useState('');

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
  const taxAmount = subtotal * ((parseFloat(taxPercent) || 0) / 100);
  const total = subtotal + taxAmount;
  const formattedTotal = total.toLocaleString('en-NG');

  const handleSave = () => {
    if (!customerName.trim()) {
      Alert.alert('Missing name', 'Enter a customer name before saving.');
      return;
    }
    const validItems = items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      Alert.alert('No items', 'Add at least one item before saving.');
      return;
    }

    const newReceipt = {
      id: makeId(),
      date: date.toISOString(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      shipTo,
      paymentMethod,
      taxPercent: parseFloat(taxPercent) || 0,
      total,
      receiptPhotoUri: receiptPhotoUri ?? null,
      items: validItems,
    };

    // TODO: replace with real persistence once that layer exists.
    console.log('New receipt (wire this up to real storage):', newReceipt);
    router.replace('/');
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
          <View style={[styles.rowInputSmall, { position: 'relative', zIndex: 20 }]}>
            <TouchableOpacity
              style={[styles.input, styles.selectInput, { borderColor: ACTIVE }]}
              onPress={() => setShowCalendar((prev) => !prev)}
            >
              <Text style={{ fontSize: 15, color: ACTIVE }}>{formattedDate}</Text>
              <Ionicons
                name={showCalendar ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={ACTIVE}
              />
            </TouchableOpacity>

            {showCalendar && (
              <View style={styles.calendarDropdown}>
                <CalendarPicker
                  selectedDate={date}
                  onSelect={(selected) => {
                    setDate(selected);
                    setShowCalendar(false);
                  }}
                />
              </View>
            )}
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
          style={[
            styles.sectionHeader,
            { borderColor: itemsExpanded ? ACTIVE : colors.surface },
          ]}
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
                    {items.length > 1 ?
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={items.length === 1 ? colors.surface : colors.alert}
                    /> : null}
                  </TouchableOpacity>
                </View>

                <View style={styles.itemRow}>
                  <View style={styles.itemNameInput}>
                    <FormInput label="Item Name" required value={item.name} onChangeText={(t) => updateItem(item.id, 'name', t)} />
                  </View>
                  <View style={styles.itemQtyInput}>
                    <FormInput label="Qty" required value={item.qty} onChangeText={(t) => updateItem(item.id, 'qty', t)} keyboardType="number-pad" />
                  </View>
                  <View style={styles.itemPriceInput}>
                    <FormInput label="Unit Price" required value={item.unitPrice} onChangeText={(t) => updateItem(item.id, 'unitPrice', t)} keyboardType="decimal-pad" />
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

        <SelectField label="Ship To" value={shipTo} options={SHIP_TO_OPTIONS} onChange={setShipTo} />
        <View style={{ height: 12 }} />
        <SelectField
          label="Payment Method"
          value={paymentMethod}
          options={PAYMENT_METHOD_OPTIONS}
          onChange={setPaymentMethod}
        />

        <View style={styles.row}>
          <View style={styles.rowInputSmall}>
            <FormInput label="Tax (%)" value={taxPercent} onChangeText={setTaxPercent} keyboardType="decimal-pad" />
          </View>
          <View style={[styles.input, styles.rowInputLarge, styles.totalDisplay, { height: 40}]}>
            <Text style={styles.totalDisplayText}>
              {total > 0 ? `$${formattedTotal}` : 'Total'}
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

  fieldWrapper: { position: 'relative', marginBottom: 12 },
  overlayLabelRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 1,
  },
  overlayLabelText: { fontSize: 15, color: colors.textPrimary },
  requiredAsterisk: { fontSize: 15, color: '#D32F2F', marginLeft: 2 },

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

  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

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
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemIndex: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  itemRemoveButton: { padding: 2},
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

  createButton: {
    backgroundColor: ACTIVE,
    borderRadius: 3,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: { color: '#fff', fontWeight: '700', fontSize: 17   },

  // ---- Calendar ----
  calendarDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    width: 320, // wider than the date field itself, matching the mock's overlap
  },
  calendarCard: {
    backgroundColor: CALENDAR_BG,
    borderRadius: 10,
    padding: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarHeaderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  calendarWeekLabel: {
    width: 36,
    textAlign: 'center',
    color: '#cfcfcf',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarDayChip: {
    width: 36,
    height: 32,
    borderRadius: 4,
    backgroundColor: CALENDAR_CHIP_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayChipSelected: { backgroundColor: ACTIVE },
  calendarDayText: { color: '#fff', fontSize: 13 },
  calendarDayTextFaded: { color: CALENDAR_CHIP_FADED_TEXT },
  calendarDayTextSelected: { color: '#fff', fontWeight: '700' },
});
