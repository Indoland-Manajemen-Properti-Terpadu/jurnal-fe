# Security Review Workflow

Inspect the requested code path and current authentication/API implementation; do not assume token storage or server behavior from old documentation. Look for exposed credentials, sensitive logging, unsafe HTML handling, file handling risks, insecure URL construction, and authorization assumptions.

Report confirmed findings by severity, include evidence and user/business impact, and separate recommendations from required fixes. Never access external accounts or production resources unless that access is explicitly in scope and authorized.
