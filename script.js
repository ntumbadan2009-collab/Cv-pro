/* ============================================================
   CV-PRO — GÉNÉRATEUR DE CV PROFESSIONNEL
   VERSION 3.0
   ============================================================

   Fonctionnalités :
   - Édition temps réel
   - Sauvegarde automatique
   - LocalStorage
   - 5 templates
   - Couleur personnalisée
   - Export PNG
   - Export HD
   - Export PDF
   - Impression
   - Partage via URL
   - Web Share API
   - Prévisualisation mobile
   - Drag & Drop des sections
   - Compteur de générations
   - Dark mode
   - Publicité
   - Système Premium
   - Photo de profil
   - Toasts
   - Statistiques
   - Responsive
   ============================================================ */


/* ============================================================
   1. CONFIGURATION
   ============================================================ */

const APP = {

    version: "3.0",

    isPremium:
        localStorage.getItem("cvPremium") === "true",

    darkMode:
        localStorage.getItem("darkMode") === "true",

    template:
        localStorage.getItem("cvTemplate") || "moderne",

    generationCount:
        Number(localStorage.getItem("cvGenerationCount") || 0),

    adIndex: 0,

    adInterval: null,

    videoInterval: null,

    videoTime: 0,

    requiredTime: 30,

    photoData: null,

    defaults: {
        nom: "Jean Dupont",

        titre: "Développeur Full-Stack",

        email: "jean@email.com",

        tel: "06 12 34 56 78",

        adresse: "Paris, France",

        siteweb: "jeandupont.com",

        competences:
            "JavaScript, React, Node.js, Python, Docker",

        experience:
            "Lead Frontend - Google (5 ans)\n" +
            "Développeur Full-Stack - Startup XYZ (3 ans)\n" +
            "Stagiaire - Agence Web (1 an)",

        formation:
            "Master Informatique - Sorbonne Université\n" +
            "Licence Mathématiques - Université Paris-Sud",

        couleur: "#1976D2"
    }

};


/* ============================================================
   2. UTILITAIRES
   ============================================================ */

const $ = (id) =>
    document.getElementById(id);


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function safeText(value, fallback = "") {

    const text = String(value ?? "").trim();

    return text || fallback;

}


function hexToRgb(hex) {

    hex = hex.replace("#", "");

    if (hex.length === 3) {

        hex =
            hex[0] + hex[0] +
            hex[1] + hex[1] +
            hex[2] + hex[2];

    }

    const number =
        parseInt(hex, 16);

    return {

        r: (number >> 16) & 255,

        g: (number >> 8) & 255,

        b: number & 255

    };

}


function rgba(hex, alpha) {

    const rgb =
        hexToRgb(hex);

    return `rgba(
        ${rgb.r},
        ${rgb.g},
        ${rgb.b},
        ${alpha}
    )`;

}


/* ============================================================
   3. DOM
   ============================================================ */

const DOM = {

    nom: $("nom"),

    titre: $("titre"),

    email: $("email"),

    tel: $("tel"),

    adresse: $("adresse"),

    siteweb: $("siteweb"),

    competences: $("competences"),

    experience: $("experience"),

    formation: $("formation"),

    couleur: $("couleur"),

    templateSelect:
        $("templateSelect"),

    previewNom:
        $("previewNom"),

    previewTitre:
        $("previewTitre"),

    previewEmail:
        $("previewEmail"),

    previewTel:
        $("previewTel"),

    previewAdresse:
        $("previewAdresse"),

    previewSite:
        $("previewSite"),

    previewCompetences:
        $("previewCompetences"),

    previewExp:
        $("previewExp"),

    previewForm:
        $("previewForm"),

    cvHeader:
        $("cvHeader"),

    cvFooter:
        $("cvFooter"),

    cvPreview:
        $("cvPreview"),

    exportBtn:
        $("exportBtn"),

    exportPremiumBtn:
        $("exportPremiumBtn"),

    premiumMsg:
        $("premiumMsg"),

    versionBadge:
        $("versionBadge"),

    themeToggle:
        $("themeToggle"),

    resetBtn:
        $("resetBtn"),

    printBtn:
        $("printBtn"),

    fullscreenBtn:
        $("fullscreenBtn"),

    shareBtn:
        $("shareBtn"),

    feedbackBtn:
        $("feedbackBtn"),

    adBanner:
        $("adBanner"),

    adText:
        $("adText"),

    adLink:
        $("adLink"),

    adClose:
        $("adClose"),

    videoOverlay:
        $("videoAdOverlay"),

    adVideo:
        $("adVideo"),

    videoTimer:
        $("videoTimer"),

    videoSkipBtn:
        $("videoSkipBtn"),

    videoAdMsg:
        $("videoAdMsg"),

    videoProgressBar:
        $("videoProgressBar"),

    videoCloseBtn:
        $("videoCloseBtn"),

    charCount:
        $("charCount"),

    wordCount:
        $("wordCount"),

    toastContainer:
        $("toastContainer")

};


