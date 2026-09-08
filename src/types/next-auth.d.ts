import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubLogin?: string;
      githubUserId?: string;
    } & NonNullable<Session["user"]>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubLogin?: string;
    githubUserId?: string;
  }
}
