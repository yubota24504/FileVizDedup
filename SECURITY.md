# Security Policy

## Supported Versions

This project is intended for local, offline-capable usage.
There are no long-term supported release branches.

Security issues will be addressed on a best-effort basis.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not disclose it publicly**.

Instead, report it using one of the following methods:

- Open a GitHub Issue with the label **security**
  (avoid including sensitive details if possible), or
- Contact the maintainer via their GitHub profile.

Please include:
- A clear description of the issue
- Steps to reproduce, if applicable
- Potential impact

---

## Security Scope and Assumptions

- The application is designed to run on **localhost (127.0.0.1)** only.
- No authentication, authorization, or multi-user access is implemented.
- The application does **not** expose services to external networks by default.
- Users are responsible for securing their own local environment.

---

## Dependency and Source Safety

- No proprietary or confidential data is included in this repository.
- API keys, secrets, and credentials are **not** required by default.
- It is recommended to use tools such as:
  - `git-secrets`
  - `trufflehog`
  to prevent accidental inclusion of secrets.

---

## Disclaimer

This software is provided **"as is"**, without warranty of any kind.
The maintainer is not responsible for misuse, data loss, or system damage.
