import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RestaurantProvider, useRestaurant } from "./contexts/RestaurantContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Navigation } from "./components/Navigation";
import { LoginForm } from "./components/LoginForm";
import { LandingPage } from "./components/LandingPage";
import { TenantRegistration } from "./components/TenantRegistration";
import { Home } from "./components/Home";
import { CustomerMenu } from "./components/CustomerMenu";
import { KitchenDashboard } from "./components/KitchenDashboard";
import { Host } from "./components/Host";
import { Payment } from "./components/Payment";
import { OwnerDashboard } from "./components/OwnerDashboard";
import { MenuManagement } from "./components/MenuManagement";
import { QRCodeManager } from "./components/QRCodeManager";
import { OnboardingWizard } from "./components/OnboardingWizard";
import { LoadingScreen } from "./components/LoadingScreen";
import { Toaster } from "./components/ui/sonner";
import { initializeDatabase } from "./utils/initializeData";
import { isDemoMode } from "./utils/demoData";
import * as api from "./utils/api";

function AppContent() {
  const [activeView, setActiveView] = useState("landing");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTenantRegistration, setShowTenantRegistration] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Check if onboarding is needed
  useEffect(() => {
    if (isAuthenticated && user?.role === 'owner' && !isDemoMode()) {
      const checkOnboarding = async () => {
        try {
          const response = await fetch(`${api.API_BASE_URL}/onboarding/status`, {
            headers: { Authorization: `Bearer ${api.getToken()}` },
          });
          const data = await response.json();
          
          if (!data.onboardingComplete) {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      };
      checkOnboarding();
    }
  }, [isAuthenticated, user]);

  // Initialize database with sample data (only for owner in production mode)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'owner' && !isInitialized && !isDemoMode()) {
      const init = async () => {
        try {
          await initializeDatabase();
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to initialize database:', error);
        }
      };
      init();
    } else if (isDemoMode()) {
      // Skip initialization in demo mode
      setIsInitialized(true);
    }
  }, [isAuthenticated, user, isInitialized]);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "home":
        return <Home onNavigate={setActiveView} />;
      case "menu":
        return <CustomerMenu />;
      case "kitchen":
        return <KitchenDashboard />;
      case "host":
        return <Host />;
      case "payment":
        return <Payment />;
      case "analytics":
        return <OwnerDashboard />;
      case "menu-management":
        return <MenuManagement />;
      case "qr-codes":
        return <QRCodeManager />;
      default:
        return <Home onNavigate={setActiveView} />;
    }
  };

  // Show landing page if not authenticated and on landing view
  if (!isAuthenticated && activeView === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setShowTenantRegistration(true)}
        onLogin={() => setActiveView("login")}
      />
    );
  }

  // Show tenant registration
  if (!isAuthenticated && showTenantRegistration) {
    return (
      <TenantRegistration
        onComplete={(tenantData) => {
          setShowTenantRegistration(false);
          setActiveView("login");
        }}
        onBack={() => {
          setShowTenantRegistration(false);
          setActiveView("landing");
        }}
      />
    );
  }

  // Show login form
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setActiveView("home")} />;
  }

  // Show onboarding wizard for new owners
  if (showOnboarding && user?.role === 'owner') {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <RestaurantProvider>
      <div className="min-h-screen bg-background">
        <Navigation
          activeView={activeView}
          onViewChange={setActiveView}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
        />
        
        <div className="transition-all duration-300">
          {renderActiveView()}
        </div>
        
        <Toaster position="top-right" />
      </div>
    </RestaurantProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}