"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { docsNav } from "@/config/docs-nav";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex items-start justify-center border-b px-6 flex-col">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          FilterCN
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {docsNav.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.pages.map((page) => {
                  const href = `/docs/${page.slug}`;
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={page.slug}>
                      <SidebarMenuButton asChild isActive={isActive} className={page.indent ? "pl-6 text-sm" : ""}>
                        <Link href={href}>
                          <span>{page.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
