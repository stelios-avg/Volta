import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || '4p9j6kpo';
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'volta',
  title: 'Volta',
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) => S.documentTypeList('event').title('Εκδηλώσεις'),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
