/**
 * 🔗 LINKS PARA MENU/NAVBAR
 * Adicione estes links no seu header/navbar para que os clientes
 * possam acessar a página de preços facilmente
 */

export const pricingLinks = [
  {
    label: '💰 Plans & Tarifs',
    href: '/pricing',
    description: 'Voir tous nos plans d\'abonnement',
  },
  {
    label: 'FAQ Abonnement',
    href: '/pricing#faq',
    description: 'Questions fréquentes sur les plans',
  },
]

/**
 * COMO ADICIONAR NO HEADER
 * 
 * Se você tiver um componente Header.tsx:
 * 
 * import { pricingLinks } from '@/config/pricing-links'
 * 
 * export function Header() {
 *   return (
 *     <nav>
 *       {pricingLinks.map(link => (
 *         <Link key={link.href} href={link.href}>
 *           {link.label}
 *         </Link>
 *       ))}
 *     </nav>
 *   )
 * }
 */
