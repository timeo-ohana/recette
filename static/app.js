const DB_NAME = "MesRecettesDB";
const DB_VERSION = 1;
const STORE_NAME = "recipes";


// ==========================================
// OUVRIR LA BASE
// ==========================================

function ouvrirBase() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );


        request.onupgradeneeded =
            function(event) {

                const db =
                    event.target.result;


                if (
                    !db.objectStoreNames.contains(
                        STORE_NAME
                    )
                ) {

                    db.createObjectStore(
                        STORE_NAME,
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );

                }

            };


        request.onsuccess =
            function(event) {

                resolve(
                    event.target.result
                );

            };


        request.onerror =
            function() {

                reject(
                    request.error
                );

            };

    });

}


// ==========================================
// RECUPERER TOUTES LES RECETTES
// ==========================================

async function obtenirRecettes() {

    const db =
        await ouvrirBase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.getAll();


            request.onsuccess =
                function() {

                    const recettes =
                        request.result.sort(
                            function(a, b) {

                                return b.id - a.id;

                            }
                        );


                    resolve(recettes);

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ==========================================
// RECUPERER UNE RECETTE
// ==========================================

async function obtenirRecette(id) {

    const db =
        await ouvrirBase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.get(
                    Number(id)
                );


            request.onsuccess =
                function() {

                    resolve(
                        request.result || null
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ==========================================
// AJOUTER UNE RECETTE
// ==========================================

async function ajouterRecette(recette) {

    const db =
        await ouvrirBase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.add(recette);


            request.onsuccess =
                function() {

                    // L'ID est disponible ici
                    // mais on attend la fin
                    // complète de la transaction.

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };


            transaction.oncomplete =
                function() {

                    // On récupère la recette
                    // pour obtenir son ID.

                    const nouvelleTransaction =
                        db.transaction(
                            STORE_NAME,
                            "readonly"
                        );


                    const nouveauStore =
                        nouvelleTransaction.objectStore(
                            STORE_NAME
                        );


                    const toutes =
                        nouveauStore.getAll();


                    toutes.onsuccess =
                        function() {

                            const recettes =
                                toutes.result.sort(
                                    function(a, b) {
                                        return b.id - a.id;
                                    }
                                );


                            if (
                                recettes.length > 0
                            ) {

                                resolve(
                                    recettes[0].id
                                );

                            } else {

                                reject(
                                    new Error(
                                        "Recette non trouvée après sauvegarde."
                                    )
                                );

                            }

                        };


                    toutes.onerror =
                        function() {

                            reject(
                                toutes.error
                            );

                        };

                };


            transaction.onerror =
                function() {

                    reject(
                        transaction.error
                    );

                };


            transaction.onabort =
                function() {

                    reject(
                        new Error(
                            "La sauvegarde a été annulée."
                        )
                    );

                };

        }
    );

}


// ==========================================
// MODIFIER UNE RECETTE
// ==========================================

async function modifierRecetteLocalement(
    id,
    recette
) {

    const db =
        await ouvrirBase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            recette.id =
                Number(id);


            const request =
                store.put(recette);


            request.onsuccess =
                function() {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ==========================================
// SUPPRIMER UNE RECETTE
// ==========================================

async function supprimerRecetteLocalement(
    id
) {

    const db =
        await ouvrirBase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.delete(
                    Number(id)
                );


            request.onsuccess =
                function() {

                    resolve();

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}

// ==========================================
// TRANSFORMER UNE PHOTO EN TEXTE
// ==========================================

function photoVersTexte(photo) {

    return new Promise((resolve, reject) => {

        if (!photo) {
            resolve(null);
            return;
        }

        const lecteur =
            new FileReader();

        lecteur.onload =
            function() {
                resolve(lecteur.result);
            };

        lecteur.onerror =
            function() {
                reject(
                    lecteur.error
                );
            };

        lecteur.readAsDataURL(photo);

    });

}


// ==========================================
// TRANSFORMER DU TEXTE EN PHOTO
// ==========================================

async function texteVersPhoto(dataUrl) {

    if (!dataUrl) {
        return null;
    }

    const reponse =
        await fetch(dataUrl);

    return await reponse.blob();

}