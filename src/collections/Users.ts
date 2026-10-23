import type { CollectionConfig } from "payload";

// Admin auth collection, required by Payload. Email and password come from `auth: true`.
//
// Role-based access (same approach as the Giada project):
//  - admin: full access, including managing other users.
//  - editor: can edit site content, but cannot create, delete or read other users,
//    and cannot change their OWN role. Without the field-level lock below, "you can
//    update your own record" would let an editor promote themselves to admin.
export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    // Hidden from the nav for non-admins. This is UX only; the real protection is `access`.
    hidden: ({ user }) => user?.role !== "admin",
  },
  auth: true,
  hooks: {
    // The first account (created on Payload's "create first user" screen) is always an admin.
    // Otherwise it would get the default `editor` role and nobody could manage users
    // (Giada hit this and had to fix the role by hand).
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== "create") return data;
        const { totalDocs } = await req.payload.count({ collection: "users", overrideAccess: true });
        return totalDocs === 0 ? { ...data, role: "admin" } : data;
      },
    ],
  },
  access: {
    // Admins read every user; everyone reads their own record (the admin UI needs
    // this to show "logged in as ...").
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    // Only admins create accounts. The very first user is created through Payload's
    // "create first user" screen, which is not gated by this rule.
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      // The first account must be an admin, otherwise nobody could manage users.
      // Later accounts default to editor (least privilege).
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: {
        // Field-level lock, separate from the collection rules above.
        update: ({ req: { user } }) => user?.role === "admin",
      },
      admin: {
        description:
          "Admins can manage other users; Editors can edit site content only. The very first account is always saved as an Admin, whatever is selected here.",
      },
    },
  ],
};
