import { Challenge } from "@/components/main";
import { Container } from "@chakra-ui/react";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Buy Your Domain</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Container paddingY={12}>
        <Challenge maxDomains={12} />
      </Container>
    </>
  );
}
