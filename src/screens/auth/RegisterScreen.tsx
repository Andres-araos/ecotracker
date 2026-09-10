import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signUp } from '@/services/authService';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username || !email || !password) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, username.trim());
      Alert.alert('Cuenta creada', 'Ya puedes iniciar sesión.');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Error al registrarte', err.message ?? 'Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.emoji}>🌎</Text>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Empieza a medir tu impacto ambiental</Text>

        <View style={{ marginTop: spacing.lg, width: '100%' }}>
          <Input label="Nombre de usuario" placeholder="ej. david_green" autoCapitalize="none" value={username} onChangeText={setUsername} />
          <Input label="Correo" placeholder="tu@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Input label="Contraseña" placeholder="Mínimo 6 caracteres" secureTextEntry value={password} onChangeText={setPassword} />

          <Button title="Registrarme" onPress={handleRegister} loading={loading} style={{ marginTop: spacing.sm }} />
          <Button title="Ya tengo una cuenta" variant="ghost" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.sm }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emoji: { fontSize: 48, marginBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
