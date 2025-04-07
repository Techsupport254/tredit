#!/bin/bash

# Check if required parameters are provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <session_id> <token>"
    exit 1
fi

SESSION_ID=$1
TOKEN=$2

# Properly encode the token by fixing the email format
# This is a workaround for the token error visible in the logs
TOKEN=$(echo $TOKEN | sed 's/kiruivicto/"kiruivicto/g' | sed 's/gmail.com/gmail.com"/g')

# Get chat session using curl
curl -X GET \
  http://localhost:8000/api/cart/chat/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo 