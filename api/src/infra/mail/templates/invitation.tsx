import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
interface InvitationEmailProps {
  invitationCode: string;
  companyName: string;
}

const baseUrl = process.env.FRONT_END_URL ?? 'http://localhost:3000';

const InvitationEmail = ({
  invitationCode,
  companyName,
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Convite para se juntar à {companyName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={`${baseUrl}/logo.svg`} width={120} height={120} alt="Logo" />
        <Heading style={heading}>Link de acesso</Heading>

        <Section style={body}>
          <Text style={paragraph}>
            Olá! Você foi convidado a se juntar à empresa {companyName} no
            MedChatIA.
          </Text>

          <Text style={paragraph}>
            Clique no botão abaixo para criar sua conta.
          </Text>
          <Link
            href={`${baseUrl}/user/signup?code=${invitationCode}`}
            style={button}
          >
            Criar conta
          </Link>

          <Text style={paragraph}>
            Se o botão não abrir, clique aqui para acessar sua conta.
            <Link
              href={`${baseUrl}/user/signup?code=${invitationCode}`}
              style={{
                cursor: 'pointer',
              }}
            ></Link>
            .
          </Text>

          <Text style={paragraph}>
            Use este código durante o cadastro para vincular sua conta ao tenant
            da empresa:
          </Text>

          <Text
            style={{
              ...paragraph,
              fontWeight: 'bold',
              fontSize: '18px',
              letterSpacing: '1px',
            }}
          >
            {invitationCode}
          </Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>MedChatIA</Text>
      </Container>
    </Body>
  </Html>
);

export default InvitationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 25px 48px',
  backgroundColor: '#f9f9f9',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
};

const body = {
  margin: '24px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const button = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#ab1616',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  borderRadius: '5px',
  margin: '20px 0',
  cursor: 'pointer',
};

const hr = {
  borderColor: '#dddddd',
  marginTop: '48px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  marginLeft: '4px',
};

// const legalInfo = {
//   color: '#8898aa',
//   fontSize: '10px',
//   marginTop: '10px'
// }
