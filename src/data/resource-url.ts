/** Asset manifests determine this build constant; docs-only builds keep it stable. */
declare const __COAST_ASSET_REVISION__: string;
export function resourceUrl(relative: string) {
  return `${import.meta.env.BASE_URL}${relative}?v=${__COAST_ASSET_REVISION__}`;
}
