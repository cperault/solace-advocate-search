## Notes

- deleted `.env` and replaced with `.env.local` since it's already excluded in `.gitignore`; documenting here since the new file won't appear in pull request
- added `MockAuthService` to mock authentication which can easily be swapped out with a real auth service like GitHub, Google, email/password, etc.; an admin user can create new advocates whereas a regular user can only view advocates
  - to test as an admin, set the `NEXT_PUBLIC_MOCK_USER` environment variable to `admin@local.com` in `.env.local`
  - to test as a regular user, set the `NEXT_PUBLIC_MOCK_USER` environment variable to `user@local.com` in `.env.local`
