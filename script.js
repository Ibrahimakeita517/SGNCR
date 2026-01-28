const produits = [
  { nom: "Sac de Riz (50kg)", prix: 22500, image: "img/riz.jpg", image2: "img/riz2.jpg", categorie: "Céréales", promo: "-10%" },
  { nom: "Sac de Sucre (50kg)", prix: 27500 , image: "img/sucre.jpg", image2: "img/sucre2.jpg", categorie: "Épicerie", promo: null },
  { nom: "Bidon Huile (20L)", prix: 21000, image: "img/huile.jpg", image2: "img/huile2.jpg", categorie: "Épicerie", promo: "Promo" },
  { nom: "Sac Pomme de terre", prix: 15000, image: "img/pomedeteure.jpg", image2: "img/pomedeteure2.jpg", categorie: "Épicerie" },
  { nom: "Sac NIDO en poudre (25kg)", prix: 55000, image: "img/nido.jpg", image2: "img/nido2.jpg", categorie: "Épicerie", promo: "-5000F" },
  { nom: "Carton Pâtes (10kg)", prix: 6500, image: "img/pate.jpg", image2: "img/pate2.jpg", categorie: "Céréales" },
  { nom: "Carton Tomate", prix: 11000, image: "img/tomate.jpg", image2: "img/tomate2.jpg", categorie: "Épicerie" },
  { nom: "Sac Farine de mil (50kg)", prix: 17500, image: "img/farine-mil.jpg", image2: "img/farine-mil2.jpg", categorie: "Céréales" },
  { nom: "Sac Farine de maïs (50kg)", prix: 15000, image: "img/farine-mais.jpg", image2: "img/farine-mais2.jpg", categorie: "Céréales" },
  { nom: "Sac Sel iodé (20kg)", prix: 2500, image: "img/sel.jpg", image2: "img/sel2.jpg", categorie: "Épicerie", promo: "Nouveau" },
];

// Chargement du panier depuis le LocalStorage (mémoire du navigateur)
const panier = JSON.parse(localStorage.getItem('anwkasugu_panier')) || {};
const historique = JSON.parse(localStorage.getItem('anwkasugu_historique')) || [];

