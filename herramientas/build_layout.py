"""Genera la cabecera (barra flotante + menú móvil) y el pie de las 12 páginas
(HTML/*.html en español y HTML/en/*.html en inglés).

Uso:  python herramientas/build_layout.py HTML

Se puede ejecutar las veces que haga falta: sustituye lo que hay entre las
marcas <!-- LAYOUT:HEADER --> / <!-- LAYOUT:FOOTER --> (o los marcadores
<!--HEADER--> / <!--FOOTER--> de una página nueva).
"""
import re, sys, pathlib

html_dir = pathlib.Path(sys.argv[1])
PAGES = ["index.html", "tienda.html", "sanitario.html", "recursoshumanos.html", "ubicacion.html", "contacto.html"]

LANG = {
    "es": {
        "dir": html_dir, "img": "../imagenes",
        "skip": "Saltar al contenido", "home_label": "DecoArPint — Inicio",
        "nav_label": "Navegación principal", "menu_label": "Menú móvil", "open_menu": "Abrir menú",
        "links": [("index.html", "Inicio"), ("tienda.html", "Servicios"), ("sanitario.html", "Especialidad"),
                  ("recursoshumanos.html", "Equipo"), ("ubicacion.html", "Ubicación"), ("contacto.html", "Contacto")],
        "switch": lambda p: f'<a href="en/{p}" class="pp-lang" lang="en" hreflang="en" aria-label="View this page in English">EN</a>',
        "cta": "Presupuesto", "menu_cta": "Pedir presupuesto →",
        "footer_text": "Pintura profesional, decoración y rehabilitación en Málaga y provincia, con experiencia en hospitales y centros sanitarios.",
        "footer_nav_label": "Navegación del pie de página",
        "t_nav": "Navegación", "t_contact": "Contacto", "t_where": "Dónde estamos", "t_follow": "Síguenos",
        "footer_links": [("index.html", "Inicio"), ("tienda.html", "Servicios"), ("sanitario.html", "Sector sanitario"),
                         ("recursoshumanos.html", "Únete al equipo"), ("ubicacion.html", "Ubicación"), ("contacto.html", "Contacto")],
        "new_tab": "(se abre en una pestaña nueva)",
        "copy": "DecoArPint SL — Todos los derechos reservados.",
    },
    "en": {
        "dir": html_dir / "en", "img": "../../imagenes",
        "skip": "Skip to content", "home_label": "DecoArPint — Home",
        "nav_label": "Main navigation", "menu_label": "Mobile menu", "open_menu": "Open menu",
        "links": [("index.html", "Home"), ("tienda.html", "Services"), ("sanitario.html", "Specialty"),
                  ("recursoshumanos.html", "Team"), ("ubicacion.html", "Location"), ("contacto.html", "Contact")],
        "switch": lambda p: f'<a href="../{p}" class="pp-lang" lang="es" hreflang="es" aria-label="Ver esta página en español">ES</a>',
        "cta": "Get a quote", "menu_cta": "Request a quote →",
        "footer_text": "Professional painting, decoration and building restoration in Málaga and its province, with experience in hospitals and healthcare facilities.",
        "footer_nav_label": "Footer navigation",
        "t_nav": "Navigation", "t_contact": "Contact", "t_where": "Where we are", "t_follow": "Follow us",
        "footer_links": [("index.html", "Home"), ("tienda.html", "Services"), ("sanitario.html", "Healthcare sector"),
                         ("recursoshumanos.html", "Join the team"), ("ubicacion.html", "Location"), ("contacto.html", "Contact")],
        "new_tab": "(opens in a new tab)",
        "copy": "DecoArPint SL — All rights reserved.",
    },
}


def nav_links(links, active, indent):
    out = []
    for href, label in links:
        cur = ' aria-current="page"' if href == active else ""
        out.append(f'{indent}<a href="{href}"{cur}>{label}</a>')
    return "\n".join(out)


