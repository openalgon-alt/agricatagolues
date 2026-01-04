import { useAuth } from "@/context/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Menu,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
        { title: "Issues", url: "/admin/issues", icon: FileText },
        { title: "Editorial Board", url: "/admin/editorial-board", icon: Users },
        // { title: "Settings", url: "/admin/settings", icon: Settings }, // Future
    ];

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50">
                <Sidebar>
                    <SidebarContent>
                        <div className="p-4">
                            <h1 className="text-xl font-bold text-primary">AgriAdmin</h1>
                        </div>
                        <SidebarGroup>
                            <SidebarGroupLabel>Menu</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={location.pathname === item.url || (item.url !== '/admin' && location.pathname.startsWith(item.url))}
                                            >
                                                <Link to={item.url}>
                                                    <item.icon className="h-4 w-4 mr-2" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <div className="mt-auto p-4 border-t">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={logout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </SidebarContent>
                </Sidebar>

                <main className="flex-1 overflow-auto">
                    <div className="p-4 border-b bg-white flex items-center gap-4">
                        <SidebarTrigger />
                        <h2 className="font-semibold">Admin Panel</h2>
                    </div>
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};
