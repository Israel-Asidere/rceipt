import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/global';

const ACTIVE = '#4C7A3B';
const CALENDAR_BG = '#4D4D4D';
const CALENDAR_CHIP_BG = '#666666';
const CALENDAR_CHIP_FADED_TEXT = '#9E9E9E';
const SCREEN_MARGIN = 12; // keeps the dropdown from ever touching the screen edge

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

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  dropdownWidth?: number;
  alwaysActive?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export default function DatePickerField({
  label,
  value,
  onChange,
  dropdownWidth = 320,
  alwaysActive = false,
  isOpen,
  onToggle,
}: DatePickerFieldProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = isOpen !== undefined && onToggle !== undefined;
  const open = isControlled ? isOpen! : internalOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) onToggle!(next);
    else setInternalOpen(next);
  };

  const triggerRef = useRef<TouchableOpacity>(null);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handlePress = () => {
    if (open) {
      setOpen(false);
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const isBorderActive = open || !!value;
  const isTextActive = alwaysActive || isBorderActive;
  const displayText = value
    ? value.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    : label;

  const screenWidth = Dimensions.get('window').width;
  let dropdownLeft = anchor.x;
  if (dropdownLeft + dropdownWidth > screenWidth - SCREEN_MARGIN) {
    dropdownLeft = screenWidth - SCREEN_MARGIN - dropdownWidth;
  }
  if (dropdownLeft < SCREEN_MARGIN) {
    dropdownLeft = SCREEN_MARGIN;
  }

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        style={[
          styles.field,
          { borderColor: isBorderActive ? ACTIVE : colors.surface, borderWidth: open ? 2 : 1 },
        ]}
        onPress={handlePress}
      >
        <Text style={[styles.fieldText, { color: isTextActive ? ACTIVE : colors.text }]} numberOfLines={1}>
          {displayText}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={isTextActive ? ACTIVE : colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.dropdown,
              { top: anchor.y + anchor.height + 4, left: dropdownLeft, width: dropdownWidth },
            ]}
          >
            {/* Swallow taps on the calendar itself so they don't bubble
                to the backdrop Pressable and close it mid-interaction. */}
            <Pressable onPress={(e) => e.stopPropagation()}>
              <CalendarPicker
                selectedDate={value ?? new Date()}
                onSelect={(selected) => {
                  onChange(selected);
                  setOpen(false);
                }}
              />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldText: { fontSize: 15, flexShrink: 1, marginRight: 6 },

  dropdown: { position: 'absolute' },
  calendarCard: { backgroundColor: CALENDAR_BG, borderRadius: 10, padding: 12 },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarHeaderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  calendarWeekLabel: { width: 36, textAlign: 'center', color: '#cfcfcf', fontSize: 12, fontWeight: '600' },
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
