import {
  LayoutDashboard,
  Users,
  GraduationCap,
  HandHeart,
  Megaphone,
  HeartHandshake,
  Boxes,
  FileBarChart,
  Bell,
  ScrollText,
  Settings,
} from "lucide-react";

export const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["admin", "staff", "teacher", "volunteer", "donor"] },
  { label: "Beneficiaries", path: "/beneficiaries", icon: Users, roles: ["admin", "staff", "teacher"] },
  { label: "Education", path: "/education", icon: GraduationCap, roles: ["admin", "staff", "teacher"] },
  { label: "Volunteers", path: "/volunteers", icon: HandHeart, roles: ["admin", "staff"] },
  { label: "Campaigns", path: "/campaigns", icon: Megaphone, roles: ["admin", "staff", "volunteer"] },
  { label: "Donations", path: "/donations", icon: HeartHandshake, roles: ["admin", "staff", "donor"] },
  { label: "Inventory", path: "/inventory", icon: Boxes, roles: ["admin", "staff"] },
  { label: "Reports", path: "/reports", icon: FileBarChart, roles: ["admin", "staff", "donor"] },
  { label: "Notifications", path: "/notifications", icon: Bell, roles: ["admin", "staff", "teacher", "volunteer", "donor"] },
  { label: "Audit Logs", path: "/audit-logs", icon: ScrollText, roles: ["admin"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["admin"] },
];

export function navForRole(role) {
  return navigation.filter((n) => n.roles.includes(role));
}