// Gestion des utilisateurs
const users = JSON.parse(localStorage.getItem('anwkasugu_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('anwkasugu_currentUser')) || null;
const VALEUR_POINT = 50; // 1 point = 50 FCFA de réduction

let codeValidationActuel = ""; // Pour stocker le code OTP temporairement

document.addEventListener('DOMContentLoaded', () => {
  // Simulation du chargement
  setTimeout(() => {
    document.getElementById('splashScreen').classList.add('hidden'); // Cache l'écran de démarrage
    const liste = document.getElementById('listeProduits');
    liste.style.display = 'grid';
    afficherProduits();
  }, 3000); // 3 secondes de délai pour l'animation

  updateHeaderAuth(); // Mettre à jour l'affichage du bouton connexion
  
  // Recherche avec Debounce (attendre que l'utilisateur arrête de taper)
  let timeoutRecherche;
  const btnClear = document.getElementById('btnClearSearch');

  searchInput.addEventListener('input', () => {
    clearTimeout(timeoutRecherche);
    timeoutRecherche = setTimeout(rechercherProduit, 500); // Délai de 500ms
    verifierInputRecherche(); // Afficher/Cacher la croix
  });

  // --- Menu Hamburger Mobile ---
  const btnMenu = document.getElementById('btn-menu-mobile');
  const navMenu = document.getElementById('nav-menu');

  if (btnMenu && navMenu) {
    btnMenu.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });

    // Fermer le menu au clic sur un lien
    navMenu.querySelectorAll('span').forEach(span => {
      span.addEventListener('click', () => {
        navMenu.classList.remove('show');
      });
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !btnMenu.contains(event.target)) {
        navMenu.classList.remove('show');
      }
    });
  }

  // Bouton Rechercher (Loupe)
  document.getElementById('btnSearch').addEventListener('click', rechercherProduit);

  // Bouton Effacer Recherche (Croix)
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      searchInput.value = "";
      verifierInputRecherche();
      rechercherProduit();
    });
  }

  document.getElementById('btn-valider').addEventListener('click', validerCommande);

  genererCategories(); // Générer les boutons de catégories dynamiquement

  // Ajout des écouteurs pour les boutons de filtre
  const boutonsFiltre = document.querySelectorAll('.btn-filtre');
  boutonsFiltre.forEach(btn => btn.addEventListener('click', filtrerProduits));

  // Écouteur pour le tri
  document.getElementById('triProduits').addEventListener('change', trierProduits);

  // Scroll vers le panier au clic sur le bouton flottant
  document.getElementById('btn-floating-panier').addEventListener('click', () => {
    document.getElementById('panier').scrollIntoView({ behavior: 'smooth' });
  });

  // Bouton vider le panier
  document.getElementById('btn-vider-panier').addEventListener('click', viderPanier);

  // Bouton passer à la caisse
  document.getElementById('btn-go-checkout').addEventListener('click', ouvrirPageCheckout);

  // Checkbox utiliser les points
  document.getElementById('usePoints').addEventListener('change', calculerTotalCheckout);

  // --- Logique du Carrousel ---
  const carouselSlide = document.querySelector('.carousel-slide');
  const images = document.querySelectorAll('.carousel-slide img');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorsContainer = document.getElementById('carouselIndicators');

  let counter = 0;
  const totalSlides = images.length;

  // Générer les points (dots)
  if (indicatorsContainer) {
    images.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        counter = index;
        updateCarousel();
      });
      indicatorsContainer.appendChild(dot);
    });
  }

  function updateCarousel() {
    carouselSlide.style.transform = `translateX(${-counter * 100}%)`;
    
    // Mettre à jour les points actifs
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[counter]) dots[counter].classList.add('active');
  }

  nextBtn.addEventListener('click', () => {
    counter = (counter + 1) % totalSlides; // Boucle au début
    updateCarousel();
  });

  prevBtn.addEventListener('click', () => {
    counter = (counter - 1 + totalSlides) % totalSlides; // Boucle à la fin
    updateCarousel();
  });

  // Défilement automatique toutes les 5 secondes
  setInterval(() => {
    counter = (counter + 1) % totalSlides;
    updateCarousel();
  }, 5000);

  // --- Gestion du Swipe (Tactile) ---
  let touchStartX = 0;
  let touchEndX = 0;

  carouselSlide.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselSlide.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 50; // Distance min pour valider le swipe
    if (touchStartX - touchEndX > threshold) {
      nextBtn.click(); // Simule un clic sur "Suivant" (Swipe Gauche)
    } else if (touchEndX - touchStartX > threshold) {
      prevBtn.click(); // Simule un clic sur "Précédent" (Swipe Droite)
    }
  }

  // --- Gestion de la Modale OTP ---
  const modal = document.getElementById('otpModal');
  const btnClose = document.getElementById('btn-close-modal');
  const btnVerify = document.getElementById('btn-verify-otp');

  btnClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  btnVerify.addEventListener('click', () => {
    const inputCode = document.getElementById('otpInput').value;
    if (inputCode === codeValidationActuel) {
      modal.style.display = 'none';
      finaliserCommande();
    } else {
      alert("❌ Code incorrect. Veuillez réessayer.");
    }
  });

  // Fermer la modale si on clique en dehors
  window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

  // --- Zoom Loupe sur l'image détail ---
  const zoomContainer = document.getElementById('zoomContainer');
  const zoomImg = document.getElementById('detailImg');

  zoomContainer.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = zoomContainer.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    zoomImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    zoomImg.style.transform = "scale(2)";
  });

  zoomContainer.addEventListener('mouseleave', () => {
    zoomImg.style.transformOrigin = "center center";
    zoomImg.style.transform = "scale(1)";
  });

  // Gestion du formulaire de contact
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    afficherNotification("✅ Message envoyé avec succès !");
    fermerPageContact();
    e.target.reset(); // Vide le formulaire
  });

  // --- Gestion du Mode Sombre ---
  const btnTheme = document.getElementById('btn-theme');
  const currentTheme = localStorage.getItem('theme');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    btnTheme.textContent = "☀️ Mode Clair";
  }

  btnTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      btnTheme.textContent = "☀️ Mode Clair";
      localStorage.setItem('theme', 'dark');
    } else {
      btnTheme.textContent = "🌙 Mode Sombre";
      localStorage.setItem('theme', 'light');
    }
  });

  // --- Gestion Auth (Connexion/Inscription) ---
  document.getElementById('btn-auth').addEventListener('click', () => {
    if (currentUser) {
      ouvrirPageProfil();
    } else {
      document.getElementById('authModal').style.display = 'flex';
    }
  });

  // Soumission formulaires
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  
  // Soumission formulaire profil
  document.getElementById('profilForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if(currentUser) {
        currentUser.telephone = document.getElementById('editTel').value;
        currentUser.quartier = document.getElementById('editQuartier').value;
        const pass = document.getElementById('editPass').value;
        if(pass) currentUser.password = pass;
        
        localStorage.setItem('anwkasugu_currentUser', JSON.stringify(currentUser));
        updateUserInDatabase(currentUser);
        afficherNotification("✅ Informations mises à jour !");
        document.getElementById('editPass').value = ""; // Vider le champ mot de passe
    }
  });

  // Fermer modale auth si clic dehors
  window.addEventListener('click', (e) => { if(e.target == document.getElementById('authModal')) fermerModalAuth(); });

  // --- Bouton Retour en haut ---
  const btnBackToTop = document.getElementById('btn-back-to-top');

  if (btnBackToTop) {
    window.addEventListener('scroll', () => {
      // Affiche le bouton si on a scrollé de plus de 100px (plus réactif)
      btnBackToTop.style.display = window.scrollY > 100 ? 'flex' : 'none';
    });

    btnBackToTop.addEventListener('click', () => {
      // Défilement fluide personnalisé (plus lent : 1000ms)
      const duration = 1000;
      const start = window.scrollY;
      const startTime = performance.now();

      function animation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Fonction d'assouplissement (easeOutCubic) pour un effet naturel
        const ease = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, start * (1 - ease));

        if (timeElapsed < duration) requestAnimationFrame(animation);
      }
      requestAnimationFrame(animation);
    });
  }

  afficherPanier(); // Mettre à jour l'affichage du panier au chargement
});

