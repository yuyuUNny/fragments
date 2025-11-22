# tests/integration/post-fragments-json.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`This is a fragment with charset!`

# Expect it return 201 and matches type
HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "application/json"

[Captures]
url: header "Location"

# Verify GET returns the same content-type with charset
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" startsWith "application/json"
body == "This is a fragment with charset!"
