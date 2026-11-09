import { defineField, defineType } from 'sanity';
import { CATEGORIES, DISTRICTS, STATUSES } from '../shared/taxonomy';

const districtOptions = DISTRICTS.map((district) => ({ title: district, value: district }));
const categoryOptions = CATEGORIES.map((category) => ({ title: category, value: category }));
const statusOptions = STATUSES.map((status) => ({
  title: status.charAt(0).toUpperCase() + status.slice(1),
  value: status,
}));

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'schedule', title: 'Schedule' },
    { name: 'place', title: 'Place' },
    { name: 'listing', title: 'Listing' },
    { name: 'moderation', title: 'Moderation' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().min(3).max(140),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      group: 'content',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      group: 'content',
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
      name: 'startDate',
      title: 'Start',
      type: 'datetime',
      group: 'schedule',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End',
      type: 'datetime',
      group: 'schedule',
    }),
    defineField({
      name: 'district',
      title: 'District',
      type: 'string',
      group: 'place',
      options: { list: districtOptions, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'locationName',
      title: 'Location name',
      type: 'string',
      group: 'place',
      description: 'e.g. Paphos Castle or Omodos Village Square',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps URL',
      type: 'url',
      group: 'place',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'listing',
      options: { list: categoryOptions },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceText',
      title: 'Price',
      type: 'string',
      group: 'listing',
      description: 'e.g. Free, €15, Free Entry',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Ticket URL',
      type: 'url',
      group: 'listing',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured / Boosted',
      type: 'boolean',
      group: 'listing',
      description: 'Pins the event to the top of the homepage.',
      initialValue: false,
    }),
    defineField({
      name: 'featuredUntil',
      title: 'Featured until',
      type: 'datetime',
      group: 'listing',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'moderation',
      options: { list: statusOptions, layout: 'radio' },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'organizerContact',
      title: 'Organizer contact',
      type: 'string',
      group: 'moderation',
      description: 'Email or phone for internal admin use. Never rendered on the public site.',
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      district: 'district',
      status: 'status',
      media: 'mainImage',
    },
    prepare({ title, district, status, media }) {
      return {
        title: title || 'Untitled event',
        subtitle: [district, status].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
