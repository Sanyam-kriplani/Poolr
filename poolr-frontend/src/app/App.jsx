import { BrowserRouter, Routes, Route,useNavigate } from "react-router-dom";
import { lazy,Suspense } from "react";
import AppLayout from "../layouts/AppLayout.jsx";
import Signup from "../features/auth/pages/signup.jsx";
import Login from "../features/auth/pages/login.jsx";
import Forgotpass from "../features/auth/pages/forgotpassword.jsx";
import SearchRide from "../features/rides/pages/searchride.jsx";
import MyProfile from "../features/user/pages/myprofile.jsx";
import PublishRide from "../features/rides/pages/publishride.jsx";
import ProtectedRoutes from "../routes/protectedRoutes.jsx";
import MyPublishedRides from "../features/user/pages/myPublishedRides.jsx";
import ManageRide from "../features/rides/pages/manageride.jsx";
import ViewRide from "../features/rides/pages/viewride.jsx";
import MyBookings from "../features/user/pages/mybookings.jsx";

// import HomeDashboard from "./pages/dashboard.jsx";
const HomeDashboard=lazy(()=>import("../pages/dashboard.jsx"))

function App() {

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<Forgotpass />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeDashboard />} />
            
            <Route path="/search-ride" element={<SearchRide />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/publish-ride" element={<PublishRide />} />
            <Route path="/my-published-rides" element={<MyPublishedRides />} />
            <Route path="/manage-ride" element={<ManageRide />} />
            <Route path="/view-ride" element={<ViewRide/>} />
            <Route path="/my-bookings" element={<MyBookings/>} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;