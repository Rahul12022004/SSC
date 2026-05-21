import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/common/components/ErrorBoundary";
import { ToastProvider } from "@/common/components/Toast";
import Router from "./router";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
