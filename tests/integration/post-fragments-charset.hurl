# tests/integration/post-fragments-charset.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`This is a fragment with charset!`

# Expect it return 201 and matches type
HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"

[Captures]
url: header "Location"

# Verify GET returns the same content-type with charset
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == "This is a fragment with charset!"
