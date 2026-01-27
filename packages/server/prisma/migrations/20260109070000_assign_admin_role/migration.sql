-- CreateRole (if not exists)
-- Ensure the 'admin' role exists before assigning it
INSERT INTO "Role" ("id", "createdAt", "name", "description")
SELECT
    gen_random_uuid()::text,
    NOW(),
    'admin',
    'Admin role'
WHERE NOT EXISTS (
    SELECT 1 FROM "Role" WHERE "name" = 'admin'
);

-- AssignAdminRole
-- Assign admin role to users with specific email
INSERT INTO "_RoleToUser" ("A", "B")
SELECT
    r."id",
    u."id"
FROM "Role" r
CROSS JOIN "User" u
WHERE r."name" = 'admin'
  AND u."email" = 'mr.sucik@gmail.com'
  AND NOT EXISTS (
      SELECT 1
      FROM "_RoleToUser" rtu
      WHERE rtu."A" = r."id"
        AND rtu."B" = u."id"
  );
