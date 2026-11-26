export const routePaths = {
  root: "/",
  login: "/login",
  databases: "/databases",
  createDatabase: "/databases/new",
  databaseDetail: "/databases/:id",
  reporting: "/reporting",
  settings: "/settings",
  faq: "/faq",
  error: "/error",
} as const;

export const routeBuilders = {
  databaseDetail: (id: number | string) => `${routePaths.databases}/${id}`,
} as const;
