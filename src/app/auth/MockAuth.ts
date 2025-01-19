export interface MockUser {
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface MockSession {
  user: MockUser;
  expires: string;
}

export class MockAuthService {
  private static instance: MockAuthService;
  private readonly mockUsers: MockUser[] = [
    { email: "admin@local.com", name: "Admin User", isAdmin: true },
    { email: "user@local.com", name: "Regular User", isAdmin: false },
  ];

  private constructor() {}

  public static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }

    return MockAuthService.instance;
  }

  public useSession() {
    const mockCurrentUser = process.env.NEXT_PUBLIC_MOCK_USER || "user@local.com";
    const user = this.mockUsers.find((u) => u.email === mockCurrentUser);

    return {
      data: user
        ? ({
            user,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          } as MockSession)
        : null,
      status: user ? "authenticated" : "unauthenticated",
    };
  }

  public signIn(email: string): Promise<{ ok: boolean; user?: MockUser }> {
    const user = this.mockUsers.find((u) => u.email === email);

    return Promise.resolve({
      ok: !!user,
      user: user || undefined,
    });
  }

  public signOut(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }

  public getCurrentUser(): MockUser | null {
    const mockCurrentUser = process.env.NEXT_PUBLIC_MOCK_USER || "admin@local.com";

    return this.mockUsers.find((u) => u.email === mockCurrentUser) || null;
  }

  public isAdmin(): boolean {
    const user = this.getCurrentUser();

    return user?.isAdmin || false;
  }
}

export function useSession() {
  return MockAuthService.getInstance().useSession();
}

export function signIn(email: string) {
  return MockAuthService.getInstance().signIn(email);
}

export function signOut() {
  return MockAuthService.getInstance().signOut();
}
