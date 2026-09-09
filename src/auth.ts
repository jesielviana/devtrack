import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: "read:user user:email repo offline_access" } },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const githubProfile = profile as { login?: string; id?: number } | undefined;
      if (githubProfile?.login && githubProfile.id) {
        await db.update(users).set({
          githubLogin: githubProfile.login,
          githubUserId: String(githubProfile.id),
        }).where(eq(users.id, user.id!));
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.githubLogin = (user as typeof user & { githubLogin?: string }).githubLogin;
      session.user.githubUserId = (user as typeof user & { githubUserId?: string }).githubUserId;
      return session;
    },
  },
  pages: { signIn: "/" },
});
