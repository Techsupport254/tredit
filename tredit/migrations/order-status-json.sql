-- First, create a temporary column to store the new JSON data
DO $$ 
BEGIN
    -- Only add the column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'status_new'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "status_new" jsonb;
    END IF;
END $$;

-- Update the temporary column with the converted data
UPDATE "Order"
SET "status_new" = jsonb_build_array(
  jsonb_build_object(
    'status', COALESCE(CASE 
      WHEN jsonb_typeof("status") = 'object' THEN ("status"->>'status')::text
      ELSE "status"::text
    END, 'PENDING'),
    'note', COALESCE(CASE 
      WHEN jsonb_typeof("status") = 'object' THEN ("status"->>'note')::text
      ELSE 'Order placed'
    END, 'Order placed'),
    'updatedBy', "userId",
    'updatedAt', COALESCE(CASE 
      WHEN jsonb_typeof("status") = 'object' THEN ("status"->>'updatedAt')::text
      ELSE "createdAt"::text
    END, "createdAt"::text)
  )
)
WHERE "status_new" IS NULL;

-- Drop the old status column and rename the new one
DO $$ 
BEGIN
    -- Drop the old status column if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE "Order" DROP COLUMN "status";
    END IF;
END $$;

-- Rename the new column to status
ALTER TABLE "Order" RENAME COLUMN "status_new" TO "status";

-- Add a comment to the status column
COMMENT ON COLUMN "Order"."status" IS 'Array of status objects: [{ status: string, note: string, updatedBy: string, updatedAt: string }]'; 