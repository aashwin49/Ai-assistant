import axios from "axios"
const api = axios.create({
    baseURL:"http://localhost:3000",
    withCredentials: true
})

export async function register({ username, email, password }) {
  try {
    console.log("Calling register API...");

    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

    console.log("Register API response:", response.data);

    return response.data;
  } catch (err) {
    console.error("API register error:", err.response?.data || err.message);
    throw err;
  }
}

export async function login({ email, password }) {
  try {
    console.log("Calling API...");

    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    console.log("API response:", response.data);

    return response.data;
  } catch (err) {
    console.error("API login error:", err.response?.data || err.message);
    throw err;
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (err) {
    console.error("API logout error:", err.response?.data || err.message);
    throw err;
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (err) {
    console.error("API getMe error:", err.response?.data || err.message);
    throw err;
  }
}