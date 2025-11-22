# tests/integration/post-fragments-unauthenticated.hurl
# No [BasicAuth] POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
`This is a fragment!`

# Get back an HTTP 401
HTTP/1.1 401
