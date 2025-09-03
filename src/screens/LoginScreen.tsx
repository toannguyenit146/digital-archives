import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../../src/api/ApiService';
import Icon from '../../src/components/Icon';
import StorageOS from '../../src/storage/StorageOS';
import { User } from '../../src/types';
import { styles } from '../styles';

const LoginScreen: React.FC<{
  onLogin: (user: User) => void;
}> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await StorageOS.getItem("authToken");
      const userData = await StorageOS.getItem("userData");

      if (token && userData) {
        const user = JSON.parse(userData);
        onLogin(user);
      }
    } catch (error) {
      console.log("No existing session");
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.login(username.trim(), password.trim());

      if (response.success) {
        // Store session
        await StorageOS.setItem("authToken", response.token);
        await StorageOS.setItem("userData", JSON.stringify(response.user));

        onLogin(response.user);
      } else {
        Alert.alert("Lỗi đăng nhập", "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      Alert.alert(
        "Lỗi đăng nhập" + error || "Có lỗi xảy ra trong quá trình đăng nhập"
      );
    }

    setLoading(false);
  };

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
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#64748b"
              />
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

export default LoginScreen;
