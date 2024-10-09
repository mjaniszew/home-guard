import { useRoutes } from 'react-router-dom';
import { AuthorizeRoute } from './AuthorizeRoute.js';
import { Layout } from './Layout.js';
import { Home } from './Home.js';
import { Dashboard } from './Dashboard.js';
import { Login } from './Login.js';
import { Logout } from './Logout.js';
import { Cam } from './Cam.js';

const Routes = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: (
        <AuthorizeRoute>
          <Layout>
            <Home />
          </Layout>
        </AuthorizeRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <AuthorizeRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </AuthorizeRoute>
      )
    },
    {
      path: "/cam/:id",
      element: (
        <AuthorizeRoute>
          <Layout>
            <Cam />
          </Layout>
        </AuthorizeRoute>
      )
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/logout",
      element: <Logout />
    }
  ]);

  return routes;
}

export { Routes };



