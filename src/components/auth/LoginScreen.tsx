// src/components/auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Icon } from '../common/Icon';
import { authService } from '../../services/auth';
import { User } from '../../types/auth';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      console.log('Checking for existing session...');
      const user = await authService.checkExistingSession();
      if (user) {
        console.log('Found existing session, logging in automatically');
        onLogin(user);
        return;
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setInitializing(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    setLoading(true);
    console.log('Starting login process...');

    try {
      const user = await authService.login(username, password);
      console.log('Login successful, calling onLogin callback');
      onLogin(user);
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Lỗi đăng nhập', error.message || 'Có lỗi xảy ra trong quá trình đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <View style={styles.initializingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.initializingText}>Đang khởi tạo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.loginContent}>
        <View style={styles.loginHeader}>
          <Icon name="document-text" size={80} color="#667eea" />
          <Text style={styles.loginTitle}>Digital Archives</Text>
          <Text style={styles.loginSubtitle}>Hệ thống quản lý tài liệu số</Text>
        </View>

        <View style={styles.loginForm}>
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#64748b" />
            <TextInput
              style={styles.loginInput}
              placeholder="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#64748b" />
            <TextInput
              style={styles.loginInput}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Tài khoản demo:</Text>
            <Text style={styles.demoText}>bantuyenhuan / 12346789</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  initializingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initializingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  loginForm: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoCredentials: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 5,
  },
  demoText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});