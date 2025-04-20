#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Business data
read -r -d '' BUSINESS_DATA << EOM
{
    "name": "Tech Gadgets Store",
    "description": "Your one-stop shop for all tech gadgets and accessories",
    "bio": "Founded in 2024, we bring the latest tech gadgets to Kenya",
    "type": "PRODUCT",
    "category": "Electronics",
    "productCategories": ["Smartphones", "Laptops", "Accessories"],
    "email": "store@techgadgets.com",
    "phone": "+254700000000",
    "address": "123 Tech Street, Nairobi",
    "businessModel": "B2C",
    "operationMode": "HYBRID",
    "paymentMethods": ["MPESA", "CARD", "BANK_TRANSFER"],
    "businessHours": {
        "monday": { "open": "09:00", "close": "18:00" },
        "tuesday": { "open": "09:00", "close": "18:00" },
        "wednesday": { "open": "09:00", "close": "18:00" },
        "thursday": { "open": "09:00", "close": "18:00" },
        "friday": { "open": "09:00", "close": "18:00" },
        "saturday": { "open": "10:00", "close": "15:00" },
        "sunday": "CLOSED"
    },
    "socialMedia": {
        "facebook": "https://facebook.com/techgadgets",
        "instagram": "https://instagram.com/techgadgets",
        "twitter": "https://twitter.com/techgadgets"
    }
}
EOM

echo -e "${BLUE}Creating business...${NC}"
echo -e "${BLUE}This will create the business on the blockchain, upload to IPFS, and save to database${NC}"
echo

# Make the request
curl -X POST http://localhost:3000/api/business/create \
  -H "Content-Type: application/json" \
  --no-buffer \
  -d "$BUSINESS_DATA" \
  -w "\n" \
  2>&1 | while IFS= read -r line; do
    if [[ $line == *"blockchain"* ]]; then
      echo -e "${GREEN}✓${NC} Blockchain transaction completed"
    elif [[ $line == *"ipfs"* ]]; then
      echo -e "${GREEN}✓${NC} IPFS upload completed"
    elif [[ $line == *"database"* ]]; then
      echo -e "${GREEN}✓${NC} Database entry created"
    else
      echo "$line"
    fi
  done

echo -e "\n${GREEN}Done!${NC}" 