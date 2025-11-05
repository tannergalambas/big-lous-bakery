// app/api/products/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const isProd = process.env.SQUARE_ENVIRONMENT === 'production';
const HAS_SQUARE = Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID && process.env.SQUARE_ENVIRONMENT);
const BASE = isProd
  ? 'https://connect.squareup.com/v2'
  : 'https://connect.squareupsandbox.com/v2';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'Square-Version': '2024-07-17',
};

function sanitizeImageUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/^http:\/\//i, 'https://');

  try {
    const url = new URL(normalized);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }
    // We always prefer https when available.
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
    }
    return url.toString();
  } catch {
    return null;
  }
}

if (process.env.SQUARE_ACCESS_TOKEN) {
  headers.Authorization = `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`;
}

function centsToDollars(a?: number | null) {
  return typeof a === 'number' ? a / 100 : null;
}

type Related = Array<any> | undefined;

function buildImageMap(related: Related) {
  const map = new Map<string, string>();
  for (const r of related ?? []) {
    if (r?.type === 'IMAGE' && r?.id && r?.image_data?.url) {
      const sanitized = sanitizeImageUrl(r.image_data.url);
      if (sanitized) {
        map.set(r.id, sanitized);
      }
    }
  }
  return map;
}

function pickImageUrlFromObject(item: any, images: Map<string, string>): string | null {
  const itemImgId = item?.item_data?.image_ids?.[0];
  if (itemImgId && images.has(itemImgId)) return images.get(itemImgId)!;

  const v0 = item?.item_data?.variations?.[0]?.item_variation_data;
  const varImgId = v0?.image_ids?.[0];
  if (varImgId && images.has(varImgId)) return images.get(varImgId)!;

  return null;
}

function normalizeSingleItem(item: any, related: Related) {
  const images = buildImageMap(related);
  const variations = (item?.item_data?.variations ?? []).map((v: any) => {
    const vd = v?.item_variation_data;
    return {
      id: v?.id,
      name: vd?.name ?? 'Default',
      price: centsToDollars(vd?.price_money?.amount),
      currency: vd?.price_money?.currency ?? 'USD',
      image: vd?.image_ids?.[0] && images.get(vd.image_ids[0]) ? images.get(vd.image_ids[0])! : null,
    };
  });

  let image = pickImageUrlFromObject(item, images);
  if (!image && variations.length && variations[0].image) {
    image = variations[0].image;
  }

  return {
    id: item?.id,
    name: item?.item_data?.name ?? '',
    description: item?.item_data?.description ?? '',
    price: variations[0]?.price ?? null,
    currency: variations[0]?.currency ?? 'USD',
    image: sanitizeImageUrl(image),
    variations,
  };
}

