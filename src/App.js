import React, { useEffect, useState } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
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
import Spare from './Components/DataComponents/Master_Managemnet/SparePart/Spare';
import FormatMaster from './Components/DataComponents/Master_Managemnet/Format/FormatMaster';
import CmcNcmcWYears from './Components/DataComponents/Admin/CmcNcmcWYears';
import CmcNcmcPrice from './Components/DataComponents/Admin/CmcNcmcPrice';
import CmcNcmcTds from './Components/DataComponents/Admin/CmcNcmcTds';
import CmcNcmcGst from './Components/DataComponents/Admin/CmcNcmcGst';
import CmcNcmcDiscount from './Components/DataComponents/Admin/CmcNcmcDiscount';
import QuoteApproval from './Components/DataComponents/Admin/QuoteApproval/QuoteApproval';
import OpenProposal from './Components/DataComponents/CloseOrder/OpenProposal';
import CloseProposal from './Components/DataComponents/CloseOrder/CloseProposal';
import ProposalApprovalPage from './Components/DataComponents/Admin/QuoteApproval/ProposalApprovalPage';
import CNoteDelete from './Components/DataComponents/Admin/CNote/CNoteDelete';
import RoleManagement from './Components/DataComponents/Role/RoleManagement';
import { PermissionProvider } from './PermissionContext';
import ProtectedRoute from './ProtectedRoute';
import UserManagment from './Components/DataComponents/Master_Managemnet/User/UserManagment';


const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  return user?.token ? children : <Navigate to="/login" />;
};