/* ============================================================
   4. VÉRIFICATION DOM
   ============================================================ */

Object.entries(DOM).forEach(
    ([name, element]) => {

        if (!element) {

            console.warn(
                `CV-Pro : élément #${name} introuvable`
            );

        }

    }
);


/* ============================================================
   5. TOAST
   ============================================================ */

function showToast(
    message,
    type = "info",
    duration = 3000
) {

    if (!DOM.toastContainer) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;

    toast.textContent =
        message;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(30px)";

        setTimeout(
            () => toast.remove(),
            350
        );

    }, duration);

}


/* ============================================================
   6. DONNÉES CV
   ============================================================ */

function getCVData() {

    return {

        nom:
            DOM.nom?.value || "",

        titre:
            DOM.titre?.value || "",

        email:
            DOM.email?.value || "",

        tel:
            DOM.tel?.value || "",

        adresse:
            DOM.adresse?.value || "",

        siteweb:
            DOM.siteweb?.value || "",

        competences:
            DOM.competences?.value || "",

        experience:
            DOM.experience?.value || "",

        formation:
            DOM.formation?.value || "",

        couleur:
            DOM.couleur?.value || "#1976D2",

        template:
            DOM.templateSelect?.value || "moderne",

        photo:
            APP.photoData || null

    };

}


/* ============================================================
   7. SAUVEGARDE
   ============================================================ */

function saveData() {

    try {

        localStorage.setItem(
            "cvData",
            JSON.stringify(
                getCVData()
            )
        );

        localStorage.setItem(
            "cvTemplate",
            DOM.templateSelect?.value ||
            "moderne"
        );

    } catch (error) {

        console.warn(
            "Impossible de sauvegarder",
            error
        );

    }

}


function loadData() {

    try {

        const saved =
            localStorage.getItem("cvData");

        if (!saved) return;

        const data =
            JSON.parse(saved);

        const fields = [
            "nom",
            "titre",
            "email",
            "tel",
            "adresse",
            "siteweb",
            "competences",
            "experience",
            "formation",
            "couleur"
        ];

        fields.forEach(key => {

            if (
                DOM[key] &&
                data[key] !== undefined
            ) {

                DOM[key].value =
                    data[key];

            }

        });

        if (
            DOM.templateSelect &&
            data.template
        ) {

            DOM.templateSelect.value =
                data.template;

        }

        if (data.photo) {

            APP.photoData =
                data.photo;

        }

    } catch (error) {

        console.warn(
            "Erreur chargement CV",
            error
        );

    }

}


/* ============================================================
   8. APERÇU EN TEMPS RÉEL
   ============================================================ */

function updatePreview() {

    if (!DOM.cvPreview) return;

    const data =
        getCVData();

    const color =
        data.couleur;

    const template =
        data.template;


    /* --------------------------------------------------------
       IDENTITÉ
       -------------------------------------------------------- */

    if (DOM.previewNom) {

        DOM.previewNom.textContent =
            safeText(
                data.nom,
                "Nom Prénom"
            );

    }


    if (DOM.previewTitre) {

        DOM.previewTitre.textContent =
            safeText(
                data.titre,
                "Titre professionnel"
            );

    }


    /* --------------------------------------------------------
       CONTACT
       -------------------------------------------------------- */

    if (DOM.previewEmail) {

        DOM.previewEmail.textContent =
            `📧 ${
                safeText(
                    data.email,
                    "email@exemple.com"
                )
            }`;

    }


    if (DOM.previewTel) {

        DOM.previewTel.textContent =
            `📱 ${
                safeText(
                    data.tel,
                    "Téléphone"
                )
            }`;

    }


    if (DOM.previewAdresse) {

        DOM.previewAdresse.textContent =
            `📍 ${
                safeText(
                    data.adresse,
                    "Adresse"
                )
            }`;

    }


    if (DOM.previewSite) {

        DOM.previewSite.textContent =
            `🌐 ${
                safeText(
                    data.siteweb,
                    "monsite.com"
                )
            }`;

    }


    /* --------------------------------------------------------
       COMPÉTENCES
       -------------------------------------------------------- */

    if (DOM.previewCompetences) {

        const skills =
            data.competences
                .split(",")
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(Boolean);

        if (skills.length) {

            DOM.previewCompetences.innerHTML =
                skills
                    .map(
                        skill =>
                            `<span class="skill-tag"
                                   style="background:${escapeHTML(color)}">
                                ${escapeHTML(skill)}
                             </span>`
                    )
                    .join("");

        } else {

            DOM.previewCompetences.innerHTML =
                `<span class="skill-tag"
                       style="background:#999">
                    Aucune compétence
                 </span>`;

        }

    }


    /* --------------------------------------------------------
       EXPÉRIENCE
       -------------------------------------------------------- */

    if (DOM.previewExp) {

        DOM.previewExp.textContent =
            safeText(
                data.experience,
                "Expérience professionnelle..."
            );

    }


    /* --------------------------------------------------------
       FORMATION
       -------------------------------------------------------- */

    if (DOM.previewForm) {

        DOM.previewForm.textContent =
            safeText(
                data.formation,
                "Formation..."
            );

    }


    /* --------------------------------------------------------
       COULEUR
       -------------------------------------------------------- */

    document.documentElement
        .style.setProperty(
            "--primary",
            color
        );


    if (DOM.cvHeader) {

        DOM.cvHeader.style.borderBottomColor =
            color;

    }


    /* --------------------------------------------------------
       TEMPLATE
       -------------------------------------------------------- */

    DOM.cvPreview.className =
        `cv-preview template-${template}`;


    /* --------------------------------------------------------
       PHOTO
       -------------------------------------------------------- */

    updatePhotoPreview();


    /* --------------------------------------------------------
       STATISTIQUES
       -------------------------------------------------------- */

    updateStats();


    /* --------------------------------------------------------
       SAUVEGARDE
       -------------------------------------------------------- */

    saveData();

}


