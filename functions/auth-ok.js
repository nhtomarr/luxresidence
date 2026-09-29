// Brauzerin parolu yadda saxlaması üçün: giriş formu uğurlu girişdən sonra bura göndərilir.
// Heç nə saxlanılmır və qeyd edilmir — sadəcə 204 qaytarılır.
export async function onRequest() {
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
