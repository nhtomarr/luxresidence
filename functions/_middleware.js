// www.luxresidence.az → luxresidence.az (tək əsas domen, SEO üçün 301)
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (url.hostname === 'www.luxresidence.az') {
    url.hostname = 'luxresidence.az';
    return Response.redirect(url.toString(), 301);
  }
  return ctx.next();
}
