/**
 * Panel visual del área de autenticación.
 *
 * Coloca la foto en `public/images/auth-hero.jpg` y aparece automáticamente;
 * mientras no exista, se ve el degradado de marca (no rompe el layout).
 */
export function AuthHero({
  title = "Tu belleza, tu poder.",
}: {
  title?: string;
}) {
  return (
    <div className="relative hidden overflow-hidden bg-primary-100 lg:block">
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-primary-200 via-primary-300 to-secondary-300"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/images/auth-hero.jpg')] bg-cover bg-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-neutral-900/55 via-neutral-900/10 to-transparent"
      />
      <p className="absolute bottom-12 left-10 right-10 font-display text-4xl leading-tight text-white drop-shadow-sm">
        {title}
      </p>
    </div>
  );
}
