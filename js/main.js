function makeCorsProxyTunnel(url) {
    return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
}

function formatSuggestions(data) {
    const arr = [];
    const lines = data.split('\n');
    lines.forEach(line => {
        const lineArgs = line.split('|');
        arr.push({
            "id": lineArgs[2],
            "name": lineArgs[0] + ', ' + lineArgs[1]
        });
    });

    return arr;
}


function startProcessing(startSinoptikUrl, retrieveFromCache = true) {
    PageRender.setLoading();

    $.ajax({
        type: "GET",
        cache: retrieveFromCache,
        url: makeCorsProxyTunnel(startSinoptikUrl)
    }).done(function (response) {
        PageRender.clear();
        const page = SinoptikPage.Parse(response.contents);
        
        if (page.isCityNotFound) {
            if (page.isRegion) {
                PageRender.setRegionsUnsupported();
            }
            else {
                PageRender.setNotFound();
            }
            return;
        }

        const markup = PageRender.initDefaultResponsePage();
        markup.header.innerHTML = page.forecastHeaderHtml;
        history.pushState({}, null, window.location.pathname + "?q=" + page.forecastSubpath);
        markup.poweredByLink.setAttribute("href", getLang().urlEndpoint + '/' + page.forecastSubpath);
        markup.days[0].fillFromSinoptikPage(page);

        let date = new Date();
        for (let i = 1; i < 10; i++) {
            const _i = i; // Need remember due async $.ajax function
            const _date = new Date(date.setDate(date.getDate() + 1));

            $.ajax({
                type: "GET",
                cache: retrieveFromCache,
                url: makeCorsProxyTunnel(getLang().urlEndpoint + '/' + page.forecastSubpath + '/' + (`${_date.getFullYear()}-${("00" + (_date.getMonth() + 1)).slice(-2)}-${("00" + _date.getDate()).slice(-2)}`))
            }).done(function (response) {
                const page = SinoptikPage.Parse(response.contents);
                markup.days[_i].fillFromSinoptikPage(page);
            });
        }
    });
}


function initSearchSuggestions() {  
    window.query_cache = { };

    const field = $('#searchField');
    field.typeahead({
        items: 'all',
        source: function (query, process) {
            if (query_cache[query]) {
                return process(formatSuggestions(query_cache[query]));
            }

            $.ajax({
                type: "GET",
                url: makeCorsProxyTunnel(getLang().urlEndpoint + "/search.php?q=" + query)
            }).done(function (response) {
                query_cache[query] = response.contents;
                return process(formatSuggestions(query_cache[query]));
            });
        },
        afterSelect: function (e) { 
            if (e != null) {
                history.pushState({}, null, window.location.pathname + "?q=" + e.id);
                onQueryUpdate();
            }
            else {
                $("#searchBtn").trigger("click");
            }
        }
    });
}

function onQueryUpdate(retrieveFromCache = true) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.q != null) {
        PageRender.setLoading();

        if ($("#searchField").val() == "") {
            $("#searchField").val(params.q)
        }

        $(".visibleOnFirstPage").addClass("d-none");
        $(".unvisibleOnFirstPage").removeClass("d-none");
        $("#content").removeClass("componentFill");

        startProcessing(getLang().urlEndpoint + '/' + params.q, retrieveFromCache);
    }
    else {
        PageRender.clear();
        $(".visibleOnFirstPage").removeClass("d-none");
        $(".unvisibleOnFirstPage").addClass("d-none");
        $("#content").addClass("componentFill");
    }
}

function initSearchControls() {
    $("#searchBtn").on("click", function () {  
        const input = $("#searchField").val();
        if (input != '') {
            startProcessing(getLang().urlEndpoint + '/redirector?search_city=' + input);
        }
    });

    $("#searchField").on("keypress", function(e) {
        if (e.key == 'Enter') {
            $("#searchBtn").trigger("click");
            return false;
        }
    });
}

jQuery(function () {
    $("a.navbar-brand").attr("href", window.location.pathname);

    initLanguages();
    initSearchSuggestions();
    initSearchControls();
    $("#refreshBtn").on("click", function() { 
        onQueryUpdate(false); 
    });

    onLanguageChanged();
    onQueryUpdate();
});