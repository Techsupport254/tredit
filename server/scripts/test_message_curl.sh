#!/bin/bash

# Test sending a message via direct curl command with verbose output
SESSION_ID="e9f63772-cec8-4ea6-a218-f9f7d476f170"
MESSAGE_CONTENT="I would like to order the iPhone 15 Pro in black color"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmM2UzODQ3LTZjODctNGY2NC1iOTRiLTEwZDNlM2MyOWRiZCIsIm5hbWUiOiJWaWN0b3IgUXVhaW50IiwiZW1haWwiOiJraXJ1aXZpY3RvcjA5N0BnbWFpbC5jb20iLCJ3YWxsZXRBZGRyZXNzIjoiMHhlOTEzODhBNDM2NjU5ZjJjMGI0MkJDZWE2ZjdhOUI3MDA0RjJmMjY1IiwiYmxvY2tjaGFpblR4SGFzaCI6IjB4MjU1MTU4NGMzY2NkYjBkNDlkMzUwY2MxNzc5NGZjZDkwMGI0ZjdhZjlkZDA1YWViNDJlNGMwZGYyN2FlZmRhYyIsImlwZnNVcmwiOiJodHRwczovL2dhdGV3YXkucGluYXRhLmNsb3VkL2lwZnMvYmFma3JlaWdkdmVwamZ5cGllc3Y0ZXN0bG9hdGdwNm4ycmRpa3E1YXMzZ3c0cDd3ZXdleGZxbzYzcTQiLCJhY2NlcHRCbG9ja2NoYWluU3RvcmFnZSI6dHJ1ZSwicHJvZmlsZUltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2N5VmJpc0ZYOWRERk9GSXdwODhLQlZRUlc4Xzc4RjJFWFpjcjV6bmpoUG90N0pGeVI9czY0LWMiLCJnZW5kZXIiOiJtYWxlIiwiZG9iIjoiMjAwMi0wOC0wOCIsInBob25lTnVtYmVyIjoiMjU0NzE2NDA0MTM3IiwibG9jYXRpb24iOiJLaWxpbWFuaSwgS2lsaW1hbmkgZGl2aXNpb24sIFdlc3RsYW5kcywgTmFpcm9iaSwgTmFpcm9iaSBDb3VudHksIDQ0ODQ3LCBLZW55YSIsImJpbyI6IlNhc2FUZWNoIEFmcmljYSAtIEJ1aWxkaW5nIHRoZSBmdXR1cmUgb2YgV2ViMyIsInByZWZlcmVuY2VzIjp7InRoZW1lIjoiZGFyayIsImxhbmd1YWdlIjoiZW4iLCJub3RpZmljYXRpb25zIjp7InB1c2giOnRydWUsImVtYWlsIjp0cnVlLCJtYXJrZXRpbmciOmZhbHNlfX0sImxhc3RMb2dpbiI6bnVsbCwic3RhdHVzIjoiYWN0aXZlIiwicm9sZSI6InVzZXIiLCJtZXRhZGF0YSI6eyJidXNpbmVzc2VzIjpbeyJpZCI6IjM5ZTBkNWY3LWJlMmEtNGY2Ny04YjE3LTcxZTk2YTNjYTliMyIsIm5hbWUiOiJUZWNoIEdhZGdldHMgU3RvcmUiLCJyb2xlIjoib3duZXIiLCJqb2luZWRBdCI6IjIwMjUtMDMtMTdUMTY6MjA6NTAuMTExWiIsInBlcm1pc3Npb25zIjp7ImFsbCI6dHJ1ZSwibWFuYWdlVGVhbSI6dHJ1ZSwibWFuYWdlQ29udGVudCI6dHJ1ZSwidmlld0FuYWx5dGljcyI6dHJ1ZSwibWFuYWdlRmluYW5jZXMiOnRydWUsIm1hbmFnZVByb2R1Y3RzIjp0cnVlLCJtYW5hZ2VTZXJ2aWNlcyI6dHJ1ZSwibWFuYWdlU2V0dGluZ3MiOnRydWV9fV0sImxhc3RJUEZTVXBkYXRlIjoiMjAyNS0wMy0yMFQxMDoxNDoxNy42NzlaIn0sImNyZWF0ZWRBdCI6IjIwMjUtMDMtMTdUMTY6MTY6NDkuNTE1WiIsInVwZGF0ZWRBdCI6IjIwMjUtMDMtMjBUMjA6Mjk6NDkuNTY4WiIsImlhdCI6MTc0MjUzMTgyOCwiZXhwIjoxNzQ1MTIzODI4fQ.vH-QXjs6JpGHIoPGI2s9YaF7MiA0rwHYx6U8CZOM1XQ"

echo "========== TEST MESSAGE CURL VERBOSE =========="
echo "Session ID: $SESSION_ID"
echo "Message content: $MESSAGE_CONTENT"
echo "Token length: ${#TOKEN} characters"

# Create JSON payload - using here-document to avoid escaping issues
MESSAGE_JSON='{
  "content": "'"$MESSAGE_CONTENT"'",
  "messageType": "text"
}'

echo "Payload content:"
echo "$MESSAGE_JSON" | json_pp

echo "Sending message with verbose output..."
curl -v -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$MESSAGE_JSON" \
  http://localhost:8000/api/cart/chat/$SESSION_ID/messages

echo ""
echo "===== TESTING WITH SCRIPT METHOD ====="
echo "Running working script implementation..."
node scripts/test_direct_create_message.js

echo ""
echo "===== TESTING WITH SEND_CHAT_MESSAGE.SH ====="
if [ -f ./scripts/send_chat_message.sh ]; then
  echo "Running the existing send_chat_message.sh script..."
  ./scripts/send_chat_message.sh "$SESSION_ID" "$MESSAGE_CONTENT" "$TOKEN"
else
  echo "send_chat_message.sh script not found"
fi

echo "Done" 