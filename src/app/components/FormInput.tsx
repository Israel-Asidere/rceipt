import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/global';

// Same shade used across the receipt-creation flow and DatePickerField.
// Worth eventually promoting into styles/global.ts as colors.active —
// kept local here until then, same as in DatePickerField.
const ACTIVE = '#4C7A3B';

export interface FormInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Renders a show/hide eye toggle and masks input until revealed. */
  isPassword?: boolean;
}

/**
 * FormInput
 * ---------
 * Two earlier versions of this component tried to show the label as a
 * custom overlay View sitting on top of the TextInput, so the required
 * asterisk could be colored separately from the rest of the label (RN's
 * native placeholder is one string in one color, so a two-tone label
 * isn't possible through that prop alone). That overlay approach kept
 * failing to actually render on top in practice — visible only after
 * the field was focused, which switched the code over to setting a
 * real placeholder instead.
 *
 * This version drops the overlay entirely and just uses the native
 * `placeholder` prop for everything, with `placeholderTextColor` swapped
 * dynamically between idle and active colors. It's less visually fancy
 * (the required marker is a plain "*" in the same color, not a red one),
 * but it's guaranteed to render immediately — it's not a separate layer
 * that can be painted over, it's part of the TextInput itself.
 */
export default function FormInput({
  label,
  required,
  value,
  onChangeText,
  keyboardType,
  multiline,
  autoCapitalize,
  isPassword,
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value.trim().length > 0;
  const isActive = focused || hasValue;

  const placeholderText = required ? `${label} *` : label;

  return (
    <View style={styles.fieldWrapper}>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          isPassword && styles.inputWithIcon,
          {
            borderColor: isActive ? ACTIVE : colors.surface,
            borderWidth: focused ? 2 : 1,
            color: ACTIVE,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholderText}
        placeholderTextColor={ACTIVE}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        secureTextEntry={isPassword && !showPassword}
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={isActive ? ACTIVE : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: { position: 'relative', marginBottom: 12 },

  input: {
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  inputMultiline: { minHeight: 44, textAlignVertical: 'top' },
  inputWithIcon: { paddingRight: 40 },

  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
