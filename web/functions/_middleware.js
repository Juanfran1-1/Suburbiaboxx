const CANONICAL_HOST = 'www.suburbiabox.com.ar';

const REDIRECT_HOSTS = new Set([
    'suburbiabox.com.ar',
    'suburbiaboxx.pages.dev'
]);

export function onRequest(context) {
    const url = new URL(context.request.url);

    if (REDIRECT_HOSTS.has(url.hostname)) {
        url.protocol = 'https:';
        url.hostname = CANONICAL_HOST;
        url.port = '';

        return Response.redirect(
            url.toString(),
            301
        );
    }

    return context.next();
}