/* ============================================================
   9. STATISTIQUES
   ============================================================ */

function updateStats() {

    const data =
        getCVData();

    const text = [
        data.nom,
        data.titre,
        data.email,
        data.tel,
        data.adresse,
        data.siteweb,
        data.competences,
        data.experience,
        data.formation
    ].join(" ");

    const characters =
        text.length;

    const words =
        text
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;


    if (DOM.charCount) {

        DOM.charCount.textContent =
            `${characters} caractères`;

    }


    if (DOM.wordCount) {

        DOM.wordCount.textContent =
            `${words} mots`;

    }

}


/* ============================================================
   10. ÉCOUTE DES CHAMPS
   ============================================================ */

const fields = [

    DOM.nom,
    DOM.titre,
    DOM.email,
    DOM.tel,
    DOM.adresse,
    DOM.siteweb,
    DOM.competences,
    DOM.experience,
    DOM.formation,
    DOM.couleur,
    DOM.templateSelect

].filter(Boolean);


fields.forEach(field => {

    field.addEventListener(
        "input",
        updatePreview
    );

    field.addEventListener(
        "change",
        updatePreview
    );

});


/* ============================================================
   11. TEMPLATES
   ============================================================ */

function improveTemplates() {

    if (!DOM.templateSelect) return;

    const existing =
        [...DOM.templateSelect.options]
            .map(option => option.value);

    const templates = [

        {
            value: "minimaliste",
            label: "Minimaliste"
        },

        {
            value: "colore",
            label: "Coloré"
        }

    ];

    templates.forEach(template => {

        if (
            !existing.includes(
                template.value
            )
        ) {

            const option =
                document.createElement("option");

            option.value =
                template.value;

            option.textContent =
                template.label;

            DOM.templateSelect.appendChild(
                option
            );

        }

    });

}


improveTemplates();


/* ============================================================
   12. DARK MODE
   ============================================================ */

function applyTheme() {

    document.body.classList.toggle(
        "dark",
        APP.darkMode
    );

    if (DOM.themeToggle) {

        DOM.themeToggle.textContent =
            APP.darkMode
                ? "☀️"
                : "🌙";

    }

    localStorage.setItem(
        "darkMode",
        APP.darkMode
    );

}


if (DOM.themeToggle) {

    DOM.themeToggle.addEventListener(
        "click",
        () => {

            APP.darkMode =
                !APP.darkMode;

            applyTheme();

            showToast(
                APP.darkMode
                    ? "🌙 Mode sombre activé"
                    : "☀️ Mode clair activé",
                "info"
            );

        }
    );

}


/* ============================================================
   13. COMPTEUR DE GÉNÉRATIONS
   ============================================================ */

function registerGeneration() {

    APP.generationCount++;

    localStorage.setItem(
        "cvGenerationCount",
        APP.generationCount
    );

    updateGenerationCounter();

}


function updateGenerationCounter() {

    let counter =
        document.getElementById(
            "generationCounter"
        );

    if (!counter) {

        counter =
            document.createElement("span");

        counter.id =
            "generationCounter";

        counter.className =
            "generation-counter";

        const headerRight =
            document.querySelector(
                ".header-right"
            );

        if (headerRight) {

            headerRight.insertBefore(
                counter,
                headerRight.firstChild
            );

        }

    }

    counter.textContent =
        `📄 ${APP.generationCount} CV${
            APP.generationCount > 1
                ? "s"
                : ""
        }`;

}


/* ============================================================
   14. PUBLICITÉS
   ============================================================ */

const ADS = [

    {
        text:
            "🚀 Créez votre site web gratuitement",
        link:
            "https://pages.github.com/"
    },

    {
        text:
            "💻 Découvrez les ressources MDN pour apprendre le Web",
        link:
            "https://developer.mozilla.org/"
    },

    {
        text:
            "⚡ Déployez vos projets rapidement",
        link:
            "https://vercel.com/"
    },

    {
        text:
            "🎓 Développez vos compétences numériques",
        link:
            "https://www.coursera.org/"
    }

];


