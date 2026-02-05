import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const themes = {
  nightvision: "nightvision",
  ocean: "ocean",
};

const getThemeFromLocalStorage = () => {
  const theme = localStorage.getItem("theme") || themes.nightvision;
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
};

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user") || null;
  return user ? JSON.parse(user) : null;
};

const initialState = {
  theme: getThemeFromLocalStorage(),
  user: getUserFromLocalStorage(),
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const { ocean, nightvision } = themes;
      state.theme = state.theme === ocean ? nightvision : ocean;
      document.documentElement.setAttribute("data-theme", state.theme);
      localStorage.setItem("theme", state.theme);
    },
    loginUser: (state, action) => {
      const user = {
        username: action.payload.username,
        userRole: action.payload.role,
        jwt: action.payload.token,
        allowedPages: action.payload.allowedPages || [],
      };
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
    },
  },
});

export const { toggleTheme, loginUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
