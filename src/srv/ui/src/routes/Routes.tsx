import { useRoutes } from 'react-router-dom';
import { AuthorizeRoute } from './AuthorizeRoute.js';
import { HomeProvider } from '../hooks/useHome.js';
import { NotFoundRoute } from './404.js';
import { Layout } from './Layout.js';
import { Home } from './Home.js';
import { Dashboard } from './Dashboard.js';
import { Login } from './Login.js';
import { Logout } from './Logout.js';
import { Cam } from './Cam.js';
import { Manage } from './Manage.js';
import { Sensor } from './Sensor.js';

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
          <HomeProvider>
            <Layout>
              <Home />
            </Layout>
          </HomeProvider>
        </AuthorizeRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <AuthorizeRoute>
          <HomeProvider>
            <Layout>
              <Dashboard />
            </Layout>
          </HomeProvider>
        </AuthorizeRoute>
      )
    },
    {
      path: "/cam/:camId",
      element: (
        <AuthorizeRoute>
          <HomeProvider>
            <Layout>
              <Cam />
            </Layout>
          </HomeProvider>
        </AuthorizeRoute>
      )
    },
    {
      path: "/sensor/:sensorId",
      element: (
        <AuthorizeRoute>
          <HomeProvider>
            <Layout>
              <Sensor />
            </Layout>
          </HomeProvider>
        </AuthorizeRoute>
      )
    },
    {
      path: "/manage",
      element: (
        <AuthorizeRoute>
          <HomeProvider>
            <Layout>
              <Manage />
            </Layout>
          </HomeProvider>
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



