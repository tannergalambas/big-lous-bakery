export default {
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    {
      name: 'heroBadge',
      title: 'Hero badge text',
      type: 'string',
      description: 'Optional text shown above the hero headline',
    },
    {
      name: 'heroTitle',
      title: 'Hero title',
      type: 'string',
      description: "Use 'Primary | Secondary' to split the headline across two lines",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'heroSubtitle',
      title: 'Hero subtitle',
      type: 'text',
      rows: 3,
    },
    {
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'ctas',
      title: 'Hero CTAs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'href', title: 'Link', type: 'string', validation: (Rule: any) => Rule.required() },
          ],
        },
      ],
    },
    {
      name: 'featuredHeading',
      title: 'Featured section heading',
      type: 'string',
    },
    {
      name: 'featuredDescription',
      title: 'Featured section description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'trustTitle',
      title: 'Trust section heading',
      type: 'string',
    },
    {
      name: 'trustDescription',
      title: 'Trust section description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'trustItems',
      title: 'Trust highlights',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'description', title: 'Description', type: 'text', rows: 3 },
          ],
        },
      ],
    },
    {
      name: 'newsletterTitle',
      title: 'Newsletter heading',
      type: 'string',
    },
    {
      name: 'newsletterDescription',
      title: 'Newsletter description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'newsletterHighlights',
      title: 'Newsletter highlights',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'newsletterButtonLabel',
      title: 'Newsletter button label',
      type: 'string',
    },
    {
      name: 'newsletterSuccessTitle',
      title: 'Newsletter success title',
      type: 'string',
    },
    {
      name: 'newsletterSuccessDescription',
      title: 'Newsletter success description',
      type: 'text',
      rows: 3,
    },
  ],
}
