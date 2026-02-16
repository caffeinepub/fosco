import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCallerProfile';
import LoginButton from './features/auth/LoginButton';
import PhoneNumberSetupCard from './features/profile/PhoneNumberSetupCard';
import FoscoLayout from './features/layout/FoscoLayout';
import FoscoBranding from './features/branding/FoscoBranding';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <FoscoBranding />
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to FOSCO</h1>
              <p className="text-lg text-muted-foreground">
                Facetime Others and Screen Cast Others
              </p>
              <p className="text-sm text-muted-foreground">
                Watch movies together while video calling from anywhere in the world
              </p>
            </div>
            <div className="pt-4">
              <LoginButton />
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show phone number setup if profile is not complete
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex min-h-screen flex-col bg-background">
          <header className="border-b border-border bg-card">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <FoscoBranding size="small" />
              <LoginButton />
            </div>
          </header>
          <main className="flex flex-1 items-center justify-center px-4">
            <PhoneNumberSetupCard />
          </main>
        </div>
      </ThemeProvider>
    );
  }

  // Show loading while profile is being fetched
  if (profileLoading || !isFetched) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show main app
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <FoscoLayout />
      <Toaster />
    </ThemeProvider>
  );
}
