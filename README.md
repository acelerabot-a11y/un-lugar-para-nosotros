# Un lugar para nosotros ❤️

Página estática (HTML, CSS y JavaScript sin dependencias) preparada para Emy.

```
un-lugar-para-nosotros/
├── index.html        ← los cinco momentos y todos los textos
├── css/styles.css    ← diseño, colores, animaciones
├── js/songs.js       ← LAS CUATRO CANCIONES (único archivo a editar para la playlist)
├── js/script.js      ← cielo animado, navegación, reproductores, carta
└── assets/favicon.svg
```

## Verla en tu computadora

Los videos de YouTube no se reproducen si abres `index.html` con doble clic
(YouTube exige que la página venga de un servidor). Usa un servidor local:

```powershell
cd "E:\Proyecto M\un-lugar-para-nosotros"
python -m http.server 5500
```

Luego abre <http://localhost:5500> en Chrome.

## Publicarla en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser privado solo con plan de pago;
   en cuentas gratuitas, GitHub Pages requiere que el repositorio sea **público**).
2. Sube **el contenido de esta carpeta** (no la carpeta del proyecto completo):

   ```powershell
   cd "E:\Proyecto M\un-lugar-para-nosotros"
   git init
   git add .
   git commit -m "Un lugar para nosotros"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```

3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)` → **Save**.
4. En uno o dos minutos la página estará en
   `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

La página tiene `noindex` para que los buscadores no la muestren.

## Cambiar algo

- **Canciones:** `js/songs.js`. La que tenga `featured: true` recibe la tarjeta
  «Una canción especial».
- **Textos:** directamente en `index.html` (cada momento está marcado con un comentario).
- **Colores:** variables al inicio de `css/styles.css`.

## Detalles

- Ninguna canción suena sola: se reproduce solo cuando se presiona «Escuchar».
- Si empieza una canción, la que estaba sonando se pausa.
- Si sales de la playlist con música, aparece un mini reproductor para pausarla.
- Cada tarjeta tiene además «Abrir en YouTube» por si el reproductor integrado falla.
- Respeta la opción del sistema «reducir movimiento».
- No hay formularios ni se recopila ningún dato.
