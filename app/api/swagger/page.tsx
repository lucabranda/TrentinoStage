import dynamic from 'next/dynamic';
import { createSwaggerSpec } from 'next-swagger-doc';
import 'swagger-ui-react/swagger-ui.css';
import {siteConfig} from '@/utils/config';
import { NextRequest, NextResponse } from 'next/server';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: true });

async function swaggerSpec() {
  return createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${siteConfig.name} API`,
        version: siteConfig.APIVersion,
      },
    },
    apis: ['./app/api/**/*.ts'], // Path to your API files
  });
}

export default async function getApiDoc() {
  const spec = await swaggerSpec();

  return <SwaggerUI spec={spec} />;
}
