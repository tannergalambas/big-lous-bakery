export default {
  name: 'instagramPost',
  title: 'Instagram Post',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Short description for accessibility.',
        },
      ],
    },
    {
      name: 'imageUrl',
      title: 'Image URL (optional)',
      type: 'string',
      description: 'Use this to reference an external or hosted image if you do not upload one.',
    },
    {
      name: 'permalink',
      title: 'Instagram permalink',
      type: 'url',
      validation: (Rule: any) => Rule.required().uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'caption',
      media: 'image',
      permalink: 'permalink',
      imageUrl: 'imageUrl',
    },
    prepare({ title, media, permalink, imageUrl }: { title?: string; media?: any; permalink?: string; imageUrl?: string }) {
      return {
        title: title || permalink || 'Instagram Post',
        subtitle: permalink,
        media: media || imageUrl,
      };
    },
  },
};
