# Test Data Structures

## User Registration

```json
{
	"name": "Test User",
	"walletAddress": "0x1234567890123456789012345678901234567890",
	"phoneNumber": "+1234567890"
}
```

## Business Creation

```json
{
	"name": "Test Product Business",
	"description": "A test product-based business",
	"type": "product",
	"category": "Technology",
	"businessModel": "B2C",
	"operationMode": "digital",
	"email": "test@business.com",
	"phone": "+12345678901234",
	"productCategories": ["Electronics", "Computers & Accessories"],
	"address": {
		"street": "123 Test St",
		"city": "Test City",
		"state": "TS",
		"country": "Test Country",
		"postalCode": "12345"
	},
	"businessHours": {
		"monday": { "open": "09:00", "close": "17:00" },
		"tuesday": { "open": "09:00", "close": "17:00" },
		"wednesday": { "open": "09:00", "close": "17:00" },
		"thursday": { "open": "09:00", "close": "17:00" },
		"friday": { "open": "09:00", "close": "17:00" }
	}
}
```

## Product Creation

```json
{
	"name": "Premium Wireless Headphones",
	"description": "High-quality wireless headphones with noise cancellation",
	"shortDescription": "Premium wireless headphones",
	"category": "Electronics",
	"brand": "TechBrand",
	"tags": ["wireless", "headphones", "audio", "premium"],
	"media": ["https://example.com/headphones.jpg"],
	"variants": [
		{
			"sku": "WH-001-BLK",
			"name": "Black",
			"price": 199.99,
			"currency": "USD",
			"stockQuantity": 50,
			"isInStock": true,
			"color": "Black",
			"weight": 0.5,
			"dimensions": "20x15x5cm",
			"material": "Premium Plastic"
		},
		{
			"sku": "WH-001-WHT",
			"name": "White",
			"price": 199.99,
			"currency": "USD",
			"stockQuantity": 30,
			"isInStock": true,
			"color": "White",
			"weight": 0.5,
			"dimensions": "20x15x5cm",
			"material": "Premium Plastic"
		}
	]
}
```

## Chat Session Creation

```json
{
	"buyerId": "user-uuid",
	"businessId": "business-uuid"
}
```

### Message Structure

```json
{
	"chatSessionId": "chat-session-uuid",
	"content": "Hello, I'm interested in your products",
	"messageType": "text",
	"senderId": "user-uuid",
	"receiverId": "business-uuid"
}
```

### Valid Message Types

- text
- system
- price_acceptance
- image
- file
- location
- product_share

### Chat Session Statuses

- active
- pending_payment
- completed
- cancelled

## Valid Values

### Business Categories

- Technology
- Retail
- Food & Beverage
- Healthcare
- Education
- Finance
- Entertainment
- Professional Services
- Manufacturing
- Other

### Business Models

- B2B
- B2C
- C2C
- B2B2C

### Operation Modes

- physical
- digital
- hybrid

### Product Categories

- Electronics
- Computers & Accessories
- Smartphones & Tablets
- Home & Garden
- Fashion & Apparel
- Beauty & Personal Care
- Sports & Outdoors
- Toys & Games
- Books & Media
- Food & Beverages
- Health & Wellness
- Automotive
- Office Supplies
- Art & Crafts
- Pet Supplies
- Baby & Kids
- Jewelry & Watches
- Musical Instruments
- Industrial & Scientific
- Other

### Phone Number Format

- Must match regex: `/^\+?[1-9]\d{1,14}$/`
- Example: "+12345678901234"

### Email Format

- Must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Example: "test@business.com"

### Product Variant Currencies

- USD
- EUR
- GBP
- JPY
- AUD
- CAD
- KES
