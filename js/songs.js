/* ==========================================================================
   LAS CUATRO CANCIONES DE EMY
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para cambiar la playlist.

   - title / artist : el texto que se muestra en la tarjeta.
   - youtubeId      : el identificador del video (lo que va después de "v=").
   - url            : enlace completo para abrir el video en YouTube.
   - featured       : true solo en la canción que tiene la tarjeta especial.
   - verifiedTitle  : título real del video según los metadatos de YouTube
                      (oEmbed), consultado el 25-11-2026. Sirve como registro
                      de que cada enlace está asociado a la canción correcta.

   Las miniaturas se cargan desde i.ytimg.com (las oficiales de cada video).
   No se descarga ni se guarda ninguna canción: todo se reproduce desde YouTube.
   ========================================================================== */

window.SONGS = [
  {
    title: 'SI TE PUDIERA OLVIDAR',
    artist: 'MANIAKO',
    youtubeId: 'guBNnE0TS3M',
    url: 'https://www.youtube.com/watch?v=guBNnE0TS3M',
    featured: false,
    verifiedTitle: 'SI TE PUDIERA OLVIDAR // •MANIAKO• // VIDEO OFICIAL'
  },
  {
    title: 'SI DECIDES REGRESAR',
    artist: 'MANIAKO & MOISÉS GARDUÑO',
    youtubeId: 'bCbmfphoj94',
    url: 'https://www.youtube.com/watch?v=bCbmfphoj94',
    featured: false,
    verifiedTitle: 'SI DECIDES REGRESAR // MANIAKO & MOISES GARDUÑO // VIDEO OFICIAL'
  },
  {
    title: 'SOLO AMIGOS',
    artist: 'MANIAKO FEAT. MOISÉS GARDUÑO',
    youtubeId: 'UR1dSrYnEjk',
    url: 'https://www.youtube.com/watch?v=UR1dSrYnEjk',
    featured: false,
    verifiedTitle: 'SOLO AMIGOS // MANIAKO FEAT. MOISES GARDUÑO // VIDEO OFICIAL'
  },
  {
    title: 'CONTIGO',
    artist: 'MANIAKO FT. MOISÉS GARDUÑO',
    youtubeId: 'CHqI6sJjU8I',
    url: 'https://www.youtube.com/watch?v=CHqI6sJjU8I',
    featured: true, // ← «Una canción especial»
    verifiedTitle: 'Contigo Maniako FT Moises Garduño Video Oficial'
  }
];