const App = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
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
          <PermissionProvider>

            <Routes>
              <Route
                path="/user"
                element={
                  <ProtectedRoute
                    component={UserData}
                    componentName="User"
                    requiredPermission="read"
                  />
                }
              />
              <Route path="/equipment" element={<ProtectedRoute
                component={Equipment}
                componentName="Equipment"
                requiredPermission="read"
              />} />
              <Route path="/product" element={<ProtectedRoute
                component={Product}
                componentName="Product"
                requiredPermission="read"
              />} />
              <Route path="/reported-problem" element={<ProtectedRoute
                component={ReportedProblem}
                componentName="Reported Problem"
                requiredPermission="read"
              />} />
              <Route path="/warrenty-code" element={<ProtectedRoute
                component={WarrantyCode}
                componentName="Warranty Code"
                requiredPermission="read"
              />} />
              <Route path="/replaced-part-code" element={<ProtectedRoute
                component={ReplacedPartCode}
                componentName="Replaced Part Code"
                requiredPermission="read"
              />} />
              <Route path="/aerb" element={<ProtectedRoute
                component={Aerb}
                componentName="AERB"
                requiredPermission="read"
              />} />
              <Route path="/dealer" element={<ProtectedRoute
                component={Dealer}
                componentName="Dealer"
                requiredPermission="read"
              />} />
              {/* <Route path="/branch" element={<ProtectedRoute
                component={Branch}
                componentName="Branch"
                requiredPermission="read"
              />} /> */}
              {/* <Route path="/complaint-create" element={<ProtectedRoute
                component={ComplaintCreate}
                componentName="Complaint Create"
                requiredPermission="read"
              />} /> */}
              <Route path="/complaint-create-close" element={<ProtectedRoute
                component={ComplaintCreateClose}
                componentName="Complaint Create Close"
                requiredPermission="read"
              />} />
              <Route path="/complaint-update" element={<ProtectedRoute
                component={ComplaintUpdate}
                componentName="Complaint Update"
                requiredPermission="read"
              />} />
              <Route path="/completed-installation" element={<ProtectedRoute
                component={CompletedInstallation}
                componentName="Completed Installation"
                requiredPermission="read"
              />} />
              <Route path="/admin-country" element={<ProtectedRoute
                component={AdminCountry}
                componentName="Country"
                requiredPermission="read"
              />} />
              <Route path="/admin-state" element={<ProtectedRoute
                component={AdminState}
                componentName="State"
                requiredPermission="read"
              />} />
              <Route path="/admin-city" element={<ProtectedRoute
                component={AdminCity}
                componentName="City"
                requiredPermission="read"
              />} />
              <Route path="/branch" element={<ProtectedRoute
                component={AdminBranch}
                componentName="Branch"
                requiredPermission="read"
              />} />

              <Route path="/admin-department" element={<ProtectedRoute
                component={AdminDepartment}
                componentName="Department"
                requiredPermission="read"
              />} />
              <Route path="/admin-department" element={<ProtectedRoute
                component={AdminDepartment}
                componentName="Department"
                requiredPermission="read"
              />} />
              <Route path="/admin-user-type" element={<ProtectedRoute
                component={AdminUserType}
                componentName="User Type"
                requiredPermission="read"
              />} />
              <Route path="/admin-product-group" element={<ProtectedRoute
                component={AdminProductGroup}
                componentName="Product Group"
                requiredPermission="read"
              />} />
              <Route path="/admin-checklist" element={<ProtectedRoute
                component={AdminChecklist}
                componentName="Checklist"
                requiredPermission="read"
              />} />
              <Route path="/admin-pm-master" element={<ProtectedRoute
                component={AdminPM_Master}
                componentName="PM Master"
                requiredPermission="read"
              />} />
              <Route path="/spare" element={<ProtectedRoute
                component={Spare}
                componentName="Spare Master"
                requiredPermission="read"
              />} />
              <Route path="/new-customer" element={<ProtectedRoute
                component={NewCustomer}
                componentName="NewCustomer"
                requiredPermission="read"
              />} />
              <Route path="/amc-contract" element={<ProtectedRoute
                component={AmcContract}
                componentName="AMC Contract"
                requiredPermission="read"
              />} />
              <Route path="/customer" element={<ProtectedRoute
                component={Customer}
                componentName="Customer"
                requiredPermission="read"
              />} />
              <Route path="/dealer-stock" element={<ProtectedRoute
                component={DealerStock}
                componentName="Dealer Stock"
                requiredPermission="read"
              />} />
              <Route path="/hub-stock" element={<ProtectedRoute
                component={HubStock}
                componentName="Hub Stock"
                requiredPermission="read"
              />} />
              <Route path="/pending-complaint" element={<ProtectedRoute
                component={PendingComplaint}
                componentName="Pending Complaint"
                requiredPermission="read"
              />} />
              <Route path="/pending-installation" element={<ProtectedRoute
                component={PendingInstallation}
                componentName="Pending Installation"
                requiredPermission="read"
              />} />
              <Route path="/change-password" element={<ChangePassword />} />


              <Route path="/profile" element={<Profile />} />
              <Route path="/preventive-maintenance" element={<ProtectedRoute
                component={PreventiveMaintenance}
                componentName="Preventive Maintenance"
                requiredPermission="read"
              />} />
              <Route path="/checklist-type" element={<ProtectedRoute
                component={CheckListType}
                componentName="CheckListType"
                requiredPermission="read"
              />} />
              <Route path="/checkpoint-type" element={<ProtectedRoute
                component={CheckPointType}
                componentName="CheckPointType"
                requiredPermission="read"
              />} />
              <Route path="/formatmaster" element={<ProtectedRoute
                component={FormatMaster}
                componentName="Format Master"
                requiredPermission="read"
              />} />
              <Route path="/cmc-ncmc-years" element={<ProtectedRoute
                component={CmcNcmcWYears}
                componentName="CMC/NCMC Years"
                requiredPermission="read"
              />} />
              <Route path="/cmc-ncmc-price" element={<ProtectedRoute
                component={CmcNcmcPrice}
                componentName="CMC/NCMC Price"
                requiredPermission="read"
              />} />
              <Route path="/cmc-ncmc-tds" element={<ProtectedRoute
                component={CmcNcmcTds}
                componentName="CMC/NCMC TDS"
                requiredPermission="read"
              />} />
              <Route path="/cmc-ncmc-gst" element={<ProtectedRoute
                component={CmcNcmcGst}
                componentName="CMC/NCMC Gst"
                requiredPermission="read"
              />} />
              <Route path="/cmc-ncmc-discount" element={<ProtectedRoute
                component={CmcNcmcDiscount}
                componentName="CMC/NCMC Discount"
                requiredPermission="read"
              />} />
              <Route path="/quote-approval" element={<ProtectedRoute
                component={QuoteApproval}
                componentName="Quote Approval"
                requiredPermission="read"
              />} />
              <Route path="/cnote-delete" element={<ProtectedRoute
                component={CNoteDelete}
                componentName="CNote Delete"
                requiredPermission="read"
              />} />
              {/* <Route path="/open-proposal" element={<ProtectedRoute
                component={OpenProposal}
                componentName="Open Proposal"
                requiredPermission="read"
              />} /> */}
              <Route path="/open-proposal" element={<OpenProposal />} />
              <Route path="/complaint-create" element={<ComplaintCreate />} />
              <Route path="/user-create" element={<UserManagment />} />
              <Route path="/proposal/:id" element={<ProposalApprovalPage />} />
              <Route path="/close-proposal" element={<CloseProposal />} />
              <Route path="/role-manage" element={<ProtectedRoute
                component={RoleManagement}
                componentName="Role Manage"
                requiredPermission="read"
              />} />
              {/* <Route path="/role-manage" element={<RoleManagement />} /> */}
              {/* Add other protected routes here */}
            </Routes>
          </PermissionProvider>

        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default App;