// Import headerfooter
import { loadHeaderfooter } from "./ui.mjs";
import ShopApi from "./ShopApi.mjs";    // default

loadHeaderfooter(); //Inserts shared header and 


// Create one object with the shop's location and country
const api = new ShopApi(5.70, -0.30, "GH");

// Weather for current day and the next two days
api.getWeather("2026-11-28").then((days) => console.log("Weather:", days));

// holidays for this year
api.getHolidays("2026").then((dates) => console.log("Weather:", dates));

// Is the day a holiday
api.findHoliday("2026-12-25").then((holiday) => console.log("Holiday:", holiday));
