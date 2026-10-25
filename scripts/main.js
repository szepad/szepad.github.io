// Shared script for every page. Each init function does nothing on pages
// that don't have the elements it needs.

// Web3Forms access keys are public by design. MyBulk support messages go to the
// app support inbox, everything else to the personal one.
const PERSONAL_KEY = "2f5b69b6-a893-47c0-886d-cf8ab3b81161";
const SUPPORT_KEY = "06f2b447-2c64-432e-812c-131b543fd41b";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

initNav();
initClips();
initEmailCopy();
initContactForm();
initPrivacy();

// Mobile menu. The open/closed state lives in aria-expanded, which the CSS reads.
function initNav() {
    const toggle = document.querySelector(".menu-toggle");
    if (!toggle) return;

    const setOpen = (open) => toggle.setAttribute("aria-expanded", String(open));

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".header-inner")) setOpen(false);
    });
}

// Close a <dialog> on its close button or a click on the dark area around the content.
// Escape is handled by the browser. onClose runs however the dialog was closed.
function setupDialog(dialog, onClose) {
    dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", onClose);
}

// Projects page: gameplay clips play muted on hover (mouse only),
// and open large in a popup on click or tap.
function initClips() {
    const dialog = document.getElementById("gallery-dialog");
    if (!dialog) return;
    const bigVideo = dialog.querySelector("video");

    document.querySelectorAll(".clip-btn").forEach((button) => {
        const preview = button.querySelector("video");

        const startPreview = () => {
            if (reducedMotion.matches) return;
            if (!preview.getAttribute("src")) preview.src = button.dataset.video;
            preview.play().then(() => button.classList.add("is-playing")).catch(() => {});
        };
        const stopPreview = () => {
            preview.pause();
            button.classList.remove("is-playing");
        };

        button.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "mouse") startPreview();
        });
        button.addEventListener("pointerleave", stopPreview);

        button.addEventListener("click", () => {
            stopPreview();
            bigVideo.poster = preview.poster;
            bigVideo.src = button.dataset.video;
            bigVideo.setAttribute("aria-label", button.getAttribute("aria-label").replace("Play ", ""));
            dialog.showModal();
            bigVideo.play().catch(() => {});
        });
    });

    setupDialog(dialog, () => {
        bigVideo.pause();
        bigVideo.removeAttribute("src");
        bigVideo.load();
    });
}

// Contact page: "Copy" copies the email address.
// If copying isn't possible, open the visitor's mail app instead.
function initEmailCopy() {
    const button = document.querySelector(".copy-btn");
    if (!button) return;
    const email = button.dataset.email;
    const status = document.getElementById("copy-status");
    let timer;

    button.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(email);
        } catch {
            window.location.href = `mailto:${email}`;
            return;
        }
        button.textContent = "Copied";
        button.classList.add("is-copied");
        if (status) status.textContent = "Email address copied.";
        clearTimeout(timer);
        timer = setTimeout(() => {
            button.textContent = "Copy";
            button.classList.remove("is-copied");
            if (status) status.textContent = "";
        }, 2000);
    });
}

// Contact page: pre-fill from ?app=..., then send the form through Web3Forms.
function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const subject = form.elements.subject;
    const submit = form.querySelector('button[type="submit"]');
    const status = document.getElementById("form-status");
    const originalLabel = submit.innerHTML;

    const app = new URLSearchParams(window.location.search).get("app");
    if (app) {
        subject.value = `${app} App Support`;
        if (app.toLowerCase() === "mybulk") form.elements.topic.value = "MyBulk support";
    }

    const isSupport = () =>
        form.elements.topic.value === "MyBulk support" || subject.value.toLowerCase().includes("mybulk");

    const showStatus = (message, stateClass) => {
        status.textContent = message;
        status.className = "form-status" + (stateClass ? ` ${stateClass}` : "");
    };

    // An old success/error message shouldn't linger once the visitor edits the form again.
    form.addEventListener("input", () => {
        if (status.textContent) showStatus("", null);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submit.disabled = true;
        submit.textContent = "Sending...";
        showStatus("", null);

        const data = new FormData(form);
        data.append("access_key", isSupport() ? SUPPORT_KEY : PERSONAL_KEY);

        try {
            const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
            const result = await response.json().catch(() => ({}));
            if (response.ok && result.success !== false) {
                showStatus("Thanks, your message was sent.", "is-success");
                form.reset();
            } else {
                showStatus("Your message could not be sent. Please try again, or email me directly.", "is-error");
            }
        } catch (error) {
            console.error("Form submission error:", error);
            showStatus("Network error. Check your connection and try again.", "is-error");
        }

        submit.innerHTML = originalLabel;
        submit.disabled = false;
    });
}

// Privacy page: the policy text lives in privacy-content.html.
// Once it's loaded, build the table of contents from its section headings.
async function initPrivacy() {
    const container = document.getElementById("policy-container");
    if (!container) return;

    try {
        const response = await fetch("privacy-content.html");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        container.innerHTML = await response.text();
    } catch (error) {
        console.error("Could not load the privacy policy:", error);
        container.innerHTML = `
            <h3 class="policy-error">Couldn't load the privacy policy.</h3>
            <p>You can <a href="privacy-content.html">open it directly here</a>.</p>`;
        return;
    }

    buildToc(container);
}

function buildToc(container) {
    const toc = document.querySelector(".doc-toc");
    const list = toc?.querySelector(".toc-list");
    const headings = container.querySelectorAll("h3");
    if (!toc || !list || headings.length === 0) return;

    headings.forEach((heading, i) => {
        heading.id = `section-${i + 1}`;
        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        const item = document.createElement("li");
        item.append(link);
        list.append(item);
    });

    // Always open on wide screens (where it's a sidebar), collapsed on small ones.
    const wide = window.matchMedia("(min-width: 1001px)");
    const sync = () => { toc.open = wide.matches; };
    sync();
    wide.addEventListener("change", sync);
    toc.hidden = false;

    // On small screens, close the list after jumping to a section.
    list.addEventListener("click", (e) => {
        if (e.target.closest("a") && !wide.matches) toc.open = false;
    });
}
