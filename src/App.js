import React, { useEffect, useState } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Sidebar from './Components/Sidebar/Sidebar';
import Header from './Components/Header/Header';
import OrderTable from './Components/RightTable/Table';
import Equipment from './Components/DataComponents/Master_Managemnet/Equipment/Equipment';
import Product from './Components/DataComponents/Master_Managemnet/Product/Product';
import ReportedProblem from './Components/DataComponents/Master_Managemnet/Reported_Problem/ReportedProblem';
import WarrantyCode from './Components/DataComponents/Master_Managemnet/WarrantyCode/WarrantyCode';
import ReplacedPartCode from './Components/DataComponents/Master_Managemnet/Replaced_Part_Code/ReplacedPartCode';
import Aerb from './Components/DataComponents/Master_Managemnet/AERB/Aerb';
import Dealer from './Components/DataComponents/Master_Managemnet/Dealer/Dealer';
import Branch from './Components/DataComponents/Master_Managemnet/Branch/Branch';
import ComplaintCreate from './Components/DataComponents/Reports/Complaint_Create/ComplaintCreate';
import ComplaintCreateClose from './Components/DataComponents/Reports/Complaint_Create_Close/ComplaintCreateClose';
import ComplaintUpdate from './Components/DataComponents/Reports/Complaint_Update/ComplaintUpdate';
import CompletedInstallation from './Components/DataComponents/Reports/Completed_Installation/CompletedInstallation';
import NewCustomer from './Components/DataComponents/Reports/New_Customer/NewCustomer';
import UserLogin from './Components/DataComponents/Reports/User_Login/UserLogin';
import UserData from './Components/DataComponents/Master_Managemnet/User/UserData';
import AmcContract from './Components/DataComponents/Upload_Management/AMC Contract/AmcContract';
import Customer from './Components/DataComponents/Upload_Management/Customer/Customer';
import DealerStock from './Components/DataComponents/Upload_Management/DealerStock/DealerStock';
import HubStock from './Components/DataComponents/Upload_Management/Hub_Stock/HubStock';
import PendingComplaint from './Components/DataComponents/Upload_Management/Pending_Complaint/PendingComplaint';
import PendingInstallation from './Components/DataComponents/Upload_Management/Pending_Installation/PendingInstallation';
import ChangePassword from './Components/Profile/ChangePassword';
import AdminCountry from './Components/DataComponents/Admin/AdminCountry';
import AdminState from './Components/DataComponents/Admin/AdminState';
import AdminCity from './Components/DataComponents/Admin/AdminCity';
import AdminBranch from './Components/DataComponents/Admin/AdminBranch';
import AdminUserType from './Components/DataComponents/Admin/AdminUserType';
import AdminDepartment from './Components/DataComponents/Admin/AdminDepartment';
import AdminProductGroup from './Components/DataComponents/Admin/AdminProductGroup';
import AdminChecklist from './Components/DataComponents/Admin/AdminChecklist';
import AdminPM_Master from './Components/DataComponents/Admin/AdminPM_Master';
import AdminRoles from './Components/DataComponents/Admin/AdminRoles';
import Login from './Components/Auth/Login';
import Profile from './Components/Profile/Profile';
import PreventiveMaintenance from './Components/DataComponents/Upload_Management/PreventiveMaintenance/PreventiveMaintenance';
import CheckListType from './Components/DataComponents/Admin/CheckListType';
import CheckPointType from './Components/DataComponents/Admin/CheckPointType';


const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  return user?.token ? children : <Navigate to="/login" />;
};


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login if not logged in */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login route */}
        <Route
          path="/login"
          element={
            JSON.parse(localStorage.getItem('user'))?.token ? (
              <Navigate to="/user" /> // Redirect to dashboard if logged in
            ) : (
              <Login />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppContent />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};



const AppContent = () => {
  const [currentRouteName, setCurrentRouteName] = useState('');
  const location = useLocation();

  useEffect(() => {
    const routeName = location.pathname.split('/').pop().replace(/-/g, ' ');
    setCurrentRouteName(routeName.charAt(0).toUpperCase() + routeName.slice(1));
  }, [location.pathname]);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
        <Header />
        <Sidebar />
        <Box
          sx={{
            px: { xs: 2, md: 2 },
            pt: {
              xs: 'calc(12px + var(--Header-height))',
              sm: 'calc(12px + var(--Header-height))',
              md: 1,
            },
            pb: { xs: 2, sm: 2, md: 0 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100dvh',
            gap: 1,
          }}
        >
          {/* Define routes */}
          <Routes>
            <Route path="/user" element={<UserData />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/product" element={<Product />} />
            <Route path="/reported-problem" element={<ReportedProblem />} />
            <Route path="/warrenty-code" element={<WarrantyCode />} />
            <Route path="/replaced-part-code" element={<ReplacedPartCode />} />
            <Route path="/aerb" element={<Aerb />} />
            <Route path="/dealer" element={<Dealer />} />
            <Route path="/branch" element={<Branch />} />
            <Route path="/complaint-create" element={<ComplaintCreate />} />
            <Route path="/complaint-create-close" element={<ComplaintCreateClose />} />
            <Route path="/complaint-update" element={<ComplaintUpdate />} />
            <Route path="/completed-installation" element={<CompletedInstallation />} />
            <Route path="/admin-country" element={<AdminCountry />} />
            <Route path="/admin-state" element={<AdminState />} />
            <Route path="/admin-city" element={<AdminCity />} />
            <Route path="/admin-branch" element={<AdminBranch />} />
            <Route path="/admin-userType" element={<AdminUserType />} />
            <Route path="/admin-roles" element={<AdminRoles />} />
            <Route path="/admin-department" element={<AdminDepartment />} />
            <Route path="/admin-user-type" element={<AdminUserType />} />
            <Route path="/admin-product-group" element={<AdminProductGroup />} />
            <Route path="/admin-checklist" element={<AdminChecklist />} />
            <Route path="/admin-pm-master" element={<AdminPM_Master />} />
            <Route path="/new-customer" element={<NewCustomer />} />
            <Route path="/amc-contract" element={<AmcContract />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/dealer-stock" element={< DealerStock />} />
            <Route path="/hub-stock" element={< HubStock />} />
            <Route path="/pending-complaint" element={< PendingComplaint />} />
            <Route path="/pending-installation" element={< PendingInstallation />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/order-list" element={<OrderTable />} />
            <Route path="/order-list" element={<OrderTable />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/preventive-maintenance" element={<PreventiveMaintenance />} />
            <Route path="/checklist-type" element={<CheckListType />} />
            <Route path="/checkpoint-type" element={<CheckPointType />} />
            {/* Add other protected routes here */}
          </Routes>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default App;