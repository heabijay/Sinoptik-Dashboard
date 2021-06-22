# sinoptik-dashboard

This application parses the [sinoptik.ua](https://sinoptik.ua) site, collects information and renders a comfortable view for it with a powerful print feature.

Preview by Github Pages: [heabijay.github.io/sinoptik-dashboard](https://heabijay.github.io/sinoptik-dashboard).

## Screenshots

<details>
    <summary>Click to show</summary>

### Home page
![](https://i.imgur.com/atn5Srh.png)

### Results page
![](https://i.imgur.com/CcR4ieP.png)

</details>

## Print output comparison

[Sinoptik.ua](https://sinoptik.ua) has awful print output: it contains advertisements, displays only one day per page, has a reduced size of content due exists ads. Our page has a redesigned UI, which allows us to display up to 5 days per page and doesn't contains ads.

<details>
    <summary>Click to show screenshot</summary>

![](https://i.imgur.com/cvJf0Ia.png)

</details>

## CORS Requests

[Sinoptik.ua](https://sinoptik.ua) currently doesn't allow CORS requests on different origins so we use an CORS Proxy called [AllOrigins](https://allorigins.win/) ([github](https://github.com/gnuns/allorigins)).

The configuration of CORS Proxy available in `js/main.js:1`:

```js
class CorsProxy {
    constructor() { }

    static makeTunnel(url) {
        return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    }

    static getDataFromResponse(response) {
        return response.contents;
    }
}
```