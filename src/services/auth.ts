// src/services/auth.ts
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { User } from '../types/auth';

const supabaseUrl = 'https://fnfolijesketyasmmplq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZm9saWplc2tldHlhc21tcGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NzQ2MjEsImV4cCI6MjA3MDQ1MDYyMX0.j73Hx7cEdH5QISIXsgDvVy7RBdazJ1TysQejLt2OoIU';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage utility that works on both web and mobile
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        // For mobile, you could use @react-native-async-storage/async-storage
        // For now, we'll use a simple in-memory storage for demo
        return (globalThis as any).__storage?.[key] || null;
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        // Initialize global storage if it doesn't exist
        if (!(globalThis as any).__storage) {
          (globalThis as any).__storage = {};
        }
        (globalThis as any).__storage[key] = value;
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        if ((globalThis as any).__storage) {
          delete (globalThis as any).__storage[key];
        }
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

export const authService = {
  async login(username: string, password: string): Promise<User> {
    console.log('Attempting login for:', username);
    
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password.trim())
        .single();

      console.log('Supabase response:', { users, error });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      }

      if (!users) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      }

      const user: User = {
        id: users.id,
        username: users.username,
        name: users.full_name,
        role: users.role || 'User',
      };

      // Store session
      await storage.setItem('userToken', `token_${users.id}`);
      await storage.setItem('userData', JSON.stringify(user));

      console.log('Login successful for user:', user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async checkExistingSession(): Promise<User | null> {
    try {
      const token = await storage.getItem('userToken');
      const userData = await storage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('Found existing session for:', user);
        return user;
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
    return null;
  },

  async logout(): Promise<void> {
    try {
      await storage.removeItem('userToken');
      await storage.removeItem('userData');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
};