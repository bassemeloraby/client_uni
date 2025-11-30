import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const themes = {
  winter: "winter",
  dracula: "dracula",
};

const getThemeFromLocalStorage = () => {
  const theme = localStorage.getItem("theme") || themes.winter;
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
      const { dracula, winter } = themes;
      state.theme = state.theme === dracula ? winter : dracula;
      document.documentElement.setAttribute("data-theme", state.theme);
      localStorage.setItem("theme", state.theme);
    },
    loginUser: (state, action) => {
      const user = {
        username: action.payload.username,
        userRole: action.payload.role,
        jwt: action.payload.token,
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
