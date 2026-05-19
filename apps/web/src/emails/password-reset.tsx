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

export type PasswordResetProps = {
  userName: string;
  resetUrl: string;
};

export function PasswordReset({ userName, resetUrl }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Valbook password</Preview>
      <Body style={{ fontFamily: 'monospace', background: '#ffffff', color: '#0a0a0a' }}>
        <Container style={{ padding: '32px', maxWidth: '480px' }}>
          <Heading as="h1" style={{ fontSize: '20px', marginBottom: '24px' }}>
            Reset password
          </Heading>
          <Text style={{ fontSize: '14px', lineHeight: 1.6 }}>Hi {userName},</Text>
          <Text style={{ fontSize: '14px', lineHeight: 1.6 }}>
            We received a request to reset your Valbook password. Click below to set a new one.
          </Text>
          <Button
            href={resetUrl}
            style={{
              background: '#171717',
              color: '#fafafa',
              padding: '12px 24px',
              fontSize: '14px',
              marginTop: '16px',
              marginBottom: '16px',
            }}
          >
            Reset password
          </Button>
          <Text style={{ fontSize: '12px', color: '#717171' }}>
            Or copy this link: <Link href={resetUrl}>{resetUrl}</Link>
          </Text>
          <Text style={{ fontSize: '12px', color: '#717171', marginTop: '32px' }}>
            This link expires in 1 hour. If you didn't request a reset, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordReset;