function rotateAd() {

    if (
        !DOM.adText ||
        !DOM.adLink
    ) return;

    const ad =
        ADS[APP.adIndex];

    DOM.adText.textContent =
        ad.text;

    DOM.adLink.onclick =
        () => {

            window.open(
                ad.link,
                "_blank",
                "noopener,noreferrer"
            );

        };

    APP.adIndex =
        (APP.adIndex + 1) %
        ADS.length;

}


function startAdRotation() {

    rotateAd();

    APP.adInterval =
        setInterval(
            rotateAd,
            12000
        );

}


if (DOM.adClose) {

    DOM.adClose.addEventListener(
        "click",
        () => {

            DOM.adBanner.classList.add(
                "hidden"
            );

            if (APP.adInterval) {

                clearInterval(
                    APP.adInterval
                );

            }

        }
    );

}


/* ============================================================
   15. PREMIUM
   ============================================================ */

function updatePremiumUI() {

    if (!DOM.exportPremiumBtn) return;

    if (APP.isPremium) {

        DOM.exportPremiumBtn.disabled =
            false;

        DOM.exportPremiumBtn.textContent =
            "⭐ Export HD";

        if (DOM.premiumMsg) {

            DOM.premiumMsg.textContent =
                "✅ Export HD débloqué.";

            DOM.premiumMsg.className =
                "premium-msg";

        }

        if (DOM.versionBadge) {

            DOM.versionBadge.textContent =
                "⭐ Premium";

        }

    } else {

        DOM.exportPremiumBtn.disabled =
            false;

        DOM.exportPremiumBtn.textContent =
            "⭐ Débloquer HD";

        if (DOM.premiumMsg) {

            DOM.premiumMsg.textContent =
                "🔒 Regardez une publicité de 30 secondes pour débloquer l'export HD.";

        }

        if (DOM.versionBadge) {

            DOM.versionBadge.textContent =
                "Gratuit";

        }

    }

}


/* ============================================================
   16. CHARGEMENT D'UNE LIBRAIRIE
   ============================================================ */

function loadScript(src) {

    return new Promise(
        (resolve, reject) => {

            const existing =
                [...document.scripts]
                    .find(
                        script =>
                            script.src ===
                            src
                    );

            if (existing) {

                resolve();

                return;

            }

            const script =
                document.createElement(
                    "script"
                );

            script.src = src;

            script.onload =
                resolve;

            script.onerror =
                () =>
                    reject(
                        new Error(
                            `Impossible de charger ${src}`
                        )
                    );

            document.head.appendChild(
                script
            );

        }
    );

}


/* ============================================================
   17. HTML2CANVAS
   ============================================================ */

async function loadHtml2Canvas() {

    if (
        typeof html2canvas !==
        "undefined"
    ) {

        return;

    }

    await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
    );

}


/* ============================================================
   18. JSPDF
   ============================================================ */

async function loadJsPDF() {

    if (
        window.jspdf &&
        window.jspdf.jsPDF
    ) {

        return window.jspdf.jsPDF;

    }

    await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    );

    return window.jspdf.jsPDF;

}


/* ============================================================
   19. EXPORT PNG
   ============================================================ */

async function exportPNG(
    scale = 2,
    watermark = false
) {

    if (!DOM.cvPreview) {

        showToast(
            "❌ Aperçu du CV introuvable.",
            "error"
        );

        return;

    }


    try {

        showToast(
            "⏳ Génération du PNG...",
            "info"
        );


        await loadHtml2Canvas();


        const cv =
            DOM.cvPreview;


        cv.classList.add(
            "exporting"
        );


        let watermarkEl = null;


        if (watermark) {

            watermarkEl =
                document.createElement(
                    "div"
                );

            watermarkEl.textContent =
                "CV-Pro";

            watermarkEl.style.cssText = `
                position:absolute;
                right:15px;
                bottom:12px;
                color:rgba(0,0,0,.15);
                font-size:10px;
                font-weight:700;
                pointer-events:none;
                z-index:9999;
            `;

            cv.style.position =
                "relative";

            cv.appendChild(
                watermarkEl
            );

        }


        const canvas =
            await html2canvas(
                cv,
                {
                    scale,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor:
                        "#ffffff",
                    logging: false
                }
            );


        if (watermarkEl) {

            watermarkEl.remove();

        }


        cv.classList.remove(
            "exporting"
        );


        const link =
            document.createElement(
                "a"
            );

        link.download =
            `CV-${slugify(
                getCVData().nom
            ) || "professionnel"}.png`;

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        link.click();


        registerGeneration();


        showToast(
            "✅ CV PNG exporté !",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "❌ Impossible de générer le PNG.",
            "error"
        );

    }

}


/* ============================================================
   20. EXPORT PDF
   ============================================================ */