def header(L, page):
    return f'''<!-- LAYOUT:HEADER -->
  <a href="#main" class="skip-link">{L["skip"]}</a>

  <header class="pp-header">
    <div class="pp-bar">
      <a href="index.html" class="pp-logo" aria-label="{L["home_label"]}">
        <span class="pp-logo-mark"><img src="{L["img"]}/logo.png" alt="" width="509" height="472" /></span>
        <span class="pp-logo-name">DecoArPint</span>
      </a>
      <nav class="pp-nav" aria-label="{L["nav_label"]}">
{nav_links(L["links"], page, "        ")}
      </nav>
      {L["switch"](page)}
      <a href="contacto.html" class="pp-cta">{L["cta"]}</a>
      <button class="pp-burger" type="button" aria-label="{L["open_menu"]}" aria-expanded="false" aria-controls="ppMenu">
        <span></span><span></span>
      </button>
    </div>
  </header>

  <nav class="pp-menu" id="ppMenu" aria-label="{L["menu_label"]}">
{nav_links(L["links"], page, "    ")}
    <a href="contacto.html" class="pp-menu-cta">{L["menu_cta"]}</a>
  </nav>
  <!-- /LAYOUT:HEADER -->'''


def footer(L):
    links = "\n".join(f'          <a href="{h}">{t}</a>' for h, t in L["footer_links"])
    return f'''<!-- LAYOUT:FOOTER -->
  <footer class="pp-footer">
    <div class="pp-footer-grid">
      <div>
        <p class="pp-footer-brand">DecoArPint</p>
        <p class="pp-footer-text">{L["footer_text"]}</p>
      </div>
      <nav aria-label="{L["footer_nav_label"]}">
        <p class="pp-footer-title">{L["t_nav"]}</p>
{links}
      </nav>
      <div>
        <p class="pp-footer-title">{L["t_contact"]}</p>
        <a href="tel:+34605055115">605 05 51 15</a>
        <a href="tel:+34647537294">647 53 72 94</a>
        <a href="mailto:pinturas@decoarpint.com">pinturas@decoarpint.com</a>
      </div>
      <div>
        <p class="pp-footer-title">{L["t_where"]}</p>
        <a href="ubicacion.html">C. Castillo del Turón, 17<br>29550 Ardales, Málaga</a>
      </div>
      <div>
        <p class="pp-footer-title">{L["t_follow"]}</p>
        <a href="https://www.instagram.com/decoarpint_sl/" target="_blank" rel="noopener noreferrer">Instagram <span class="sr-only">{L["new_tab"]}</span></a>
        <a href="https://www.facebook.com/decoarpint?locale=es_ES" target="_blank" rel="noopener noreferrer">Facebook <span class="sr-only">{L["new_tab"]}</span></a>
      </div>
    </div>
    <p class="pp-footer-copy">&copy; <span data-year>2026</span> {L["copy"]}</p>
  </footer>
  <!-- /LAYOUT:FOOTER -->'''


def replace_block(html, new, marker, placeholder, legacy):
    marked = re.compile(rf'<!-- {marker} -->.*?<!-- /{marker} -->', re.S)
    if marked.search(html):
        return marked.sub(lambda m: new, html, count=1)
    if placeholder in html:
        return html.replace(placeholder, new, 1)
    html, n = legacy.subn(lambda m: new, html, count=1)
    if not n:
        raise SystemExit(f"No se encontró dónde poner {marker}")
    return html


legacy_header = re.compile(r'<a href="#main" class="skip-link">.*?</header>', re.S)
legacy_footer = re.compile(r'<!-- ─── FOOTER ─── -->.*?</footer>', re.S)

for code, L in LANG.items():
    for page in PAGES:
        p = L["dir"] / page
        html = p.read_text(encoding="utf-8")
        html = replace_block(html, header(L, page), "LAYOUT:HEADER", "<!--HEADER-->", legacy_header)
        html = replace_block(html, footer(L), "LAYOUT:FOOTER", "<!--FOOTER-->", legacy_footer)
        p.write_text(html, encoding="utf-8", newline="")
        print(f"{code}/{page} ok")
