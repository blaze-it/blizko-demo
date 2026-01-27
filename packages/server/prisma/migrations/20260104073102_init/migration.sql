-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('CLOCKIFY', 'TRADING212', 'AMUNDI', 'ETHERSCAN', 'BLOCKFROST', 'ETH_RPC', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MORNING_REPORT', 'EVENING_REPORT', 'SYNC_SUCCESS', 'SYNC_PARTIAL', 'SYNC_FAILED', 'SYSTEM_ERROR', 'SYSTEM_WARNING', 'SYSTEM_INFO', 'TASK_REMINDER', 'TASK_DUE', 'PORTFOLIO_ALERT', 'CALORIE_DAILY_SUMMARY', 'CALORIE_GOAL_PROGRESS', 'CALORIE_MEAL_REMINDER');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('REPORT', 'SYNC', 'SYSTEM', 'REMINDER', 'ALERT', 'HEALTH');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "username" TEXT,
    "displayUsername" TEXT,
    "name" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BYTEA NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "providerId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIntegration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "encryptedCredentials" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestSuccess" BOOLEAN,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cryptocurrency" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cryptocurrency_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "CryptoWallet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "address" TEXT NOT NULL,
    "cryptoName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CryptoWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmundiSyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "AmundiSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trading212SyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Trading212SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoWalletValue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION NOT NULL,
    "cryptoWalletId" TEXT NOT NULL,

    CONSTRAINT "CryptoWalletValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockFundValue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION NOT NULL,
    "stockFundName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StockFundValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoPrice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceCzk" DOUBLE PRECISION NOT NULL,
    "priceEur" DOUBLE PRECISION NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "cryptoName" TEXT NOT NULL,

    CONSTRAINT "CryptoPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessEntity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "street" TEXT,
    "street2" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "registrationNo" TEXT,
    "vatNo" TEXT,
    "businessId" TEXT NOT NULL,
    "regNo" TEXT,
    "bankAccountNumber" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "BusinessEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "number" TEXT NOT NULL,
    "variableSymbol" TEXT,
    "taxDocument" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "issuedOn" TIMESTAMP(3) NOT NULL,
    "taxableFulfillmentDue" TIMESTAMP(3),
    "dueOn" TIMESTAMP(3),
    "paidOn" TIMESTAMP(3),
    "bankAccount" TEXT,
    "iban" TEXT,
    "swiftBic" TEXT,
    "paymentMethod" TEXT,
    "currency" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "nativeSubtotal" DOUBLE PRECISION,
    "nativeTotal" DOUBLE PRECISION,
    "note" TEXT,
    "footerNote" TEXT,
    "privateNote" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitName" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPriceWithoutVat" DOUBLE PRECISION,
    "unitPriceWithVat" DOUBLE PRECISION,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpectedIncomeSchedule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPeriod" TEXT,
    "clientId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ExpectedIncomeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpectedOutcomeSchedule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPeriod" TEXT,
    "category" TEXT,
    "providerId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ExpectedOutcomeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startedDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "balance" DOUBLE PRECISION,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "lenderId" TEXT,
    "borrowerId" TEXT,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPaymentDate" TIMESTAMP(3),

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "due" JSONB,
    "deadline" JSONB,
    "parentId" TEXT,
    "childOrder" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" JSONB,
    "labels" TEXT[],
    "userId" TEXT NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "parent_id" TEXT,
    "childOrder" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "viewStyle" TEXT NOT NULL DEFAULT 'list',
    "inboxProject" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionOrder" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "itemOrder" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoistSyncState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncToken" TEXT,
    "lastSyncAt" TIMESTAMP(3),

    CONSTRAINT "TodoistSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoistTask" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "todoistId" TEXT,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "due" JSONB,
    "deadline" JSONB,
    "parentId" TEXT,
    "childOrder" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT,
    "dayOrder" INTEGER NOT NULL DEFAULT -1,
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "addedByUid" TEXT,
    "assignedByUid" TEXT,
    "responsibleUid" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3),
    "todoist_updated_at" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" JSONB,
    "labels" TEXT[],
    "syncedAt" TIMESTAMP(3),
    "locallyModified" BOOLEAN NOT NULL DEFAULT false,
    "locallyCreated" BOOLEAN NOT NULL DEFAULT false,
    "syncConflict" BOOLEAN NOT NULL DEFAULT false,
    "lastLocalEdit" TIMESTAMP(3),
    "syncError" TEXT,
    "projectId" TEXT,

    CONSTRAINT "TodoistTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoistProject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "todoistId" TEXT,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "parentId" TEXT,
    "childOrder" INTEGER NOT NULL DEFAULT 0,
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "viewStyle" TEXT NOT NULL DEFAULT 'list',
    "description" TEXT,
    "workspaceId" TEXT,
    "isInviteOnly" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "isLinkSharingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "collaboratorRoleDefault" TEXT NOT NULL DEFAULT 'READ_WRITE',
    "canAssignTasks" BOOLEAN NOT NULL DEFAULT false,
    "inboxProject" BOOLEAN NOT NULL DEFAULT false,
    "todoist_created_at" TIMESTAMP(3),
    "todoist_updated_at" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "locallyModified" BOOLEAN NOT NULL DEFAULT false,
    "locallyCreated" BOOLEAN NOT NULL DEFAULT false,
    "syncConflict" BOOLEAN NOT NULL DEFAULT false,
    "lastLocalEdit" TIMESTAMP(3),
    "syncError" TEXT,

    CONSTRAINT "TodoistProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoistSection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "todoistId" TEXT,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionOrder" INTEGER NOT NULL DEFAULT 0,
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "syncId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "addedAt" TIMESTAMP(3),
    "todoist_updated_at" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "TodoistSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoistLabel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "todoistId" TEXT,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "itemOrder" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "locallyModified" BOOLEAN NOT NULL DEFAULT false,
    "locallyCreated" BOOLEAN NOT NULL DEFAULT false,
    "syncConflict" BOOLEAN NOT NULL DEFAULT false,
    "lastLocalEdit" TIMESTAMP(3),
    "syncError" TEXT,

    CONSTRAINT "TodoistLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClockifySyncState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "ClockifySyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClockifyWorkspace" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clockifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ClockifyWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClockifyProject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clockifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,

    CONSTRAINT "ClockifyProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClockifyClient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clockifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "ClockifyClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClockifyTimeEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clockifyId" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "hourlyRate" DOUBLE PRECISION,
    "tags" TEXT[],
    "clockifyUserId" TEXT NOT NULL,
    "clockifyUserEmail" TEXT,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "clientId" TEXT,
    "clockify_updated_at" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "ClockifyTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "notes" TEXT,
    "currentValue" DECIMAL(12,2),
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryValueHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inventoryItemId" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "note" TEXT,

    CONSTRAINT "InventoryValueHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "tags" TEXT[],
    "audioBlob" BYTEA NOT NULL,
    "audioContentType" TEXT NOT NULL DEFAULT 'audio/mpeg',
    "audioFileName" TEXT NOT NULL,
    "subtitleBlob" BYTEA,
    "subtitleContentType" TEXT,
    "subtitleFileName" TEXT,
    "transcriptBlob" BYTEA,
    "transcriptContentType" TEXT,
    "transcriptFileName" TEXT,
    "userId" TEXT NOT NULL,
    "clockifyTimeEntryId" TEXT,
    "clockifySyncedAt" TIMESTAMP(3),
    "recordedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WheatSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "sessionAt" TIMESTAMP(3) NOT NULL,
    "strain" TEXT,
    "method" TEXT,
    "notes" TEXT,
    "effects" TEXT[],
    "rating" INTEGER,
    "duration" INTEGER,
    "clockifyTimeEntryId" TEXT,

    CONSTRAINT "WheatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalorieEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "entryAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "clockifyTimeEntryId" TEXT,

    CONSTRAINT "CalorieEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalorieSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "dailyCalorieGoal" INTEGER,

    CONSTRAINT "CalorieSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "shouldPush" BOOLEAN NOT NULL DEFAULT false,
    "pushSentAt" TIMESTAMP(3),
    "pushStatus" TEXT,
    "pushResult" JSONB,
    "userId" TEXT,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "deviceName" TEXT,
    "platform" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "NotificationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserVendorBusinesses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserVendorBusinesses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_displayUsername_key" ON "user"("displayUsername");

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userId_key" ON "UserImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

