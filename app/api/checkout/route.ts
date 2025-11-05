import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const isProd = process.env.SQUARE_ENVIRONMENT === 'production';
const BASE = isProd
  ? 'https://connect.squareup.com/v2'
  : 'https://connect.squareupsandbox.com/v2';

const headers = {
  Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN ?? ''}`,
  'Content-Type': 'application/json',
  'Square-Version': '2024-07-17',
};

type CartPayloadItem = {
  variationId?: string;
  id?: string;
  qty: number;
  note?: string;
  price?: number | string | null;
  currency?: string | null;
};

type CartPayload = {
  items: CartPayloadItem[];
  redirectUrl?: string;
};

function normalizeMoney(input: number | string | null | undefined) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input === 'string') {
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildLineItem(item: CartPayloadItem) {
  const catalogObjectId = item.variationId || item.id;
  if (!catalogObjectId) return null;

  const line: Record<string, any> = {
    catalog_object_id: catalogObjectId,
    quantity: String(Math.max(1, Number(item.qty) || 1)),
  };

  if (item.note) {
    line.note = item.note;
  }

  const price = normalizeMoney(item.price);
  if (price != null && price >= 0) {
    const cents = Math.round(price * 100);
    if (Number.isFinite(cents)) {
      const currency =
        typeof item.currency === 'string' && item.currency.trim()
          ? item.currency.trim().toUpperCase()
          : 'USD';
      line.base_price_money = {
        amount: cents,
        currency,
      };
    }
  }

  return line;
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || '';
    let line_items: any[] = [];
    let redirectUrl: string | undefined;

    if (ct.includes('application/json')) {
      // JSON (optional — you’re using form mode below, but we keep both)
      const payload = (await req.json()) as CartPayload;
      redirectUrl = payload.redirectUrl ?? undefined;
      line_items = (payload.items ?? [])
        .map(buildLineItem)
        .filter((item): item is Record<string, any> => Boolean(item));
    } else {
      // FORM mode (used by the cart + “Buy Now”)
      const form = await req.formData();

      // 3A) Whole cart as JSON string (what your cart page posts)
      const payloadStr = (form.get('payload') as string) || '';
      if (payloadStr) {
        const payload = JSON.parse(payloadStr) as CartPayload;
        redirectUrl = payload.redirectUrl ?? undefined;
        line_items = (payload.items ?? [])
          .map(buildLineItem)
          .filter((item): item is Record<string, any> => Boolean(item));
      } else {
        // 3B) Single-item “Buy Now” fallback
        const id = String(form.get('variationId') || form.get('id') || '').trim();
        const qty = Number(form.get('qty') || 1);
        const note = String(form.get('note') || '');
        const price = normalizeMoney(form.get('price') as any);
        const currency = (form.get('currency') as string) || undefined;
        redirectUrl = (form.get('redirectUrl') as string) || undefined;

        if (!id) {
          return NextResponse.json(
            { error: 'Missing item id/variationId' },
            { status: 400 }
          );
        }
        const single = buildLineItem({
          variationId: id,
          qty,
          note,
          price,
          currency,
        });
        line_items = single ? [single] : [];
      }
    }

    if (!line_items.length) {
      return NextResponse.json(
        { error: 'No items provided for checkout' },
        { status: 400 }
      );
    }

    const body = {
      idempotency_key: crypto.randomUUID(),
      order: {
        location_id: process.env.SQUARE_LOCATION_ID,
        line_items,
      },
      checkout_options: {
        ask_for_shipping_address: true,
        redirect_url:
          redirectUrl ??
          (process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/thanks`
            : undefined),
      },
    };

    const res = await fetch(`${BASE}/online-checkout/payment-links`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });

    const url = data?.payment_link?.url;
    if (!url) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
    }

    return NextResponse.redirect(url, { status: 303 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}