function sauvegarderPanier() {
  localStorage.setItem('anwkasugu_panier', JSON.stringify(panier));
}

function afficherNotification(message) {
  let toast = document.getElementById("toast");
  // Créer l'élément s'il n'existe pas encore
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.className = "toast show";
  
  // Faire disparaître après 3 secondes
  setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

function afficherProduits() {
  const div = document.getElementById("listeProduits");
  div.innerHTML = "";
  produits.forEach((produit, index) => {
    const p = document.createElement("div");
    p.className = "produit";
    p.setAttribute("data-nom", produit.nom.toLowerCase());
    p.setAttribute("data-categorie", produit.categorie); // Ajout de l'attribut catégorie

    // Génération aléatoire d'étoiles et d'avis pour l'effet réaliste
    const nbEtoiles = Math.floor(Math.random() * 2) + 4; // Donne 4 ou 5 étoiles
    const etoiles = "⭐".repeat(nbEtoiles);
    const nbAvis = Math.floor(Math.random() * 300) + 10; // Entre 10 et 310 avis

    // Badge promo si existant
    const badgeHtml = produit.promo ? `<span class="badge-promo">${produit.promo}</span>` : '';

    // Image au survol (utilise une image générée si pas définie dans l'objet produit)
    const imageHover = produit.image2 || `https://placehold.co/300x300/f0f0f0/333?text=${encodeURIComponent(produit.nom)}+Vue+2`;

    p.innerHTML = `
      ${badgeHtml}
      <div class="produit-image-wrapper" onclick="ouvrirPageDetail(${index})" style="cursor: pointer">
        <img src="${produit.image}" alt="${produit.nom}" class="img-normal">
        <img src="${imageHover}" alt="${produit.nom} Vue 2" class="img-hover">
      </div>
      <h3>${produit.nom}</h3>
      <div class="stars">${etoiles} <span class="avis">(${nbAvis})</span></div>
      <p>${produit.prix} FCFA</p>
      <button onclick="ajouterAuPanier(${index})">
        <span class="btn-icon">🛒</span> <span class="btn-text">Ajouter au panier</span>
      </button>
    `;
    div.appendChild(p);
  });
}

function genererCategories() {
  const categories = [...new Set(produits.map(p => p.categorie))];
  const container = document.querySelector('.filtres-container');
  const selectTri = document.getElementById('triProduits');

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'btn-filtre';
    btn.setAttribute('data-categorie', cat);
    btn.textContent = cat;
    container.insertBefore(btn, selectTri); // Insérer avant le select de tri
  });
}

function trierProduits() {
  const critere = document.getElementById('triProduits').value;

  if (critere === 'croissant') {
    produits.sort((a, b) => a.prix - b.prix);
  } else if (critere === 'decroissant') {
    produits.sort((a, b) => b.prix - a.prix);
  } else {
    // Tri par défaut (on mélange un peu ou on remet l'ordre initial si on avait une copie, ici on simplifie)
    produits.sort((a, b) => a.nom.localeCompare(b.nom));
  }

  afficherProduits();
  
  // Ré-appliquer le filtre actif visuellement
  const filtreActif = document.querySelector('.btn-filtre.active');
  if (filtreActif) filtreActif.click();
}

function filtrerProduits(e) {
  // Gestion de la classe active sur les boutons
  document.querySelectorAll('.btn-filtre').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  const categorieSelectionnee = e.target.getAttribute('data-categorie');
  const produitsDOM = document.querySelectorAll('.produit');

  produitsDOM.forEach(p => {
    const categorieProduit = p.getAttribute('data-categorie');
    
    if (categorieSelectionnee === 'Tout' || categorieProduit === categorieSelectionnee) {
      p.style.display = 'flex';
    } else {
      p.style.display = 'none';
    }
  });
}

