interface ImportMetaEnv {
  /** microCMS service ID: the "xxxx" in xxxx.microcms.io (build-time only, never PUBLIC_) */
  readonly MICROCMS_SERVICE_DOMAIN?: string;
  /** microCMS API key with GET permission on the events API (build-time only, never PUBLIC_) */
  readonly MICROCMS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
