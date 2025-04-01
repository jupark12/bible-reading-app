import {
  Book,
  Calendar,
  Home,
  Inbox,
  LogOut,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { ThemeToggle } from "../ui/theme-toggle";
import { Button } from "../ui/button";

// Menu items.
interface MenuItem {
  id: Page;
  label: string;
  icon: LucideIcon; // Optional icon name if you want to add icons
}

const items = [
  {
    title: "Home",
    icon: Home,
  },
  //   {
  //     title: "Inbox",
  //     url: "#",
  //     icon: Inbox,
  //   },
  //   {
  //     title: "Calendar",
  //     url: "#",
  //     icon: Calendar,
  //   },
  {
    title: "Search",
    icon: Search,
  },
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: Settings,
  //   },
];

interface AppSidebarProps {
  onPageChange: (page: Page) => void;
  activePage: Page;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onPageChange,
  activePage,
  setLoggedIn,
  setUser,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setLoggedIn(false);
        setUser(null);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems: MenuItem[] = [
    { id: "Home", label: "Home", icon: Home },
    { id: "Search", label: "Search", icon: Search },
    // { id: "Settings", label: "Settings", icon: Settings },
    { id: "Devotionals", label: "Devotionals", icon: Book },
  ];

  return (
    <Sidebar className="">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => onPageChange(item.id)}
                      className="cursor-pointer"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};
