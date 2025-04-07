-- Ensure enums exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_carts_status') THEN
    CREATE TYPE enum_carts_status AS ENUM ('active', 'converted', 'abandoned');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_carts_discounttype') THEN
    CREATE TYPE enum_carts_discounttype AS ENUM ('percentage', 'fixed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_chatsessions_status') THEN
    CREATE TYPE enum_chatsessions_status AS ENUM ('active', 'pending_payment', 'completed', 'disputed', 'closed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
    CREATE TYPE message_type AS ENUM ('text', 'system', 'image', 'file', 'price_proposal', 'price_acceptance');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
    CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
  END IF;
END
$$;

-- Create a new cart for our test user
INSERT INTO "Carts" ("id", "userId", "status", "subtotal", "tax", "discount", "totalAmount", "requiresShipping", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'af3e3847-6c87-4f64-b94b-10d3e3c29dbd', 'active', 0, 0, 0, 0, true, NOW(), NOW());

-- Get the ID of the cart we just inserted
WITH new_cart AS (
  SELECT id FROM "Carts" 
  WHERE "userId" = 'af3e3847-6c87-4f64-b94b-10d3e3c29dbd' 
  ORDER BY "createdAt" DESC 
  LIMIT 1
)
-- Create chat sessions for this cart with two businesses
INSERT INTO "ChatSessions" ("id", "buyerId", "businessId", "cartId", "status", "lastMessageAt", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(), 
  'af3e3847-6c87-4f64-b94b-10d3e3c29dbd',
  b.id, 
  new_cart.id, 
  'active', 
  NOW(), 
  NOW(), 
  NOW()
FROM "Businesses" b, new_cart
LIMIT 2;

-- Get the chatSessions we just created
WITH new_chat_sessions AS (
  SELECT cs.id, cs."businessId", b.name as business_name, cs."buyerId"
  FROM "ChatSessions" cs
  JOIN "Businesses" b ON cs."businessId" = b.id
  WHERE cs."buyerId" = 'af3e3847-6c87-4f64-b94b-10d3e3c29dbd'
  ORDER BY cs."createdAt" DESC
  LIMIT 2
)
-- Add welcome messages to each chat session
INSERT INTO "Messages" ("id", "chatSessionId", "senderId", "receiverId", "content", "messageType", "status", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  ncs.id,
  ncs."businessId",
  ncs."buyerId",
  'Welcome to ' || ncs.business_name || '! How can we help you today?',
  'system',
  'sent',
  NOW(),
  NOW()
FROM new_chat_sessions ncs
UNION ALL
SELECT 
  gen_random_uuid(),
  ncs.id,
  ncs."businessId",
  ncs."buyerId",
  'We have some special offers just for you!',
  'text',
  'read',
  NOW() + interval '1 minute',
  NOW() + interval '1 minute'
FROM new_chat_sessions ncs; 