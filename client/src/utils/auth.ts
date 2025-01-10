import { JwtPayload, jwtDecode } from "jwt-decode";

class AuthService {
  // Decode the token and return the user's profile
  getProfile() {
    const token = this.getToken();
    return token ? jwtDecode<JwtPayload>(token) : null;
  }

  // Check if the user is logged in
  loggedIn() {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  // Check if the token is expired
  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded && decoded.exp) {
        return Date.now() >= decoded.exp * 1000; // Compare current time with token expiration time
      }
      return false;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return true;
    }
  }

  // Retrieve the token from localStorage
  getToken(): string {
    return localStorage.getItem("jwt") || "";
  }

  // Set the token to localStorage and redirect to the home page
  login(idToken: string) {
    localStorage.setItem("jwt", idToken);
    window.location.assign("/kanban"); // Redirect to the main Kanban board page
  }

  // Remove the token from localStorage and redirect to the login page
  logout() {
    localStorage.removeItem("jwt");
    window.location.assign("/login"); // Redirect to the login page
  }
}

export default new AuthService();
