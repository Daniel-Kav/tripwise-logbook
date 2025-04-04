// This file simulates integration with a Django backend for authentication

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  license_number: string;
  company_name: string;
  password2: string;
}

interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  license_number: string;
  company_name: string;
}

// Simulated API URL - in a real implementation, this would point to your Django backend
const API_URL = "https://tripwise-7jbg.onrender.com/api";

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log(data.user);
      return data.user;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },

  // Register user
  register: async (data: RegisterData): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const responseData = await response.json();
      localStorage.setItem('user', JSON.stringify(responseData.user));
      return responseData.user;
    } catch (error) {
      throw new Error('Registration failed');
    }
  },
  
  // Sign up user
  signup: async (credentials: SignupCredentials): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('user');
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem('user') !== null;
  },
  
  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    console.log(`Current user: ${userStr}`);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Get auth token (would be used for API requests)
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  }
};