function verifierInputRecherche() {
  const input = document.getElementById('searchInput');
  const btnClear = document.getElementById('btnClearSearch');
  if (input.value.length > 0) {
    btnClear.style.display = 'block';
  } else {
    btnClear.style.display = 'none';
  }
}

function rechercherProduit() {
  const input = document.getElementById('searchInput').value;
  const filter = input.toLowerCase();
  const produitsAffiches = document.querySelectorAll('.produit');

  produitsAffiches.forEach(p => {
    const nom = p.getAttribute('data-nom');
    const h3 = p.querySelector('h3');
    const originalText = h3.textContent; // Récupère le texte brut (nettoie les anciens highlights)

    if (nom.includes(filter) && filter !== "") {
      p.style.display = 'flex';
      // Créer une regex pour trouver le terme (insensible à la casse)
      const escapedFilter = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Échapper les caractères spéciaux
      const regex = new RegExp(`(${escapedFilter})`, 'gi');
      h3.innerHTML = originalText.replace(regex, '<span class="highlight">$1</span>');
    } else {
      p.style.display = filter === "" ? 'flex' : 'none'; // Afficher tout si recherche vide
      h3.innerHTML = originalText; // Enlever la surbrillance
    }
  });
}

function ajouterAuPanier(index) {
  const nom = produits[index].nom;
  if (panier[nom]) {
    panier[nom].quantite += 1;
  } else {
    panier[nom] = { ...produits[index], quantite: 1 };
  }
  sauvegarderPanier();
  afficherPanier();
  afficherNotification(`✅ ${nom} ajouté au panier !`);
}

// Rendre les fonctions accessibles globalement pour les onclick dans le HTML généré
window.ajouterAuPanier = ajouterAuPanier;
window.modifierQuantite = modifierQuantite;
window.supprimerDuPanier = supprimerDuPanier;
window.ouvrirPageDetail = ouvrirPageDetail;
window.fermerPageDetail = fermerPageDetail;
window.viderPanier = viderPanier;
window.ouvrirPageContact = ouvrirPageContact;
window.fermerPageContact = fermerPageContact;
window.ouvrirPageHistorique = ouvrirPageHistorique;
window.fermerPageHistorique = fermerPageHistorique;
window.recommander = recommander;
window.ouvrirPageCheckout = ouvrirPageCheckout;
window.fermerPageCheckout = fermerPageCheckout;
window.switchAuthTab = switchAuthTab;
window.fermerModalAuth = fermerModalAuth;
window.ouvrirModalParrainage = ouvrirModalParrainage;
window.fermerModalParrainage = fermerModalParrainage;
window.copierCodeParrainage = copierCodeParrainage;
window.ouvrirPageProfil = ouvrirPageProfil;
window.fermerPageProfil = fermerPageProfil;
window.genererCategories = genererCategories;
window.togglePassword = togglePassword;


function ouvrirPageDetail(index) {
  const produit = produits[index];
  
  // Remplir les infos
  const mainImg = document.getElementById('detailImg');
  mainImg.src = produit.image;
  document.getElementById('detailNom').textContent = produit.nom;
  document.getElementById('detailPrix').textContent = produit.prix + " FCFA";
  
  // Générer des étoiles aléatoires pour la démo (ou récupérer celles de la liste si stockées)
  const nbEtoiles = 4; 
  document.getElementById('detailEtoiles').innerHTML = "⭐".repeat(nbEtoiles) + ' <span class="avis">(Avis vérifiés)</span>';

  // --- Galerie d'images (Thumbnails) ---
  const thumbnailsDiv = document.getElementById('detailThumbnails');
  thumbnailsDiv.innerHTML = ""; // Nettoyer les anciennes miniatures

  // Simuler d'autres images pour la galerie (On répète l'image principale car on n'a pas les autres vues)
  const imagesGalerie = [
    produit.image,
    produit.image2 || produit.image,
    produit.image,
    produit.image2 || produit.image
  ];

  imagesGalerie.forEach((imgSrc, i) => {
    const thumb = document.createElement('img');
    thumb.src = imgSrc;
    thumb.className = 'thumbnail';
    if (i === 0) thumb.classList.add('active');
    
    thumb.onclick = function() {
      mainImg.src = imgSrc;
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    };
    
    thumbnailsDiv.appendChild(thumb);
  });

  // Configurer le bouton d'ajout
  const btnAjout = document.getElementById('btn-ajout-detail');
  btnAjout.onclick = function() {
    ajouterAuPanier(index);
  };

  // Cacher les autres pages et afficher la vue détail
  document.getElementById('listeProduits').style.display = 'none';
  document.getElementById('contactPage').style.display = 'none';
  document.getElementById('historiquePage').style.display = 'none';
  document.getElementById('checkoutPage').style.display = 'none';
  document.getElementById('profilPage').style.display = 'none';
  document.querySelector('.sidebar-droite').style.display = 'block'; // S'assurer que la sidebar est visible
  document.getElementById('detailProduit').style.display = 'block';
  window.scrollTo(0, 0); // Remonter en haut de page
}

