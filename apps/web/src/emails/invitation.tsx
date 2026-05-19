import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

export type InvitationEmailProps = {
  inviterName: string;
  workspaceName: string;
  role: 'editor' | 'viewer';
  inviteUrl: string;
  customMessage?: string;
};

export function InvitationEmail({
  inviterName,
  workspaceName,
  role,
  inviteUrl,
  customMessage,
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to {workspaceName} on Valbook
      </Preview>
      <Body style={{ fontFamily: 'monospace', background: '#ffffff', color: '#0a0a0a' }}>
        <Container style={{ padding: '32px', maxWidth: '480px' }}>
          <Heading as="h1" style={{ fontSize: '20px', marginBottom: '24px' }}>
            You're invited
          </Heading>
          <Text style={{ fontSize: '14px', lineHeight: 1.6 }}>
            {inviterName} invited you to join the workspace <strong>{workspaceName}</strong> as{' '}
            <strong>{role}</strong>.
          </Text>
          {customMessage ? (
            <Text
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                padding: '12px',
                background: '#f5f5f5',
                borderLeft: '2px solid #171717',
              }}
            >
              {customMessage}
            </Text>
          ) : null}
          <Button
            href={inviteUrl}
            style={{
              background: '#171717',
              color: '#fafafa',
              padding: '12px 24px',
              fontSize: '14px',
              marginTop: '16px',
              marginBottom: '16px',
            }}
          >
            Accept invitation
          </Button>
          <Text style={{ fontSize: '12px', color: '#717171' }}>
            Or copy this link: <Link href={inviteUrl}>{inviteUrl}</Link>
          </Text>
          <Text style={{ fontSize: '12px', color: '#717171', marginTop: '32px' }}>
            This invitation expires in 7 days.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InvitationEmail;
