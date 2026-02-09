import { BrowserRouter, Routes, Route,useNavigate } from "react-router-dom";
import { lazy,Suspense } from "react";
import AppLayout from "./layouts/AppLayout.jsx";
import Signup from "./pages/signup.jsx";
import Login from "./pages/login.jsx";
import Forgotpass from "./pages/forgotpassword.jsx";
import SearchRide from "./pages/searchride.jsx";
import MyProfile from "./pages/myprofile.jsx";
import PublishRide from "./pages/publishride.jsx";
import ProtectedRoutes from "./routes/protectedRoutes.jsx";
import MyPublishedRides from "./pages/myPublishedRides.jsx";
import ManageRide from "./pages/manageride.jsx";
import ViewRide from "./pages/viewride.jsx";
import MyBookings from "./pages/mybookings.jsx";

// import HomeDashboard from "./pages/dashboard.jsx";
const HomeDashboard=lazy(()=>import("./pages/dashboard.jsx"))

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