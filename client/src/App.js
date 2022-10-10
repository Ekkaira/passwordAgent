import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// import NewPass from "./places/pages/NewPass";
// import UserPasswords from "./places/pages/UserPasswords";
// import UpdatePass from "./places/pages/UpdatePass";
import Auth from "./user/pages/Auth";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";

const NewPass = React.lazy(() => import("./places/pages/NewPass"));
const UserPasswords = React.lazy(() => import("./places/pages/UserPasswords"));
const UpdatePass = React.lazy(() => import("./places/pages/UpdatePass"));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/:userId/passwords" element={<UserPasswords />} />
        <Route path="/passwords/new" element={<NewPass />} />
        <Route path="/passwords/:passId" element={<UpdatePass />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/:userId/passwords" element={<UserPasswords />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