function fermerPageDetail() {
  document.getElementById('detailProduit').style.display = 'none';
  document.getElementById('listeProduits').style.display = 'grid';
  document.querySelector('.sidebar-droite').style.display = 'block';
}

function ouvrirPageContact() {
  document.getElementById('listeProduits').style.display = 'none';
  document.getElementById('detailProduit').style.display = 'none';
  document.getElementById('historiquePage').style.display = 'none';
  document.getElementById('checkoutPage').style.display = 'none';
  document.getElementById('profilPage').style.display = 'none';
  document.querySelector('.sidebar-droite').style.display = 'none';
  document.getElementById('contactPage').style.display = 'block';
  window.scrollTo(0, 0);
}

function fermerPageContact() {
  document.getElementById('contactPage').style.display = 'none';
  document.getElementById('listeProduits').style.display = 'grid';
  document.querySelector('.sidebar-droite').style.display = 'block';
}

function ouvrirPageHistorique() {
  document.getElementById('listeProduits').style.display = 'none';
  document.getElementById('detailProduit').style.display = 'none';
  document.getElementById('contactPage').style.display = 'none';
  document.getElementById('checkoutPage').style.display = 'none';
  document.getElementById('profilPage').style.display = 'none';
  document.querySelector('.sidebar-droite').style.display = 'none';
  document.getElementById('historiquePage').style.display = 'block';
  
  const div = document.getElementById('listeHistorique');
  div.innerHTML = "";
  
  if (historique.length === 0) {
    div.innerHTML = "<p>Aucune commande passée pour le moment.</p>";
    return;
  }
  
  // Afficher les commandes de la plus récente à la plus ancienne
  historique.forEach(cmd => {
    const card = document.createElement('div');
    card.className = 'commande-card';
    
    let articlesHtml = '<ul>';
    for (let nom in cmd.articles) {
      const item = cmd.articles[nom];
      articlesHtml += `<li><span>${item.quantite}x ${nom}</span> <span>${item.prix * item.quantite} F</span></li>`;
    }
    articlesHtml += '</ul>';
    
    card.innerHTML = `
      <div class="commande-header">
        <span>📅 ${cmd.date}</span>
        <span>Commande #${cmd.id.toString().slice(-6)}</span>
      </div>
      <div class="commande-details">
        ${articlesHtml}
        <div class="commande-total">Total : ${cmd.total} FCFA</div>
        <button class="btn-recommander" onclick="recommander(${cmd.id})">🔄 Recommander</button>
      </div>
    `;
    div.appendChild(card);
  });
  
  window.scrollTo(0, 0);
}

function fermerPageHistorique() {
  document.getElementById('historiquePage').style.display = 'none';
  document.getElementById('listeProduits').style.display = 'grid';
  document.querySelector('.sidebar-droite').style.display = 'block';
}

function ouvrirPageProfil() {
  if (!currentUser) return;

  // Masquer les autres pages
  document.getElementById('listeProduits').style.display = 'none';
  document.getElementById('detailProduit').style.display = 'none';
  document.getElementById('contactPage').style.display = 'none';
  document.getElementById('historiquePage').style.display = 'none';
  document.getElementById('checkoutPage').style.display = 'none';
  document.querySelector('.sidebar-droite').style.display = 'none';

  document.getElementById('profilPage').style.display = 'block';

  // Remplir les champs
  document.getElementById('editUser').value = currentUser.username;
  document.getElementById('editTel').value = currentUser.telephone || "";
  document.getElementById('editQuartier').value = currentUser.quartier || "";
  document.getElementById('profilPoints').textContent = currentUser.points;
  document.getElementById('profilReferral').textContent = currentUser.referralCode || "Aucun";
}

function fermerPageProfil() {
  document.getElementById('profilPage').style.display = 'none';
  document.querySelector('.sidebar-droite').style.display = 'block';
  document.getElementById('listeProduits').style.display = 'grid';
}

