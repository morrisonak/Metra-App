import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  // Dashboard (home page)
  index("./routes/_index.tsx"),

  // // Crossings routes
  ...prefix("crossings", [
    index("./routes/crossings/_index.tsx"),
    route("new", "./routes/crossings/new.tsx"),
    route(":id", "./routes/crossings/$id.tsx"),
    route(":id/edit", "./routes/crossings/$id.edit.tsx"),
  ]),

  // // Field Collection
  route("field-collection", "./routes/field-collection.tsx"),

  // // Map View
  route("map", "./routes/map.tsx"),

  // // Reports
  route("reports", "./routes/reports.tsx"),

  // // Sync
  route("sync", "./routes/sync.tsx"),

  // Admin section
  ...prefix("admin", [
    layout("./routes/admin/_layout.tsx", [
      route("settings", "./routes/admin/settings.tsx"),
      route("users", "./routes/admin/users.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