-- CreateIndex
CREATE INDEX "UserIntegration_userId_idx" ON "UserIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserIntegration_userId_type_key" ON "UserIntegration"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Cryptocurrency_name_key" ON "Cryptocurrency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AmundiSyncState_userId_key" ON "AmundiSyncState"("userId");

-- CreateIndex
CREATE INDEX "AmundiSyncState_userId_idx" ON "AmundiSyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Trading212SyncState_userId_key" ON "Trading212SyncState"("userId");

-- CreateIndex
CREATE INDEX "Trading212SyncState_userId_idx" ON "Trading212SyncState"("userId");

-- CreateIndex
CREATE INDEX "StockFundValue_stockFundName_idx" ON "StockFundValue"("stockFundName");

-- CreateIndex
CREATE INDEX "StockFundValue_userId_idx" ON "StockFundValue"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessEntity_businessId_key" ON "BusinessEntity"("businessId");

-- CreateIndex
CREATE INDEX "BusinessEntity_ownerId_idx" ON "BusinessEntity"("ownerId");

-- CreateIndex
CREATE INDEX "Invoice_vendorId_idx" ON "Invoice"("vendorId");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");

-- CreateIndex
CREATE INDEX "ExpectedIncomeSchedule_userId_idx" ON "ExpectedIncomeSchedule"("userId");

