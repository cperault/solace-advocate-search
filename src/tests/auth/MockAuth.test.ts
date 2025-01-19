import { MockAuthService, useSession, signIn, signOut } from "@/app/auth/MockAuth";

describe("MockAuthService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("useSession", () => {
    it("should return regular user session by default", () => {
      const { data: session } = useSession();

      expect(session?.user).toEqual({
        email: "user@local.com",
        name: "Regular User",
        isAdmin: false,
      });
    });

    it("should return regular user session when specified", () => {
      process.env.NEXT_PUBLIC_MOCK_USER = "user@local.com";

      const { data: session } = useSession();

      expect(session?.user).toEqual({
        email: "user@local.com",
        name: "Regular User",
        isAdmin: false,
      });
    });

    it("should return null session for unknown user", () => {
      process.env.NEXT_PUBLIC_MOCK_USER = "unknown@local.com";

      const { data: session, status } = useSession();

      expect(session).toBeNull();
      expect(status).toBe("unauthenticated");
    });
  });

  describe("signIn", () => {
    it("should successfully sign in admin user", async () => {
      const result = await signIn("admin@local.com");

      expect(result).toEqual({
        ok: true,
        user: {
          email: "admin@local.com",
          name: "Admin User",
          isAdmin: true,
        },
      });
    });

    it("should successfully sign in regular user", async () => {
      const result = await signIn("user@local.com");

      expect(result).toEqual({
        ok: true,
        user: {
          email: "user@local.com",
          name: "Regular User",
          isAdmin: false,
        },
      });
    });

    it("should fail to sign in unknown user", async () => {
      const result = await signIn("unknown@local.com");

      expect(result).toEqual({
        ok: false,
        user: undefined,
      });
    });
  });

  describe("signOut", () => {
    it("should always succeed", async () => {
      const result = await signOut();

      expect(result).toEqual({ ok: true });
    });
  });

  describe("getCurrentUser", () => {
    it("should return admin by default", () => {
      const service = MockAuthService.getInstance();
      const user = service.getCurrentUser();

      expect(user).toEqual({
        email: "admin@local.com",
        name: "Admin User",
        isAdmin: true,
      });
    });

    it("should return regular user when specified", () => {
      process.env.NEXT_PUBLIC_MOCK_USER = "user@local.com";

      const service = MockAuthService.getInstance();
      const user = service.getCurrentUser();

      expect(user).toEqual({
        email: "user@local.com",
        name: "Regular User",
        isAdmin: false,
      });
    });

    it("should return null for unknown user", () => {
      process.env.NEXT_PUBLIC_MOCK_USER = "unknown@local.com";

      const service = MockAuthService.getInstance();
      const user = service.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe("isAdmin", () => {
    it("should return true for admin user", () => {
      const service = MockAuthService.getInstance();

      expect(service.isAdmin()).toBe(true);
    });

    it("should return false for regular user", () => {
      process.env.NEXT_PUBLIC_MOCK_USER = "user@local.com";

      const service = MockAuthService.getInstance();

      expect(service.isAdmin()).toBe(false);
    });

    it("should return false for unknown user", () => {
      process.env.NEXT_PUBLIC_MOCK_USER = "unknown@local.com";

      const service = MockAuthService.getInstance();

      expect(service.isAdmin()).toBe(false);
    });
  });
});
