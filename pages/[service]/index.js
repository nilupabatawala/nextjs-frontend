import Head from "next/head";
import PageGenerator from "../../generator/PageGenerator";

const Page = ({ data, params, breadcrumbs, DOMAIN_URL }) => {
  return (
    <>
      <Head>
        <title>{data.header.meta.title}</title>

        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#fffff" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content={data.header.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="manifest" href="/manifest.json" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="canonical" href={`${DOMAIN_URL}/${params.service}`} />

        {Object.entries(data.header?.schemas[0]).map(([id, schema]) => {
          return (
            <script
              key={id}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema)
                  .replaceAll("[current_url]", `${DOMAIN_URL}/${params.service}`)
                  .replaceAll("[phone]", data.contact.phone),
              }}
            />
          );
        })}
      </Head>
      <PageGenerator
        data={data}
        params={params}
        breadcrumbs={breadcrumbs}
        type="service"
      />
      ;
    </>
  );
};

export const getServerSideProps = async ({ res, params }) => {
  const { service } = params;

  const breadcrumbs = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: service
        .replace("-los-angeles-ca", "")
        .split("-")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" "),
      href: `/${service}`,
    },
  ];

  const homeResponse = await fetch(
    `${process.env.API_URL}?${new URLSearchParams({
      domain: process.env.DOMAIN_URL,
    }).toString()}`
  );

  const homeData = await homeResponse.json();

  if (
    service.replace("-los-angeles-ca", "").toLowerCase() ===
    homeData.header.default_service
  ) {
    res.setHeader("Location", "/");
    res.statusCode = 302;
    res.end();
    return {
      props: {},
    };
  }

  const response = await fetch(
    `${process.env.API_URL}?${new URLSearchParams({
      domain: process.env.DOMAIN_URL,
      type: "service",
      service: service.replace("-los-angeles-ca", ""),
    }).toString()}`
  );

  const data = await response.json();

  if (!data || !!data.response) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data: { ...data, zips: homeData.zips, allServices: homeData.allServices },
      params,
      breadcrumbs,
      DOMAIN_URL: process.env.DOMAIN_URL,
    },
  };
};

export default Page;