-- CreateIndex
CREATE INDEX "ExpectedIncomeSchedule_clientId_idx" ON "ExpectedIncomeSchedule"("clientId");

-- CreateIndex
CREATE INDEX "ExpectedOutcomeSchedule_userId_idx" ON "ExpectedOutcomeSchedule"("userId");

-- CreateIndex
CREATE INDEX "ExpectedOutcomeSchedule_providerId_idx" ON "ExpectedOutcomeSchedule"("providerId");

-- CreateIndex
CREATE INDEX "Expense_senderId_idx" ON "Expense"("senderId");

-- CreateIndex
CREATE INDEX "Expense_recipientId_idx" ON "Expense"("recipientId");

-- CreateIndex
CREATE INDEX "Expense_completedDate_idx" ON "Expense"("completedDate");

-- CreateIndex
CREATE INDEX "Debt_ownerId_idx" ON "Debt"("ownerId");

-- CreateIndex
CREATE INDEX "Debt_lenderId_idx" ON "Debt"("lenderId");

-- CreateIndex
CREATE INDEX "Debt_borrowerId_idx" ON "Debt"("borrowerId");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_checked_idx" ON "Task"("checked");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_sectionId_idx" ON "Task"("sectionId");

-- CreateIndex
CREATE INDEX "Task_parentId_idx" ON "Task"("parentId");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_parent_id_idx" ON "Project"("parent_id");

-- CreateIndex
CREATE INDEX "Section_userId_idx" ON "Section"("userId");

-- CreateIndex
CREATE INDEX "Section_projectId_idx" ON "Section"("projectId");

-- CreateIndex
CREATE INDEX "Label_userId_idx" ON "Label"("userId");

-- CreateIndex
CREATE INDEX "Label_name_idx" ON "Label"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Label_userId_name_key" ON "Label"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TodoistTask_todoistId_key" ON "TodoistTask"("todoistId");

-- CreateIndex
CREATE INDEX "TodoistTask_checked_idx" ON "TodoistTask"("checked");

-- CreateIndex
CREATE INDEX "TodoistTask_projectId_idx" ON "TodoistTask"("projectId");

-- CreateIndex
CREATE INDEX "TodoistTask_sectionId_idx" ON "TodoistTask"("sectionId");

-- CreateIndex
CREATE INDEX "TodoistTask_parentId_idx" ON "TodoistTask"("parentId");

