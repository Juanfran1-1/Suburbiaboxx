export async function onRequestGet(context) {
    const { env, request } = context;

    const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600'
    };

    const origin = new URL(request.url).origin;

    try {

        /*
        =========================================================
        INSTAGRAM API - PENDIENTE
        =========================================================

        Cuando conectemos la API oficial de Meta vamos a obtener:

        - Cantidad real de seguidores
        - Cantidad real de publicaciones

        Y más adelante, si queremos agregar el mini feed:

        - Últimas publicaciones
        - Miniaturas
        - Permalink de cada publicación

        Variables previstas en Cloudflare:

        env.INSTAGRAM_ACCESS_TOKEN
        env.INSTAGRAM_ACCOUNT_ID

        IMPORTANTE:
        El access token nunca debe enviarse al frontend.
        */


        /*
        =========================================================
        DATOS TEMPORALES
        =========================================================

        Métricas aproximadas utilizadas temporalmente para
        terminar el diseño de la sección.

        Reemplazar por valores reales cuando conectemos Meta.
        */

        const instagramMock = {
            username: '@suburbiaboxx',

            posts: '300+',

            followers: '+11K',

            url:
                env.INSTAGRAM_URL ||
                'https://www.instagram.com/suburbiaboxx/'

            /*
            =====================================================
            MINI FEED - PENDIENTE META API
            =====================================================

            latestPosts: [
                {
                    thumbnail: '...',
                    permalink: '...'
                },
                {
                    thumbnail: '...',
                    permalink: '...'
                },
                {
                    thumbnail: '...',
                    permalink: '...'
                }
            ]
            */
        };


        return new Response(
            JSON.stringify({
                instagram: instagramMock,

                meta: {
                    source: 'instagram-mock',
                    realData: false,
                    origin,
                    updatedAt: new Date().toISOString()
                }
            }),
            {
                status: 200,
                headers
            }
        );

    } catch (error) {

        console.error(
            'Community API:',
            error
        );

        return new Response(
            JSON.stringify({
                error:
                    'No se pudieron cargar los datos de Instagram.'
            }),
            {
                status: 500,
                headers
            }
        );
    }
}