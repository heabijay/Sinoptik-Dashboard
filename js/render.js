class ForecastTableRender {
    constructor (baseElement) {
        this.base = baseElement;

        this.tableTemplate = `
            <table class="forecastTable table table-unstriped table-bordered table-sm text-center">
                <thead class="thead-light">
                    <tr class="time">
                        <th class="align-middle" scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="weather img weatherIcoS" title="Weather">
                        <td class="align-middle"><i class="fas fa-cloud-sun"></i></td>
                    </tr>
                    <tr class="temperature" title="Temperature">
                        <td class="align-middle"><i class="fas fa-thermometer-half"></i></td>
                    </tr>
                    <tr class="wind" title="Wind">
                        <td class="align-middle"><i class="fas fa-wind"></i></td>
                    </tr>
                    <tr class="chanceOfPrecipitation" title="Chance of the precipitation">
                        <td class="align-middle"><i class="fas fa-cloud-rain"></i></td>
                    </tr>
                </tbody>
            </table>
        `

        this.base.innerHTML = `
            <div class="d-none d-md-table w-100">
                ${this.tableTemplate}
            </div>
            <div class="d-md-none w-100">
                ${this.tableTemplate}
            </div>
        `;

        this.$limit = 4;

        this.$pushToTable = function (tableSelector, timeDto) {
            $(`${tableSelector} .time`, this.base).append(`<th class="align-middle" scope="col">${timeDto.time}</th>`);
            $(`${tableSelector} .weather`, this.base).append(`<td class="align-middle"><div class="${timeDto.weatherClass}" title="${timeDto.weather}">${timeDto.weatherImgTag}</div></td>`);
            $(`${tableSelector} .temperature`, this.base).append(`<td class="align-middle">${`${timeDto.temperature} <br/> <small class="text-muted">${timeDto.temperatureSens}</span>`}</td>`);
            $(`${tableSelector} .wind`, this.base).append(`<td class="align-middle">${`<span title="${timeDto.windStr}"><i class="fas fa-arrow-circle-up ${timeDto.windClass}"></i> ${timeDto.wind}</span>`}</td>`);
            $(`${tableSelector} .chanceOfPrecipitation`, this.base).append(`<td class="align-middle">${timeDto.chanceOfPrecipitation == '-' ? '-' : timeDto.chanceOfPrecipitation + '%'}</td>`);
        }

        this.push = function (timeDto) {
            this.$pushToTable(".d-md-table table", timeDto);
            if ($(".d-md-none table:last-child tr:first-child td", this.base).length >= this.$limit + 1) {
                $(".d-md-none", this.base).append(this.tableTemplate);
            }
            this.$pushToTable(".d-md-none table:last-child", timeDto);
        }
    }
}

class DefaultResponsePage {
    constructor() { 
        const data = document.getElementById("data");
        this.header = data.getElementsByClassName("header")[0];
        this.days = [];
        const rows = data.getElementsByClassName("table")[0].children[0].children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            this.days.push({
                date: $('.date', row)[0],
                weather: $('.weather', row)[0],
                weatherIcon: $('.weatherIcon', row)[0],
                description: $('.description', row)[0],
                warnings: $('.warnings', row),
                temperature: $('.temperature', row)[0],
                main: $(".main", row)[0],

                fillFromSinoptikPage: function (sinoptikPage) {
                    this.date.innerHTML = sinoptikPage.day.name + ', ' + sinoptikPage.day.date.toLocaleDateString(getLang().code, { year: 'numeric', month: 'numeric', day: 'numeric' });
                    
                    this.temperature.innerHTML = `<span title="Max Temperature">${sinoptikPage.day.temperatureMax}</span> <span class="text-muted" title="Min Temperature">| ${sinoptikPage.day.temperatureMin}</span>`;
                    this.weather.innerHTML = sinoptikPage.day.weather;
                    $(this.weatherIcon).attr("class", sinoptikPage.day.weatherClass);
                    $(this.weatherIcon).html(sinoptikPage.day.weatherImgTag);
                    this.description.innerHTML = sinoptikPage.day.description;
                    
                    const forecastRender = new ForecastTableRender(this.main);

                    for (let i = 0; i < sinoptikPage.day.times.length; i++) {
                        const t = sinoptikPage.day.times[i];
                        forecastRender.push(t);
                    }

                    if (sinoptikPage.day.warnings != null) {
                        this.warnings.addClass("mt-3");
                        this.warnings.html(`<i class="fas fa-exclamation-circle"></i> ${sinoptikPage.day.warnings.charAt(0).toUpperCase() + sinoptikPage.day.warnings.slice(1)}`);
                    }
                }
            });
        }
        this.poweredByLink = data.getElementsByClassName("poweredByLink")[0];
    }
}

class PageRender {
    constructor() { }

    static appendHtml(html) {
        const data = $("#data");
        data.append(html);
    }

    static setHtml(html) {
        const data = $("#data");
        data.empty();
        data.html(html);
    }

    static initDefaultResponsePage() {
        const data = $("#data");
        data.empty();
        let html = `
            <div class="header mt-5"></div>
            <table class="table table-striped days">
        `
        for (let i = 0; i < 10; i++) {
            html += `
                <tr>
                    <td class="d-flex flex-wrap px-0">
                        <div class="col-12 col-md-3 mb-3 mb-md-0 d-flex flex-column justify-content-center weatherIcoS">
                            <div class="d-flex flex-row">
                                <div class="d-flex flex-column align-items-center">
                                    <div class="weatherIcon" style="transform: scale(2.0); margin: 1.75rem auto;"></div>
                                    <p class="temperature m-0 text-nowrap"></p>
                                </div>
                                <div class="ml-3 flex-fill d-flex flex-column justify-content-center">
                                    <p class="date font-weight-bold m-0"><i class="fas fa-circle-notch fa-spin"></i></p>
                                    <p class="weather m-0"></p>
                                    <p class="warnings m-0 text-danger d-md-none" style="margin-top: 0.33rem!important"></p>
                                </div>
                            </div>
                            <p class="warnings m-0 text-danger text-center d-none d-md-block"></p>
                        </div>
                        <div class="col-12 col-md-9">
                            <p class="main m-0"></p>
                            <p class="description m-0 font-weight-light"></p>
                        </div>
                    </td>
                </tr>
            `
        }
        const now = new Date();
        html += `
            </table>
            <p class="text-center text-muted mt-3">
                <small>
                    Source: <a class="poweredByLink" target="_blank" href="https://sinoptik.ua">sinoptik.ua</a>.
                    Generated by <a target="_blank" href="https://github.com/heabijay/sinoptik-dashboard">Sinoptik-Dashboard</a> on
                    ${now.toLocaleDateString(getLang().code, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
                </small>
            </p>
        `

        data.html(html);

        return new DefaultResponsePage();
    }

    static setLoading() {  
        const data = $("#data");
        data.empty();
        data.append(`<div class="text-center"><i class="fas fa-sync fa-spin"></i></div>`);
    }

    static setNotFound() {  
        const data = $("#data");
        data.empty();
        data.append(`<div class="text-center text-danger">This city is not found!</div>`);
    }

    static setRegionsUnsupported() {  
        const data = $("#data");
        data.empty();
        data.append(`<div class="text-center text-danger">Regions is unsupported!</div>`);
    }
    
    static clear() {
        const data = $("#data");
        data.empty();
    }
}