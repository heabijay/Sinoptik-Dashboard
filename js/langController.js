const defaultLanguage = "uk";

class Language {
    constructor(code, label, urlEndpoint, placeholder) {
        this.code = code;
        this.label = label;
        this.urlEndpoint = urlEndpoint;
        this.placeholder = placeholder;
    }
}

const languages = [
    new Language(
        "ru", 
        "Русский", 
        "https://sinoptik.ua",
        "Киев, Столица Украины"
        ),
    new Language(
        "uk", 
        "Українська", 
        "https://ua.sinoptik.ua",
        "Київ, Столиця України"
        )
];

function getLang() {
    const code = localStorage.getItem("lang") ?? defaultLanguage;
    return languages.filter(t => t.code == code)[0];
}

function setLang(langCode) {
    localStorage.setItem("lang", langCode);
    // window.location.href = window.location.pathname;
    window.location.reload();
    onLanguageChanged();
}

function initLanguages() {
    const form = $("#langDropdownMenu");
    form.empty();

    languages.forEach(lang => {
        form.append(`<a class="dropdown-item" onclick="setLang(this.attributes['lang'].value)" href="#" lang="${lang.code}">${lang.label}</a>`)
    });
}

function onLanguageChanged() {
    const lang = getLang();

    $("#langDropdownBtn").text(lang.label);
    $("#searchField").attr("placeholder", lang.placeholder);
}