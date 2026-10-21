import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user was previously authenticated
    try {
      const savedAuth = localStorage.getItem('moon_auth');
      if (savedAuth) {
        const { username: savedUsername, accessToken: savedToken } = JSON.parse(savedAuth);
        if (savedUsername && savedToken) {
          setIsAuthenticated(true);
          setUsername(savedUsername);
          setAccessToken(savedToken);
          console.log('Restored session for user:', savedUsername);
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      localStorage.removeItem('moon_auth');
    }
  }, []);

  const login = async (inputUsername: string, inputPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            username: inputUsername,
            password: inputPassword,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Login failed:', data.error || 'Unknown error');
        return false;
      }
      
      if (data.success) {
        const authData = { 
          username: data.user.username,
          accessToken: data.access_token 
        };
        
        setIsAuthenticated(true);
        setUsername(data.user.username);
        setAccessToken(data.access_token);
        
        // Persist to localStorage
        try {
          localStorage.setItem('moon_auth', JSON.stringify(authData));
          console.log('Session saved for user:', data.user.username);
        } catch (error) {
          console.error('Error saving session to localStorage:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (inputUsername: string, inputPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            username: inputUsername,
            password: inputPassword,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Signup failed:', data.error || 'Unknown error');
        return false;
      }

      if (data.success === true) {
        console.log('Signup successful for user:', inputUsername);

        // If server returned an access_token (auto-login), set the session immediately
        if (data.access_token) {
          const authData = {
            username: data.user?.username || inputUsername,
            accessToken: data.access_token,
          };
          setIsAuthenticated(true);
          setUsername(authData.username);
          setAccessToken(data.access_token);
          try {
            localStorage.setItem('moon_auth', JSON.stringify(authData));
            console.log('Auto-login session saved after signup for:', authData.username);
          } catch (e) {
            console.error('Error saving auto-login session:', e);
          }
        }

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setAccessToken(null);
    try {
      localStorage.removeItem('moon_auth');
      console.log('Session cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, accessToken, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}