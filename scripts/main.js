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

    // Email copying
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
});