async function exportPDF() {

    try {

        showToast(
            "⏳ Génération du PDF...",
            "info"
        );


        await loadHtml2Canvas();

        const jsPDF =
            await loadJsPDF();


        const cv =
            DOM.cvPreview;


        cv.classList.add(
            "exporting"
        );


        const canvas =
            await html2canvas(
                cv,
                {
                    scale: 2.5,
                    useCORS: true,
                    backgroundColor:
                        "#ffffff",
                    logging: false
                }
            );


        cv.classList.remove(
            "exporting"
        );


        const imgData =
            canvas.toDataURL(
                "image/png"
            );


        const pdf =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );


        const pageWidth =
            210;

        const pageHeight =
            297;


        const ratio =
            Math.min(
                pageWidth /
                    canvas.width,

                pageHeight /
                    canvas.height
            );


        const width =
            canvas.width *
            ratio;

        const height =
            canvas.height *
            ratio;


        const x =
            (pageWidth - width) / 2;

        const y =
            (pageHeight - height) / 2;


        pdf.addImage(
            imgData,
            "PNG",
            x,
            y,
            width,
            height
        );


        pdf.save(
            `CV-${slugify(
                getCVData().nom
            ) || "professionnel"}.pdf`
        );


        registerGeneration();


        showToast(
            "✅ PDF créé avec succès !",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "❌ Impossible de générer le PDF.",
            "error"
        );

    }

}


/* ============================================================
   21. SLUG
   ============================================================ */

function slugify(text) {

    return String(text || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            "");

}


/* ============================================================
   22. EXPORT GRATUIT
   ============================================================ */

if (DOM.exportBtn) {

    DOM.exportBtn.addEventListener(
        "click",
        async () => {

            await exportPNG(
                1.5,
                true
            );

        }
    );

}


/* ============================================================
   23. EXPORT PREMIUM
   ============================================================ */

if (DOM.exportPremiumBtn) {

    DOM.exportPremiumBtn.addEventListener(
        "click",
        async () => {

            if (!APP.isPremium) {

                openVideoAd();

                return;

            }

            await exportPDF();

        }
    );

}


/* ============================================================
   24. PUBLICITÉ VIDÉO
   ============================================================ */

function openVideoAd() {

    if (!DOM.videoOverlay) {

        unlockPremium();

        return;

    }


    DOM.videoOverlay.style.display =
        "flex";


    APP.videoTime = 0;


    if (DOM.videoTimer) {

        DOM.videoTimer.textContent =
            "⏱️ 0s / 30s";

    }


    if (DOM.videoProgressBar) {

        DOM.videoProgressBar.style.width =
            "0%";

    }


    if (DOM.videoSkipBtn) {

        DOM.videoSkipBtn.disabled =
            true;

        DOM.videoSkipBtn.textContent =
            "⏳ Regardez 30s";

    }


    if (DOM.videoAdMsg) {

        DOM.videoAdMsg.className =
            "video-msg waiting";

        DOM.videoAdMsg.textContent =
            "📺 Regardez la publicité jusqu'à la fin.";

    }


    if (DOM.adVideo) {

        DOM.adVideo.currentTime = 0;

        DOM.adVideo.play()
            .catch(() => {});

    }


    if (APP.videoInterval) {

        clearInterval(
            APP.videoInterval
        );

    }


    APP.videoInterval =
        setInterval(
            () => {

                let current = 0;


                if (DOM.adVideo) {

                    current =
                        Number(
                            DOM.adVideo.currentTime
                        ) || 0;

                }


                APP.videoTime =
                    Math.max(
                        APP.videoTime,
                        current
                    );


                const percent =
                    Math.min(
                        100,
                        (
                            APP.videoTime /
                            APP.requiredTime
                        ) * 100
                    );


                if (DOM.videoProgressBar) {

                    DOM.videoProgressBar.style.width =
                        `${percent}%`;

                }


                if (DOM.videoTimer) {

                    DOM.videoTimer.textContent =
                        `⏱️ ${Math.floor(
                            APP.videoTime
                        )}s / 30s`;

                }


                if (
                    APP.videoTime >=
                    APP.requiredTime
                ) {

                    unlockVideoPremium();

                }

            },
            500
        );

}


function unlockVideoPremium() {

    if (APP.videoInterval) {

        clearInterval(
            APP.videoInterval
        );

        APP.videoInterval =
            null;

    }


    if (DOM.videoSkipBtn) {

        DOM.videoSkipBtn.disabled =
            false;

        DOM.videoSkipBtn.textContent =
            "✅ Débloquer l'export HD";

    }


    if (DOM.videoAdMsg) {

        DOM.videoAdMsg.className =
            "video-msg success";

        DOM.videoAdMsg.textContent =
            "🎉 Publicité terminée !";

    }


    if (DOM.adVideo) {

        DOM.adVideo.pause();

    }

}