-- CreateIndex
CREATE INDEX "TodoistTask_locallyModified_idx" ON "TodoistTask"("locallyModified");

-- CreateIndex
CREATE INDEX "TodoistTask_locallyCreated_idx" ON "TodoistTask"("locallyCreated");

-- CreateIndex
CREATE UNIQUE INDEX "TodoistProject_todoistId_key" ON "TodoistProject"("todoistId");

-- CreateIndex
CREATE INDEX "TodoistProject_parentId_idx" ON "TodoistProject"("parentId");

-- CreateIndex
CREATE INDEX "TodoistProject_workspaceId_idx" ON "TodoistProject"("workspaceId");

-- CreateIndex
CREATE INDEX "TodoistProject_locallyModified_idx" ON "TodoistProject"("locallyModified");

-- CreateIndex
CREATE UNIQUE INDEX "TodoistSection_todoistId_key" ON "TodoistSection"("todoistId");

-- CreateIndex
CREATE INDEX "TodoistSection_projectId_idx" ON "TodoistSection"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "TodoistLabel_todoistId_key" ON "TodoistLabel"("todoistId");

-- CreateIndex
CREATE UNIQUE INDEX "TodoistLabel_name_key" ON "TodoistLabel"("name");

-- CreateIndex
CREATE INDEX "TodoistLabel_name_idx" ON "TodoistLabel"("name");

-- CreateIndex
CREATE INDEX "TodoistLabel_locallyModified_idx" ON "TodoistLabel"("locallyModified");

-- CreateIndex
CREATE UNIQUE INDEX "ClockifySyncState_userId_key" ON "ClockifySyncState"("userId");

-- CreateIndex
CREATE INDEX "ClockifySyncState_userId_idx" ON "ClockifySyncState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClockifyWorkspace_clockifyId_key" ON "ClockifyWorkspace"("clockifyId");

-- CreateIndex
CREATE INDEX "ClockifyWorkspace_clockifyId_idx" ON "ClockifyWorkspace"("clockifyId");

-- CreateIndex
CREATE UNIQUE INDEX "ClockifyProject_clockifyId_key" ON "ClockifyProject"("clockifyId");

-- CreateIndex
CREATE INDEX "ClockifyProject_workspaceId_idx" ON "ClockifyProject"("workspaceId");

-- CreateIndex
CREATE INDEX "ClockifyProject_clientId_idx" ON "ClockifyProject"("clientId");

-- CreateIndex
CREATE INDEX "ClockifyProject_clockifyId_idx" ON "ClockifyProject"("clockifyId");

-- CreateIndex
CREATE UNIQUE INDEX "ClockifyClient_clockifyId_key" ON "ClockifyClient"("clockifyId");

-- CreateIndex
CREATE INDEX "ClockifyClient_workspaceId_idx" ON "ClockifyClient"("workspaceId");

-- CreateIndex
CREATE INDEX "ClockifyClient_clockifyId_idx" ON "ClockifyClient"("clockifyId");

-- CreateIndex
CREATE UNIQUE INDEX "ClockifyTimeEntry_clockifyId_key" ON "ClockifyTimeEntry"("clockifyId");

-- CreateIndex
CREATE INDEX "ClockifyTimeEntry_workspaceId_idx" ON "ClockifyTimeEntry"("workspaceId");

-- CreateIndex
CREATE INDEX "ClockifyTimeEntry_projectId_idx" ON "ClockifyTimeEntry"("projectId");

-- CreateIndex
CREATE INDEX "ClockifyTimeEntry_clientId_idx" ON "ClockifyTimeEntry"("clientId");

-- CreateIndex
CREATE INDEX "ClockifyTimeEntry_startTime_idx" ON "ClockifyTimeEntry"("startTime");

-- CreateIndex
CREATE INDEX "ClockifyTimeEntry_clockifyUserId_idx" ON "ClockifyTimeEntry"("clockifyUserId");

-- CreateIndex
CREATE INDEX "ClockifyTimeEntry_billable_idx" ON "ClockifyTimeEntry"("billable");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_idx" ON "InventoryItem"("userId");

