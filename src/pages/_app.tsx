import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/common/app-sidebar";
import { useEffect, useState } from "react";
import Head from "next/head";
import { BibleReader } from "~/components/BibleReader";
import SearchVerses from "~/components/SearchVerses";
import "~/styles/globals.css";
import { ThemeProvider } from "~/components/ui/theme-provider";
import { LoginPage } from "./login"; // Assuming login.tsx exports LoginPage
import { Toaster } from "~/components/ui/sonner";

const geist = Geist({
  subsets: ["latin"],
});

// Define Page type if not already defined elsewhere
type Page = "Home" | "Search" | "Settings"; // Add other pages as needed

const MyApp: AppType = ({ Component, pageProps }) => {
  // State to track the active page
  const [activePage, setActivePage] = useState<Page>("Home");
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  // Remove accessToken state if solely relying on HttpOnly cookie
  // const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Add loading state
  const [currentDevotional, setCurrentDevotional] = useState<Devotional | null>(
    null,
  ); // Add currentDevotional state

  // Handler for page changes
  const handlePageChange = (page: Page) => {
    setActivePage(page);
  };

  // Render the appropriate content based on activePage
  const renderContent = () => {
    switch (activePage) {
      case "Home":
        return (
          <BibleReader
            setCurrentDevotional={setCurrentDevotional}
            currentDevotional={currentDevotional}
          />
        );
      case "Search":
        return <SearchVerses />;
      // case 'Settings':
      //   return <Settings />;
      default:
        return (
          <BibleReader
            setCurrentDevotional={setCurrentDevotional}
            currentDevotional={currentDevotional}
          />
        );
    }
  };
  // Define an async function to perform the check
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8000/auth/users/me", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setLoggedIn(true);
        console.log("User authenticated via cookie:", userData);

        // Set existing Devotional
        const devotionalResponse = await fetch(
          "http://localhost:8000/devotionals/today",
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          },
        );

        if (devotionalResponse.ok) {
          const devotionalData: Devotional = await devotionalResponse.json();
          setCurrentDevotional(devotionalData);
          console.log("Current Devotional:", devotionalData);
        } else {
          console.log(
            "Error getting current devotional:",
            devotionalResponse.status,
          );
        }

        return true;
      } else {
        console.log("User not authenticated via cookie:", response.status);
        setLoggedIn(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setLoggedIn(false);
      setUser(null);
      return false; // Return false on network/other error
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Check authentication status on initial load
  useEffect(() => {
    // Call the function to perform the check
    checkAuthStatus();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Show a loading indicator while checking auth status
  if (isLoadingAuth) {
    // You can replace this with a more sophisticated loading spinner/component
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Render login page or main app based on loggedIn state
  return (
    <>
      {loggedIn && user ? ( // Ensure user is also set before rendering logged-in view
        <SidebarProvider>
          <ThemeProvider>
            <div className={geist.className + " flex w-full"}>
              <Head>
                <title>Bible Reading App - {user.first_name}</title>{" "}
                {/* Example using user data */}
                <meta
                  name="description"
                  content="Read the Bible with this app"
                />
                <link rel="icon" href="/favicon.ico" />
              </Head>
              <AppSidebar
                onPageChange={handlePageChange}
                activePage={activePage}
                setUser={setUser}
                setLoggedIn={setLoggedIn}
                // You might want to pass user info or logout function to sidebar later
              />
              <SidebarTrigger className="fixed left-0 z-10" />
              <main className="flex flex-1 justify-center overflow-x-hidden">
                {renderContent()}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </SidebarProvider>
      ) : (
        // Pass the state setters to the LoginPage so it can update state on successful login
        <LoginPage checkAuth={checkAuthStatus} setLoggedIn={setLoggedIn} />
      )}
    </>
  );
};

export default MyApp;
