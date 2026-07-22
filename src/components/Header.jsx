'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Header.module.css';

const menuItems = [
  { label: 'Quem Somos', href: '#quem-somos' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Etapas', href: '#etapas' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contato', href: '#contato' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
    >
      <nav className={styles.nav} aria-label="Menu principal">
        <a href="#topo" className={styles.logo}>
          Planix Sistemas
        </a>

        <button
          className={`${styles.menuToggle} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <ul
          className={`${styles.menu} ${menuOpen ? styles.show : ''}`}
          id="main-menu"
        >
          {menuItems.map(({ label, href }) => (
            <li key={href}>
              <a href={href} onClick={closeMenu}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}