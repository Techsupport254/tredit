#!/bin/bash

# Base directory where all files will be created
BASE_DIR="src/pages"

# Ensure the base directory exists
mkdir -p "$BASE_DIR"

# Sidebar JSON Data
SIDEBAR_DATA='[
  {
    "category": "Dashboard",
    "path": "/",
    "roles": ["Vendor"]
  },
  {
    "category": "Products",
    "pages": [
      { "name": "AllProducts", "path": "/products" },
      { "name": "AddProduct", "path": "/products/add" },
      { "name": "Inventory", "path": "/products/inventory" },
      { "name": "Categories", "path": "/products/categories" }
    ]
  },
  {
    "category": "Orders",
    "pages": [
      { "name": "AllOrders", "path": "/orders" },
      { "name": "PendingOrders", "path": "/orders/pending" },
      { "name": "CompletedOrders", "path": "/orders/completed" },
      { "name": "ReturnsRefunds", "path": "/orders/refunds" }
    ]
  },
  {
    "category": "Payments",
    "pages": [
      { "name": "PaymentOverview", "path": "/payments" },
      { "name": "PayoutRequests", "path": "/payments/payouts" },
      { "name": "TransactionHistory", "path": "/payments/history" }
    ]
  },
  {
    "category": "Analytics",
    "pages": [
      { "name": "SalesAnalytics", "path": "/analytics/sales" },
      { "name": "ProductPerformance", "path": "/analytics/products" },
      { "name": "CustomerInsights", "path": "/analytics/customers" }
    ]
  },
  {
    "category": "Customers",
    "pages": [
      { "name": "AllCustomers", "path": "/customers" },
      { "name": "FeedbackReviews", "path": "/customers/reviews" },
      { "name": "CustomerQueries", "path": "/customers/queries" }
    ]
  },
  {
    "category": "Dispute",
    "pages": [
      { "name": "AllDisputes", "path": "/disputes" },
      { "name": "OpenDisputes", "path": "/disputes/open" },
      { "name": "ResolvedDisputes", "path": "/disputes/resolved" }
    ]
  },
  {
    "category": "Settings",
    "pages": [
      { "name": "ProfileSettings", "path": "/settings/profile" },
      { "name": "BusinessInfo", "path": "/settings/business" },
      { "name": "PaymentSettings", "path": "/settings/payments" },
      { "name": "Security", "path": "/settings/security" }
    ]
  },
  {
    "category": "Support",
    "pages": [
      { "name": "HelpCenter", "path": "/support/help" },
      { "name": "ContactSupport", "path": "/support/contact" },
      { "name": "FAQs", "path": "/support/faqs" }
    ]
  },
  {
    "category": "Profile",
    "pages": [
      { "name": "MyProfile", "path": "/profile" },
      { "name": "VerificationStatus", "path": "/profile/verification" },
      { "name": "AccountSecurity", "path": "/profile/security" },
      { "name": "Wallet", "path": "/profile/wallet" },
      { "name": "EditProfile", "path": "/profile/edit" }
    ]
  },
  {
    "category": "Logout",
    "path": "/logout"
  }
]'

# Loop through the JSON data
echo "$SIDEBAR_DATA" | jq -c '.[]' | while read item; do
  CATEGORY=$(echo "$item" | jq -r '.category')
  PAGES=$(echo "$item" | jq -c '.pages // empty')

  # Convert category to lowercase and replace spaces with hyphens
  CATEGORY_DIR="$BASE_DIR/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"

  if [ -n "$PAGES" ] && [ "$PAGES" != "null" ]; then
    # Create directory for the category
    mkdir -p "$CATEGORY_DIR"

    echo "Creating directory: $CATEGORY_DIR"

    # Create files for each page inside the category folder
    echo "$PAGES" | jq -c '.[]' | while read page; do
      PAGE_NAME=$(echo "$page" | jq -r '.name')
      PAGE_FILE="$CATEGORY_DIR/$PAGE_NAME.jsx"

      # Initialize file with default content
      cat <<EOF >"$PAGE_FILE"
import React from "react";

const $PAGE_NAME = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">$PAGE_NAME</h1>
      <p>This is the $PAGE_NAME page.</p>
    </div>
  );
};

export default $PAGE_NAME;
EOF

      echo "Created file: $PAGE_FILE"
    done
  else
    # Create a single file in the base directory
    PAGE_FILE="$BASE_DIR/$CATEGORY.jsx"

    cat <<EOF >"$PAGE_FILE"
import React from "react";

const $CATEGORY = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">$CATEGORY</h1>
      <p>This is the $CATEGORY page.</p>
    </div>
  );
};

export default $CATEGORY;
EOF

    echo "Created file: $PAGE_FILE"
  fi
done

echo "All files and directories have been created successfully!"
