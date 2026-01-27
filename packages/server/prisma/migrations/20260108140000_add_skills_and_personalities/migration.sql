-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('DEVELOPMENT', 'PRODUCTIVITY', 'RESEARCH', 'COMMUNICATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "CommunicationStyle" AS ENUM ('FORMAL', 'CASUAL', 'BALANCED');

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "keywords" TEXT[],
    "requiredTools" TEXT[],
    "instructions" TEXT NOT NULL,
    "referenceDocs" TEXT,
    "category" "SkillCategory" NOT NULL DEFAULT 'GENERAL',
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillEnablement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "skillId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserSkillEnablement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personality" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "backstory" TEXT NOT NULL,
    "traits" TEXT[],
    "communicationStyle" "CommunicationStyle" NOT NULL DEFAULT 'BALANCED',
    "verbosityLevel" INTEGER NOT NULL DEFAULT 2,
    "preferredTools" TEXT[],
    "avoidedTools" TEXT[],
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,

    CONSTRAINT "Personality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPersonalitySelection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "personalityId" TEXT NOT NULL,

    CONSTRAINT "UserPersonalitySelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Skill_userId_idx" ON "Skill"("userId");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "Skill_isBuiltIn_idx" ON "Skill"("isBuiltIn");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_userId_key" ON "Skill"("name", "userId");

-- CreateIndex
CREATE INDEX "UserSkillEnablement_userId_idx" ON "UserSkillEnablement"("userId");

-- CreateIndex
CREATE INDEX "UserSkillEnablement_skillId_idx" ON "UserSkillEnablement"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillEnablement_skillId_userId_key" ON "UserSkillEnablement"("skillId", "userId");

-- CreateIndex
CREATE INDEX "Personality_userId_idx" ON "Personality"("userId");

-- CreateIndex
CREATE INDEX "Personality_isBuiltIn_idx" ON "Personality"("isBuiltIn");

-- CreateIndex
CREATE UNIQUE INDEX "Personality_name_userId_key" ON "Personality"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalitySelection_userId_key" ON "UserPersonalitySelection"("userId");

-- CreateIndex
CREATE INDEX "UserPersonalitySelection_personalityId_idx" ON "UserPersonalitySelection"("personalityId");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillEnablement" ADD CONSTRAINT "UserSkillEnablement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillEnablement" ADD CONSTRAINT "UserSkillEnablement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personality" ADD CONSTRAINT "Personality_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPersonalitySelection" ADD CONSTRAINT "UserPersonalitySelection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPersonalitySelection" ADD CONSTRAINT "UserPersonalitySelection_personalityId_fkey" FOREIGN KEY ("personalityId") REFERENCES "Personality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
