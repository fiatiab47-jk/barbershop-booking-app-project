
// Helper funtion
// Turn a Date object into text like "2026-11-28"
function formatDate(date) {
    const year = date.getFullYear();
    // Month start at 0, so add 1
    const month = String(date.getMonth() + 1).padStart(2, "0");
    // padStart makes "5" into "05" 
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Add days to a date text like "2026-11-28". Returns a new text date.
function addDays(dateString, amount) {
    // Creates a data object
    const date = new Date(`${dateString}T00:00:00`);    // local midnight so no time zone shift
    date.setDate(date.getDate() + amount);  //JS automatically adjusts the month or year if needed
    // converts the new Date object back into YYYY-MM-DD
    return formatDate(date);
}


// =========== Class ============

 export default class ShopApi {
    //The constructor runs once when you create an instance of the class
    // it stores the shop's settings on the object (this)
    constructor(latitude, longitude, countryCode) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.countryCode = countryCode;
        // Creates an object used to save holiday data so 
        // so API doesn't get called repeatedly
        this.holidayCache = {}; //remembers holidays fectch, by year
    }

    // Returns an array of day objects, or an empty array if nothing can be shown.
    async getWeather(startDate, days = 3) {
        const today = formatDate(new Date());
        const lastForecastDay = addDays(today, 15);  // Open-Meteo farecast about 16 days
        
        // Dates in the past or too far ahead have no forecast so stop early
        if (startDate < today || startDate > lastForecastDay) {
            return [];
        }

        // The last we ask for: start + (days - 1) but never past the forecast limit
        let endDate = addDays(startDate, days - 1);
        // checks if the ending date exceeds API limit 
        if (endDate > lastForecastDay) {
            endDate = lastForecastDay;
        }

        // The daily values we want back
        const dailyValues = [
            "weather_code",                   // a number for the condition (clear, rain...)
            "temperature_2m_max",             // highest temperature
            "temperature_2m_min",             // lowest temperature
            "precipitation_probability_max",  // chance of rain in percent
            "precipitation_sum",              // total rain in millimeters
            "wind_speed_10m_max",             // strongest wind
            "uv_index_max"                    // sun strength
        ].join(",");

        const url = 
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${this.latitude}&longitude=${this.longitude}` +
            `&daily=${dailyValues}` +
            `&start_date=${startDate}&end_date=${endDate}` +
            `&timezone=auto`;

        try {
            const response = await fetch(url);
            if (!response) {
                throw new Error (`Weather request failed with status ${response.status}`);
            }

            const data = await response.json();
            const daily = data.daily;   // lists with one item per day

            // Combine the seperate lists into ONE object per day.
            // map() goes through each date and uses its position 
            // (i) to pick the matching values.
            return daily.time.map((date, i) => ({
                date: date,
                weatherCode: daily.weather_code[i],
                tempMax: daily.temperature_2m_max[i],
                tempMin: daily.temperature_2m_min[i],
                rainChance: daily.precipitation_probability_max[i],
                rainTotal: daily.precipitation_sum[i],
                windMax: daily.wind_speed_10m_max[i],
                uvIndex: daily.uv_index_max[i]
            }));
        } catch (error) {
            console.error("Could not get weather:", error);
            return[];   //empty list:  the page can hide the weather section
        }
    }

    // Get all holidays for one year. 
    // Returns an array of holidays objects, or an 
    // empty array if something goes wrong.
    async getHolidays (year) {
        // if we already fetched this year, return the saved copy and skip the request
        if (this.holidayCache[year]){
            return this.holidayCache[year];
        }
        const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${this.countryCode}`;

        try {
            const response = await fetch(url);
            if(!response.ok){
                throw new Error(`Holiday request failed with status ${response.status}`);
            }

            const holidays = await response.json();
            this.holidayCache[year] = holidays; // save it for next time use
            return holidays;
        }catch(error){
            console.error("Could not get the holidays:", error);
            return [];
        }     
    }

    //Check if a date like "2026-12-25" is a holiday.
    // Returns the holiday object, or undefined if it is not a holiday.
    async findHoliday (date) {
        // "2026-12-25" -> "2026"
        const year = date.split("-")[0];
        const holidays = await this.getHolidays(year);
        return holidays.find((holiday) => holiday.date === date);
    }

}





