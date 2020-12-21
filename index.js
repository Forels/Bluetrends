//Setup the server - express
//const { json } = require('express');
const express = require('express');
const app = express();
//const { request, response } = require('express');

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Sono in ascolto sulla porta ${port}...`)
    console.log("");
});
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

//Setup the database- nedb
const Datastore = require('nedb');
const database = new Datastore('database.db');
database.loadDatabase();

//Setup Naive-Bayes classifier - bayes
var bayes = require('bayes');
var classifier = bayes();

//Setup the Twitter API - twit
var Twit = require('twit');
var config = require('./config/config');
const { request, response } = require('express');
var T = new Twit(config);


// *** APPLICATION ***



//insert word into database
//var p = ;
//for (var i = 0; i <p.length; i++){
//  database.insert({parola: p[i].parola, valore: p[i].valore});
//}

/* 
    Ogni volta che il server viene caricato, cerca tutte le parole presenti nel database. 
    Il classificatore impara ad ogni avvio le parole trovate nel database
*/


//Interrogazione del databse per trovare parole da insegnare al classificatore
var y = null;
var parola = null;
var valore = null;
database.find({ "valore": { $exists: true } }, function (err, docs) {
    y = docs;
    classificaParola();
});

//Funzione per insegnare al classificatore parole presenti nel databse
async function classificaParola() {
    
    for (var i = 0; i < y.length; i++) {
        var parola = y[i].parola;
        var valore = y[i].valore;

        //console.log("parola: "+y[i].parola)
        //console.log("valore: "+y[i].valore)

        try {
            await classifier.learn(parola, valore)
        } catch (error) {
            console.log(error)
        }


        
        
        
    }
    console.log(y.length)
    // serialize the classifier's state as a JSON string.
    var stateJson = classifier.toJson()
    // load the classifier back from its JSON representation.
    var revivedClassifier = bayes.fromJson(stateJson)
    console.log("Bluetrends conosce attualmente queste categorie:")
    console.log(revivedClassifier.wordCount);
    // console.log(`Il classificatore ha imparato parole ${x[0].valore}`);
    console.log();
}

//Invia le categorie e tutte le parole al clie
app.get('/vocabolario', (request, response) => {

    console.log("Qualcuno sta consultando la pagina del vocabolario...")
    console.log("Invio le categorie conosciute e tutte le parole...")
       
    var json = {}
    var categorieDatabase = [];
    var x = null;
    var counter = 0;
    
    
        database.find({ valore: { $exists: true } }, function (err, docs) {
    
            var myArray = [];
            docs.forEach(element => {
                myArray.push(element.valore);
            });
            categorieDatabase = myArray.filter((v, i, a) => a.indexOf(v) === i);
    
            
            for (var i = 0; i < categorieDatabase.length; i++) {
                var prova = categorieDatabase[i];
                json[prova] = {};
                json[prova] = [({})] 
            }
    
            faiQualcosa();
            
        }); 
    
    function faiQualcosa(){
        
        for(var i = 0; i<categorieDatabase.length;i++){
            //console.log(categorieDatabase[i]);
            database.find({ valore: categorieDatabase[i] }, function (err, docs) {
                x=docs;
                faiQualcosa2();
                counter++;
            });
           
        }
    
    }
    
    function faiQualcosa2(){
        
       //console.log(counter)
       //console.log(categorieDatabase.length-1)
        for(var i=0;i<x.length;i++){
            json[x[0].valore][i] = ({parola: x[i].parola, valore: x[i].valore});
        }
        
        if(counter == categorieDatabase.length-1){
            stampa()
            isFunctionCalled = true;
        }
        
    }
    

  
    function stampa() {
        console.log("");
        response.json({
            categorie: categorieDatabase,
            vocabolario: json
        });
    }

    console.log("Fatto!");
    console.log();
     
});



//Invia sia i trends che le categorie al client
app.get('/api', (request, response) => {

    console.log("Qualcuno si è collegato!")
    console.log()

    var cat_array = '{"categoria":[]}';

    //Cerca le categorie di parole conosciute dal classsficatore nel database
    database.find({ valore: { $exists: true } }, function (err, docs) {
        var myArray = [];
        docs.forEach(element => {
            myArray.push(element.valore);
        });
        categorieDatabase = myArray.filter((v, i, a) => a.indexOf(v) === i);        
    });

        // Cerca i trends attuali in italia 
    T.get('trends/place', { id: 23424853 }, function (err, data, responseT) {
  
        console.log("Cerco i trend più recenti attualmente in Italia...")
        var trend_array = '{"trend":[]}';


        for (let i = 1; i <= 30; i++) {
            var trend_JSON = JSON.parse(trend_array);
            var hashtag = data[0].trends[i];
            //console.log(i + ")  " + hashtag.name);
            trend_JSON['trend'].push({
                "name"          : hashtag.name,
                "tweet_volume"  : hashtag.tweet_volume                       
            });
            
            trend_array = JSON.stringify(trend_JSON);

            //console.log(i+") Trend: "+data[0].trends[i].name);
            
        }

        
        console.log("Invio i trend all'utente immediatamente...");
        response.json({
        trends: trend_JSON.trend,
        categorie: categorieDatabase
        });

        console.log("Fatto!")
        console.log()
    }); //close trends/place
});


var trendRicevuto = "";
//La funziona utilizza un array che riempe ogni volta con un tweet. Quando tutti i tweets trovati saranno inseriti nell'array,
//convertito in un JSON
var tweet_array = '{"tweet":[]}';

//Il server riceve dal client il trend selezionato e latitudine e longitudine
app.post('/trends', (request, response) => {
    const data = request.body;
    console.log('Ho ricevuto un trend dal client: ' + data.trendSelezionato);
    //console.log("Latitudine: " + data.lat);
    //console.log("Longitudine: " + data.lon);
    //console.log("");
    
//Cerca i 15 tweet più popolari riguardanti il trend appena ricevuto
    trendRicevuto = data.trendSelezionato;
    //latRicevuto = data.lat;
    //lonRicevuto = data.lon;
  
 

    T.get('search/tweets', {q: trendRicevuto, result_type: 'mixed', lang: 'it', include_entities: 'true', tweet_mode: 'extended', count: 20}, function (err, twit, res) {
        var tweets = twit.statuses;

        for (var i = 0; i < tweets.length; i++) {

            var tweet_JSON = JSON.parse(tweet_array);

            // console.log("NAME: "            + tweets[i].user.name);
            // console.log("SCREEN-NAME: "     + tweets[i].user.screen_name);
            // console.log("DATE: "            + tweets[i].created_at);
            // console.log("TEXT: "            + tweets[i].full_text);
            // console.log("RETWEET COUNT: "   + tweets[i].retweet_count);
            // console.log("FAVORITE COUNT: "  + tweets[i].favorite_count);
           

            //Controlla se nel tweet siano presenti 'extended_entities'
            if (tweets[i].extended_entities != undefined) {
                //Controlla se tra i 'extended_entities' ci siano media (comprendono media multipli, video o gif)
                if (tweets[i].extended_entities.media != undefined) {
                    for (var k = 0; k < 4; k++) {
                        //Se esiste qualche tipo di media prende solo il primo (non c'è un controllo sul tipo del media)
                        if (tweets[i].extended_entities.media[k] != undefined) {
                            //console.log("IMMAGINE " + tweets[i].extended_entities.media[k].media_url);
                        }
                    }
                }
            }

            //console.log("");

            //C'è un media (semplice) nel tweet
            if (tweets[i].entities.media != undefined) {

                //In questo caso è un retweet (con media)
                if (tweets[i].retweeted_status != undefined) {
                    tweet_JSON['tweet'].push({
                        "profile_image_url"     : tweets[i].user.profile_image_url_https,
                        "name"                  : tweets[i].user.name,
                        "screen_name"           : tweets[i].user.screen_name,
                        "created_at"            : tweets[i].created_at,
                        "text"                  : tweets[i].full_text,
                        "retweet_text"          : tweets[i].retweeted_status.full_text,
                        "retweet_screen_name"   : tweets[i].retweeted_status.user.screen_name,
                        "media_url"             : tweets[i].entities.media[0].media_url_https,
                        "retweet_count"         : tweets[i].retweet_count,
                        "favorite_count"        : tweets[i].favorite_count

                    });
                }
                //In questo caso non è un retweet (con media)
                else {
                    tweet_JSON['tweet'].push({
                        "profile_image_url" : tweets[i].user.profile_image_url_https,
                        "name"              : tweets[i].user.name,
                        "screen_name"       : tweets[i].user.screen_name,
                        "created_at"        : tweets[i].created_at,
                        "text"              : tweets[i].full_text,
                        //"retweet_text": tweets[i].retweeted_status.full_text,
                        //"retweet_screen_name": tweets[i].retweeted_status.user.screen_name,
                        "media_url"         : tweets[i].entities.media[0].media_url_https,
                        "retweet_count"     : tweets[i].retweet_count,
                        "favorite_count"    : tweets[i].favorite_count
                    });
                }

                //Non c'è un media nel tweet
            } else {

                //In questo caso è un retweet (senza media)
                if (tweets[i].retweeted_status != undefined) {
                    tweet_JSON['tweet'].push({
                        "profile_image_url"     : tweets[i].user.profile_image_url_https,
                        "name"                  : tweets[i].user.name,
                        "screen_name"           : tweets[i].user.screen_name,
                        "created_at"            : tweets[i].created_at,
                        "text"                  : tweets[i].full_text,
                        "retweet_text"          : tweets[i].retweeted_status.full_text,
                        "retweet_screen_name"   : tweets[i].retweeted_status.user.screen_name,
                        "retweet_count"         : tweets[i].retweet_count,
                        "favorite_count"        : tweets[i].favorite_count
                        //"media_url": tweets[i].entities.media[0].media_url
                    });
                }
                //In questo caso non è un retweet (senza media)
                else {
                    tweet_JSON['tweet'].push({
                        "profile_image_url" : tweets[i].user.profile_image_url_https,
                        "name"              : tweets[i].user.name,
                        "screen_name"       : tweets[i].user.screen_name,
                        "created_at"        : tweets[i].created_at,
                        "text"              : tweets[i].full_text,
                        "retweet_count"     : tweets[i].retweet_count,
                        "favorite_count"    : tweets[i].favorite_count
                        //"retweet_text": tweets[i].retweeted_status.full_text,
                        //"retweet_screen_name": tweets[i].retweeted_status.user.screen_name,
                        //"media_url": tweets[i].entities.media[0].media_url
                    });
                }
            }

            //tweet_JSON['tweet'].push({"name": tweets[i].user.name});
            tweet_array = JSON.stringify(tweet_JSON);

        } //close for

        if (tweetsInviati = undefined) {
            console.log("PROBELMS ");
        }

        var tweetsInviati = tweet_JSON.tweet;

        //console.log(forse);
        //Send the tweets to the client
        response.json({
            status: "succces",
            hashtag: data.trendSelezionato,
            tweets: tweetsInviati
        });

        console.log("Ho inviato i tweets al client!")
        console.log("");

        tweet_array = '{"tweet":[]}';
    }); //close search/tweets
});// close api



//Il server riceve il tweet scelto dal client per esser analizzato
var tweetRicevuto   = null;
var tweetAnalizzato = null
var giudizio        = null;
var prob  = null;

app.post('/tweets', (request, response) => {
    const data = request.body;
    tweetRicevuto = data.tweet_selected;

    analizzaTweet()

    async function analizzaTweet() {

        //Verifica se il tweet selezionato sia un retweet
        if (tweetRicevuto.charAt(0) == "R" && tweetRicevuto.charAt(1) == "T") {
            //Se è un retweet elimina  'RT @username:' per non analizzarlo
            tweetAnalizzato = tweetRicevuto.substring(tweetRicevuto.indexOf(":") + 1);
        } else { tweetAnalizzato = tweetRicevuto; }

        
        giudizio = await classifier.categorize(tweetAnalizzato);
        console.log("Ho ricevuto un tweet da analizzare: " + tweetAnalizzato)
        console.log("");
        console.log("Il tweet è stato giudicato come: " + giudizio);
        console.log("");
    
        //Il server risponde con il tweet analizzato e il giudizio sulla categoria
        response.json({
            status: "succces",
            tweet: tweetAnalizzato,
            risultato: giudizio
        });

    }

});



/* Addestramento semplice */
// L'utente può inviare un tweet con una categoria già esistente 
// oppure
// Può inviare un tweet con una nuova categoria 
//Il classificatore impare il tweet come categoria

var categoriaRicevuta = null;

app.post('/categorysemplice', (request, response) => {

    const data = request.body;
    categoriaRicevuta = data.categoriaScelta;
    tweetAnalizzato   = data.tweetAnalizzato;

    console.log("cat: "+categoriaRicevuta);
    console.log("tweet: "+tweetAnalizzato);

    imparaCategoria(categoriaRicevuta, tweetAnalizzato, response);

});


/* Addestramento guidato */
// Utente può inviare tweet con categoria proposta
// Oppure
// Può inviare il tweet con una categoria scelta tra quelle già esistenti
// Il classificatore impara il tweet come categoria

app.post('/categoryguidato', (request, response) => {

    const data = request.body;
    categoriaRicevuta = data.categoriaScelta;
    tweetAnalizzato   = data.tweetAnalizzato;

    imparaCategoria(categoriaRicevuta, tweetAnalizzato, response);

});

//var categorieDatabase = [];

//Funzione per insegnare al classificatore tweet e categoria
async function imparaCategoria(categoriaRicevuta, tweetAnalizzato, response) {

    //prima di aggiungere un nuovo insegnamento, controlla che nel datbase non sia gia assegnato la
    database.find({parola: `${tweetAnalizzato}`, valore: `${categoriaRicevuta}`}, (err, docs) => {
     
        if(docs.length === 0) {
            console.log("cat: "+categoriaRicevuta);
            console.log("tweet: "+tweetAnalizzato);
            impara();
        } 
        else {
            console.log("Il server non ha bisogno di imparare questi dati");
            console.log("");
        }
    });

    async function impara(){
        await classifier.learn(categoriaRicevuta, tweetAnalizzato);
            database.insert({ parola: tweetAnalizzato, valore: categoriaRicevuta });
            console.log("Il server ha imparato " + tweetAnalizzato + " come " + categoriaRicevuta);
    }

    

    database.find({ valore: { $exists: true } }, function (err, docs) {

        var myArray = [];
        docs.forEach(element => {
            myArray.push(element.valore);
        });
        categorieDatabase = myArray.filter((v, i, a) => a.indexOf(v) === i);        
    });     

    console.log(categorieDatabase);
    
    response.json({
        status: "succces",
        tweet: tweetAnalizzato,
        categoria: categoriaRicevuta,
        categorieEsistente: categorieDatabase
    });

}





