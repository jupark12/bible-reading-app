import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/common/app-sidebar";
import { useState } from "react";
import Head from "next/head";
import BibleReader from "~/components/BibleReader";
import SearchVerses from "~/components/SearchVerses";
import "~/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  // State to track the active page
  const [activePage, setActivePage] = useState<Page>("Home");

  // Handler for page changes
  const handlePageChange = (page: Page) => {
    setActivePage(page);
  };

  // Render the appropriate content based on activePage
  const renderContent = () => {
    switch (activePage) {
      case "Home":
        return <BibleReader />;
      case "Search":
        return <SearchVerses />;
      // case 'Settings':
      //   return <Settings />;
      default:
        return <BibleReader />;
    }
  };

  return (
    <SidebarProvider>
      <div className={geist.className + " flex min-w-screen"}>
        <Head>
          <title>Bible Reading App</title>
          <meta name="description" content="Read the Bible with this app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppSidebar onPageChange={handlePageChange} activePage={activePage} />
        <SidebarTrigger className="fixed left-0 z-10" />
        <main className="ml-2 flex flex-1 justify-center">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MyApp;
