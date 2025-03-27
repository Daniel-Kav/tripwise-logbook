
// This file simulates integration with a Django backend for authentication

interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

// Simulated API URL - in a real implementation, this would point to your Django backend
const API_URL = "https://api.example.com";

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<User> => {
    // In a real implementation, this would make an actual fetch request to Django
    console.log("Attempting login with:", credentials);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate successful login for demo username/password
    if (credentials.username === "driver" && credentials.password === "password") {
      const user: User = {
        id: 1,
        username: credentials.username,
        email: "driver@example.com",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiZHJpdmVyIn0.fake_token"
      };
      
      // Store token in localStorage - similar to how you'd store a Django-issued JWT token
      localStorage.setItem("auth_token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      
      return user;
    }
    
    // Simulate login failure
    throw new Error("Invalid credentials");
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem("auth_token") !== null;
  },
  
  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Get auth token (would be used for API requests)
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  }
};