function ouvrirPageCheckout() {
  // Vérifier si le panier est vide
  if (Object.keys(panier).length === 0) {
    afficherNotification("⚠️ Votre panier est vide !");
    return;
  }

  // Masquer les autres pages et la sidebar
  document.getElementById('listeProduits').style.display = 'none';
  document.getElementById('detailProduit').style.display = 'none';
  document.getElementById('contactPage').style.display = 'none';
  document.getElementById('historiquePage').style.display = 'none';
  document.getElementById('profilPage').style.display = 'none';
  document.querySelector('.sidebar-droite').style.display = 'none'; // Cacher la sidebar
  
  // Afficher la page checkout
  document.getElementById('checkoutPage').style.display = 'block';
  
  // Remplir le récapitulatif
  const ul = document.getElementById("listePanierCheckout");
  ul.innerHTML = "";
  let total = 0;
  
  for (let nom in panier) {
    const item = panier[nom];
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.quantite}x ${nom}</span> <span>${item.prix * item.quantite} F</span>`;
    ul.appendChild(li);
    total += item.prix * item.quantite;
  }
  
  // Gestion de l'affichage des points
  const divPoints = document.getElementById('divPoints');
  const checkbox = document.getElementById('usePoints');
  if (checkbox) checkbox.checked = false; // Réinitialiser la case

  if (currentUser && currentUser.points > 0) {
    divPoints.style.display = 'block';
    document.getElementById('userPointsDisplay').textContent = currentUser.points;
    document.getElementById('discountValue').textContent = currentUser.points * VALEUR_POINT;
  } else {
    divPoints.style.display = 'none';
  }
  calculerTotalCheckout(); // Calculer le total initial
  
  // --- Logique Fidélité & Pré-remplissage ---
  const msgDiv = document.getElementById('loyaltyMessage');
  if (currentUser) {
    // Pré-remplir les champs
    if(currentUser.quartier) document.getElementById('quartier').value = currentUser.quartier;
    if(currentUser.telephone) document.getElementById('telephone').value = currentUser.telephone;

    // Calcul des points à gagner (1 pt pour 1000 FCFA)
    const pointsGagnes = Math.floor(total / 1000);
    msgDiv.style.display = 'block';
    msgDiv.style.background = '#e8f5e9'; // Vert clair
    msgDiv.style.color = '#2e7d32';
    msgDiv.innerHTML = `<strong>Bonjour ${currentUser.username} !</strong><br>Vous avez actuellement <strong>${currentUser.points} points</strong>.<br>Cette commande vous rapportera <strong>+${pointsGagnes} points</strong> !`;
  } else {
    msgDiv.style.display = 'block';
    msgDiv.style.background = '#fff3e0'; // Orange clair
    msgDiv.style.color = '#ef6c00';
    msgDiv.innerHTML = `💡 <strong>Astuce :</strong> <a href="#" onclick="fermerPageCheckout(); document.getElementById('authModal').style.display='flex'; return false;">Connectez-vous ou inscrivez-vous</a> pour gagner des points de fidélité et remplir ce formulaire automatiquement !`;
  }

  window.scrollTo(0, 0);
}

function calculerTotalCheckout() {
  let total = 0;
  for (let nom in panier) {
    total += panier[nom].prix * panier[nom].quantite;
  }

  const checkbox = document.getElementById('usePoints');
  let reduction = 0;

  if (checkbox && checkbox.checked && currentUser) {
    const maxReduction = currentUser.points * VALEUR_POINT;
    reduction = Math.min(total, maxReduction); // On ne peut pas réduire plus que le total
  }

  const totalFinal = total - reduction;
  document.getElementById("totalCheckout").textContent = totalFinal;
}

function fermerPageCheckout() {
  document.getElementById('checkoutPage').style.display = 'none';
  document.querySelector('.sidebar-droite').style.display = 'block'; // Réafficher la sidebar
  document.getElementById('listeProduits').style.display = 'grid';
}

function recommander(id) {
  const commande = historique.find(c => c.id === id);
  if (commande) {
    if (confirm("Voulez-vous ajouter les articles de cette commande à votre panier actuel ?")) {
      for (let nom in commande.articles) {
        const item = commande.articles[nom];
        if (panier[nom]) {
          panier[nom].quantite += item.quantite;
        } else {
          panier[nom] = { ...item };
        }
      }
      sauvegarderPanier();
      afficherPanier();
      afficherNotification("✅ Articles ajoutés au panier !");
      fermerPageHistorique(); // Retour à la boutique pour voir le panier mis à jour
    }
  }
}

function modifierQuantite(nom, delta) {
  if (panier[nom]) {
    panier[nom].quantite += delta;
    if (panier[nom].quantite <= 0) delete panier[nom];
    sauvegarderPanier();
    afficherPanier();
  }
}

function supprimerDuPanier(nom) {
  if (panier[nom]) {
    delete panier[nom];
    sauvegarderPanier();
    afficherPanier();
  }
}

function viderPanier() {
  if (Object.keys(panier).length === 0) return; // Rien à vider
  if (confirm("Voulez-vous vraiment vider tout votre panier ?")) {
    for (let member in panier) delete panier[member];
    sauvegarderPanier();
    afficherPanier();
    afficherNotification("🗑️ Panier vidé !");
  }
}

function afficherPanier() {
  const ul = document.getElementById("listePanier");
  ul.innerHTML = "";
  let total = 0;
  let nombreArticles = 0;

  for (let nom in panier) {
    const item = panier[nom];
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="panier-item-content">
        <div class="panier-header">
          <span>${nom}</span>
          <span>${item.prix * item.quantite} F</span>
        </div>
        <div class="panier-controls">
          <div class="qte-wrapper">
            <button class="btn-panier" onclick="modifierQuantite('${nom}', -1)">-</button>
            <span class="quantite" style="margin:0 10px">${item.quantite}</span>
            <button class="btn-panier" onclick="modifierQuantite('${nom}', 1)">+</button>
          </div>
          <button class="btn-supprimer" onclick="supprimerDuPanier('${nom}')" title="Supprimer">🗑️</button>
        </div>
      </div>
    `;
    ul.appendChild(li);
    total += item.prix * item.quantite;
    nombreArticles += item.quantite;
  }

  document.getElementById("total").textContent = total;
  
  // Mise à jour du compteur sur le bouton flottant
  const compteurSpan = document.getElementById("compteur-panier");
  if (compteurSpan) {
    compteurSpan.textContent = nombreArticles;

    // Animation de rebond sur le bouton
    const btn = document.getElementById("btn-floating-panier");
    
    // Afficher le bouton uniquement s'il y a des articles
    if (nombreArticles > 0) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }

    btn.classList.remove("anim-rebond");
    void btn.offsetWidth; // Astuce pour redémarrer l'animation
    btn.classList.add("anim-rebond");
  }
}

