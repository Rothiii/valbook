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

export type VerifyEmailProps = {
  userName: string;
  verifyUrl: string;
};

export function VerifyEmail({ userName, verifyUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your Valbook email</Preview>
      <Body style={{ fontFamily: 'monospace', background: '#ffffff', color: '#0a0a0a' }}>
        <Container style={{ padding: '32px', maxWidth: '480px' }}>
          <Heading as="h1" style={{ fontSize: '20px', marginBottom: '24px' }}>
            Verify your email
          </Heading>
          <Text style={{ fontSize: '14px', lineHeight: 1.6 }}>Hi {userName},</Text>
          <Text style={{ fontSize: '14px', lineHeight: 1.6 }}>
            Click the button below to verify your email address for Valbook.
          </Text>
          <Button
            href={verifyUrl}
            style={{
              background: '#171717',
              color: '#fafafa',
              padding: '12px 24px',
              fontSize: '14px',
              marginTop: '16px',
              marginBottom: '16px',
            }}
          >
            Verify email
          </Button>
          <Text style={{ fontSize: '12px', color: '#717171' }}>
            Or copy this link: <Link href={verifyUrl}>{verifyUrl}</Link>
          </Text>
          <Text style={{ fontSize: '12px', color: '#717171', marginTop: '32px' }}>
            This link expires in 24 hours. If you didn't sign up for Valbook, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default VerifyEmail;
