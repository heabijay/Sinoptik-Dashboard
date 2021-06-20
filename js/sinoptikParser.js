class SinoptikTimeDto {
    constructor() {
        this.time = null;
        this.weather = null;
        this.weatherСlass = null;
        this.temperature = null;
        this.temperatureSens = null;
        this.wind = null;
        this.windClass = null;
        this.windStr = null;
        this.chanceOfPrecipitation = null;
    }
}

class SinoptikDayDto {
    constructor() {
        this.name = null;
        this.weather = null;
        this.weatherClass = null;
        this.description = null;
        this.warnings = null;
        this.date = null;

        this.temperatureMin = null;
        this.temperatureMax = null;

        this.times = [];
    }
}

class SinoptikPage {
    constructor() { 
        this.forecastHeaderHtml = null;
        this.isCityNotFound = null;
        this.isRegion = null;
        this.forecastSubpath = null;

        this.day = new SinoptikDayDto();
    }

    static Parse(html) {
        const dto = new SinoptikPage();

        const page = $( '<div></div>' );
        page.html(html);
        
        dto.forecastHeaderHtml = $(".cityName.cityNameShort", page)[0]?.outerHTML;
        // page.isCityNotFound = !(el.getElementsByClassName("menu-city-static")[0]?.children[0]?.classList?.contains("mapLeftCol") ?? true);
        dto.isCityNotFound = dto.forecastHeaderHtml == null;
        dto.isRegion = $(".menu-city-head-sort-catalog", page)[0] != null;
        
        const selectedDayId = $("#blockDays", page).attr('class');
        dto.day.name = $('#' + selectedDayId + " .day-link", page)[0]?.innerText;
        dto.day.weather = $('#' + selectedDayId + " .weatherIco", page)?.attr("title");
        dto.day.weatherClass = $('#' + selectedDayId + " .weatherIco", page)?.attr("class");

        const dayPathes = $('#' + selectedDayId + " .day-link", page)?.attr("data-link")?.split('/');
        if (dayPathes) {
            dto.forecastSubpath = dayPathes[dayPathes.length - 2];
            dto.day.date = new Date(dayPathes[dayPathes.length - 1]);
        }

        dto.day.temperatureMin = $('#' + selectedDayId + " .temperature .min span", page)[0]?.innerText;
        dto.day.temperatureMax = $('#' + selectedDayId + " .temperature .max span", page)[0]?.innerText;

        dto.day.description = $(".wDescription .description", page)[0]?.innerText;
        dto.day.warnings = $(".oWarnings .description", page)[0]?.innerText;

        const timeDetails = $(".weatherDetails tbody", page)[0]?.children;
        if (timeDetails != null) {
            const timeCount = timeDetails[0].children.length;
            for (let i = 0; i < timeCount; i++) {
                const timeDto = new SinoptikTimeDto();
                timeDto.time = timeDetails[0].children[i].innerText.replace(' ', '').trim();
                timeDto.weather = timeDetails[1].children[i].children[0].attributes["title"].value;
                timeDto.weatherClass = timeDetails[1].children[i].children[0].attributes["class"].value;
                timeDto.temperature = timeDetails[2].children[i].innerText;
                timeDto.temperatureSens = timeDetails[3].children[i].innerText;
                timeDto.wind = timeDetails[6].children[i].innerText.trim();
                const windClasses = timeDetails[6].children[i].children[0].classList;
                timeDto.windClass = windClasses[windClasses.length - 1];
                timeDto.windStr = timeDetails[6].children[i].children[0].attributes["data-tooltip"].value.trim();
                timeDto.chanceOfPrecipitation = timeDetails[7].children[i].innerText;

                dto.day.times.push(timeDto);
            }
        }

        return dto;
    }
}