function unlockPremium() {

    APP.isPremium =
        true;

    localStorage.setItem(
        "cvPremium",
        "true"
    );

    updatePremiumUI();

    closeVideoAd();

    showToast(
        "⭐ Export HD débloqué !",
        "success"
    );

}


function closeVideoAd() {

    if (DOM.videoOverlay) {

        DOM.videoOverlay.style.display =
            "none";

    }


    if (APP.videoInterval) {

        clearInterval(
            APP.videoInterval
        );

        APP.videoInterval =
            null;

    }


    if (DOM.adVideo) {

        DOM.adVideo.pause();

        try {

            DOM.adVideo.currentTime = 0;

        } catch {}

    }

}


if (DOM.videoSkipBtn) {

    DOM.videoSkipBtn.addEventListener(
        "click",
        () => {

            if (
                APP.videoTime >=
                APP.requiredTime
            ) {

                unlockPremium();

            }

        }
    );

}


if (DOM.videoCloseBtn) {

    DOM.videoCloseBtn.addEventListener(
        "click",
        closeVideoAd
    );

}


/* ============================================================
   25. IMPRESSION
   ============================================================ */

if (DOM.printBtn) {

    DOM.printBtn.addEventListener(
        "click",
        () => {

            window.print();

        }
    );

}


/* ============================================================
   26. PLEIN ÉCRAN
   ============================================================ */

if (DOM.fullscreenBtn) {

    DOM.fullscreenBtn.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await DOM.cvPreview
                        .requestFullscreen();

                } else {

                    await document
                        .exitFullscreen();

                }

            } catch {

                showToast(
                    "⚠️ Le plein écran n'est pas disponible.",
                    "warning"
                );

            }

        }
    );

}


/* ============================================================
   27. PRÉVISUALISATION MOBILE
   ============================================================ */

function openMobilePreview() {

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "modal-overlay";

    overlay.id =
        "mobilePreviewModal";


    overlay.innerHTML = `

        <div class="mobile-preview-modal">

            <button
                class="modal-close"
                id="closeMobilePreview"
                aria-label="Fermer"
            >
                ✕
            </button>

            <h3>
                📱 Prévisualisation mobile
            </h3>

            <div class="phone-frame">

                <div class="phone-screen">

                    <div
                        class="mobile-preview-container"
                        id="mobilePreviewContainer"
                    ></div>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const container =
        document.getElementById(
            "mobilePreviewContainer"
        );


    const clone =
        DOM.cvPreview.cloneNode(
            true
        );


    clone.removeAttribute("id");


    container.appendChild(
        clone
    );


    document
        .getElementById(
            "closeMobilePreview"
        )
        .addEventListener(
            "click",
            () => overlay.remove()
        );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                overlay.remove();

            }

        }
    );

}


/* ============================================================
   28. BOUTON MOBILE DYNAMIQUE
   ============================================================ */

function createMobileButton() {

    const actions =
        document.querySelector(
            ".preview-actions"
        );

    if (!actions) return;


    if (
        document.getElementById(
            "mobilePreviewBtn"
        )
    ) return;


    const button =
        document.createElement(
            "button"
        );

    button.id =
        "mobilePreviewBtn";

    button.className =
        "icon-btn";

    button.title =
        "Prévisualisation mobile";

    button.textContent =
        "📱";


    button.addEventListener(
        "click",
        openMobilePreview
    );


    actions.appendChild(
        button
    );

}


createMobileButton();


/* ============================================================
   29. PARTAGE URL
   ============================================================ */

function encodeCVData() {

    const data =
        getCVData();

    const json =
        JSON.stringify(data);

    return btoa(
        encodeURIComponent(json)
    );

}


function decodeCVData(encoded) {

    try {

        const json =
            decodeURIComponent(
                atob(encoded)
            );

        return JSON.parse(json);

    } catch {

        return null;

    }

}


function createShareURL() {

    const encoded =
        encodeCVData();

    const url =
        new URL(
            window.location.href
        );

    url.search = "";

    url.hash =
        `cv=${encoded}`;

    return url.toString();

}


function loadCVFromURL() {

    const hash =
        window.location.hash;


    if (
        !hash.startsWith("#cv=")
    ) return;


    const encoded =
        hash.substring(4);


    const data =
        decodeCVData(encoded);


    if (!data) {

        showToast(
            "⚠️ Le CV partagé est invalide.",
            "error"
        );

        return;

    }


    const fields = [

        "nom",
        "titre",
        "email",
        "tel",
        "adresse",
        "siteweb",
        "competences",
        "experience",
        "formation",
        "couleur"

    ];


    fields.forEach(key => {

        if (
            DOM[key] &&
            data[key] !== undefined
        ) {

            DOM[key].value =
                data[key];

        }

    });


    if (
        DOM.templateSelect &&
        data.template
    ) {

        DOM.templateSelect.value =
            data.template;

    }


    if (data.photo) {

        APP.photoData =
            data.photo;

    }


    updatePreview();

    showToast(
        "🔗 CV partagé chargé !",
        "success"
    );

}


async function shareCV() {

    const url =
        createShareURL();


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "Mon CV - CV-Pro",

                text:
                    "Découvrez mon CV",

                url

            });

            return;

        } catch {

            // L'utilisateur peut avoir annulé.

        }

    }


    try {

        await navigator.clipboard
            .writeText(url);

        showToast(
            "🔗 Lien du CV copié !",
            "success"
        );

    } catch {

        openShareModal(url);

    }

}


function openShareModal(url) {

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "modal-overlay";


    overlay.innerHTML = `

        <div class="share-modal">

            <button
                class="modal-close"
                id="closeShareModal"
            >
                ✕
            </button>

            <h3>
                🔗 Partager votre CV
            </h3>

            <p>
                Toute personne possédant ce lien
                pourra charger les données du CV.
            </p>

            <div class="share-url-wrapper">

                <input
                    id="shareURL"
                    class="form-input"
                    value="${escapeHTML(url)}"
                    readonly
                >

                <button
                    id="copyShareURL"
                    class="btn btn-primary"
                >
                    📋 Copier
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    document
        .getElementById(
            "copyShareURL"
        )
        .addEventListener(
            "click",
            async () => {

                await navigator.clipboard
                    .writeText(url);

                showToast(
                    "✅ Lien copié !",
                    "success"
                );

            }
        );


    document
        .getElementById(
            "closeShareModal"
        )
        .addEventListener(
            "click",
            () => overlay.remove()
        );

}


if (DOM.shareBtn) {

    DOM.shareBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            shareCV();

        }
    );

}


/* ============================================================
   30. PHOTO DE PROFIL
   ============================================================ */

function createPhotoUploader() {

    const editor =
        document.querySelector(
            ".editor-panel"
        );

    if (!editor) return;


    if (
        document.getElementById(
            "photoInput"
        )
    ) return;


    const group =
        document.createElement(
            "div"
        );

    group.className =
        "form-group";


    group.innerHTML = `

        <label>
            📷 Photo de profil
        </label>

        <input
            type="file"
            id="photoInput"
            class="form-input"
            accept="image/png,image/jpeg,image/webp"
        >

        <small class="field-help">
            JPG, PNG ou WebP — recommandé : photo carrée.
        </small>

    `;


    const colorGroup =
        DOM.couleur?.closest(
            ".form-group"
        );


    if (colorGroup) {

        editor.insertBefore(
            group,
            colorGroup
        );

    } else {

        editor.appendChild(
            group
        );

    }


    const input =
        document.getElementById(
            "photoInput"
        );


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];

            if (!file) return;


            if (
                file.size >
                2 * 1024 * 1024
            ) {

                showToast(
                    "⚠️ Image trop volumineuse. Maximum 2 Mo.",
                    "warning"
                );

                input.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    APP.photoData =
                        reader.result;

                    saveData();

                    updatePhotoPreview();

                    showToast(
                        "📷 Photo ajoutée !",
                        "success"
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


function updatePhotoPreview() {

    if (!DOM.cvPreview) return;


    const header =
        DOM.cvHeader;

    if (!header) return;


    let photo =
        header.querySelector(
            ".cv-photo"
        );


    let avatar =
        header.querySelector(
            ".cv-avatar"
        );


    if (APP.photoData) {

        if (!photo) {

            photo =
                document.createElement(
                    "img"
                );

            photo.className =
                "cv-photo";

            photo.alt =
                "Photo de profil";


            if (avatar) {

                avatar.replaceWith(
                    photo
                );

            } else {

                header.prepend(
                    photo
                );

            }

        }


        photo.src =
            APP.photoData;


        if (avatar) {

            avatar.remove();

        }

    }

}


/* ============================================================
   31. DRAG & DROP DES SECTIONS
   ============================================================ */

function enableSectionDragDrop() {

    const body =
        DOM.cvPreview?.querySelector(
            ".cv-body"
        );

    if (!body) return;


    const sections =
        [...body.querySelectorAll(
            ".cv-section"
        )];


    sections.forEach(
        (section, index) => {

            section.draggable =
                true;

            section.dataset.sectionIndex =
                index;

            section.style.cursor =
                "grab";


            section.addEventListener(
                "dragstart",
                event => {

                    section.classList.add(
                        "dragging"
                    );

                    event.dataTransfer.effectAllowed =
                        "move";

                    event.dataTransfer.setData(
                        "text/plain",
                        ""
                    );

                }
            );


            section.addEventListener(
                "dragend",
                () => {

                    section.classList.remove(
                        "dragging"
                    );

                    saveSectionOrder();

                }
            );


            section.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();

                    const dragging =
                        body.querySelector(
                            ".dragging"
                        );

                    if (
                        !dragging ||
                        dragging === section
                    ) return;


                    const rect =
                        section.getBoundingClientRect();


                    const middle =
                        rect.top +
                        rect.height / 2;


                    if (
                        event.clientY <
                        middle
                    ) {

                        body.insertBefore(
                            dragging,
                            section
                        );

                    } else {

                        body.insertBefore(
                            dragging,
                            section.nextSibling
                        );

                    }

                }
            );

        }
    );

}


