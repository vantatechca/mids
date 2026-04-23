import {
  LayoutDashboard,
  Send,
  TableProperties,
  Inbox,
  Building2,
  UserCircle,
  Phone,
  Globe,
  FileText,
  ShoppingBag,
  CreditCard,
  Database,
  Shield,
  Settings,
  Users,
  Server,
} from "lucide-react";

export const navigation = [
  {
    group: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Applications", href: "/applications", icon: Send },
      { name: "Matrix View", href: "/matrix", icon: TableProperties },
      { name: "Communications", href: "/communications", icon: Inbox },
    ],
  },
  {
    group: "ASSETS",
    items: [
      { name: "Companies", href: "/companies", icon: Building2 },
      { name: "Identities & IDs", href: "/identities", icon: UserCircle },
      { name: "Phone Lines", href: "/phones", icon: Phone },
      { name: "Domains", href: "/domains", icon: Globe },
      { name: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    group: "ACCOUNTS",
    items: [
      {
        name: "Shopify Accounts",
        href: "/accounts/shopify",
        icon: ShoppingBag,
      },
      { name: "Stripe Accounts", href: "/accounts/stripe", icon: CreditCard },
    ],
  },
  {
    group: "DATA",
    items: [
      { name: "Processors Database", href: "/processors", icon: Database },
      { name: "Isolation Rules", href: "/isolation-rules", icon: Shield },
    ],
  },
  {
    group: "SETTINGS",
    items: [
      { name: "App Settings", href: "/settings", icon: Settings },
      { name: "Team Members", href: "/settings/team", icon: Users },
      { name: "DNS Management", href: "/settings/dns", icon: Server },
    ],
  },
];
