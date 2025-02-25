import { configureStore } from "@reduxjs/toolkit";
import sideBarReducer from "../features/SideBarSlice";
import logInReducer from "../features/LoginSlice";

export const store = configureStore({
  reducer: { sideBarReducer, logInReducer },
});
