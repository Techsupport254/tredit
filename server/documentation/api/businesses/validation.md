# Business Validation Middleware

The Business Validation Middleware is a crucial component that validates business data before sending it to IPFS and the blockchain. This prevents wasting resources on transactions that will fail validation.

## Overview

The middleware performs comprehensive validation of business data to ensure:

1. All required fields are present
2. Field formats are valid
3. Values match predefined constants
4. Data structures are correctly formatted

## Implementation Details

The validation middleware is implemented in `middleware/businessValidationMiddleware.js` and relies on constants defined in `models/constants.js`. It is applied to both creation and update routes:

```javascript
// Create business endpoint with validation
router.post(
	"/",
	protect,
	logValidationAttempt,
	validateBusinessData,
	async (req, res) => {
		// Only executes if validation passes
		// Business creation logic here
	}
);

// Update business endpoint with validation
router.patch(
	"/:id",
	protect,
	logValidationAttempt,
	validateBusinessData,
	async (req, res) => {
		// Only executes if validation passes
		// Business update logic here
	}
);
```

The middleware also includes logging functionality to track validation attempts and failures, which helps identify common validation issues and monitor API usage patterns.

## Validation Logic

The validation middleware performs the following checks:

```javascript
const validateBusinessData = (req, res, next) => {
	const {
		name,
		description,
		type,
		category,
		businessModel,
		operationMode,
		email,
		// other fields
	} = req.body;

	const errors = [];

	// Required field checks
	if (!name) errors.push("Name is required");
	if (!description) errors.push("Description is required");
	// More required field checks...

	// Format validation
	if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
		errors.push("Invalid email format");
	}

	// Enum validation
	if (type && !Object.values(BUSINESS_CONSTANTS.TYPES).includes(type)) {
		errors.push(
			`Invalid business type: ${type}. Must be one of: ${Object.values(
				BUSINESS_CONSTANTS.TYPES
			).join(", ")}`
		);
	}

	// More validations...

	// Return errors or continue
	if (errors.length > 0) {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors,
		});
	}

	next();
};
```

## Validation Rules

### Required Fields

The following fields are required for all business operations:

- `name` - Business name
- `description` - Business description
- `type` - Business type (product or service)
- `category` - Business category
- `businessModel` - Business model (B2B, B2C, etc.)
- `operationMode` - Operation mode (digital, physical, hybrid)
- `email` - Business email

### Format Validation

| Field | Validation                                          |
| ----- | --------------------------------------------------- |
| Email | Must be a valid email format                        |
| Phone | Must match international phone format (if provided) |

### Value Validation

All enum-type fields are validated against predefined constants:

- `type` must be one of: "product", "service"
- `operationMode` must be one of: "physical", "digital", "hybrid"
- `businessModel` must be one of: "B2B", "B2C", "C2C", "B2B2C"
- `status` must be one of: "active", "inactive", "suspended"
- `category` must be from the approved business categories list
- `paymentMethods` must contain only approved payment methods

### Object Validation

- `address` must be an object containing required fields: street, city, state, country, postalCode
- `businessHours` must be properly formatted with valid days and time formats
- `productCategories` and `serviceCategories` must match approved lists according to business type

## Error Response Format

When validation fails, the API responds with:

```json
{
	"success": false,
	"message": "Validation failed",
	"errors": ["Error message 1", "Error message 2", "..."]
}
```

The `errors` array contains specific validation errors that need to be fixed.

## Common Validation Errors

| Error                              | Possible Causes                      | Solution                                                  |
| ---------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| "Invalid email format"             | Malformed email address              | Provide a valid email with proper format                  |
| "Invalid business type"            | Type not in allowed list             | Use only "product" or "service" for type                  |
| "Address field X is required"      | Missing required address field       | Ensure address object contains all required fields        |
| "Business hours must be an object" | businessHours not properly formatted | Format hours as object with day keys and open/close times |

## Benefits

- Prevents invalid data from being stored on the blockchain
- Saves gas costs by avoiding failed transactions
- Provides detailed error messages for client applications
- Ensures data consistency throughout the application
- Reduces the risk of data integrity issues

## Future Improvements

Planned improvements to the validation middleware include:

1. Adding schema-based validation with JSON Schema or Joi
2. Implementing custom validation rules for specific business types
3. Adding validation for file uploads and media content
4. Enhancing validation for international address formats
5. Supporting validation of business-specific fields based on category
