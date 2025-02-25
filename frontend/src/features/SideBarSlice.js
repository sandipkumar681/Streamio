import { createSlice } from "@reduxjs/toolkit";

const initialState = { isSideBarOpen: true };

export const sideBarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSideBar: (state) => {
      state.isSideBarOpen = !state.isSideBarOpen;
    },
    makeSideBarOpen: (state) => {
      state.isSideBarOpen = true;
    },
    makeSideBarClose: (state) => {
      state.isSideBarOpen = false;
    },
  },
});

export const { toggleSideBar, makeSideBarOpen, makeSideBarClose } =
  sideBarSlice.actions;

export default sideBarSlice.reducer;
