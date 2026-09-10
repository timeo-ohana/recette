const CACHE_NAME = "mes-recettes-v6";

const FILES_TO_CACHE = [
    "/",
    "/new-recipe.html",
    "/recipe.html",
    "/manifest.json",
    "static/style.css",
    "static/app.js",
    "static/icons/icon-180.png",
    "static/icons/icon-192.png",
    "static/icons/icon-512.png",
    "static/icons/apple-touch-icon.png"
];


// ==========================================
// INSTALLATION
// ==========================================

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    function(cache) {

                        return cache.addAll(
                            FILES_TO_CACHE
                        );

                    }
                )

        );

        self.skipWaiting();

    }
);


// ==========================================
// ACTIVATION
// ==========================================

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches
                .keys()
                .then(
                    function(noms) {

                        return Promise.all(

                            noms
                                .filter(
                                    function(nom) {

                                        return nom !== CACHE_NAME;

                                    }
                                )
                                .map(
                                    function(nom) {

                                        return caches.delete(
                                            nom
                                        );

                                    }
                                )

                        );

                    }
                )

        );

        self.clients.claim();

    }
);


// ==========================================
// REQUETES
// ==========================================

self.addEventListener(
    "fetch",
    function(event) {

        const request =
            event.request;


        // Seulement les requêtes GET
        if (request.method !== "GET") {

            return;

        }


        event.respondWith(

            caches
                .match(request)
                .then(
                    function(reponseCache) {

                        if (reponseCache) {

                            return reponseCache;

                        }


                        return fetch(request)
                            .then(
                                function(reponse) {

                                    // On ne met pas en cache
                                    // les réponses invalides

                                    if (
                                        !reponse ||
                                        reponse.status !== 200
                                    ) {

                                        return reponse;

                                    }


                                    const copie =
                                        reponse.clone();


                                    caches
                                        .open(CACHE_NAME)
                                        .then(
                                            function(cache) {

                                                cache.put(
                                                    request,
                                                    copie
                                                );

                                            }
                                        );


                                    return reponse;

                                }
                            );

                    }
                )

        );

    }
);