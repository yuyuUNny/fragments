# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# posting an unsupported Content-Type
Content-Type: unKnow/type
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# Get back an HTTP 415
HTTP/1.1 415
