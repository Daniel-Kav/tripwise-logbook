// This file simulates integration with a Django backend for authentication

interface LoginCredentials {
  username: string;
  password: string;
}

<<<<<<< HEAD
interface RegisterData extends LoginCredentials {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  license_number: string;
  company_name: string;
  password2: string;
=======
interface SignupCredentials {
  username: string;
  email: string;
  password: string;
>>>>>>> c8b53042b605f83b29df5ad77493c4214ed9bdae
}

interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  license_number: string;
  company_name: string;
}

// Simulated API URL - in a real implementation, this would point to your Django backend
const API_URL = "http://localhost:8000/api";

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
    // In a real implementation, this would make an actual fetch request to Django
    console.log("Attempting signup with:", credentials);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful registration
    const user: User = {
      id: Math.floor(Math.random() * 1000) + 2, // Random ID
      username: credentials.username,
      email: credentials.email,
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiR7aWR9LCJ1c2VybmFtZSI6IiR7Y3JlZGVudGlhbHMudXNlcm5hbWV9In0.fake_token`
    };
    
    // Store token in localStorage - similar to how you'd store a Django-issued JWT token
    localStorage.setItem("auth_token", user.token);
    localStorage.setItem("user", JSON.stringify(user));
    
    return user;
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
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Get auth token (would be used for API requests)
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  }
};
