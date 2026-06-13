import React, { useState } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/src/contexts/AuthContext';
import Base from '@/src/api/Base';
import { Stack } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Pointing to auth/login endpoint as discovered in backend urls.py
      const response = await Base.post('auth/login', { username, password }, false);
      
      if (response.data && response.data.data && response.data.data.token) {
        login(response.data.data.token);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>PomoTask</Text>
              <View style={styles.logoDot} />
            </View>
            <Text variant="titleMedium" style={styles.subtitle}>Focus. Execute. Achieve.</Text>
          </View>

          <Surface style={styles.surface} elevation={0}>
            <Text variant="headlineSmall" style={styles.cardTitle}>Sign In</Text>
            <Text variant="bodyMedium" style={styles.cardSubtitle}>Enter your details to access your dashboard</Text>

            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              outlineColor="#e0e0e0"
              activeOutlineColor={theme.colors.primary}
              textColor="#000000" // Ensure typed text is dark
              left={<TextInput.Icon icon="account-outline" />}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              outlineColor="#e0e0e0"
              activeOutlineColor={theme.colors.primary}
              textColor="#000000" // Ensure typed text is dark
              left={<TextInput.Icon icon="lock-outline" />}
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button 
              mode="contained" 
              onPress={handleLogin} 
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? '' : 'Get Started'}
            </Button>
            
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>Secure authentication powered by PomoTask</Text>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
    maxWidth: 400,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6750A4',
    marginLeft: 2,
    marginBottom: 10,
  },
  title: {
    fontWeight: '900',
    letterSpacing: -1.5,
    color: '#1A1A1A', // Darker title
  },
  subtitle: {
    color: '#4A4A4A', // Darker subtitle instead of opacity
    marginTop: -4,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  surface: {
    padding: 40,
    borderRadius: 32,
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 480,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)', // Deeper shadow
      },
      default: {
        elevation: 8,
      },
    }),
  },
  cardTitle: {
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'left',
    color: '#111111', // Almost black
  },
  cardSubtitle: {
    color: '#555555', // Darker gray
    marginBottom: 32,
    textAlign: 'left',
    fontWeight: '500',
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white',
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCACA',
  },
  errorText: {
    color: '#B71C1C', // Stronger red
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    elevation: 0,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#888888', // Darker footer text
    fontSize: 11,
    fontWeight: '600',
  },
});
