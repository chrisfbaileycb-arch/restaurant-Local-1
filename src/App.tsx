import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import CollectionPage from "./pages/CollectionPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Onboarding from "./pages/Onboarding";
import POS from "./pages/POS";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import StarterKit from "./pages/StarterKit";
import Templates from "./pages/Templates";
import Devices from "./pages/Devices";
import StayOpenOffline from "./pages/StayOpenOffline";
import TestRun from "./pages/TestRun";
import TemplatesAndLogo from "./pages/TemplatesAndLogo";
import InvestorDemo from "./pages/InvestorDemo";
import Locations from "./pages/Locations";
import Audit from "./pages/Audit";




const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/starter" element={<StarterKit />} />
                <Route path="/starter-kit" element={<StarterKit />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/stay-open-offline" element={<StayOpenOffline />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/templates-logo" element={<TemplatesAndLogo />} />
                <Route path="/website-templates" element={<TemplatesAndLogo />} />
                <Route path="/test-run" element={<TestRun />} />
                <Route path="/weekend-test" element={<TestRun />} />
                <Route path="/demo" element={<InvestorDemo />} />
                <Route path="/investor" element={<InvestorDemo />} />
                <Route path="/investor-demo" element={<InvestorDemo />} />
                <Route path="/walkthrough" element={<InvestorDemo />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/multi-location" element={<Locations />} />
                <Route path="/group" element={<Locations />} />
                <Route path="/audit" element={<Audit />} />
                <Route path="/platform-audit" element={<Audit />} />


                <Route path="/collections/:handle" element={<CollectionPage />} />
                <Route path="/products/:handle" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
