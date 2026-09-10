import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signIn } from '@/services/authService';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Error al iniciar sesión', err.message ?? 'Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.title}>Bienvenido de vuelta</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar reduciendo tu huella</Text>

        <View style={{ marginTop: spacing.lg, width: '100%' }}>
          <Input label="Correo" placeholder="tu@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Input label="Contraseña" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />

          <Button title="Iniciar sesión" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

          <Button
            title="Crear una cuenta"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: spacing.sm }}
          />
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
