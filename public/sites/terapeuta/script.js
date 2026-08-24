// Header scroll effect
window.addEventListener('scroll', function() {
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('backToTopFixed');
  const scrollPosition = window.scrollY;
  
  if (scrollPosition > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  // Mostrar/ocultar botão de voltar ao topo
  if (scrollPosition > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
  
  // Atualizar links ativos
  updateActiveNavLink();
});

// Menu Mobile Funcionalidade
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuLinks = document.querySelectorAll('.nav-link-mobile');
const body = document.body;

// Abrir/fechar menu mobile
mobileMenuBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  mobileMenu.classList.toggle('active');
  body.classList.toggle('menu-open');
  mobileMenuBtn.innerHTML = mobileMenu.classList.contains('active') 
    ? '<i class="fas fa-times"></i>' 
    : '<i class="fas fa-bars"></i>';
});

// Fechar menu ao clicar em um link
mobileMenuLinks.forEach(link => {
  link.addEventListener('click', function() {
    mobileMenu.classList.remove('active');
    body.classList.remove('menu-open');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Scroll suave para a seção
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  });
});

// Fechar menu ao clicar fora
document.addEventListener('click', function(e) {
  if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    mobileMenu.classList.remove('active');
    body.classList.remove('menu-open');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  }
});

// Fechar menu ao redimensionar para desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768 && mobileMenu) {
    mobileMenu.classList.remove('active');
    body.classList.remove('menu-open');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  }
});

// Atualizar links ativos na navegação
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id], .header-hero[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.nav-link-mobile');
  
  let currentSection = '';
  const scrollPosition = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
      
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });
  
  // Atualizar links desktop
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
  
  // Atualizar links mobile
  mobileNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

// Smooth scroll para links da navegação desktop
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Form submission
document.getElementById('footerContactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Simulação de envio
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    alert('Mensagem enviada com sucesso! Entraremos em contato em até 24 horas.');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    document.getElementById('footerContactForm').reset();
  }, 1500);
});

// Animações dos elementos
function checkScroll() {
  const elements = document.querySelectorAll('.fade-in');
  
  elements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.2;
    
    if (elementPosition < screenPosition) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

// Inicializar animações
window.addEventListener('scroll', checkScroll);
window.addEventListener('load', checkScroll);

// Estado inicial para elementos fade-in
document.querySelectorAll('.fade-in').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
});

// Configurar botão de voltar ao topo
const backToTopFixed = document.getElementById('backToTopFixed');
backToTopFixed.style.transition = 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease';
// Adicione estas funções ao seu script.js existente

// Lazy Loading para imagens
document.addEventListener('DOMContentLoaded', function() {
  const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
  
  if ('IntersectionObserver' in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }
});

// Prevenir envio duplo do formulário
let formSubmitted = false;
const contactForm = document.getElementById('footerContactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    if (formSubmitted) {
      e.preventDefault();
      return;
    }
    
    formSubmitted = true;
    setTimeout(() => {
      formSubmitted = false;
    }, 3000);
  });
}

// Track CTA clicks para analytics
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
  button.addEventListener('click', function() {
    // Implementar tracking do Google Analytics aqui
    console.log('CTA clicked:', this.textContent.trim());
  });
});

// Performance: Defer carregamento de recursos não críticos
window.addEventListener('load', function() {
  // Carregar scripts de terceiros após a página carregar
  setTimeout(() => {
    // Exemplo: Carregar widget do Facebook ou outras integrações
  }, 2000);
});