const express = require('express');
const request = require('request');
const hbs = require('hbs');
const fs = require('fs');

const port = process.env.PORT || 8080;

var app = express();

app.use(express.static(__dirname + 'public'));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});
hbs.registerHelper('message', (text) => {
    return text
});

var getCountry = (country) => {
    return new Promise((resolve, reject) => {
        request({
            url: `https://restcountries.eu/rest/v2/name/${country}?fullText=true`,
            json: true
        }, (error, response, body) => {
            if (error){
                reject('Error occurred')
            } else if (!typeof country === 'string') {
                reject('Incorrect country parameter')
            } else if (body.status == 404) {
                reject('Incorrect Country parameter')
            } else {
                resolve({
                    currencyCode: body[0].currencies[0].code

                })
            }
        });
        // console.log(`Your requested venue: ${country}\nAddress: ${body.results[0].formatted_address}\nStatus Code: ${body.status}\nLocation Type: ${body.results[0].geometry.location_type}\nType: ${body.results[0].types}`)
    });
};


var getExchange = (countryCode) => {
    return new Promise((resolve, reject) => {
        request({
            url: `https://api.exchangeratesapi.io/latest?symbols=${countryCode}&base=USD`,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Error Occurred when getting Exchange Rate')
            } else if (!typeof currencyCode === 'string') {
                reject('Incorrect Currency Code')
            } else if (body.error) {
                reject('Outdated or bogus currency code')
            }
            else {
                resolve({
                    exchangeRate: body.rates[countryCode]
                })
            }

        });
    });
};

// app.use((request, response, next) => {
//     response.render('maintenance.hbs', {
//
//     })
// });


app.use((request, response, next) => {
    var time = new Date().toString();
    // console.log(`${time}: ${request.method} ${request.url}`);
    var log = `${time}: ${request.method} ${request.url}`;
    fs.appendFile('server.log', log + '\n', (error) => {
        if (error) {
            console.log('Unable to log message');
        }
    });
    next();
});

app.get('/', (request, response) => {
    // response.send('<h1>Hello express!</h1>');
    response.render('home.hbs', {
        title: "Home page",
        header: "Welcome to the homepage"
    });
});

app.get('/info', (request, response) => {
    response.render('about.hbs', {
        title: 'About page',
        // year: new Date().getFullYear()
        welcome: 'Hello!',
        header: 'Welcome to the about page',
        home: '/'
    })
});
app.get('/exchange', (request, response) => {
    // response.render('exchange.hbs', {
    //     title: "Exchange page",
    //     header: "Welcome to the exchange page"
    //     });
    country = 'Mexico';
    getCountry(country).then((results) => {
        code = results.currencyCode;
        return getExchange(results.currencyCode);
    }).then((results) => {
        response.render('exchange.hbs', {
            title: "Exchange page",
            header: "Welcome to the exchange page",
            success: `One USD equals ${results.exchangeRate} ${code}`,
            home: '/'
        });
    }).catch((error) => {
        response.render('exchange.hbs', {
            title: "Exchange page",
            header: "Welcome to the exchange page",
            failure: 'Something went wrong: ' + error,
            home: '/'
        });
    });
});

// app.get('/404', (request, response) => {
//     response.send({
//         error: 'you fucked up'
//     })
// });

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`)
});