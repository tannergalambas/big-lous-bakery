import { sanity, sanityFor } from './sanity';
import groq from 'groq';

type Maybe<T> = T | null | undefined;

function sanityDisabled() {
  const projectId =
    process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset =
    process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET;
  return !projectId || !dataset;
}

export type CmsPage = {
  title: string;
  content?: any;
  image?: string | null;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string | null };
  ctaTitle?: string;
  ctaDescription?: string;
  ctas?: Array<{ label: string; href: string }>;
};

export async function getPage(slug: string, preview = false): Promise<Maybe<CmsPage>> {
  if (sanityDisabled()) return null;

  try {
    const query = groq`*[_type == "page" && slug.current == $slug][0]{
      title,
      content[]{
        ...,
        _type == 'image' => {
          ...,
          'url': asset->url,
          'alt': coalesce(alt, '')
        }
      },
      "image": image.asset->url,
      ctaTitle,
      ctaDescription,
      ctas,
      seo{ metaTitle, metaDescription, "ogImage": ogImage.asset->url },
    }`;

    const client = preview ? sanityFor(true) : sanity;
    const data = await client.fetch<CmsPage | null>(query, { slug });
    return data ?? null;
  } catch {
    return null;
  }
}

export type FaqItem = { question: string; answer: string };

