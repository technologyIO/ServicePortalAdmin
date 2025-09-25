"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePermissions } from "../../PermissionContext";
import {
  Activity,
  Delete,
  LucideDelete,
  PanelTopInactive,
  Trash,
  Trash2,
} from "lucide-react";
import { Approval } from "@mui/icons-material";

// SVG ICONS (keeping all your existing icons)
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372-.836 2.942.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
      clipRule="evenodd"
    />
  </svg>
);

const BusinessIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
      clipRule="evenodd"
    />
    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
  </svg>
);

const ReceiptIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-8.207-.293a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    className="w-4 h-4 transition-transform duration-200"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
      clipRule="evenodd"
    />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

// Enhanced Toggler Component
function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
  storageKey,
}) {
  const storedState = localStorage.getItem(storageKey);
  const initialState =
    storedState !== null ? JSON.parse(storedState) : defaultExpanded;
  const [open, setOpen] = useState(initialState);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(open));
  }, [open, storageKey]);

  return (
    <div className="w-full">
      {renderToggle({ open, setOpen })}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-2 w-full">{children}</div>
      </div>
    </div>
  );
}

// Logout Modal Component
const LogoutModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-80 mx-4 transform transition-all duration-300 scale-100 border border-gray-200 z-[10000]">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <LogoutIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Are you sure you want to log out of your account?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-800 rounded-md font-medium transition-colors duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Sidebar Component
export default function EnhancedSidebar({ onSidebarItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Permission system
  const { hasPermission, loading, ready } = usePermissions();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const canAccess = (componentName, action = "read") => {
    if (!ready || loading) return false;
    return hasPermission(componentName, action);
  };

  const hasAnyPermissionInSection = (sectionItems) => {
    if (!ready || loading) return false;
    return sectionItems.some((item) => canAccess(item.component));
  };

  const hasAnyPermissionInSubsections = (subsections) => {
    if (!ready || loading) return false;
    return subsections.some((subsection) => {
      if (subsection.items) return hasAnyPermissionInSection(subsection.items);
      if (subsection.subsections)
        return hasAnyPermissionInSubsections(subsection.subsections);
      return false;
    });
  };

  // Sidebar configuration
  const sidebarSections = [
    {
      title: "Master",
      icon: <DashboardIcon />,
      storageKey: "masterManagementTogglerState",
      items: [
        { component: "User", path: "/user" },
        { component: "AERB", path: "/aerb" },
        { component: "Dealer", path: "/dealer" },
        { component: "Branch", path: "/branch" },
        { component: "Product", path: "/product" },
        { component: "Checklist", path: "/admin-checklist" },
        { component: "Equipment", path: "/equipment" },
        { component: "Complaint Type", path: "/complaint-type" },
        { component: "Spare Master", path: "/spare" },
        { component: "PM Doc Master", path: "/pm-doc-master" },
        { component: "Format Master", path: "/formatmaster" },
        { component: "Warranty Code", path: "/warrenty-code" },
        { component: "Reported Problem", path: "/reported-problem" },
        { component: "Replaced Part Code", path: "/replaced-part-code" },
        {
          component: "Preventive Maintenance",
          path: "/preventive-maintenance",
        },
      ],
    },
    {
      title: "Upload",
      icon: <UploadIcon />,
      storageKey: "uploadManagementTogglerState",
      items: [
        { component: "Customer", path: "/customer" },
        { component: "Hub Stock", path: "/hub-stock" },
        { component: "Dealer Stock", path: "/dealer-stock" },
        { component: "AMC Contract", path: "/amc-contract" },
        { component: "Pending Complaint", path: "/pending-complaint" },
        { component: "Pending Installation", path: "/pending-installation" },
      ],
    },
    {
      title: "Admin",
      icon: <SettingsIcon />,
      storageKey: "adminTogglerState",
      items: [
        { component: "Geo", path: "/admin-geo" },
        { component: "City", path: "/admin-city" },
        { component: "State", path: "/admin-state" },
        { component: "Region", path: "/admin-region" },
        { component: "Country", path: "/admin-country" },
        { component: "Department", path: "/admin-department" },
        { component: "Role Manage", path: "/role-manage" },
        { component: "Admin Access", path: "/admin-access" },
        { component: "Problem Type", path: "/problem-type" },
        { component: "Problem Name", path: "/problem-name" },
        { component: "CheckListType", path: "/checklist-type" },
        { component: "Product Group", path: "/admin-product-group" },
        { component: "CheckPointType", path: "/checkpoint-type" },
        { component: "CMC/NCMC Gst", path: "/cmc-ncmc-gst" },
        { component: "CMC/NCMC TDS", path: "/cmc-ncmc-tds" },
        { component: "CMC/NCMC Price", path: "/cmc-ncmc-price" },
        { component: "CMC/NCMC Years", path: "/cmc-ncmc-years" },
        { component: "CMC/NCMC Discount", path: "/cmc-ncmc-discount" },
        { component: "OnCall Service Charge", path: "/service-charge" },
      ],
    },
    {
      title: "Opportunity",
      icon: <BusinessIcon />,
      storageKey: "opportunityTogglerState",
      isNested: true,
      subsections: [
        {
          title: "OnCall",
          storageKey: "onCallTogglerState",
          items: [
            { component: "OnCall", path: "/on-call-open", label: "Open" },
            { component: "OnCall", path: "/on-call-close", label: "Close" },
          ],
        },
        {
          title: "CMC/NCMC",
          storageKey: "cmcNcmcTogglerState",
          items: [
            { component: "CMC/NCMC", path: "/cmc-ncmc-open", label: "Open" },
            { component: "CMC/NCMC", path: "/cmc-ncmc-close", label: "Close" },
          ],
        },
      ],
    },
    {
      title: "Inactive Opportunity",
      icon: <PanelTopInactive size={20} />,
      storageKey: "cnoteDeleteTogglerState",
      items: [
        { component: "OnCall Assign", path: "/oncall-assign" },
        { component: "CMC/NCMC Assign", path: "/cmc-ncmc-assign" },
        // { component: "Preventive Maintenance Assign", path: "/pm-assign" },
      ],
    },
    {
      title: "Opportunity Approval",
      icon: <Approval className="size-5" />,
      storageKey: "opportunityapprovalTogglerState",
      items: [
        {
          component: "On Call Approval",
          path: "/on-call-approval",
          label: "OnCall Approval",
        },
        {
          component: "CMC/NCMC Approval",
          path: "/cmc-ncm-approval",
          label: "CMC/NCMC Approval",
        },
      ],
    },

    {
      title: "SO Number Entry",
      icon: <ReceiptIcon />,
      storageKey: "soNumberEntryTogglerState",
      isNested: true,
      subsections: [
        {
          title: "OnCall SO Entry",
          storageKey: "onCallSOEntryTogglerState",
          items: [
            {
              component: "OnCall SO Entry",
              path: "/open-oncall-order",
              label: "Open",
            },
            {
              component: "OnCall SO Entry",
              path: "/close-oncall-order",
              label: "Close",
            },
          ],
        },
        {
          title: "CMC/NCMC SO Entry",
          storageKey: "cmcNcmcSOEntryTogglerState",
          items: [
            {
              component: "CMC/NCMC SO Entry",
              path: "/open-proposal",
              label: "Open",
            },
            {
              component: "CMC/NCMC SO Entry",
              path: "/close-proposal",
              label: "Close",
            },
          ],
        },
      ],
    },
    {
      title: "Cnote Delete",
      icon: <Trash2 size={20} />,
      storageKey: "cnoteDeleteTogglerState",
      items: [
        { component: "OnCall Cnote Delete", path: "/oncall-cnote-delete" },
        { component: "CMC/NCMC Cnote Delete", path: "/cnote-delete" },
      ],
    },
    {
      title: "Activity Logs",
      icon: <Activity size={17} />,
      storageKey: "activitylogTogglerState",
      items: [
        { component: "Activity Logs", path: "/activity-logs" },
      ],
    },
  ];

  const baseUrl =
    process.env.REACT_APP_API_URL ||
    "https://servicepbackend.insideoutprojects.in";
  const avatarPath = user?.details?.profileimage;
  const avatarImage = avatarPath
    ? `${baseUrl}${avatarPath}`
    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286";

  const userName = user?.details?.firstname || "John Doe";
  const userId = user?.details?.employeeid || "EMP001";
  const userRole = user?.details?.role?.roleName || "Administrator";
  const department = user?.details?.department || "IT Department";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    window.location.reload();
  };

  useEffect(() => {
    setSelectedItem(location.pathname);
  }, [location.pathname]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsMobileOpen(false);
  };

  // Render functions
  const renderNestedItems = (items, level = 0) => {
    return items.map((item) => {
      if (!canAccess(item.component)) return null;
      return (
        <div key={item.path} className="w-full">
          <button
            onClick={() => {
              navigate(item.path);
              handleItemClick(item.path);
            }}
            className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm ${
              selectedItem === item.path
                ? "bg-blue-100 text-blue-800 font-medium"
                : "text-gray-700 hover:text-blue-800 hover:bg-blue-50"
            }`}
            style={{ marginLeft: `${level * 16}px` }}
          >
            <span>{item.label || item.component}</span>
          </button>
        </div>
      );
    });
  };

  const renderSection = (section) => {
    if (!section.isNested) {
      if (!hasAnyPermissionInSection(section.items)) return null;
      return (
        <div key={section.title} className="mb-1 w-full">
          <Toggler
            storageKey={section.storageKey}
            renderToggle={({ open, setOpen }) => (
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 group border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                    {section.icon}
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900 text-sm">
                    {section.title}
                  </span>
                </div>
                <div
                  className={`transform transition-transform duration-200 text-gray-400 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDownIcon />
                </div>
              </button>
            )}
          >
            <div className="space-y-1 mt-1 ml-1 w-full">
              {renderNestedItems(section.items)}
            </div>
          </Toggler>
        </div>
      );
    }

    if (!hasAnyPermissionInSubsections(section.subsections)) return null;

    return (
      <div key={section.title} className="mb-1 w-full">
        <Toggler
          storageKey={section.storageKey}
          renderToggle={({ open, setOpen }) => (
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 group border border-gray-200 hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                  {section.icon}
                </div>
                <span className="font-medium text-gray-700 group-hover:text-gray-900 text-sm">
                  {section.title}
                </span>
              </div>
              <div
                className={`transform transition-transform duration-200 text-gray-400 ${
                  open ? "rotate-180" : ""
                }`}
              >
                <ChevronDownIcon />
              </div>
            </button>
          )}
        >
          <div className="space-y-1 mt-1 ml-3 w-full">
            {section.subsections.map((subsection) => {
              if (
                subsection.items &&
                !hasAnyPermissionInSection(subsection.items)
              )
                return null;
              return (
                <div key={subsection.title} className="w-full">
                  <Toggler
                    storageKey={subsection.storageKey}
                    renderToggle={({ open, setOpen }) => (
                      <button
                        onClick={() => setOpen(!open)}
                        className="w-full flex items-center justify-between p-2.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-all duration-200 group border border-gray-100 hover:border-gray-200"
                      >
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                          {subsection.title}
                        </span>
                        <div
                          className={`transform transition-transform duration-200 text-gray-400 ${
                            open ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDownIcon />
                        </div>
                      </button>
                    )}
                  >
                    <div className="space-y-1 mt-1 ml-1 w-full">
                      {renderNestedItems(subsection.items, 1)}
                    </div>
                  </Toggler>
                </div>
              );
            })}
          </div>
        </Toggler>
      </div>
    );
  };

  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Menu Buttons */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`fixed top-1 left-2 z-[9999] lg:hidden p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 border-2 border-white ${
          isMobileOpen ? "hidden" : "block"
        }`}
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      <button
        onClick={() => setIsMobileOpen(false)}
        className={`fixed top-1 right-2 z-[9999] lg:hidden p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 border-2 border-white ${
          isMobileOpen ? "block" : "hidden"
        }`}
        aria-label="Close menu"
      >
        <CloseIcon />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm  lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar with PERFECT Scrolling */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 z-[9990] bg-white border-r border-gray-300 shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:transform-none lg:h-screen lg:z-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Header - Fixed at Top */}
        <div
          className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
          style={{ flexShrink: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <img
                src="https://img.freepik.com/free-vector/blond-man-with-eyeglasses-icon-isolated_24911-100831.jpg"
                alt="Logo"
                className="w-6 h-6 rounded-md"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Service Portal
              </h1>
              <p className="text-gray-600 text-xs">Management System</p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Content */}
        <div
          className="p-3 space-y-2 overflow-y-auto overflow-x-hidden"
          style={{
            flex: 1,
            minHeight: 0,
            scrollbarWidth: "thin",
            scrollbarColor: "#CBD5E0 #F7FAFC",
          }}
        >
          {sidebarSections.map(renderSection)}
        </div>

        {/* Footer User Section - Fixed at Bottom */}
        <div
          className="p-3 border-t border-gray-200 bg-white"
          style={{ flexShrink: 0 }}
        >
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 pb-0 border border-gray-200 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                
                <img
                  src={avatarImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate text-sm">
                  {userName}
                </h3>
                <p className="text-xs text-gray-500">ID: {userId}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                {userRole}
              </span>
              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                {department}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Enhanced Custom CSS for Perfect Scrollbar */}
      <style jsx global>{`
        /* Webkit browsers scrollbar */
        div[style*="overflow-y: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 3px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        /* Firefox scrollbar */
        div[style*="overflow-y: auto"] {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
      `}</style>

      {/* Logout Modal */}
      <LogoutModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

{
  /* <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem nested className="mx-1">
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <SettingsRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Settings</Typography>
                  </ListItemContent>

                  <KeyboardArrowDownIcon
                    sx={{ transform: open ? "rotate(180deg)" : "none" }}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/profile");
                    handleItemClick("/profile");
                  }}
                  sx={{ mt: 0.5 }}
                >
                  <ListItemButton selected={selectedItem === "/profile"}>
                    My profile
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/change-password");
                    handleItemClick("/change-password");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/change-password"}
                  >
                    Change password
                  </ListItemButton>
                </ListItem>
         
              </List>
            </Toggler>
          </ListItem>
        </List> */
}

{
  /* <List
          size="sm"
          className="mx-1"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": "3px",
          }}
        >
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <SummarizeIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Reports</Typography>
                  </ListItemContent>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    className="bi bi-chevron-down"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                    />
                  </svg>
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/user-login");
                    handleItemClick("/user-login");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/user-login"}>
                    User Login
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/new-customer");
                    handleItemClick("/new-customer");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/new-customer"}>
                    New Customer
                  </ListItemButton>
                </ListItem>

                <ListItem
                  nested
                  onClick={() => {
                    navigate("/complaint-create");
                    handleItemClick("/complaint-create");
                  }}
                  sx={{ mt: 0.5 }}
                >
                  <ListItemButton
                    selected={selectedItem === "/complaint-create"}
                  >
                    Complaint Create
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/complaint-update");
                    handleItemClick("/complaint-update");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/complaint-update"}
                  >
                    Complaint Update
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/completed-installation");
                    handleItemClick("/completed-installation");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/completed-installation"}
                  >
                    Completed Installation
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/complaint-create-close");
                    handleItemClick("/complaint-create-close");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/complaint-create-close"}
                  >
                    Complaint-Create-Close
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List> */
}
