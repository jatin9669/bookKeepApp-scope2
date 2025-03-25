import React, { PropsWithChildren, ReactElement } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { configureStore, Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { RootState, rootReducer } from "./data/store";

interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  is_signed_in: boolean;
}

interface Book {
  id: number;
  book_name: string;
  author_name?: string;
  total_quantity: number;
  image_url?: string;
}

interface MyBooks {
  id: number;
  user_id: number;
  book_id: number;
  quantity: number;
  name: string;
  email: string;
  book_name: string;
  author_name?: string;
  total_quantity: number;
  image_url?: string;
}

interface ReturnRequest {
  id: number;
  borrowed_book_id: number;
  quantity: number;
  created_at: string;
  book_name: string;
  author_name: string;
  image_url: string;
  total_quantity: number;
  name: string;
  email: string;
  book_id: number;
  user_id: number;
}

interface UserReturnRequested {
  id: number;
  quantity: number;
  book_name: string;
  author_name: string;
  image_url: string;
  total_quantity: number;
  name: string;
  email: string;
  book_id: number;
  user_id: number;
}

interface IssueRequest {
  id: number;
  book_id: number;
  user_id: number;
  quantity: number;
  created_at: string;
  book_name: string;
  author_name?: string;
  image_url?: string;
  total_quantity: number;
  name: string;
  email: string;
}

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  route?: string;
}

interface ExtendedStore extends Store {
  getActions: () => any[];
}

export const defaultInitialState: Partial<RootState> = {
  user: { user: {} as User },
  books: { books: [] as Book[], status: "idle", error: null },
  myBooks: { myBooks: [] as MyBooks[], status: "idle", error: null },
  notification: { message: "", notice: false, alert: false },
  returnRequest: { returnRequest: [] as ReturnRequest[], status: "idle", error: null },
  userReturnRequest: { userReturnRequest: [] as UserReturnRequested[], status: "idle", error: null },
  issueRequested: { issueRequest: [] as IssueRequest[], status: "idle", error: null },
};

export function createTestStore(preloadedState: Partial<RootState> = {}): ExtendedStore {
  const actions: any[] = [];

  const cleanState = { ...preloadedState };
  if ("_persist" in cleanState) {
    delete (cleanState as any)._persist;
  }

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: cleanState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

  const originalDispatch = store.dispatch;
  store.dispatch = (action: any) => {
    actions.push(action);
    return originalDispatch(action);
  };

  return { ...store, getActions: () => actions } as ExtendedStore;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, route = "/", ...renderOptions }: ExtendedRenderOptions = {}
) {
  window.history.pushState({}, "Test page", route);

  const store = createTestStore(preloadedState);

  const Wrapper: React.FC<PropsWithChildren<{}>> = ({ children }) => (
    <BrowserRouter>
      <Provider store={store}>{children}</Provider>
    </BrowserRouter>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from "@testing-library/react";
export * from "@testing-library/user-event";
