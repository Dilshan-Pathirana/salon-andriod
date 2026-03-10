import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  /** Override the outer container (the visible "input box") style, e.g. background color or margin. */
  containerStyle?: ViewStyle;
};

/**
 * A TextInput pre-wired for password entry with an eye-toggle button.
 * Drop-in replacement for <TextInput secureTextEntry />.
 */
export default function PasswordInput({ containerStyle, style, ...rest }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...rest}
        style={[styles.input, style]}
        secureTextEntry={!visible}
        placeholderTextColor={rest.placeholderTextColor ?? Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={styles.eyeBtn}
        hitSlop={10}
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        accessibilityRole="button"
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={Colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.background,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
