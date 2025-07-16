import React, { useEffect, useState } from "react";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { closeSidebar } from "./utils";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, CircularProgress, Modal } from "@mui/joy";
import { usePermissions } from "../../PermissionContext";

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
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "0.2s ease",
          "& > *": {
            overflow: "hidden",
          },
        }}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

export default function Sidebar({ onSidebarItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { hasPermission } = usePermissions();

  const canAccess = (componentName, action = "read") => {
    return hasPermission(componentName, action);
  };

  // Helper function to check if any item in a section has permission
  const hasAnyPermissionInSection = (sectionItems) => {
    return sectionItems.some((item) => canAccess(item.component));
  };

  // Define sidebar sections and their items
  const sidebarSections = [
    {
      title: "Master Management",
      icon: <DashboardRoundedIcon />,
      storageKey: "masterManagementTogglerState",
      items: [
        { component: "User", path: "/user" },
        { component: "AERB", path: "/aerb" },
        { component: "Dealer", path: "/dealer" },
        { component: "Branch", path: "/branch" },
        { component: "Product", path: "/product" },
        { component: "Checklist", path: "/admin-checklist" },
        { component: "Equipment", path: "/equipment" },
        { component: "Spare Master", path: "/spare" },
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
      title: "Upload Management",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          style={{ color: "#636b74" }}
          height="16"
          fill="currentColor"
          className="bi bi-cloud-arrow-up-fill"
          viewBox="0 0 16 16"
        >
          <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z" />
        </svg>
      ),
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
      icon: <SettingsRoundedIcon />,
      storageKey: "adminTogglerState",
      items: [
        { component: "Geo", path: "/admin-geo" },
        { component: "Country", path: "/admin-country" },
        { component: "Region", path: "/admin-region" },
        { component: "State", path: "/admin-state" },
        { component: "City", path: "/admin-city" },
        { component: "CheckListType", path: "/checklist-type" },
        { component: "CheckPointType", path: "/checkpoint-type" },
        { component: "Role Manage", path: "/role-manage" },
        { component: "User Type", path: "/admin-user-type" },
        { component: "Department", path: "/admin-department" },
        { component: "Product Group", path: "/admin-product-group" },
        { component: "PM Master", path: "/admin-pm-master" },
        { component: "CMC/NCMC Years", path: "/cmc-ncmc-years" },
        { component: "CMC/NCMC Price", path: "/cmc-ncmc-price" },
        { component: "CMC/NCMC TDS", path: "/cmc-ncmc-tds" },
        { component: "CMC/NCMC Gst", path: "/cmc-ncmc-gst" },
        { component: "CMC/NCMC Discount", path: "/cmc-ncmc-discount" },
        { component: "Quote Approval", path: "/quote-approval" },
        { component: "CNote Delete", path: "/cnote-delete" },
      ],
    },
    {
      title: "Close Order",
      icon: <SummarizeIcon />,
      storageKey: "closeOrderTogglerState",
      items: [
        { component: "Open Proposal", path: "/open-proposal" },
        { component: "Close Proposal", path: "/close-proposal" },
      ],
    },
  ];

  const avatarImage =
    user?.details?.profileimage ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286";

  const userName = user?.details?.firstname || "Default Name";
  const userId = user?.details?.employeeid || "Default ID";
  const userRole = user?.details?.role?.roleName || "User";
  const department = user?.details?.department || "None";

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
  };
  const { ready } = usePermissions();

  if (!ready) {
    return (
      <Sheet className="Sidebar">
        <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
          <CircularProgress />
        </Box>
      </Sheet>
    );
  }
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 1,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 0,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <img
          style={{ width: "40px", height: "40px", borderRadius: "5px" }}
          src="https://img.freepik.com/free-vector/blond-man-with-eyeglasses-icon-isolated_24911-100831.jpg?t=st=1713514458~exp=1713518058~hmac=9d7688b59aa4ecb9a54415ce7ef5de909bbbf715fb73346df0d52abf0b08c603&w=740"
          alt=""
        />
        <Typography level="title-lg">Service Portal</Typography>
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          className="mb-5 mt-6 mx-1"
          sx={{
            gap: 3,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": "3px",
          }}
        >
          {/* Render only sections where user has at least one permission */}
          {sidebarSections.map((section) => {
            if (!hasAnyPermissionInSection(section.items)) {
              return null;
            }

            return (
              <ListItem nested key={section.title}>
                <Toggler
                  storageKey={section.storageKey}
                  renderToggle={({ open, setOpen }) => (
                    <ListItemButton onClick={() => setOpen(!open)}>
                      {section.icon}
                      <ListItemContent>
                        <Typography level="title-sm">
                          {section.title}
                        </Typography>
                      </ListItemContent>
                      <KeyboardArrowDownIcon
                        sx={{ transform: open ? "rotate(180deg)" : "none" }}
                      />
                    </ListItemButton>
                  )}
                >
                  <List sx={{ gap: 0.5 }}>
                    {section.items.map((item) => {
                      if (!canAccess(item.component)) {
                        return null;
                      }

                      return (
                        <ListItem
                          nested
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            handleItemClick(item.path);
                          }}
                        >
                          <ListItemButton selected={selectedItem === item.path}>
                            {item.component}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Toggler>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ width: "100%" }}>
        <div className="flex mx-1 bg-gradient-to-r from-slate-50 to-gray-50 gap-3 items-center rounded-xl pl-3 py-3 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300/60">
          <Avatar
            variant="outlined"
            size="sm"
            src={`${process.env.REACT_APP_BASE_URL || ""}${avatarImage}`}
            className="ring-2 ring-white shadow-sm"
          />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <div className="flex items-center justify-between pr-2">
              <Typography
                level="title-sm"
                className="text-sm font-semibold text-gray-800 mb-1"
              >
                {userName}
              </Typography>
              <Typography
                level="body-xs"
                className="text-xs text-gray-600 font-medium"
              >
                Role ID: {userId}
              </Typography>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-1.5">
                <Typography
                  level="body-xs"
                  className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-black font-semibold shadow-sm"
                >
                  {userRole}
                </Typography>
                <Typography
                  level="body-xs"
                  className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white font-medium shadow-sm"
                >
                  {department}
                </Typography>
              </div>
            </div>
          </Box>
        </div>
        <div className="mx-1">
          <IconButton
            size="sm"
            className="flex gap-5 mb-3 h-10 text-lg items-center mt-2 justify-between px-3 bg-gray-200 w-full"
            variant="plain"
            color="neutral"
            onClick={() => setIsModalOpen(true)}
          >
            LogOut <LogoutRoundedIcon />
          </IconButton>

          <LogoutModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleLogout}
          />
        </div>
      </Box>
    </Sheet>
  );
}

const LogoutModal = ({ open, onClose, onConfirm }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="p-5 bg-white rounded-md shadow-lg w-80"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="mb-6">Are you sure you want to log out?</p>
        <div className="flex justify-end gap-4">
          <Button variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" color="danger" onClick={onConfirm}>
            Log Out
          </Button>
        </div>
      </div>
    </Modal>
  );
};

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
