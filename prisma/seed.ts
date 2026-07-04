import { PrismaClient, LeadStatus, LeadPriority, Complexity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.lead.deleteMany();

  // Create demo leads
  const demoLeads = [
    {
      name: 'María González',
      company: 'Tienda Moda Trendy',
      email: 'maria@modatrendy.com',
      phone: '+57 300 123 4567',
      projectType: 'Landing page para tienda de ropa',
      description: 'Necesito una landing page para lanzar mi nueva colección de ropa sostenible. Incluir formulario de contacto y integración con WhatsApp para recibir pedidos.',
      clientBudget: 1500000,
      status: LeadStatus.NEW,
      priority: LeadPriority.HIGH,
      complexity: Complexity.MEDIUM,
      opportunityLevel: 'Excelente',
      riskLevel: 'Bajo',
      estimatedMinBudget: 1200000,
      estimatedBudget: 1800000,
      estimatedMaxBudget: 2200000,
      nextAction: 'Agendar llamada de diagnóstico',
      suggestedMessage: 'Hola María, gracias por contarme sobre tu proyecto de landing page para la tienda de ropa sostenible. Me parece una idea genial y puedo ayudarte a crear una página que transmita la identidad de tu marca y capture leads de manera efectiva. ¿Podemos agendar una llamada de 20 minutos para profundizar en los detalles?',
      scope: JSON.stringify({
        scope: [
          'Diseño responsive de landing page',
          'Sección de productos destacados',
          'Formulario de contacto',
          'Botón de WhatsApp',
          'Optimización básica SEO',
          'Despliegue en Vercel'
        ],
        outOfScope: [
          'Pasarela de pagos',
          'Panel de administración',
          'Gestión de inventario'
        ],
        deliverables: [
          'Sitio web publicado',
          'Código fuente completo',
          'Documentación básica'
        ]
      }),
      notes: 'Cliente muy entusiasta, tiene presupuesto definido.'
    },
    {
      name: 'Carlos Rodríguez',
      company: 'Minimarket Don Pedro',
      email: 'carlos@minimarketdonpedro.com',
      phone: '+57 310 987 6543',
      projectType: 'Sistema de inventario para minimarket',
      description: 'Necesito un sistema simple para controlar el inventario de mi minimarket, registrar entradas y salidas, y ver reportes básicos.',
      clientBudget: 3000000,
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.HIGH,
      complexity: Complexity.HIGH,
      opportunityLevel: 'Muy buena',
      riskLevel: 'Medio',
      estimatedMinBudget: 2500000,
      estimatedBudget: 3500000,
      estimatedMaxBudget: 4500000,
      nextAction: 'Enviar propuesta detallada',
      suggestedMessage: 'Hola Carlos, gracias por hablar sobre tu proyecto de sistema de inventario para el minimarket. Entiendo perfectamente la necesidad de tener un control claro de tus productos. He preparado una propuesta inicial que se ajusta a tu presupuesto y necesidades. ¿Podemos revisarla juntos?',
      scope: JSON.stringify({
        scope: [
          'Panel de administración',
          'Gestión de productos (CRUD)',
          'Registro de entradas/salidas',
          'Reportes básicos de inventario',
          'Autenticación de usuarios'
        ],
        outOfScope: [
          'Integración con caja registradora',
          'Gestión de proveedores',
          'Facturación electrónica'
        ],
        deliverables: [
          'Sistema web funcional',
          'Base de datos configurada',
          'Manual de usuario'
        ]
      }),
      notes: 'Necesita solución rápida, presupuesto flexible.'
    },
    {
      name: 'Ana Martínez',
      company: 'Emprendimiento Dulces Ana',
      email: 'ana@dulcesana.com',
      phone: '+57 311 456 7890',
      projectType: 'E-commerce para emprendimiento local',
      description: 'Quiero vender mis dulces artesanales por internet. Necesito una tienda online con catálogo, carrito y opción de pago contraentrega.',
      clientBudget: 2000000,
      status: LeadStatus.DIAGNOSIS,
      priority: LeadPriority.MEDIUM,
      complexity: Complexity.HIGH,
      opportunityLevel: 'Buena',
      riskLevel: 'Medio',
      estimatedMinBudget: 1800000,
      estimatedBudget: 2800000,
      estimatedMaxBudget: 3800000,
      nextAction: 'Presentar opciones de plataforma',
      suggestedMessage: 'Hola Ana, me encanta tu proyecto de dulces artesanales! Una tienda online es perfecta para ampliar tu alcance. Quiero presentarte algunas opciones de plataformas y funcionalidades que se ajusten a tu presupuesto. ¿Podemos charlar?',
      scope: JSON.stringify({
        scope: [
          'Diseño de tienda online',
          'Catálogo de productos',
          'Carrito de compras',
          'Gestión de pedidos',
          'Integración WhatsApp'
        ],
        outOfScope: [
          'Pasarela de pagos online',
          'Gestión de envíos',
          'Sistema de descuentos complejo'
        ],
        deliverables: [
          'Tienda online publicada',
          'Capacitación básica',
          'Soporte inicial 1 mes'
        ]
      }),
      notes: 'Primera experiencia con e-commerce, necesita guía.'
    },
    {
      name: 'Fundación Semilla',
      company: 'Fundación Semilla',
      email: 'contacto@fundacionsemilla.org',
      phone: '+57 1 234 5678',
      projectType: 'Página institucional para fundación',
      description: 'Necesitamos una página web para mostrar nuestra misión, proyectos y recibir donaciones.',
      clientBudget: 1000000,
      status: LeadStatus.PROPOSAL_SENT,
      priority: LeadPriority.MEDIUM,
      complexity: Complexity.LOW,
      opportunityLevel: 'Buena',
      riskLevel: 'Bajo',
      estimatedMinBudget: 800000,
      estimatedBudget: 1200000,
      estimatedMaxBudget: 1600000,
      nextAction: 'Seguimiento propuesta',
      suggestedMessage: 'Hola equipo de Fundación Semilla, espero que estén bien! Quería recordarles que les envié la propuesta para su página institucional. Estoy encantado de apoyar su causa y ajustarme a su presupuesto. ¿Tienen alguna duda o comentario?',
      scope: JSON.stringify({
        scope: [
          'Diseño de página institucional',
          'Sección de nosotros',
          'Galería de proyectos',
          'Formulario de contacto',
          'Botón de donaciones'
        ],
        outOfScope: [
          'Blog',
          'Panel de noticias',
          'Multiidioma'
        ],
        deliverables: [
          'Página web publicada',
          'Código fuente',
          'Tutorial de actualización'
        ]
      }),
      notes: 'Organización sin fines de lucro, aplicar descuento social.'
    },
    {
      name: 'Luisa Fernández',
      company: 'Negocio Café & Más',
      email: 'luisa@cafeyamas.com',
      phone: '+57 312 111 2233',
      projectType: 'Dashboard de ventas para negocio pequeño',
      description: 'Quiero ver mis ventas diarias, semanales y mensuales en un dashboard simple con gráficos.',
      clientBudget: 800000,
      status: LeadStatus.NEGOTIATION,
      priority: LeadPriority.LOW,
      complexity: Complexity.LOW,
      opportunityLevel: 'Regular',
      riskLevel: 'Bajo',
      estimatedMinBudget: 600000,
      estimatedBudget: 900000,
      estimatedMaxBudget: 1200000,
      nextAction: 'Ajustar alcance',
      suggestedMessage: 'Hola Luisa, gracias por tu feedback. Entiendo que quieres ajustar el alcance para ajustarnos a tu presupuesto. He preparado una versión simplificada del dashboard que sigue cumpliendo con tus necesidades principales. ¿Lo revisamos?',
      scope: JSON.stringify({
        scope: [
          'Dashboard con gráficos',
          'Visualización de ventas por período',
          'Filtros de fecha',
          'Exportación a Excel básica'
        ],
        outOfScope: [
          'Integración con punto de venta',
          'Gestión de productos',
          'Multi-usuario'
        ],
        deliverables: [
          'Dashboard funcional',
          'Configuración inicial',
          'Guía de uso'
        ]
      }),
      notes: 'Presupuesto ajustado, priorizar funcionalidades esenciales.'
    },
    {
      name: 'Javier Torres',
      company: 'Barbería El Estilo',
      email: 'javier@barberiaelestilo.com',
      phone: '+57 313 444 5566',
      projectType: 'Sistema de reservas para barbería',
      description: 'Necesito que mis clientes reserven citas online, elijan barbero y horario. Que les llegue recordatorio por WhatsApp.',
      clientBudget: 2500000,
      status: LeadStatus.CLIENT,
      priority: LeadPriority.HIGH,
      complexity: Complexity.MEDIUM,
      opportunityLevel: 'Excelente',
      riskLevel: 'Medio',
      estimatedMinBudget: 2000000,
      estimatedBudget: 2800000,
      estimatedMaxBudget: 3500000,
      nextAction: 'Iniciar desarrollo',
      suggestedMessage: 'Hola Javier! Estoy emocionado de empezar a trabajar en tu sistema de reservas para la barbería. Vamos a crear una herramienta que le ahorre mucho tiempo a ti y a tus clientes. Mañana te envío el plan de trabajo detallado!',
      scope: JSON.stringify({
        scope: [
          'Sistema de reservas online',
          'Gestión de barberos',
          'Horarios disponibles',
          'Recordatorios por WhatsApp',
          'Panel de administración'
        ],
        outOfScope: [
          'Pagos online',
          'Historial de servicios',
          'Fidelización de clientes'
        ],
        deliverables: [
          'Sistema completo',
          'Despliegue',
          'Capacitación'
        ]
      }),
      notes: 'Cliente confirmado, empezar desarrollo esta semana!'
    }
  ];

  // Insert demo leads
  for (const lead of demoLeads) {
    await prisma.lead.create({
      data: lead
    });
  }

  console.log('Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
