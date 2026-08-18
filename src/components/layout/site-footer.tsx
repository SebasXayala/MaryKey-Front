import { Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Compañía",
    links: [
      { label: "Nuestra Historia", href: "/nuestra-historia" },
      { label: "Carreras", href: "/carreras" },
      { label: "Impacto Social", href: "/impacto-social" },
    ],
  },
  {
    title: "Servicio",
    links: [
      { label: "Ayuda", href: "/ayuda" },
      { label: "Encontrar Consultora", href: "/consultoras" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
    ],
  },
];

const social = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary-300 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <h2 className="font-display text-2xl font-semibold text-white">
              Mary Kay
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/85">
              Empoderando a las mujeres a través de la belleza y la oportunidad
              durante más de 60 años.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {social.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/85 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-white/20 pt-6 text-center text-[0.7rem] text-white/85">
          © {new Date().getFullYear()} Mary Kay Inc. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
