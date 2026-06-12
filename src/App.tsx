import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import EditorialBoard from "./pages/EditorialBoard";
import Guidelines from "./pages/Guidelines";
import CurrentIssue from "./pages/CurrentIssue";
import Archives from "./pages/Archives";
import Membership from "./pages/Membership";
import PublishWithUs from "./pages/PublishWithUs";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import ExamPage from "./pages/ExamPage";

// AO/AAO Exam Portal Imports
import LandingPage from "./pages/ao-aao-portal/LandingPage";
import AuthPage from "./pages/ao-aao-portal/AuthPage";
import AoAaoPortalLayout from "./pages/ao-aao-portal/AoAaoPortalLayout";
import DashboardPage from "./pages/ao-aao-portal/DashboardPage";
import SubjectsPage from "./pages/ao-aao-portal/SubjectsPage";
import TestsPage from "./pages/ao-aao-portal/TestsPage";
import TestSessionPage from "./pages/ao-aao-portal/TestSessionPage";
import ResultsPage from "./pages/ao-aao-portal/ResultsPage";
import BillingPage from "./pages/ao-aao-portal/BillingPage";
import ProfilePage from "./pages/ao-aao-portal/ProfilePage";
import FreeTestPage from "./pages/ao-aao-portal/FreeTestPage";
import AnalyticsPage from "./pages/ao-aao-portal/AnalyticsPage";

import { AuthProvider } from "./context/AuthContext";
import { ExamAuthProvider } from "./context/ExamAuthContext";
import Login from "./pages/admin/Login";
import { AdminLayout } from "./layouts/AdminLayout";
import { RequireAuth } from "./components/admin/RequireAuth";
import Dashboard from "./pages/admin/Dashboard";
import IssueList from "./pages/admin/IssueList";

import IssueEditor from "./pages/admin/IssueEditor";

import IssueView from "./pages/IssueView";
import EditorialBoardList from "./pages/admin/EditorialBoardList";
import EditorialMemberEditor from "./pages/admin/EditorialMemberEditor";
import ProductList from "./pages/admin/ProductList";
import ProductEditor from "./pages/admin/ProductEditor";
import ExamSubmissions from "./pages/admin/ExamSubmissions";
import ExamList from "./pages/admin/ExamList";
import ExamEditor from "./pages/admin/ExamEditor";
import UserAccess from "./pages/admin/UserAccess";
import StudentList from "./pages/admin/StudentList";
import OfflineCoachingList from "./pages/admin/OfflineCoachingList";
import { SiteSettingsProvider, useSiteSettings } from "./context/SiteSettingsContext";

// AO/AAO Admin Imports
import AoAaoControlCenter from "./pages/admin/ao-aao/ControlCenter";
import AoAaoPapersPage from "./pages/admin/ao-aao/PapersPage";
import AoAaoFreeTestPage from "./pages/admin/ao-aao/FreeTestPage";
import AoAaoAccessPage from "./pages/admin/ao-aao/AccessPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SiteSettingsProvider>
          <ExamAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/editorial-board" element={<EditorialBoard />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/current-issue" element={<CurrentIssue />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/publish-with-us" element={<PublishWithUs />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/issues/:id" element={<IssueView />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/exam" element={<ExamPage />} />

            {/* AO/AAO Portal Routes */}
            <Route path="/exam/ao-aao" element={<LandingPage />} />
            <Route path="/exam/ao-aao/auth" element={<AuthPage />} />
            <Route path="/exam/ao-aao" element={<AoAaoPortalLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="subjects/:subjectId/tests" element={<TestsPage />} />
              <Route path="subjects/:subjectId/tests/:paperNumber/session" element={<TestSessionPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="free-test" element={<FreeTestPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }>
              <Route index element={<Dashboard />} />
              <Route path="issues" element={<IssueList />} />
              <Route path="issues/new" element={<IssueEditor />} />
              <Route path="issues/:id" element={<IssueEditor />} />
              <Route path="editorial-board" element={<EditorialBoardList />} />
              <Route path="editorial-board/new" element={<EditorialMemberEditor />} />
              <Route path="editorial-board/:id" element={<EditorialMemberEditor />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductEditor />} />
              <Route path="products/:id" element={<ProductEditor />} />
              <Route path="exams" element={<ExamList />} />
              <Route path="exams/new" element={<ExamEditor />} />
              <Route path="exams/:id" element={<ExamEditor />} />
              <Route path="exam-submissions" element={<ExamSubmissions />} />
              <Route path="user-access" element={<UserAccess />} />
              <Route path="students" element={<StudentList />} />
              <Route path="offline-coaching" element={<OfflineCoachingList />} />
              
              {/* AO/AAO Admin Routes */}
              <Route path="ao-aao" element={<AoAaoControlCenter />} />
              <Route path="ao-aao/papers" element={<AoAaoPapersPage />} />
              <Route path="ao-aao/free-test" element={<AoAaoFreeTestPage />} />
              <Route path="ao-aao/access" element={<AoAaoAccessPage />} />
            </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </ExamAuthProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
