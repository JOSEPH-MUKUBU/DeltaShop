import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

export const fetchProducts = createAsyncThunk("products/list", async ({ page = 1, q = "", category = "" } = {}) => {
  const { data } = await api.get("/api/products", { params: { page, q, category } });
  return data;
});

export const fetchProduct = createAsyncThunk("products/get", async (idOrSlug) => {
  const { data } = await api.get(`/api/products/${idOrSlug}`);
  return data;
});

const productsSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    page: 1,
    pages: 1,
    total: 0,
    current: null,
    status: "idle",
    error: null
  },
  reducers: {
    clearCurrent(state) {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Erreur chargement produits";
      })
      .addCase(fetchProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload.product;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Erreur chargement produit";
      });
  }
});

export const { clearCurrent } = productsSlice.actions;
export default productsSlice.reducer;

