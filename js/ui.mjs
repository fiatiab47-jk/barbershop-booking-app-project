// Fetch an HTML file and put its content inside the 
// element that matches the selector
async function loadPartial(url, selector) {
    const response = await fetch(url);     // request the partial file
    const html = await response.text();    // read it as plain text
    document.querySelector(selector).innerHTML = html;      //insert it into the page
}

// Load the shared header and footer into every page
export async function loadHeaderfooter() {
    await  loadPartial("/partials/header.html", "#site-header");
    await  loadPartial("/partials/footer.html", "#site-footer");
    // The footer exist now, so we can now fill in the dates
    setFooterDates();
}
// Fill in the current year and date this page was  last modified.
function setFooterDates() {
    document.querySelector("#currentYear").textContent = new Date().getFullYear();
    document.querySelector("#last-modified").textContent = document.lastModified;
}