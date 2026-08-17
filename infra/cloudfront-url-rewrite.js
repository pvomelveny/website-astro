// CloudFront Function — event type: viewer request.
// Distribution E1HKVL3MS04OWG (pvomelveny.com).
//
// Resolves the two URL shapes this site publishes, because CloudFront asks the
// origin for the literal key:
//
//   Astro  publishes a page as a directory  -> about/index.html   served at /about
//   wanshi publishes a note as a flat file  -> welcome.html       served at /notes/welcome
//
// The wanshi half is the part that genuinely requires this function: S3 website
// hosting resolves index documents on its own, but never tries an .html
// extension. Handling the Astro half here too costs nothing and skips S3's
// 302 redirect from /about to /about/, so the page is served in one hop.
//
// IMPORTANT: this must match the deployed site layout. It assumes the wanshi
// notes build (v2.0.0+), where notes are flat .html files. Against the older
// MDX build, which published notes as directories, "/notes/welcome" rewrites
// to a key that does not exist.
//
// The same rewrite is implemented for the dev server as the notesDevUrls Vite
// plugin in astro.config.ts. Keep the two in step.
//
// Written to ES5 so it runs on either CloudFront Functions runtime.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Directory URLs: "/", "/about/", "/notes/", "/notes/algebra/".
  if (uri.charAt(uri.length - 1) === '/') {
    request.uri = uri + 'index.html';
    return request;
  }

  // A dot in the last segment means a real file — "/notes/welcome.html",
  // "/notes/main.css", "/cv.pdf", "/_astro/x.webp". Pass it straight through.
  // Only the last segment is tested, so a directory containing a dot does not
  // disable the rewrite.
  var last = uri.substring(uri.lastIndexOf('/') + 1);
  if (last.indexOf('.') !== -1) {
    return request;
  }

  // "/notes/welcome" -> "/notes/welcome.html"   (wanshi: flat files)
  // "/about"         -> "/about/index.html"     (Astro: directories)
  if (uri.lastIndexOf('/notes/', 0) === 0) {
    request.uri = uri + '.html';
  } else {
    request.uri = uri + '/index.html';
  }

  return request;
}
