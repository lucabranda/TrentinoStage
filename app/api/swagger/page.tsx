import dynamic from 'next/dynamic';
import { createSwaggerSpec } from 'next-swagger-doc';
import 'swagger-ui-react/swagger-ui.css';
import {siteConfig} from '@/utils/config';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: true });

async function getSwaggerSpec() {
  return createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${siteConfig.name} API`,
        version: siteConfig.APIVersion,
      },
    },
  });
}

export default async function ApiDoc() {
  const spec = await getSwaggerSpec();

  return <SwaggerUI spec={spec} />;
}
