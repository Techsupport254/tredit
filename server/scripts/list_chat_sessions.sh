#!/bin/bash

# Check if token is provided
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <token>"
    exit 1
fi

TOKEN=$1

# Properly encode the token by fixing the email format
# This is a workaround for the token error visible in the logs
TOKEN=$(echo $TOKEN | sed 's/kiruivicto/"kiruivicto/g' | sed 's/gmail.com/gmail.com"/g')

# List all chat sessions using curl
curl -X GET \
  http://localhost:8000/api/cart/chat/sessions \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo 