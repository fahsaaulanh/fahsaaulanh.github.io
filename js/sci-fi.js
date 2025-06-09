document.addEventListener("DOMContentLoaded", () => {
  // --- Interactive Background Canvas (Constellation Effect) ---
  const canvas = document.getElementById("interactive-bg-canvas");
  const ctx = canvas.getContext("2d");
  let particlesArray;
  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  setCanvasSize();
  const mouse = {
    x: null,
    y: null,
    radius: (canvas.height / 90) * (canvas.width / 90),
  };
  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });
  window.addEventListener("mouseout", () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  class Particle {
    constructor(x, y, dX, dY, s, c) {
      this.x = x;
      this.y = y;
      this.directionX = dX;
      this.directionY = dY;
      this.size = s;
      this.color = c;
      this.speedX = this.directionX;
      this.speedY = this.directionY;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = "rgba(187, 0, 255, 0.9)";
      ctx.fill();
    } // Slightly less opaque particles
    update() {
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
        this.speedX = this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
        this.speedY = this.directionY;
      }
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius + this.size) {
        if (mouse.x < this.x && this.x < canvas.width - this.size * 5)
          this.x += 2;
        if (mouse.x > this.x && this.x > this.size * 5) this.x -= 2;
        if (mouse.y < this.y && this.y < canvas.height - this.size * 5)
          this.y += 2;
        if (mouse.y > this.y && this.y > this.size * 5) this.y -= 2;
      }
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedX += (this.directionX * 0.005 - this.speedX) * 0.05;
      this.speedY += (this.directionY * 0.005 - this.speedY) * 0.05; // Slower natural drift
      this.draw();
    }
  }
  function initParticles() {
    particlesArray = [];
    let num = (canvas.height * canvas.width) / 18000;
    for (let i = 0; i < num; i++) {
      let s = Math.random() * 1.2 + 0.3;
      let x = Math.random() * (innerWidth - s * 2 - s * 2) + s * 2;
      let y = Math.random() * (innerHeight - s * 2 - s * 2) + s * 2;
      let dX = Math.random() * 0.3 - 0.15;
      let dY = Math.random() * 0.3 - 0.15;
      particlesArray.push(new Particle(x, y, dX, dY, s, "rgba(0,247,255,0.2)"));
    }
  }
  function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dist =
          (particlesArray[a].x - particlesArray[b].x) *
            (particlesArray[a].x - particlesArray[b].x) +
          (particlesArray[a].y - particlesArray[b].y) *
            (particlesArray[a].y - particlesArray[b].y);
        if (dist < (canvas.width / 12) * (canvas.height / 12)) {
          opacityValue = 1 - dist / 18000;
          ctx.strokeStyle = `rgba(0,247,255,${opacityValue * 0.1})`;
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }
  let animationFrameId;
  function animateParticles() {
    animationFrameId = requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connectParticles();
  }
  initParticles();
  animateParticles();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrameId);
    setCanvasSize();
    mouse.radius = (canvas.height / 90) * (canvas.width / 90);
    initParticles();
    animateParticles();
  });

  // --- Mobile Menu Toggle ---
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.toggle("hidden");
      menuToggle.setAttribute("aria-expanded", String(!isHidden));
      const iconPath = isHidden
        ? "M4 6h16M4 12h16M4 18h16"
        : "M6 18L18 6M6 6l12 12";
      menuToggle.querySelector("svg path").setAttribute("d", iconPath);
    });
  }

  // --- Active Nav Link on Scroll & Click ---
  const mainNavLinks = document.querySelectorAll(
    "nav .hidden.md\\:flex a.nav-link"
  );
  const mobileNavLinksInternal = document.querySelectorAll(
    "#mobile-menu a.nav-link-mobile"
  );
  const allNavLinks = [...mainNavLinks, ...mobileNavLinksInternal];
  const sections = document.querySelectorAll("section[id]");
  const navElement = document.querySelector("nav");
  const navHeight = navElement ? navElement.offsetHeight : 70;

  function changeNavOnScroll() {
    let currentSectionId = "";
    const scrollPosition = pageYOffset + navHeight + 60; // Increased offset
    sections.forEach((section) => {
      if (scrollPosition >= section.offsetTop) {
        currentSectionId = section.getAttribute("id");
      }
    });
    if (
      !currentSectionId &&
      sections.length > 0 &&
      pageYOffset < sections[0].offsetTop - navHeight
    ) {
      currentSectionId = "home";
    } else if (
      window.innerHeight + window.pageYOffset >=
      document.body.offsetHeight - 10
    ) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) currentSectionId = lastSection.id;
    }

    mainNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
    mobileNavLinksInternal.forEach((link) => {
      link.classList.remove("text-[var(--primary)]", "font-semibold");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("text-[var(--primary)]", "font-semibold");
      }
    });
  }
  window.addEventListener("scroll", changeNavOnScroll, { passive: true });
  changeNavOnScroll(); // Initial check

  allNavLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (this.hash !== "") {
        e.preventDefault();
        const hash = this.hash;
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          let topOffset = targetElement.offsetTop - navHeight;
          if (hash !== "#home") topOffset += 5; // Small adjustment for non-home sections
          window.scrollTo({ top: topOffset, behavior: "smooth" });
          if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
            mobileMenu.classList.add("hidden");
            menuToggle
              .querySelector("svg path")
              .setAttribute("d", "M4 6h16M4 12h16M4 18h16");
            menuToggle.setAttribute("aria-expanded", "false");
          }
        }
      }
    });
  });

  // --- Typing Animation for Hero Section ---
  const roleTextElement = document.getElementById("role-text");
  const roles = [
    "Fullstack Developer",
    "Game Programmer",
    "AI Enthusiast",
    "Tech Innovator",
    "Creative Coder",
    "Cyber Architect",
  ];
  let roleIndex = 0,
    charIndex = 0,
    isDeleting = false;
  const typeSpeed = 100,
    deleteSpeed = 50,
    delayBetween = 1800;
  function typeRole() {
    if (!roleTextElement) return;
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      charIndex--;
      roleTextElement.textContent = currentRole.substring(0, charIndex);
    } else {
      charIndex++;
      roleTextElement.textContent = currentRole.substring(0, charIndex);
    }
    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(typeRole, delayBetween);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeRole, typeSpeed / 2);
    } else {
      setTimeout(typeRole, isDeleting ? deleteSpeed : typeSpeed);
    }
  }
  if (roleTextElement) typeRole();

  // --- Project Data & Pagination ---
  const allProjects = [
    {
      id: 1,
      title: "Lingo Song APP",
      category: "Mobile App",
      image: "images/LingoSong/3.png",
      description:
        "English learning app leveraging VAK pedagogy through music-driven activities.",
      tags: ["Unity", "C#", "Firebase", "Playfab"],
      liveLink: "lingosong.html", // Pastikan Anda memiliki halaman ini
      repoLink: "#",
      themeColor: "purple",
    },
    {
      id: 2,
      title: "Timescape 2",
      category: "Game Project",
      image: "images/Timescape/01.png",
      description:
        "A 3D multiplayer puzzle-platformer where players manipulate time to solve collaborative puzzles.",
      tags: ["Unity", "C#", "Photon", "Multiplayer"],
      liveLink: "Timescape-detail.html", // Path ke halaman detail
      repoLink: "https://github.com/your-username/timescape2", // Ganti dengan link repo Anda
      themeColor: "purple",
    },
    {
      id: 3,
      title: "MathFalls",
      category: "Educational Game",
      image: "images/MathFalls/1.png",
      description:
        "An educational game to make learning math fun by catching correct answers and avoiding wrong ones.",
      tags: ["Unity", "C#", "Game Design"],
      liveLink: "mathfalls.html", // Pastikan Anda memiliki halaman ini
      repoLink: "#",
      themeColor: "cyan",
    },
    {
      id: 4,
      title: "Colorfun Signature",
      category: "Commercial Project",
      image: "images/colorfun/8.png",
      description:
        "Interactive game for brand activation at live events in collaboration with Signature Gudang Garam.",
      tags: ["Unity", "C#", "Event Integration"],
      liveLink: "colorfun.html",
      repoLink: "#", // Ganti jika ada
      themeColor: "red",
    },
    {
      id: 5,
      title: "Wingy",
      category: "Online Multiplayer Game",
      image: "images/wingy/4.png",
      description:
        "A feature-rich online multiplayer game with ranked modes, leaderboards, and an in-game shop.",
      tags: ["Unity", "C#", "Photon", "PlayFab"],
      liveLink: "wingy.html",
      repoLink: "#",
      themeColor: "cyan",
    },
    {
      id: 6,
      title: "LuxBeauty E-commerce",
      category: "Web App",
      image: "images/LuxBeauty/Picture1.png",
      description:
        "A full-featured e-commerce website built with the Codeigniter 4 framework for an academic project.",
      tags: ["Codeigniter 4", "PHP", "MySQL", "Bootstrap"],
      liveLink: "luxbeauty.html",
      repoLink: "https://github.com/your-username/luxbeauty",
      themeColor: "pink",
    },
    {
      id: 7,
      title: "Hilton In Tropical",
      category: "Adventure Game",
      image: "images/Hilton/4.png",
      description:
        "The second installment in the Hilton adventure series, set in a lush tropical forest with new mini-games.",
      tags: ["Unity", "C#", "2D Platformer"],
      liveLink: "hilton.html",
      repoLink: "#",
      themeColor: "green",
    },
    {
      id: 8,
      title: "Vacation Hotel",
      category: "Simulation Game",
      image: "images/Vacation/4.png",
      description:
        "A management simulation game where players take on the role of a housekeeper to complete tasks.",
      tags: ["Unity", "C#", "Simulation"],
      liveLink: "vacation.html",
      repoLink: "#",
      themeColor: "blue",
    },
  ];
  const projectGridContainer = document.getElementById(
    "project-grid-container"
  );
  const pageInfoSpan = document.getElementById("page-info");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const itemsPerPageProjects = 3;
  let currentPageProjects = 1;

  function getProjectCardHTML(project) {
    const colorMap = {
      cyan: {
        text: "text-cyan-400",
        bg: "bg-cyan-500",
        gradientFrom: "from-cyan-500",
        gradientTo: "to-purple-600",
      },
      purple: {
        text: "text-purple-400",
        bg: "bg-purple-500",
        gradientFrom: "from-purple-500",
        gradientTo: "to-pink-600",
      },
      blue: {
        text: "text-blue-400",
        bg: "bg-blue-500",
        gradientFrom: "from-blue-500",
        gradientTo: "to-green-600",
      },
      red: {
        text: "text-red-400",
        bg: "bg-red-500",
        gradientFrom: "from-red-500",
        gradientTo: "to-yellow-600",
      },
      green: {
        text: "text-green-400",
        bg: "bg-green-500",
        gradientFrom: "from-green-500",
        gradientTo: "to-teal-600",
      },
      pink: {
        text: "text-pink-400",
        bg: "bg-pink-500",
        gradientFrom: "from-pink-500",
        gradientTo: "to-orange-600",
      },
    };
    const theme = colorMap[project.themeColor] || colorMap.cyan;
    return `<div class="project-card border-animated rounded-lg p-px group"><div class="bg-gray-900 bg-opacity-80 rounded-lg overflow-hidden h-full flex flex-col"><div class="h-48 bg-gradient-to-br ${
      theme.gradientFrom
    } ${theme.gradientTo} relative overflow-hidden"><img src="${
      project.image
    }" alt="${
      project.title
    }" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"><div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div></div><div class="p-6 flex flex-col flex-grow"><div class="flex justify-between items-start mb-3"><h3 class="text-xl font-bold text-gray-100 group-hover:text-[var(--primary)] transition-colors duration-300">${
      project.title
    }</h3><span class="${theme.bg}/20 ${
      theme.text
    } text-xs px-2 py-1 rounded-full mono self-start">${
      project.category
    }</span></div><p class="text-gray-400 text-sm mb-4 flex-grow">${
      project.description
    }</p><div class="flex flex-wrap gap-2 mb-5">${project.tags
      .map(
        (tag) =>
          `<span class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">${tag}</span>`
      )
      .join(
        ""
      )}</div><div class="flex justify-between items-center mt-auto"><a href="${
      project.liveLink
    }" target="_blank" rel="noopener noreferrer" class="${
      theme.text
    } hover:opacity-80 transition-opacity duration-300 flex items-center text-sm font-medium"><span>View Project</span><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a><a href="${
      project.repoLink
    }" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-gray-300 transition-colors duration-300"><i class="fab fa-github text-xl"></i></a></div></div></div></div>`;
  }

  function displayProjects() {
    if (!projectGridContainer) return;
    projectGridContainer.innerHTML = "";
    const startIndex = (currentPageProjects - 1) * itemsPerPageProjects;
    const endIndex = startIndex + itemsPerPageProjects;
    const paginatedItems = allProjects.slice(startIndex, endIndex);
    paginatedItems.forEach((project) => {
      projectGridContainer.innerHTML += getProjectCardHTML(project);
    });
    updatePaginationControls();
  }

  function updatePaginationControls() {
    if (!pageInfoSpan || !prevPageBtn || !nextPageBtn) return;
    const totalPages = Math.ceil(allProjects.length / itemsPerPageProjects);
    pageInfoSpan.textContent = `Page ${currentPageProjects} of ${totalPages}`;
    prevPageBtn.disabled = currentPageProjects === 1;
    nextPageBtn.disabled =
      currentPageProjects === totalPages || totalPages === 0;
    if (totalPages <= 1) {
      // Hide controls if only one page or no projects
      prevPageBtn.parentElement.style.display = "none";
    } else {
      prevPageBtn.parentElement.style.display = "flex";
    }
  }

  if (prevPageBtn)
    prevPageBtn.addEventListener("click", () => {
      if (currentPageProjects > 1) {
        currentPageProjects--;
        displayProjects();
      }
    });
  if (nextPageBtn)
    nextPageBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(allProjects.length / itemsPerPageProjects);
      if (currentPageProjects < totalPages) {
        currentPageProjects++;
        displayProjects();
      }
    });

  if (projectGridContainer && allProjects.length > 0) {
    displayProjects();
  } else if (projectGridContainer) {
    updatePaginationControls(); /* Handle no projects case */
  }

  // --- Footer Current Year ---
  const currentYearElement = document.getElementById("current-year");
  if (currentYearElement)
    currentYearElement.textContent = String(new Date().getFullYear());

  // --- Intersection Observer for Section Animations ---
  const animatedSections = document.querySelectorAll(
    "section[id].section-hidden"
  );
  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("section-hidden");
          entry.target.classList.add("section-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  animatedSections.forEach((section) => {
    sectionObserver.observe(section);
  });
});
