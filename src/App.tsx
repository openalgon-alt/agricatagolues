import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EditorialBoard from "./pages/EditorialBoard";
import Guidelines from "./pages/Guidelines";
import CurrentIssue from "./pages/CurrentIssue";
import Archives from "./pages/Archives";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/admin/Login";
import { AdminLayout } from "./layouts/AdminLayout";
import { RequireAuth } from "./components/admin/RequireAuth";
import Dashboard from "./pages/admin/Dashboard";
import IssueList from "./pages/admin/IssueList";

import IssueEditor from "./pages/admin/IssueEditor";

import IssueView from "./pages/IssueView";
import EditorialBoardList from "./pages/admin/EditorialBoardList";
import EditorialMemberEditor from "./pages/admin/EditorialMemberEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/editorial-board" element={<EditorialBoard />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/current-issue" element={<CurrentIssue />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/issues/:id" element={<IssueView />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/contact" element={<Contact />} />

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
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
