import { eq } from 'drizzle-orm';

import { user } from '@/src/features/auth/server/db';
import { workspaces } from '@/src/features/workspace/server/db';
import { createWorkspaceWithTemplate } from '@/src/features/workspace/server/service';
import { auth } from '@/src/server/auth';
import { db } from '@/src/server/db';

const DEMO_EMAIL = 'demo@valbook.local';
const DEMO_PASSWORD = 'demo1234';
const DEMO_NAME = 'Demo User';
const DEMO_WORKSPACE_NAME = 'Personal Demo';
const DEMO_WORKSPACE_SLUG = 'personal-demo';

async function ensureDemoUser(): Promise<{ id: string; created: boolean }> {
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, DEMO_EMAIL))
    .limit(1);

  if (existing[0]) {
    return { id: existing[0].id, created: false };
  }

  await auth.api.signUpEmail({
    body: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: DEMO_NAME,
    },
    headers: new Headers(),
  });

  const inserted = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, DEMO_EMAIL))
    .limit(1);

  if (!inserted[0]) {
    throw new Error('Failed to create demo user');
  }
  return { id: inserted[0].id, created: true };
}

async function ensureDemoWorkspace(
  ownerUserId: string,
): Promise<{ slug: string; created: boolean }> {
  const existing = await db
    .select({ slug: workspaces.slug })
    .from(workspaces)
    .where(eq(workspaces.slug, DEMO_WORKSPACE_SLUG))
    .limit(1);

  if (existing[0]) {
    return { slug: existing[0].slug, created: false };
  }

  await createWorkspaceWithTemplate(
    {
      name: DEMO_WORKSPACE_NAME,
      slug: DEMO_WORKSPACE_SLUG,
      displayCurrency: 'IDR',
      templateId: 'personal-wealth',
    },
    { ownerUserId, ownerName: DEMO_NAME },
  );
  return { slug: DEMO_WORKSPACE_SLUG, created: true };
}

async function main() {
  // biome-ignore lint/suspicious/noConsole: seed script log
  console.log('[seed-demo] starting…');

  const userResult = await ensureDemoUser();
  // biome-ignore lint/suspicious/noConsole: seed script log
  console.log(
    `[seed-demo] user ${userResult.created ? 'created' : 'exists'}: ${DEMO_EMAIL} (id=${userResult.id})`,
  );

  const wsResult = await ensureDemoWorkspace(userResult.id);
  // biome-ignore lint/suspicious/noConsole: seed script log
  console.log(`[seed-demo] workspace ${wsResult.created ? 'created' : 'exists'}: ${wsResult.slug}`);

  // biome-ignore lint/suspicious/noConsole: seed script log
  console.log('\n[seed-demo] done. Login at /login:');
  // biome-ignore lint/suspicious/noConsole: seed script log
  console.log(`  email:    ${DEMO_EMAIL}`);
  // biome-ignore lint/suspicious/noConsole: seed script log
  console.log(`  password: ${DEMO_PASSWORD}`);
  // biome-ignore lint/suspicious/noConsole: seed script log
  console.log(`  workspace: /app/w/${DEMO_WORKSPACE_SLUG}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // biome-ignore lint/suspicious/noConsole: seed script error log
    console.error('[seed-demo] failed:', error);
    process.exit(1);
  });
