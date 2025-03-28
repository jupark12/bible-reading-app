import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";

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
  SidebarTrigger,
} from "../ui/sidebar";
import { ThemeToggle } from "../ui/theme-toggle";

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
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onPageChange,
  activePage,
}) => {
  const menuItems: MenuItem[] = [
    { id: "Home", label: "Home", icon: Home },
    { id: "Search", label: "Search", icon: Search },
    { id: "Settings", label: "Settings", icon: Settings },
  ];
  return (
    <Sidebar>
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
          <SidebarFooter>
            <ThemeToggle />
          </SidebarFooter>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