/** Get a single item (used for detail page and list backfill) */
async function getItemById(id: string) {
  const res = await fetch(
    `${BASE}/catalog/object/${encodeURIComponent(id)}?include_related_objects=true`,
    { headers, cache: 'no-store' }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return normalizeSingleItem(data.object, data.related_objects);
}

/** List items using Search Catalog Items (for image_url), then backfill missing fields via catalog/object */
async function listItemsRobust() {
  // Try to respect the configured location if provided (can help Sandbox)
  const body: any = {};
  if (process.env.SQUARE_LOCATION_ID) {
    body.enabled_location_ids = [process.env.SQUARE_LOCATION_ID];
  }

  const res = await fetch(`${BASE}/catalog/search-catalog-items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  // Initial pass from search-catalog-items
  const initial: Array<{
    id: string;
    name?: string;
    description?: string;
    price?: number | null;
    currency?: string;
    image?: string | null;
  }> = (data.items ?? []).map((i: any) => {
    const v0 = i?.variations?.[0]?.item_variation_data;
    return {
      id: i?.id,
      name: i?.name ?? '',
      description: i?.description ?? '',
      price: centsToDollars(v0?.price_money?.amount),
      currency: v0?.price_money?.currency ?? 'USD',
      image: sanitizeImageUrl(i?.image_url),
    };
  });

  // Backfill any items that are missing critical fields (name or price or image)
  const needsBackfill = initial.filter(
    (x) => !x?.name || x.name.trim() === '' || x.price == null || !x.image
  );

  if (needsBackfill.length === 0) return initial;

  const byId = new Map(initial.map((x) => [x.id, x]));

  await Promise.all(
    needsBackfill.map(async (x) => {
      try {
        const filled = await getItemById(x.id);
        const merged = {
          id: filled.id,
          name: filled.name || x.name || '',
          description: filled.description || x.description || '',
          price: filled.price ?? x.price ?? null,
          currency: filled.currency || x.currency || 'USD',
          image: sanitizeImageUrl(filled.image ?? x.image),
        };
        byId.set(x.id, merged);
      } catch {
        // If backfill fails, keep the original (at least shows something)
      }
    })
  );

  return Array.from(byId.values());
}

const FALLBACK_PRODUCTS = [
  {
    id: 'mock-1',
    name: 'Chocolate Chunk Cookies',
    description: 'Crispy edges, gooey center, lots of chocolate.',
    price: 3.5,
    currency: 'USD',
    image: '/chocolate-chunk-cookies.jpeg',
  },
  {
    id: 'mock-2',
    name: 'Cinnamon Rolls',
    description: 'Soft rolls with brown sugar cinnamon and glaze.',
    price: 4.25,
    currency: 'USD',
    image: '/3DED26DC-832D-46F6-957D-830F1EBB3331_4_5005_c.jpeg',
  },
  {
    id: 'mock-3',
    name: 'Blueberry Muffin',
    description: 'Bursting with berries and lemon zest.',
    price: 3.0,
    currency: 'USD',
    image: '/282FFA65-692C-461D-8B67-9AFA5514ABE1_4_5005_c.jpeg',
  },
  {
    id: 'mock-4',
    name: 'Apple Pie Slice',
    description: 'Buttery crust with spiced apples.',
    price: 4.5,
    currency: 'USD',
    image: '/A12FD468-BF4B-4089-91FC-AB08BB6D13EF_4_5005_c.jpeg',
  },
  {
    id: 'mock-5',
    name: 'Brownies',
    description: 'Fudgy chocolate brownies with flake salt.',
    price: 3.75,
    currency: 'USD',
    image: '/77DB1324-FF2E-471E-940B-6E714614DA23_4_5005_c.jpeg',
  },
  {
    id: 'mock-6',
    name: 'Banana Bread',
    description: 'Moist, buttery loaf with toasted walnuts.',
    price: 5.0,
    currency: 'USD',
    image: '/63A58EBB-29B9-4B83-8973-6112DC671710_4_5005_c.jpeg',
  },
  {
    id: 'mock-7',
    name: 'Lemon Bar',
    description: 'Tart lemon curd on shortbread crust.',
    price: 3.25,
    currency: 'USD',
    image: '/0036B461-78BB-4046-BC65-41651D60DB18_4_5005_c.jpeg',
  },
  {
    id: 'mock-8',
    name: 'Chocolate Cake Slice',
    description: 'Rich chocolate layers with ganache.',
    price: 5.5,
    currency: 'USD',
    image: '/8E56CCAD-C999-44CF-8302-34365D17E5D4_4_5005_c.jpeg',
  },
];

function respondWithMock(id?: string | null) {
  if (id) {
    return NextResponse.json({ item: FALLBACK_PRODUCTS.find((m) => m.id === id) ?? null, mock: true });
  }
  return NextResponse.json({ items: FALLBACK_PRODUCTS, mock: true });
}

/* ----------------------------- GET ----------------------------- */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!HAS_SQUARE) {
    return respondWithMock(id);
  }

  try {
    if (id) {
      const item = await getItemById(id);
      return NextResponse.json({ item });
    }

    const items = await listItemsRobust();
    return NextResponse.json({ items });
  } catch (e: any) {
    console.error('[Square API error]', e);
    return respondWithMock(id);
  }
}
