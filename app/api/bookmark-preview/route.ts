/**
 * API para obter preview/cover de uma URL (Open Graph, etc.).
 * Usado ao adicionar card bookmark.
 */

import { NextResponse } from 'next/server';

function getMetaContent(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(regex);
  if (m) return m[1].trim();
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,
    'i'
  );
  const m2 = html.match(regex2);
  return m2 ? m2[1].trim() : null;
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function resolveUrl(base: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!rawUrl) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      );
    }
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        { error: 'Apenas http e https são permitidos' },
        { status: 400 }
      );
    }

    const res = await fetch(url.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; BoardBot/1.0; +https://github.com)',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Falha ao carregar: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { error: 'A URL não é uma página HTML' },
        { status: 400 }
      );
    }

    const html = await res.text();
    const base = url.origin + url.pathname.replace(/\/[^/]*$/, '/');

    const image =
      getMetaContent(html, 'og:image') ||
      getMetaContent(html, 'twitter:image');
    const title =
      getMetaContent(html, 'og:title') ||
      getMetaContent(html, 'twitter:title') ||
      getTitle(html);
    const description =
      getMetaContent(html, 'og:description') ||
      getMetaContent(html, 'twitter:description');

    const imageResolved = image ? resolveUrl(base, image) : undefined;

    return NextResponse.json({
      image: imageResolved ?? undefined,
      title: title ?? undefined,
      description: description ?? undefined,
      url: url.href,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao buscar preview';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