function saveSectionOrder() {

    const sections =
        DOM.cvPreview?.querySelectorAll(
            ".cv-section"
        );

    if (!sections) return;


    const order =
        [...sections]
            .map(
                section =>
                    section.querySelector(
                        "h5"
                    )?.textContent || ""
            );


    localStorage.setItem(
        "cvSectionOrder",
        JSON.stringify(order)
    );

}


function restoreSectionOrder() {

    const body =
        DOM.cvPreview?.querySelector(
            ".cv-body"
        );

    if (!body) return;


    const saved =
        localStorage.getItem(
            "cvSectionOrder"
        );


    if (!saved) {

        enableSectionDragDrop();

        return;

    }


    try {

        const order =
            JSON.parse(saved);


        order.forEach(title => {

            const section =
                [...body.children]
                    .find(
                        element =>
                            element
                                .querySelector(
                                    "h5"
                                )
                                ?.textContent ===
                            title
                    );


            if (section) {

                body.appendChild(
                    section
                );

            }

        });

    } catch {}

    enableSectionDragDrop();

}


restoreSectionOrder();


/* ============================================================
   32. BOUTON DE RÉINITIALISATION
   ============================================================ */

if (DOM.resetBtn) {

    DOM.resetBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "🔄 Réinitialiser complètement votre CV ?"
                );


            if (!confirmed) return;


            Object.entries(
                APP.defaults
            ).forEach(
                ([key, value]) => {

                    if (DOM[key]) {

                        DOM[key].value =
                            value;

                    }

                }
            );


            if (DOM.templateSelect) {

                DOM.templateSelect.value =
                    "moderne";

            }


            APP.photoData =
                null;


            localStorage.removeItem(
                "cvData"
            );

            localStorage.removeItem(
                "cvSectionOrder"
            );

            localStorage.removeItem(
                "cvPremium"
            );


            APP.isPremium =
                false;


            updatePreview();

            updatePremiumUI();

            showToast(
                "🔄 CV réinitialisé !",
                "info"
            );

        }
    );

}


/* ============================================================
   33. FEEDBACK
   ============================================================ */

if (DOM.feedbackBtn) {

    DOM.feedbackBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const message =
                prompt(
                    "💬 Votre suggestion ou votre avis :"
                );


            if (
                message &&
                message.trim()
            ) {

                showToast(
                    "🙏 Merci pour votre retour !",
                    "success"
                );


                console.log(
                    "Feedback:",
                    message
                );

            }

        }
    );

}


/* ============================================================
   34. AUTOSAVE
   ============================================================ */

setInterval(
    saveData,
    5000
);


window.addEventListener(
    "beforeunload",
    saveData
);


/* ============================================================
   35. CONNEXION
   ============================================================ */

window.addEventListener(
    "online",
    () => {

        showToast(
            "🌐 Connexion rétablie.",
            "success"
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        showToast(
            "📡 Mode hors ligne. Les données restent sauvegardées.",
            "warning"
        );

    }
);


/* ============================================================
   36. RACCOURCIS CLAVIER
   ============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.key.toLowerCase() ===
                "s"
        ) {

            event.preventDefault();

            saveData();

            showToast(
                "💾 CV sauvegardé !",
                "success"
            );

        }


        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.key.toLowerCase() ===
                "p"
        ) {

            event.preventDefault();

            window.print();

        }

    }
);


/* ============================================================
   37. INITIALISATION
   ============================================================ */

function init() {

    console.log(
        "🚀 CV-Pro v3.0"
    );


    loadData();

    loadCVFromURL();

    applyTheme();

    improveTemplates();

    updatePreview();

    updatePremiumUI();

    updateGenerationCounter();

    createPhotoUploader();

    restoreSectionOrder();

    startAdRotation();


    console.log(
        "✅ Édition temps réel"
    );

    console.log(
        "✅ Sauvegarde automatique"
    );

    console.log(
        "✅ 5 templates"
    );

    console.log(
        "✅ Export PNG"
    );

    console.log(
        "✅ Export PDF"
    );

    console.log(
        "✅ Partage URL"
    );

    console.log(
        "✅ Prévisualisation mobile"
    );

    console.log(
        "✅ Photo de profil"
    );

    console.log(
        "✅ Drag & Drop"
    );

    console.log(
        "✅ Analytics local"
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();

}


/* ============================================================
   38. API DEBUG
   ============================================================ */

window.CVPro = {

    app: APP,

    dom: DOM,

    getData:
        getCVData,

    update:
        updatePreview,

    save:
        saveData,

    exportPNG,

    exportPDF,

    share:
        shareCV,

    showToast

};


console.log(
    "💯 CV-Pro prêt."
);