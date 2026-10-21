/**
 * Path secreto del panel del admin.
 *
 * En modo estático (output: export) no hay middleware ni rewrites: la carpeta
 * `src/app/panel-editorial-9x4k/` ES la ruta. Si se cambia aquí, hay que
 * renombrar la carpeta y el bloque de `/admin/**` en firebase.json.
 */
export const ADMIN_BASE = '/panel-editorial-9x4k'
