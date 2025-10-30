import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export function MagicLink(props: { url: string }) {
  const { url } = props;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>Prihlásenie do Kromka učtu</Preview>
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-md border border-solid p-[20px]">
            <Section>
              {/* <Img
                src="https://fitpoint.app/logo.png"
                alt="FitPoint Logo"
                width={100}
                height={50}
                className="mx-auto my-0"
              /> */}
            </Section>
            <Heading className="mx-0 my-[20px] text-center font-semibold text-[24px] text-black">
              Prihlásenie do Kromka učtu
            </Heading>
            <Section className="mx-auto text-center">
              <Text className="mb-[24px] text-center text-gray-500 text-sm leading-[24px]">
                Kliknite na tlačidlo nižšie pre bezpečné prihlásenie do svojho
                účtu.
              </Text>
              <Button
                className="my-0 rounded-md bg-gray-800 px-[20px] py-[12px] text-center text-white"
                href={url}
              >
                Prihlásiť sa
              </Button>
              <Text className="mb-[12px] text-center text-gray-500 text-xs leading-[20px]">
                Tento odkaz vyprší za 15 minút pre vašu bezpečnosť.
              </Text>
            </Section>
            <Section className="mt-[32px] text-center">
              <Hr className="mx-0 my-[14px] w-full border border-[#eaeaea] border-solid" />
              <Text className="mb-[14px] text-center text-gray-500 text-xs leading-[20px]">
                Ak ste tento email nepožiadali, môžete ho bezpečne ignorovať.
                <br />
                Potrebujete pomoc? Kontaktujte{" "}
                <Link
                  className="text-blue-500 underline"
                  href="mailto:support@kromka.sk"
                >
                  support@kromka.sk
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export async function renderMagicLink(url: string) {
  const template = <MagicLink url={url} />;
  return await render(template);
}
