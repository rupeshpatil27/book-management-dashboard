import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./RootLayout";
import Home from "./pages/Home";
import Page404 from "./pages/Page404";

function App() {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          { path: "/", element: <Home />, index: true },
          { path: "/*", element: <Page404 /> },
        ],
      },
    ],
    {
      future: {
        v7_relativeSplatPath: true,
      },
    }
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