function validerCommande() {
  const quartier = document.getElementById("quartier").value.trim();
  const rue = document.getElementById("rue").value.trim();
  const porte = document.getElementById("porte").value.trim();
  const telephone = document.getElementById("telephone").value.trim();
  
  // Récupération du bouton radio sélectionné
  const paiementRadio = document.querySelector('input[name="paiement"]:checked');
  const paiement = paiementRadio ? paiementRadio.value : null;

  if (!quartier || !rue || !porte || !telephone || !paiement) {
    alert("Veuillez remplir tous les champs et choisir un mode de paiement.");
    return;
  }
  
  // Génération du code et ouverture de la modale
  codeValidationActuel = Math.floor(1000 + Math.random() * 9000).toString();
  
  document.getElementById("confirmTel").textContent = telephone;
  document.getElementById("testCode").textContent = codeValidationActuel;
  document.getElementById("otpInput").value = ""; // Vider le champ
  
  const modal = document.getElementById('otpModal');
  modal.style.display = 'flex'; // Afficher la modale
}

function finaliserCommande() {
  const msg = document.getElementById("confirmationMessage");
  msg.textContent = "✅ Commande confirmée ! Livraison en cours...";
  msg.style.color = "#27ae60";
  
  // Sauvegarder dans l'historique
  const nouvelleCommande = {
    id: Date.now(),
    date: new Date().toLocaleDateString() + ' à ' + new Date().toLocaleTimeString(),
    articles: { ...panier }, // Copie du panier actuel
    total: document.getElementById("totalCheckout").textContent // Utiliser le total du checkout
  };

  // Ajouter les points si connecté
  if (currentUser) {
    // 1. Déduire les points utilisés (si applicable)
    const checkbox = document.getElementById('usePoints');
    if (checkbox && checkbox.checked) {
      let totalBrut = 0;
      for(let nom in panier) totalBrut += panier[nom].prix * panier[nom].quantite;
      const maxReduction = currentUser.points * VALEUR_POINT;
      const reduction = Math.min(totalBrut, maxReduction);
      const pointsUtilises = Math.ceil(reduction / VALEUR_POINT);
      currentUser.points -= pointsUtilises;
      afficherNotification(`💎 ${pointsUtilises} points utilisés !`);
    }

    const pointsGagnes = Math.floor(parseInt(nouvelleCommande.total) / 1000);
    currentUser.points += pointsGagnes;
    localStorage.setItem('anwkasugu_currentUser', JSON.stringify(currentUser));
    updateUserInDatabase(currentUser); // Mettre à jour la liste globale
    updateHeaderAuth();
    afficherNotification(`🎉 Félicitations ! Vous avez gagné ${pointsGagnes} points.`);
  }
  
  historique.unshift(nouvelleCommande); // Ajouter au début de la liste
  localStorage.setItem('anwkasugu_historique', JSON.stringify(historique));
  
  // Vider le panier après commande
  for (let member in panier) delete panier[member];
  sauvegarderPanier();
  fermerPageCheckout(); // Retour à l'accueil
  afficherPanier();
}

