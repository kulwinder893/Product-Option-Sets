-- CreateTable
CREATE TABLE "OptionSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "internalNote" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OptionField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT NOT NULL,
    "parentId" TEXT,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "validation" TEXT,
    "cssClass" TEXT,
    "tooltip" TEXT,
    "helpText" TEXT,
    "customErrorMessage" TEXT,
    "minQuantity" INTEGER,
    "maxQuantity" INTEGER,
    "minLength" INTEGER,
    "maxLength" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "collapsed" BOOLEAN NOT NULL DEFAULT false,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OptionField_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OptionField_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OptionField" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FieldChoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fieldId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "imageUrl" TEXT,
    "colorHex" TEXT,
    "priceAddon" REAL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FieldChoice_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "OptionField" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConditionalRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT NOT NULL,
    "targetFieldId" TEXT NOT NULL,
    "triggerFieldId" TEXT,
    "action" TEXT NOT NULL,
    "logic" TEXT NOT NULL DEFAULT 'AND',
    "conditions" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConditionalRule_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConditionalRule_targetFieldId_fkey" FOREIGN KEY ("targetFieldId") REFERENCES "OptionField" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConditionalRule_triggerFieldId_fkey" FOREIGN KEY ("triggerFieldId") REFERENCES "OptionField" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT,
    "fieldId" TEXT,
    "choiceId" TEXT,
    "type" TEXT NOT NULL,
    "amount" REAL,
    "formula" TEXT,
    "quantityTiers" TEXT,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PriceRule_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceRule_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "OptionField" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceRule_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "FieldChoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productGid" TEXT NOT NULL,
    "productTitle" TEXT,
    "productHandle" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductAssignment_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "collectionGid" TEXT NOT NULL,
    "collectionTitle" TEXT,
    "collectionHandle" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollectionAssignment_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VendorAssignment_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TagAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TagAssignment_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductTypeAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionSetId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductTypeAssignment_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "OptionSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "optionSetId" TEXT,
    "fieldId" TEXT,
    "orderId" TEXT,
    "orderGid" TEXT,
    "lineItemKey" TEXT,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "extension" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT,
    "checksum" TEXT,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "general" TEXT NOT NULL DEFAULT '{}',
    "theme" TEXT NOT NULL DEFAULT '{}',
    "currency" TEXT,
    "translations" TEXT NOT NULL DEFAULT '{}',
    "customCss" TEXT,
    "customJs" TEXT,
    "fileUpload" TEXT NOT NULL DEFAULT '{"maxSizeMb":10,"allowedExtensions":["jpg","jpeg","png","gif","pdf","webp"]}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "actor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "OptionSet_shop_status_idx" ON "OptionSet"("shop", "status");

-- CreateIndex
CREATE INDEX "OptionSet_shop_name_idx" ON "OptionSet"("shop", "name");

-- CreateIndex
CREATE INDEX "OptionSet_shop_updatedAt_idx" ON "OptionSet"("shop", "updatedAt");

-- CreateIndex
CREATE INDEX "OptionSet_shop_deletedAt_idx" ON "OptionSet"("shop", "deletedAt");

-- CreateIndex
CREATE INDEX "OptionField_optionSetId_sortOrder_idx" ON "OptionField"("optionSetId", "sortOrder");

-- CreateIndex
CREATE INDEX "OptionField_parentId_idx" ON "OptionField"("parentId");

-- CreateIndex
CREATE INDEX "FieldChoice_fieldId_sortOrder_idx" ON "FieldChoice"("fieldId", "sortOrder");

-- CreateIndex
CREATE INDEX "ConditionalRule_optionSetId_idx" ON "ConditionalRule"("optionSetId");

-- CreateIndex
CREATE INDEX "ConditionalRule_targetFieldId_idx" ON "ConditionalRule"("targetFieldId");

-- CreateIndex
CREATE INDEX "ConditionalRule_triggerFieldId_idx" ON "ConditionalRule"("triggerFieldId");

-- CreateIndex
CREATE INDEX "PriceRule_optionSetId_idx" ON "PriceRule"("optionSetId");

-- CreateIndex
CREATE INDEX "PriceRule_fieldId_idx" ON "PriceRule"("fieldId");

-- CreateIndex
CREATE INDEX "PriceRule_choiceId_idx" ON "PriceRule"("choiceId");

-- CreateIndex
CREATE INDEX "ProductAssignment_shop_productGid_idx" ON "ProductAssignment"("shop", "productGid");

-- CreateIndex
CREATE INDEX "ProductAssignment_optionSetId_idx" ON "ProductAssignment"("optionSetId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAssignment_optionSetId_productGid_key" ON "ProductAssignment"("optionSetId", "productGid");

-- CreateIndex
CREATE INDEX "CollectionAssignment_shop_collectionGid_idx" ON "CollectionAssignment"("shop", "collectionGid");

-- CreateIndex
CREATE INDEX "CollectionAssignment_optionSetId_idx" ON "CollectionAssignment"("optionSetId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionAssignment_optionSetId_collectionGid_key" ON "CollectionAssignment"("optionSetId", "collectionGid");

-- CreateIndex
CREATE INDEX "VendorAssignment_shop_vendor_idx" ON "VendorAssignment"("shop", "vendor");

-- CreateIndex
CREATE INDEX "VendorAssignment_optionSetId_idx" ON "VendorAssignment"("optionSetId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAssignment_optionSetId_vendor_key" ON "VendorAssignment"("optionSetId", "vendor");

-- CreateIndex
CREATE INDEX "TagAssignment_shop_tag_idx" ON "TagAssignment"("shop", "tag");

-- CreateIndex
CREATE INDEX "TagAssignment_optionSetId_idx" ON "TagAssignment"("optionSetId");

-- CreateIndex
CREATE UNIQUE INDEX "TagAssignment_optionSetId_tag_key" ON "TagAssignment"("optionSetId", "tag");

-- CreateIndex
CREATE INDEX "ProductTypeAssignment_shop_productType_idx" ON "ProductTypeAssignment"("shop", "productType");

-- CreateIndex
CREATE INDEX "ProductTypeAssignment_optionSetId_idx" ON "ProductTypeAssignment"("optionSetId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTypeAssignment_optionSetId_productType_key" ON "ProductTypeAssignment"("optionSetId", "productType");

-- CreateIndex
CREATE INDEX "FileUpload_shop_createdAt_idx" ON "FileUpload"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "FileUpload_shop_orderGid_idx" ON "FileUpload"("shop", "orderGid");

-- CreateIndex
CREATE INDEX "FileUpload_fieldId_idx" ON "FileUpload"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_shop_key" ON "Settings"("shop");

-- CreateIndex
CREATE INDEX "Log_shop_createdAt_idx" ON "Log"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "Log_shop_level_idx" ON "Log"("shop", "level");

-- CreateIndex
CREATE INDEX "Log_shop_action_idx" ON "Log"("shop", "action");
