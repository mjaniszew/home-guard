import { useRoutes } from 'react-router-dom';
import { AuthorizeRoute } from './AuthorizeRoute.js';
import { NotFoundRoute } from './404.js';
import { Layout } from './Layout.js';
import { Home } from './Home.js';
import { Dashboard } from './Dashboard.js';
import { Login } from './Login.js';
import { Logout } from './Logout.js';
import { Cam } from './Cam.js';
import { Manage } from './Manage.js';

const Routes = () => {
  const routes = useRoutes([
    {
      path: "*",
      element: (
        <NotFoundRoute />
      )
    },
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
      path: "/manage",
      element: (
        <AuthorizeRoute>
          <Layout>
            <Manage />
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



