-- ============================================================================
-- ALGORISE MIGRATION: Add 'icpc' to group_type enum
-- ============================================================================
-- Run this migration on existing databases to add support for ICPC teams
-- ============================================================================

-- Add 'icpc' to group_type enum if it doesn't exist
DO $$ 
BEGIN
    -- Check if 'icpc' value exists in group_type enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'icpc' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'group_type')
    ) THEN
        ALTER TYPE group_type ADD VALUE 'icpc';
        RAISE NOTICE '✅ Added icpc to group_type enum';
    ELSE
        RAISE NOTICE '⏭️ icpc already exists in group_type enum';
    END IF;
END $$;

-- ======================== SUCCESS ========================
DO $$ BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
END $$;
