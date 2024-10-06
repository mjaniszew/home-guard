import { useRoutes } from 'react-router-dom';
import { AuthorizeRoute } from './AuthorizeRoute.js';
import { Home } from './Home.js';
import { Dashboard } from './Dashboard.js';
import { Login } from './Login.js';

const Routes = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: (
        <AuthorizeRoute>
          <Home />
        </AuthorizeRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <AuthorizeRoute>
          <Dashboard />
        </AuthorizeRoute>
      )
    },
    {
      path: "/login",
      element: <Login />
    }
  ]);

  return routes;
}

export { Routes };