// --- Fonctions Parrainage ---

function ouvrirModalParrainage() {
  if (!currentUser) {
    afficherNotification("⚠️ Veuillez vous connecter pour accéder au parrainage.");
    document.getElementById('authModal').style.display = 'flex';
    return;
  }

  // Générer un code si l'utilisateur n'en a pas (pour les anciens comptes)
  if (!currentUser.referralCode) {
    currentUser.referralCode = currentUser.username.substring(0,3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('anwkasugu_currentUser', JSON.stringify(currentUser));
    updateUserInDatabase(currentUser);
  }

  document.getElementById('myReferralCode').textContent = currentUser.referralCode;
  document.getElementById('referralModal').style.display = 'flex';
}

function fermerModalParrainage() {
  document.getElementById('referralModal').style.display = 'none';
}

function copierCodeParrainage() {
  const code = document.getElementById('myReferralCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    afficherNotification("📋 Code copié ! Partagez-le avec vos amis.");
  });
}

// --- Fonctions d'Authentification ---

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const btnLogin = document.getElementById('tab-login');
  const btnRegister = document.getElementById('tab-register');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    btnLogin.classList.add('active');
    btnRegister.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    btnLogin.classList.remove('active');
    btnRegister.classList.add('active');
  }
}

function fermerModalAuth() {
  document.getElementById('authModal').style.display = 'none';
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUser').value;
  const password = document.getElementById('regPass').value;
  const quartier = document.getElementById('regQuartier').value;
  const telephone = document.getElementById('regTel').value;
  const referralInput = document.getElementById('regReferral').value.trim();

  // Vérifier si l'utilisateur existe déjà
  if (users.find(u => u.username === username)) {
    alert("Ce nom d'utilisateur est déjà pris.");
    return;
  }

  // Générer un code de parrainage pour le nouvel utilisateur
  const newReferralCode = username.substring(0,3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
  let initialPoints = 0;

  // Vérifier le code parrainage entré
  if (referralInput) {
    const referrer = users.find(u => u.referralCode === referralInput);
    if (referrer) {
      referrer.points += 500; // Bonus pour le parrain
      updateUserInDatabase(referrer);
      initialPoints = 200; // Bonus de bienvenue pour le filleul
    }
  }

  const newUser = { username, password, quartier, telephone, points: initialPoints, referralCode: newReferralCode };
  users.push(newUser);
  localStorage.setItem('anwkasugu_users', JSON.stringify(users));
  
  loginUser(newUser);
  fermerModalAuth();
  if (initialPoints > 0) {
    afficherNotification(`✅ Compte créé ! +${initialPoints} points de bienvenue (Parrainage).`);
  } else {
    afficherNotification("✅ Compte créé avec succès !");
  }
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value;
  const password = document.getElementById('loginPass').value;

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    loginUser(user);
    fermerModalAuth();
    afficherNotification(`👋 Bon retour, ${user.username} !`);
  } else {
    alert("Nom d'utilisateur ou mot de passe incorrect.");
  }
}

function loginUser(user) {
  currentUser = user;
  localStorage.setItem('anwkasugu_currentUser', JSON.stringify(currentUser));
  updateHeaderAuth();
  // Si on est sur la page checkout, on la rafraîchit pour afficher les infos
  if(document.getElementById('checkoutPage').style.display === 'block') ouvrirPageCheckout();
}

function logoutUser() {
  if(confirm("Voulez-vous vous déconnecter ?")) {
    currentUser = null;
    localStorage.removeItem('anwkasugu_currentUser');
    updateHeaderAuth();
    afficherNotification("Déconnexion réussie.");
    if(document.getElementById('checkoutPage').style.display === 'block' || document.getElementById('profilPage').style.display === 'block') 
      fermerPageProfil(); // Utilise la même logique de fermeture pour revenir à l'accueil
  }
}

function updateHeaderAuth() {
  const btn = document.getElementById('btn-auth');
  if (currentUser) {
    btn.textContent = `👤 ${currentUser.username} (${currentUser.points} pts)`;
    btn.style.color = '#febd69'; // Couleur or pour montrer qu'il est connecté
  } else {
    btn.textContent = `👤 Connexion`;
    btn.style.color = 'white';
  }
}

function updateUserInDatabase(updatedUser) {
  const index = users.findIndex(u => u.username === updatedUser.username);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('anwkasugu_users', JSON.stringify(users));
  }
}

function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈"; // Icône pour cacher (singe ou œil barré)
  } else {
    input.type = "password";
    icon.textContent = "👁️"; // Icône pour voir
  }
}
