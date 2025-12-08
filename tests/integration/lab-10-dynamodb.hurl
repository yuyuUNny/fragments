# 1. POST JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{ "service": "DynamoDB" }
HTTP 201
[Captures]
fragment1_url: header "Location"
fragment1_id: header "Location" regex "/v1/fragments/([^/]+)$"
[Asserts]
header "Location" exists

# 2. GET fragment1 metadata
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP 200

# 3. POST Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
```
DynamoDB is **great**.
```
HTTP 201
[Captures]
fragment2_url: header "Location"
fragment2_id: header "Location" regex "/v1/fragments/([^/]+)$"
[Asserts]
header "Location" exists

# 4. GET fragment2 metadata
GET {{fragment2_url}}
[BasicAuth]
user1@email.com:password1
HTTP 200

# 5. GET fragment1 info
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"

# 6. GET all fragments (IDs only)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP 200
[Asserts]
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# 7. DELETE fragment1
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"

# 8. GET fragment1 again → should be 404
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP 404

# 9. GET all fragments again (IDs only)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP 200
[Asserts]
jsonpath "$[*]" not includes "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"
