let logo = document.getElementById("logo-name");

function updateSize() {
    if (window.innerWidth < 575) {
        logo.innerText = "Szép Adrián";
    } else {
        logo.innerText = "Szép Adrián Attila";
    }
}

updateSize();
window.addEventListener("resize", updateSize);

document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("enlargedImg");
    const closeBtn = document.querySelector(".close-btn");

    const images = document.querySelectorAll(".gallery-img");

    images.forEach(img => {
        img.style.cursor = 'pointer'; 
        
        img.addEventListener("click", function(event) {
            event.preventDefault();
            modalImg.src = this.getAttribute("data-highres"); 
            modal.style.display = "flex"; 
        });
    });

    closeBtn?.addEventListener("click", function() {
        modal.style.display = "none";
    });

    modal?.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    const emailWrapper = document.querySelector('.email-wrapper');
    const tooltipText = document.getElementById('secure-email');
    
    const emailAddress = "szepad06@gmail.com";

    if (emailWrapper && tooltipText) {
        emailWrapper.addEventListener('click', function() {
            navigator.clipboard.writeText(emailAddress).then(function() {
                
                tooltipText.innerText = "Copied!";
                tooltipText.style.color = "#4CAF50";
                
                setTimeout(function() {
                    tooltipText.innerText = emailAddress;
                    tooltipText.style.color = "";
                }, 2000);
                
            }).catch(function(err) {
                console.error('Failed to copy: ', err);
                tooltipText.innerText = "Failed to copy";
            });
        });
    }

    // Redirect from app to contact
    const urlParams = new URLSearchParams(window.location.search);
    const targetApp = urlParams.get('app');

    if (targetApp) {
        const subjectField = document.getElementById('subject');
        if (subjectField) {
            subjectField.value = `${targetApp} App Support`;
        }
    }

    // Web3Forms
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.8";
            submitBtn.style.cursor = "not-allowed";

            const subjectValue = document.getElementById('subject').value.toLowerCase();
            
            const PERSONAL_KEY = "2f5b69b6-a893-47c0-886d-cf8ab3b81161";
            const SUPPORT_KEY = "06f2b447-2c64-432e-812c-131b543fd41b";

            // If the subject contains "bulkr", route to support. Otherwise personal
            let activeKey = subjectValue.includes('bulkr') ? SUPPORT_KEY : PERSONAL_KEY;

            const formData = new FormData(contactForm);
            formData.append('access_key', activeKey);

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                });

                if (response.ok) {
                    // Success UI State
                    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sent Successfully!';
                    submitBtn.style.backgroundColor = "#27ae60"; // Slightly darker green
                    contactForm.reset(); 
                } else {
                    // API Error UI State
                    submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error sending';
                    submitBtn.style.backgroundColor = "#e74c3c"; // Red
                }
            } catch (error) {
                console.error("Form submission error:", error);
                // Network Error UI State
                submitBtn.innerHTML = '<i class="fa-solid fa-wifi"></i> Network Error';
                submitBtn.style.backgroundColor = "#e74c3c";
            }

            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.style.backgroundColor = ""; 
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
                submitBtn.disabled = false;
            }, 3000);
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const trailerBtn = document.getElementById('open-trailer-btn');
    const modal = document.getElementById('trailer-modal');
    const closeBtn = document.getElementById('close-trailer-btn');
    const video = document.getElementById('app-trailer-video');

    if (trailerBtn && modal) {
        // Open modal & Play video
        trailerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            if (video) video.play();
        });

        // Reusable Close Function (Pauses and resets video)
        const closeModal = () => {
            modal.classList.remove('active');
            if (video) {
                video.pause();
                video.currentTime = 0; 
            }
        };

        // Close on X button click
        closeBtn.addEventListener('click', closeModal);

        // Close on clicking outside the video (overlay click)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});