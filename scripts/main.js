// Shared script for every page. Each init function does nothing on pages
// that don't have the elements it needs.

// Web3Forms access keys are public by design. Messages whose subject mentions
// "mybulk" go to the app support inbox, everything else to the personal one.
const PERSONAL_KEY = "2f5b69b6-a893-47c0-886d-cf8ab3b81161";
const SUPPORT_KEY = "06f2b447-2c64-432e-812c-131b543fd41b";

initNav();
initGallery();
initTrailer();
initEmailCopy();
initContactForm();
initPrivacy();

// Mobile hamburger menu. The open/closed state lives in aria-expanded, which the CSS reads.
function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    if (!toggle) return;

    const setOpen = (open) => toggle.setAttribute("aria-expanded", String(open));

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".navbar")) setOpen(false);
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

// Projects page: thumbnails open a looping gameplay clip.
function initGallery() {
    const dialog = document.getElementById("gallery-dialog");
    if (!dialog) return;
    const video = dialog.querySelector("video");

    document.querySelectorAll(".gallery-item").forEach((item) => {
        item.addEventListener("click", () => {
            const thumb = item.querySelector("img");
            video.poster = thumb.src;
            video.src = item.dataset.video;
            video.setAttribute("aria-label", thumb.alt);
            dialog.showModal();
            video.play().catch(() => {});
        });
    });

    setupDialog(dialog, () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
    });
}

// Apps page: "Watch Video" opens the promo video.
function initTrailer() {
    const button = document.getElementById("open-trailer-btn");
    const dialog = document.getElementById("trailer-dialog");
    if (!button || !dialog) return;
    const video = dialog.querySelector("video");

    button.addEventListener("click", () => {
        dialog.showModal();
        video.play().catch(() => {});
    });

    setupDialog(dialog, () => {
        video.pause();
        video.currentTime = 0;
    });
}

// Contact page: the envelope icon copies the email address.
// If copying isn't possible, open the visitor's mail app instead.
function initEmailCopy() {
    const button = document.querySelector(".email-btn");
    if (!button) return;
    const email = button.dataset.email;
    const tooltip = button.querySelector(".tooltip-text");
    let timer;

    button.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(email);
        } catch {
            window.location.href = `mailto:${email}`;
            return;
        }
        tooltip.textContent = "Copied!";
        button.classList.add("is-copied");
        clearTimeout(timer);
        timer = setTimeout(() => {
            tooltip.textContent = email;
            button.classList.remove("is-copied");
        }, 2000);
    });
}

// Contact page: pre-fill the subject from ?app=..., then send the form through Web3Forms.
function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const subject = form.elements.subject;
    const submit = form.querySelector('button[type="submit"]');
    const status = document.getElementById("form-status");
    const originalLabel = submit.innerHTML;

    const app = new URLSearchParams(window.location.search).get("app");
    if (app) subject.value = `${app} App Support`;

    const showState = (html, stateClass, message) => {
        submit.innerHTML = html;
        submit.classList.remove("is-success", "is-error");
        if (stateClass) submit.classList.add(stateClass);
        status.textContent = message;
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submit.disabled = true;
        showState('<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Sending...', null, "Sending your message...");

        const data = new FormData(form);
        data.append("access_key", subject.value.toLowerCase().includes("mybulk") ? SUPPORT_KEY : PERSONAL_KEY);

        try {
            const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
            const result = await response.json().catch(() => ({}));
            if (response.ok && result.success !== false) {
                showState('<i class="fa-solid fa-check" aria-hidden="true"></i> Sent Successfully!', "is-success", "Your message was sent.");
                form.reset();
            } else {
                showState('<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Error sending', "is-error", "Sorry, the message could not be sent. Please try again.");
            }
        } catch (error) {
            console.error("Form submission error:", error);
            showState('<i class="fa-solid fa-wifi" aria-hidden="true"></i> Network Error', "is-error", "Network error. Please check your connection and try again.");
        }

        setTimeout(() => {
            showState(originalLabel, null, "");
            submit.disabled = false;
        }, 3000);
    });
}

// Privacy page: the policy text lives in privacy-content.html.
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
    }
}