export async function getFaq(preview = false): Promise<FaqItem[]> {
  if (sanityDisabled()) return [];

  try {
    const query = groq`*[_type == "faqItem"] | order(order asc){
      question,
      answer
    }`;
    const client = preview ? sanityFor(true) : sanity;
    const data = await client.fetch<FaqItem[]>(query);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// -------- Owner editables --------
export type SiteSettings = {
  siteName?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  social?: { instagram?: string; tiktok?: string };
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string | null };
  featuredProductIds?: string[];
  footerText?: string;
  contactFormSubmitLabel?: string;
};

export async function getSiteSettings(preview = false): Promise<SiteSettings | null> {
  if (sanityDisabled()) return null;
  try {
    const query = groq`*[_type == "siteSettings"][0]{
      siteName, tagline, email, phone, address, hours,
      social,
      contactFormSubmitLabel,
      seo{ metaTitle, metaDescription, "ogImage": ogImage.asset->url },
      featuredProductIds,
      footerText
    }`;
    const client = preview ? sanityFor(true) : sanity;
    const data = await client.fetch<SiteSettings | null>(query);
    return data ?? null;
  } catch {
    return null;
  }
}

export type Navigation = {
  headerLinks?: Array<{ label: string; url: string }>;
  footerLinks?: Array<{ label: string; url: string }>;
  headerTree?: Array<NavItem>;
};

export async function getNavigation(preview = false): Promise<Navigation | null> {
  if (sanityDisabled()) return null;
  try {
    const query = groq`*[_type == "navigation"][0]{ headerLinks, footerLinks }`;
    const client = preview ? sanityFor(true) : sanity;
    const data = await client.fetch<Navigation | null>(query);
    return data ?? null;
  } catch {
    return null;
  }
}

// Auto-nav fallback from Pages
export type PageForNav = {
  title: string;
  slug: string;
  navLabel?: string;
  order?: number;
  hideFromNav?: boolean;
  parent?: { slug: string; title: string } | null;
};

export async function getAutoNavigation(preview = false): Promise<Navigation> {
  if (sanityDisabled()) return { headerLinks: [], footerLinks: [] };
  try {
    const query = groq`*[_type=='page']{
      title,
      "slug": slug.current,
      navLabel, order, hideFromNav,
      parent->{ _id, "slug": slug.current, title }
    }`;
    const client = preview ? sanityFor(true) : sanity;
    const pages = await client.fetch<PageForNav[]>(query);
    const list = pages || [];
    const bySlug = new Map(list.map((p) => [p.slug, p]));

    // Build children map keyed by parent slug
    const children = new Map<string, PageForNav[]>();
    for (const p of list) {
      if (p.parent?.slug && !p.hideFromNav) {
        const arr = children.get(p.parent.slug) || [];
        arr.push(p);
        children.set(p.parent.slug, arr);
      }
    }

    function toItem(p: PageForNav): NavItem {
      const kids = (children.get(p.slug) || []).sort((a,b)=>(a.order??999)-(b.order??999));
      return {
        label: p.navLabel || p.title,
        url: `/${p.slug}`,
        order: p.order,
        children: kids.map(toItem),
      };
    }

    const topLevel = list
      .filter((p) => !p.parent && !p.hideFromNav && p.slug)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const tree = topLevel.map(toItem);
    const flatLinks = topLevel.map((p) => ({ label: p.navLabel || p.title, url: `/${p.slug}` }));
    return { headerLinks: flatLinks, footerLinks: flatLinks, headerTree: tree };
  } catch {
    return { headerLinks: [], footerLinks: [] };
  }
}

export type NavItem = { label: string; url: string; children?: NavItem[]; order?: number };

export async function getBreadcrumbs(slug: string, preview = false): Promise<Array<{label: string; url: string}>> {
  if (sanityDisabled()) return [];
  try {
    const query = groq`*[_type=='page' && slug.current==$slug][0]{
      title,
      "slug": slug.current,
      parent->{
        title,
        "slug": slug.current,
        parent->{
          title,
          "slug": slug.current,
          parent->{
            title,
            "slug": slug.current
          }
        }
      }
    }`;
    const client = preview ? sanityFor(true) : sanity;
    const page = await client.fetch<any>(query, { slug });
    if (!page) return [];
    const chain: Array<{label: string; url: string}> = [];
    function pushNode(node: any) {
      if (!node) return;
      if (node.parent) pushNode(node.parent);
      chain.push({ label: node.title, url: `/${node.slug}` });
    }
    if (page.parent) pushNode(page.parent);
    chain.push({ label: page.title, url: `/${page.slug}` });
    return chain;
  } catch {
    return [];
  }
}

export async function getChildrenOf(slug: string, preview = false): Promise<Array<{label: string; url: string}>> {
  if (sanityDisabled()) return [];
  try {
    const query = groq`*[_type=='page' && parent->slug.current==$slug]{
      title,
      "slug": slug.current,
      order
    } | order(order asc)`;
    const client = preview ? sanityFor(true) : sanity;
    const res = await client.fetch<Array<{title: string; slug: string}>>(query, { slug });
    return (res || []).filter((p)=>p.slug).map((p)=>({ label: p.title, url: `/${p.slug}` }));
  } catch {
    return [];
  }
}

export type Homepage = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  heroImage?: string | null;
  ctas?: Array<{ label: string; href: string }>;
  featuredHeading?: string;
  featuredDescription?: string;
  trustTitle?: string;
  trustDescription?: string;
  trustItems?: Array<{ title: string; description?: string }>;
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterHighlights?: string[];
  newsletterButtonLabel?: string;
  newsletterSuccessTitle?: string;
  newsletterSuccessDescription?: string;
  instagramFeed?: Array<{
    image?: string | null;
    alt?: string;
    permalink: string;
    caption?: string;
  }>;
};

export async function getHomepage(preview = false): Promise<Homepage | null> {
  if (sanityDisabled()) return null;
  try {
    const query = groq`*[_type == "homepage"][0]{
      heroBadge,
      heroTitle,
      heroSubtitle,
      "heroImage": heroImage.asset->url,
      ctas,
      featuredHeading,
      featuredDescription,
      trustTitle,
      trustDescription,
      trustItems,
      newsletterTitle,
      newsletterDescription,
      newsletterHighlights,
      newsletterButtonLabel,
      newsletterSuccessTitle,
      newsletterSuccessDescription,
      instagramFeed[]{
        'image': image.asset->url,
        'alt': coalesce(image.alt, ''),
        permalink,
        caption
      }
    }`;
    const client = preview ? sanityFor(true) : sanity;
    const data = await client.fetch<Homepage | null>(query);
    return data ?? null;
  } catch {
    return null;
  }
}
