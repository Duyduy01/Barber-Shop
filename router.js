const headerUrl = "./layouts/common/AppHeader.html";
const footerUrl = "./layouts/common/AppFooter.html";
const notFoundUrl = "./pages/404/NotFoundPage.html";
const homeUrl = "./pages/home/HomePage.html";
const campaignUrl = "./pages/campaign/CampaignPage.html";

export const layoutDefault = {
  Header: headerUrl,
  Footer: footerUrl,
};
const routes = [
  { path: "/404", component: () => Promise.resolve(notFoundUrl) },
  { path: "/", component: () => Promise.resolve(homeUrl) },
  { path: "/campaign", component: () => Promise.resolve(campaignUrl) },
  {
    path: "/contact",
    component: () => Promise.resolve("./pages/contact.html"),
  },
];

export default routes;
