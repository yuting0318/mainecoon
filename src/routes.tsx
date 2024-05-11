import React, { Children } from "react";
import type { RouteObject } from "react-router-dom";
import Home from "Pages/home";
import NotFound from "Pages/notFound";
import Main from "./pages/Main";
import './index.css'
import WSIViewerOpenLayers from "Pages/WsiViewerOpenLayers";
import WSIViewerWithReport from "Pages/WsiViewerWithReport";
import WSIViwerByStudy from "Pages/WsiViewerByStudy";
import SearchPageHeader from "./components/SearchPageHeader";
import ViewerPage from './routes/viewer/[...rest]/ViewerPage';


const routes: RouteObject[] = [
  {
    path: "/",
    element: <Main />,
    children: [],
  },

  {
    path: "*",
    element: <NotFound />,
    children: [],
  },
  {
    path: "/home",
    element: <Home />,
    children: [],
  },
  {
    path: "/WSIViewerOpenLayers/:studyInstanceUID/:seriesInstanceUID/:modalityAttribute",
    element: <WSIViewerOpenLayers />,
    children: [],
  },
  {
    path: "/WSIViewerWithReport/:studyInstanceUID/:seriesInstanceUID/:modalityAttribute",
    element: <WSIViewerWithReport />,
    children: [],
  },
  {
    path: "/WSIViwerByStudy/:studyInstanceUID",
    element: <WSIViwerByStudy />,
    children: [],
  },
    {
        path: "/viewer/:rest",
        element: <ViewerPage />,
        children: [],
    },

];

export default routes;
