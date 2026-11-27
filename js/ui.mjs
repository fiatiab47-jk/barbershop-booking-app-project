// Fetch an HTML file and put its content inside the 
// element that matches the selector
async function loadPartial(url, selector) {
    const response = await fetch(url);     // request the partial file
    const html = await response.text();    // read it as plain text
    document.querySelector(selector).innerHTML = html;      //insert it into the page
}

// Load the shared header and footer into every page
export async function loadHeaderfooter() {
    await  loadPartial("partials/header.html", "#site-header");
    await  loadPartial("partials/footer.html", "#site-footer");

    highlightCurrentPage();
    // The footer exist now, so we can now fill in the dates
    setFooterDates();
    setUpHamburger();       // the header exists now, the button can be found
}

// Open and close the mobile menu when the hamburger is clicked 
function setUpHamburger() { 
    const button = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");

    button.addEventListener('click', ()=>{
        const isOpen = nav.classList.toggle("open"); //Add or remove the "open" lass
        button.setAttribute("aria-expanded", isOpen); //tells screen readers the state

        // Scroll nav into view when opening on small screen
        if (isOpen) {
            // Smoothly scroll the whole page to the top
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

    });
}

// Hightlight the nav link for the page the user is on
function highlightCurrentPage() {
    // get the file name from address, like "booking.html"
    // if the address ends with "/", use "index.html"
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-links a");

    links.forEach(link => {
        // get the file name form this link's href
        const linkPage = link.getAttribute("href").split("/").pop();

        if (linkPage === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page") //tells screen readers too
        }
    });
}

// Fill in the current year and date this page was  last modified.
function setFooterDates() {
    document.querySelector("#currentYear").textContent = new Date().getFullYear();
    document.querySelector("#last-modified").textContent = document.lastModified;
}