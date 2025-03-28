import React, { useEffect, useState } from "react";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SummarizeIcon from "@mui/icons-material/Summarize";
// import ColorSchemeToggle from '../ColorToggle/ColorSchemeToggle';
import { closeSidebar } from "./utils";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal } from "@mui/joy";

function Toggler({ defaultExpanded = false, renderToggle, children }) {
  const [open, setOpen] = useState(defaultExpanded);
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

  // Check if image exists in localStorage, otherwise use a default image
  const avatarImage =
    user?.image ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286";
  const userName = user?.name || "Default Name"; // Fallback to "Default Name" if not available
  const userId = user?.employeeId || "Default ID"; // Fallback to "Default ID" if not available
  const userRole = user?.roleName || "User";
  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data from localStorage
    window.location.reload(); // Refresh the page or navigate to login page
  };

  useEffect(() => {
    // Set the selected item based on the current route
    setSelectedItem(location.pathname);
  }, [location.pathname]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };
  const [activeToggler, setActiveToggler] = useState(null);

  const handleToggle = (toggler) => {
    setActiveToggler((prevToggler) =>
      prevToggler === toggler ? null : toggler
    );
  };
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
        {/* <ColorSchemeToggle sx={{ ml: 'auto' }} /> */}
      </Box>
      {/* <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Search"
      /> */}
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          //   display: "grid",
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
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": "3px",
          }}
        >
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <DashboardRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Master Management</Typography>
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
                    navigate("/user");
                    handleItemClick("/user");
                  }}
                  sx={{ mt: 0.5 }}
                >
                  <ListItemButton selected={selectedItem === "/user"}>
                    User
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/equipment");
                    handleItemClick("/equipment");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/equipment"}>
                    Equipment
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/product");
                    handleItemClick("/product");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/product"}>
                    Product
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/reported-problem");
                    handleItemClick("/reported-problem");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/reported-problem"}
                  >
                    Reported Problem
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/warrenty-code");
                    handleItemClick("/warrenty-code");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/warrenty-code"}>
                    Warranty Code
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/replaced-part-code");
                    handleItemClick("/replaced-part-code");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/replaced-part-code"}
                  >
                    Replaced Part Code
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/aerb");
                    handleItemClick("/aerb");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/aerb"}>
                    AERB
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/dealer");
                    handleItemClick("/dealer");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/dealer"}>
                    Dealer
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/spare");
                    handleItemClick("/spare");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/spare"}>
                    Spare Master
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-checklist");
                    handleItemClick("/admin-checklist");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/admin-checklist"}
                  >
                    Checklist
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List>
        <List
          size="sm"
          className="mb-5 mx-1"
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
                  <ListItemContent>
                    <Typography level="title-sm">Upload Management</Typography>
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
                    navigate("/amc-contract");
                    handleItemClick("/amc-contract");
                  }}
                  sx={{ mt: 0.5 }}
                >
                  <ListItemButton selected={selectedItem === "/amc-contract"}>
                    AMC Contract
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/customer");
                    handleItemClick("/customer");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/customer"}>
                    Customer
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/dealer-stock");
                    handleItemClick("/dealer-stock");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/dealer-stock"}>
                    Dealer Stock
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/hub-stock");
                    handleItemClick("/hub-stock");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/hub-stock"}>
                    Hub Stock
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/pending-installation");
                    handleItemClick("/pending-installation");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/pending-installation"}
                  >
                    Pending Installation
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/pending-complaint");
                    handleItemClick("/pending-complaint");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/pending-complaint"}
                  >
                    Pending Complaint
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/preventive-maintenance");
                    handleItemClick("/preventive-maintenance");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/preventive-maintenance"}
                  >
                    Preventive Maintenance
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List>
        <List
          size="sm"
          className="mx-1 mb-5"
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
                    <Typography level="title-sm">Admin</Typography>
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
                    navigate("/admin-country");
                    handleItemClick("/admin-country");
                  }}
                  sx={{ mt: 0.5 }}
                >
                  <ListItemButton selected={selectedItem === "/admin-country"}>
                    Country
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-state");
                    handleItemClick("/admin-state");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/admin-state"}>
                    State/Region
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-city");
                    handleItemClick("/admin-city");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/admin-city"}>
                    City
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/checklist-type");
                    handleItemClick("/checklist-type");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/checklist-type"}>
                    CheckListType
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/checkpoint-type");
                    handleItemClick("/checkpoint-type");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/checkpoint-type"}
                  >
                    CheckPointType
                  </ListItemButton>
                </ListItem>

                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-branch");
                    handleItemClick("/admin-branch");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/admin-branch"}>
                    Branch
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/Roles");
                    handleItemClick("/Roles");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/Roles"}>
                    Roles
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-user-type");
                    handleItemClick("/admin-user-type");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/admin-user-type"}
                  >
                    User Type
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-department");
                    handleItemClick("/admin-department");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/admin-department"}
                  >
                    Department
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-product-group");
                    handleItemClick("/admin-product-group");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/admin-product-group"}
                  >
                    Product Group
                  </ListItemButton>
                </ListItem>

                <ListItem
                  nested
                  onClick={() => {
                    navigate("/admin-pm-master");
                    handleItemClick("/admin-pm-master");
                  }}
                >
                  <ListItemButton
                    selected={selectedItem === "/admin-pm-master"}
                  >
                    PM Master
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List>
        {/* <List
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
                    navigate("/user-login");
                    handleItemClick("/user-login");
                  }}
                >
                  <ListItemButton selected={selectedItem === "/user-login"}>
                    User Login
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List> */}
        {/* <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <DashboardRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Master Management</Typography>
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
                    navigate("/user");
                    handleItemClick("user");
                  }}
                  sx={{ mt: 0.5 }}
                >
                  <ListItemButton selected={selectedItem === "user"}>
                    User
                  </ListItemButton>
                </ListItem>
                <ListItem
                  nested
                  onClick={() => {
                    navigate("/equipment");
                    handleItemClick("equipment");
                  }}
                >
                  <ListItemButton selected={selectedItem === "equipment"}>
                    Equipment
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/product")}>
                    Product
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/reported-problem")}>
                    Reported Problem
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/warrenty-code")}>
                    Warranty Code
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => navigate("/replaced-part-code")}
                  >
                    Replaced Part Code
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("aerb")}>
                    AERB
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/dealer")}>
                    Dealer
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
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
                  <ListItemContent>
                    <Typography level="title-sm">Upload Management</Typography>
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
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton onClick={() => navigate("/amc-contract")}>
                    AMC Contract
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/customer")}>
                    Customer
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/dealer-stock")}>
                    Dealer Stock
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/hub-stock")}>
                    Hub Stock
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => navigate("/pending-installation")}
                  >
                    Pending Installation
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => navigate("/pending-complaint")}
                  >
                    Pending Complaint
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <SummarizeIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Admin</Typography>
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
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton onClick={() => navigate("/admin-country")}>
                    Country
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/admin-state")}>
                    State/Region
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/admin-city")}>
                    City
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/admin-branch")}>
                    Branch
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/Roles")}>
                    Roles
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/admin-user-type")}>
                    User Type
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/admin-department")}>
                    Department
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => navigate("/admin-product-group")}
                  >
                    Product Group
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/admin-checklist")}>
                    Checklist
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate("/admin-pm-master")}>
                    PM Master
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List> */}
      </Box>

      <Divider />
      <Box sx={{ width: "100%" }}>
        <List
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
                <ListItem>
                  {/* <ListItemButton onClick={()=>navigate('/reported-problem')}>Roles & permission</ListItemButton> */}
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List>
        <div className="flex my-3 border mx-1 bg-gray-100 gap-1 items-center rounded pl-1 py-1">
          <Avatar
            variant="outlined"
            size="sm"
            src={avatarImage} // Dynamically set avatar image
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="title-sm" className="text-xs font-bold">
              {userName}
            </Typography>
            <div className="flex gap-2 mt-1">
              <Typography level="body-xs" className="text-xs font-bold">
                Id - {userId}
              </Typography>
              <Typography
                level="body-xs"
                className="text-xs border px-1 bg-yellow-500 rounded-[3px] text-black font-bold"
              >
                {userRole}
              </Typography>
            </div>
          </Box>
        </div>
        <div className="mx-1">
          <IconButton
            size="sm"
            className="flex gap-5 mb-3 h-10 text-lg items-center mt-5 justify-between px-3 bg-gray-200 w-full"
            variant="plain"
            color="neutral"
            onClick={() => setIsModalOpen(true)} // Open the modal
          >
            LogOut <LogoutRoundedIcon />
          </IconButton>

          {/* Logout confirmation modal */}
          <LogoutModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)} // Close modal without logging out
            onConfirm={handleLogout} // Confirm and logout
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