-- CreateIndex
CREATE INDEX "InventoryItem_name_idx" ON "InventoryItem"("name");

-- CreateIndex
CREATE INDEX "InventoryValueHistory_inventoryItemId_idx" ON "InventoryValueHistory"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryValueHistory_createdAt_idx" ON "InventoryValueHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Recording_userId_idx" ON "Recording"("userId");

-- CreateIndex
CREATE INDEX "Recording_title_idx" ON "Recording"("title");

-- CreateIndex
CREATE INDEX "WheatSession_userId_idx" ON "WheatSession"("userId");

-- CreateIndex
CREATE INDEX "WheatSession_sessionAt_idx" ON "WheatSession"("sessionAt");

-- CreateIndex
CREATE INDEX "CalorieEntry_userId_idx" ON "CalorieEntry"("userId");

-- CreateIndex
CREATE INDEX "CalorieEntry_entryAt_idx" ON "CalorieEntry"("entryAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalorieSettings_userId_key" ON "CalorieSettings"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_type_idx" ON "NotificationLog"("type");

-- CreateIndex
CREATE INDEX "NotificationLog_category_idx" ON "NotificationLog"("category");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

-- CreateIndex
CREATE INDEX "PushToken_token_idx" ON "PushToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_userId_key" ON "PushToken"("token", "userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_type_key" ON "NotificationPreference"("userId", "type");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE INDEX "_UserVendorBusinesses_B_index" ON "_UserVendorBusinesses"("B");

-- AddForeignKey
ALTER TABLE "UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWallet" ADD CONSTRAINT "CryptoWallet_cryptoName_fkey" FOREIGN KEY ("cryptoName") REFERENCES "Cryptocurrency"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWallet" ADD CONSTRAINT "CryptoWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmundiSyncState" ADD CONSTRAINT "AmundiSyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trading212SyncState" ADD CONSTRAINT "Trading212SyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWalletValue" ADD CONSTRAINT "CryptoWalletValue_cryptoWalletId_fkey" FOREIGN KEY ("cryptoWalletId") REFERENCES "CryptoWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockFundValue" ADD CONSTRAINT "StockFundValue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoPrice" ADD CONSTRAINT "CryptoPrice_cryptoName_fkey" FOREIGN KEY ("cryptoName") REFERENCES "Cryptocurrency"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessEntity" ADD CONSTRAINT "BusinessEntity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "BusinessEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "BusinessEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedIncomeSchedule" ADD CONSTRAINT "ExpectedIncomeSchedule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "BusinessEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedIncomeSchedule" ADD CONSTRAINT "ExpectedIncomeSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedOutcomeSchedule" ADD CONSTRAINT "ExpectedOutcomeSchedule_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "BusinessEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedOutcomeSchedule" ADD CONSTRAINT "ExpectedOutcomeSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "BusinessEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "BusinessEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "BusinessEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "BusinessEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoistTask" ADD CONSTRAINT "TodoistTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "TodoistProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoistSection" ADD CONSTRAINT "TodoistSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "TodoistProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClockifySyncState" ADD CONSTRAINT "ClockifySyncState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClockifyProject" ADD CONSTRAINT "ClockifyProject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ClockifyWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClockifyProject" ADD CONSTRAINT "ClockifyProject_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClockifyClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClockifyClient" ADD CONSTRAINT "ClockifyClient_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ClockifyWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClockifyTimeEntry" ADD CONSTRAINT "ClockifyTimeEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ClockifyWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClockifyTimeEntry" ADD CONSTRAINT "ClockifyTimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClockifyProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClockifyTimeEntry" ADD CONSTRAINT "ClockifyTimeEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClockifyClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryValueHistory" ADD CONSTRAINT "InventoryValueHistory_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheatSession" ADD CONSTRAINT "WheatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalorieEntry" ADD CONSTRAINT "CalorieEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalorieSettings" ADD CONSTRAINT "CalorieSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserVendorBusinesses" ADD CONSTRAINT "_UserVendorBusinesses_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserVendorBusinesses" ADD CONSTRAINT "_UserVendorBusinesses_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
