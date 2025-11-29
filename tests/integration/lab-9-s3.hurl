# tests/integration/lab-9-s3.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`Fragments to S3`

# Expect it return 201 and capture Location header
HTTP/1.1 201
[Captures]
url: header "Location"

# GET the fragment using the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# DELETE the fragment using the URL
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Try to GET the deleted fragment
GET {{url}}
[BasicAuth]

# Confirm 401 status since fragment should be deleted
HTTP/1.1 401
