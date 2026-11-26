import { defineField, defineType } from 'sanity';
import { CATEGORIES, DISTRICTS, STATUSES } from '../shared/taxonomy';

const districtOptions = DISTRICTS.map((district) => ({ title: district, value: district }));
const categoryOptions = CATEGORIES.map((category) => ({ title: category, value: category }));
const statusOptions = STATUSES.map((status) => ({
  title: status.charAt(0).toUpperCase() + status.slice(1),
  value: status,
}));

export const venueType = defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(140),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.max(180),
        }),
      ],
    }),
    defineField({
      name: 'district',
      title: 'District',
      type: 'string',
      options: { list: districtOptions, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'locationName',
      title: 'Address or area',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(160),
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps URL',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'category',
      title: 'Activities',
      type: 'string',
      options: { list: categoryOptions, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'organizerContact',
      title: 'Contact',
      type: 'string',
      description: 'Email or phone. Not shown on the public page.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: statusOptions, layout: 'radio' },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', district: 'district', status: 'status' },
    prepare({ title, district, status }) {
      return { title: title || 'Venue', subtitle: [district, status].filter(Boolean).join(' · ') };
    },
  },
});
