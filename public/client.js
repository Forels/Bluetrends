//Il client riceve i trends direttamente
getTrends();

//Variabile per salvare il trend selezionato
var trendSelezionato  = null;
//Variabile per salvare il tweet selezionato 
var tweetSelezionato  = null;
//Variabile per salvare il tweet inviato (se è un retweet non contiene 'RT @username:', se non è un retwet è uguale a tweetSelezionato)
var tweetAnalizzato   = null;
//Variabile per salvare la categoria ricevuta
var categoriaRicevuta = null

var lat = null;
var lon = null;


//Ottenere geolocalizzazione utente
/*
if ('geolocation' in navigator) {
    // Geolocalizzazione è disponibile
    //console.log('geolocalizzazione disponibile');
    navigator.geolocation.getCurrentPosition(position => {
        lat = position.coords.latitude
        lon = position.coords.longitude
        //console.log(lat + " " + lon);
    });
} else {
    // Geolocalizzazione non è disponibile
    //console.log('geolocalizzazione non disponibile');
}
*/


//Funzione per ricere i trends
async function getTrends() {
    const response = await fetch('/api');
    const data = await response.json();
    
  
    //console.log("Ho ricevuto le categorie esistenti dal server!")
    //Il client riceve anche le categorie che il classificatore conosce già
    
    for (item of data.categorie){
  
            
            //Aggiunge le categorie conosciute nell'addestramento semplice
            const opzione_semplice = document.createElement('option');
            opzione_semplice.value = item;
            
            document.querySelector("#datalistOptions").appendChild(opzione_semplice);

            //Aggiunge le categorie conosciute nell'addestramento guidato
            const opzione_guidato       = document.createElement('option');
            opzione_guidato.textContent = item;
            opzione_guidato.value       = item;
            
            document.querySelector("#form-g").appendChild(opzione_guidato);
           
       
        
    }//chiusura for categorie 
   
    
    //Mostra i trend nella pagina web
    //console.log("Ho ricevuto i trends dal server!")
    var i = 1;
    for (item of data.trends) {
        //console.log(item);
        //Crea elemento <li class="nav-item">
        const nav_item = document.createElement('li');
        nav_item.className = "nav-item";

        //Funzione per selezionare il trend 
        nav_item.onclick = function selezionaTrend() {

            trendSelezionato = this.getElementsByTagName('span')[1].innerHTML;
                            
            //Cambia il colore del trend selezionato
            var x = document.getElementsByClassName("trend-span");
            var i;
                for (i = 0; i < x.length; i++) {
                x[i].style.color = "#0F1419";
            }
           this.getElementsByTagName('span')[1].style.color = "#1DA1F2";

            const trend = document.createElement('span')
            trend.className = 'trend-title';
            trend.textContent = trendSelezionato;
            

            document.getElementById('intestazione-trend').textContent = `Hai selezionato il trend `
            document.getElementById('intestazione-trend').appendChild(trend);

            //Cliccando sul trend l'utente viene reinferizzato all'inizio della pagina
            var elemento = document.querySelector("#barra-intestazione");
            elemento.scrollIntoView({behavior: "smooth", block: "start"});
        
            riceviTweets(trendSelezionato);
        }

        //Crea elemento <div class="trend_counter"></div>
        const trend_counter = document.createElement('div');
        trend_counter.className = 'trend-counter';
        //Crea elemento <span class="trend-counter-paragraph"> N - Di tendenza </span>
        const trend_counter_span = document.createElement('span');
        trend_counter_span.className = 'trend-counter_span';
        trend_counter_span.textContent = `${i} - Di tendenza`;

        //Crea elemento <a class="nav-link active" href="#">
        const nav_link = document.createElement('a');
        nav_link.className = 'nav-link';

        //Crea elemento <div class="trend" id="i"></div>
        const trend = document.createElement('div');
        trend.className = 'trend';
        trend.id = i;
        const trend_span = document.createElement('span');
        trend_span.className = 'trend-span';
        trend_span.textContent = `${item.name}`;

        //Crea elemento <div class="trend_volume_tweets"></div>
        const trend_volume = document.createElement('div');
        trend_volume.className = 'trend-volume';
        //Crea elemento <span class="trend_tweet_volume_span"> N tweet </span>
        const trend_volume_span = document.createElement('span');
        trend_volume_span.className = 'trend-volume-span';
        if (item.tweet_volume != null) {
            trend_volume_span.textContent = `${item.tweet_volume} tweet`;
        }

        //Aggiunge nav-item a nav flex-column
        document.getElementById('sidebar-trends').appendChild(nav_item);
        //Aggiunge trend-counter, trend a nav-item
        nav_item.append(trend_counter, nav_link, trend_volume);
        //Aggiunge trend-counter-span a trend-counter
        trend_counter.append(trend_counter_span);
        //Aggiunge trend a nav-lin
        nav_link.append(trend);
        //Aggiunge trend-span al trend
        trend.append(trend_span);
        //Aggiunge trend-volume-span a trend-volume
        trend_volume.append(trend_volume_span);

        i++;
    }//chiusura for trends
}// --------------------------------------- chiusura funzione riceviTrends --------------------------------------- 

function chiusuraSidebar(){

    var x = document.getElementsByClassName('nav-item')

    for(var i = 0; i < x.length; i++){
        x[i].setAttribute("data-bs-toggle","collapse");
        x[i].setAttribute("data-bs-target","#sidebarMenu");
        
    }    
}


//Funzione per inviare al server il trend selezionato e ricevere i tweets relativi 
async function riceviTweets(trendSelezionato) {

    //Ottengo il trend
    //console.log("Hai selezionato il trend " + trendSelezionato);
    //const trend_selected = trendSelezionato;
    //console.log("Invio il trend al server!")

    //Invio il trend al server
    // const data = { trendSelezionato, lat, lon };
    const data = { trendSelezionato };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    //I tweets relativi al trend sono inviati dal server al client tramite response
    const response = await fetch('/trends', options);
    const tweetRicevuti = await response.json();

    //console.log("Hai ricevuto tweets dal server!")

    //Verifica se ci siano già dei tweets sulla pagina web
    var tweetsEsistenti = document.getElementsByClassName("list-group-item")
    if (tweetsEsistenti.length > 0) {
        //Se esistono dei tweets vengono eliminati
        var tweetsEsistenti = document.querySelectorAll('.list-group-item');
        for (var element of tweetsEsistenti) {
            element.remove();
            // or 
            // element.parentNode.removeChild(element);
        }
    }
    
    //Mostra i tweets nella pagina web
    var i = 1;
    for (item of tweetRicevuti.tweets) {

        //Crea elemento <li class="list-group-item"></li> -> elenco di tweet
        const list_group_item = document.createElement('a');
        list_group_item.className = 'list-group-item list-group-item-action';
        
        //Aggiunge list-group-element al list-group -> elemento dell'elenco di tweet
        document.getElementById('container-tweets').appendChild(list_group_item);

        //Funzione per selezionare il tweet ed inviarlo al server successivamente
        list_group_item.onclick = function selezionaTweet() {
            tweetSelezionato = this.getElementsByTagName('p')[0].textContent

            //Cambia il colore del trend selezionato
            var x =  document.getElementsByClassName('list-group-item');
            var i;
                for (i = 0; i < x.length; i++) {
                x[i].style.backgroundColor = "#FFF";
            }
            this.style.backgroundColor = "#E1E8ED"
            
            //Funzione per essere reindirizzati alla colonna di analisi quando si preme un tweet
            var ww = $(window).width();
            //Su desktop l'utente viene reindirizzato alla barra di intestazione
            if (ww > 768){
                var elemento = document.querySelector("#barra-intestazione");
                elemento.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
            }
            //Su smartphone l'utente viene reindirizzato alla colonna di analisi
            if (ww < 768){
                var elemento = document.querySelector("#colonna-analisi");
                elemento.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
            }    

            inviaTweetSelezionato(tweetSelezionato);
        }

        //Crea elemento <div class="tweet_container" ></div> -> contenitore del tweet
        const tweet_container = document.createElement('div');
        tweet_container.className = 'tweet-container';
        //Aggiunge tweet-container al list-group-itme
        list_group_item.append(tweet_container);

        //Crea elemento <div class="tweets-container-sx"></div>
        const tweet_container_sx = document.createElement('div');
        tweet_container_sx.className = 'tweet-container-sx';
        //Crea elemento <div class="tweets_container_dx"></div>
        const tweet_container_dx = document.createElement('div');
        tweet_container_dx.className = "tweet-container-dx";
        //Aggiunge tweet-container-sx, tweet-container-dx al tweet container
        tweet_container.append(tweet_container_sx, tweet_container_dx);

        //Immagine profilo
        //Crea elemento <div class="user_image"></div>
        const user_image = document.createElement('div');
        user_image.className = 'user-image';
        //Crea elemento <img></>
        const user_img = document.createElement('img');
        user_img.className = 'img-fluid';
        //user_image.className = "user_image";
        user_img.src = item.profile_image_url;
        //Aggiunge user-img to user-image
        user_image.append(user_img);
        //Aggiunge user-image to tweet-container-sx
        tweet_container_sx.append(user_image);

        //Nome, nome utente, data, tweet ed eventuale immagine
                //Crea elemento <div class="tweets_data"></div>
        const tweet_data = document.createElement('div');
        tweet_data.className = 'row tweet-data';
        //Aggiunge tweet-data al tweet-container-dx
        tweet_container_dx.append(tweet_data);

        //Crea elemento <div class="user_name"></div> -> Nome utente
        const user_name = document.createElement('div');
        user_name.className = 'col col-auto user-name';
        //Crea elemento <span></span>
        const user_name_span = document.createElement('span');
        user_name_span.textContent = `${item.name}`;
        //Aggiunge user-name al tweet-data
        tweet_data.append(user_name);
        //Aggiunge user-name-span al user-name
        user_name.append(user_name_span);

        //Crea elemento <div class="user_screen_name"></div> -> Nickname
        const user_screen_name = document.createElement('div');
        user_screen_name.className = 'col col-auto user-screen-name';
        //Crea elemento <span></span>
        const user_screen_name_span = document.createElement('span');
        user_screen_name_span.textContent = `${item.screen_name}`;
        //Aggiunge user-screen-name a tweet-data
        tweet_data.append(user_screen_name);
        //Aggiunge user-screen-name-span al user-screen-name
        user_screen_name.append(user_screen_name_span);

        //Crea elemento <div class="created_at"></div> -> Data creazine del tweet
        const created_at = document.createElement('div');
        created_at.className = 'col col-auto created-at';
        //Crea elemento <span></span>
        const created_at_span = document.createElement('span');
        created_at_span.textContent = `${parseTwitterDate(item.created_at)}`;
        //Aggiunge created-at a tweet-data
        tweet_data.append(created_at);
        //Aggiunge created-at-span a creted-at
        created_at.append(created_at_span);

        //Crea elemento <div class="tweet"></div>
        const tweet = document.createElement('div');
        tweet.className = 'tweet';
        //Aggiunge tweet a tweet-container-dx
        tweet_container_dx.append(tweet);
        //Crea elemento <p></p>
        const tweet_paragraph = document.createElement('p');
        tweet_paragraph.textContent = `${item.text}`

        //Controlla se il tweet sia un retweet e se i due tweet siano differenti
        if (item.retweet_text != null && `RT @${item.retweet_screen_name}: ${item.retweet_text}` != item.text) {
            //Crea elemento <p class="retweet-complete-paragraph"></p>
            const retweet_complete_paragraph = document.createElement('p');
            retweet_complete_paragraph.className = 'retweet-complete-paragraph';

            //Aggiunger il test del retwet
            retweet_complete_paragraph.textContent = `${item.text.substring(0, item.text.indexOf(':'))}: ${item.retweet_text}`;

            //Aggiunge tweet-paragraph, hr, retweet-paragraph to tweet 
            tweet.append(retweet_complete_paragraph);
        } else { tweet.append(tweet_paragraph); }

        //Controlla se nel tweet sia presente un immagine
        if (item.media_url != null) {
            //Crea elemento <div class="tweet_img"></div>
            const tweet_image = document.createElement('div');
            tweet_image.className = 'tweet-image';
            //Crea elemento <img></>
            const tweet_img = document.createElement('img');
            tweet_img.className = 'img-fluid';
            tweet_img.src = item.media_url;

            //Aggiunge tweet-paragraph al tweet
            tweet.append(tweet_paragraph);
            //Aggiunge tweet-image al tweet
            tweet.append(tweet_image);
            //Aggiunge tweet-img a tweet-image
            tweet_image.append(tweet_img);
        }


        const container_count = document.createElement('div');
        container_count.className = 'row row-counter';
        
        //Contatore dei like
        const col_favorite = document.createElement('div');
        col_favorite.className = 'col col-auto';
        //Crea elemento <img src="/assets/img/heart.svg" >
        const favorite_count = document.createElement('img');
        favorite_count.src = '/assets/img/heart.svg';
        favorite_count.setAttribute("with", 16);
        favorite_count.setAttribute("height", 16);

        const favorite_count_span = document.createElement('span');
        favorite_count_span.className = 'span-like'
        favorite_count_span.textContent = `${item.favorite_count}`;

        col_favorite.append(favorite_count, favorite_count_span)

        //Contatore dei retweet
        const col_retweet = document.createElement('div');
        col_retweet.className = 'col col-auto';
        //Crea elemento <img src="/assets/img/heart.svg" >
        const retweet_count = document.createElement('img');
        retweet_count.src = '/assets/img/arrow-left-right.svg';
        retweet_count.setAttribute("with", 16);
        retweet_count.setAttribute("height", 16); 

        const retweet_count_span = document.createElement('span');
        retweet_count_span.className = 'span-heart'
        retweet_count_span.textContent = `${item.retweet_count}`;
        
        col_retweet.append(retweet_count, retweet_count_span)

        container_count.append(col_favorite, col_retweet);
        tweet_container_dx.append(container_count);


        i++;
    }//Chiusura for tweets
} // --------------------------------------- chiusura funzione riceviTweets --------------------------------------- 

// Funzione per convertire data twitter in "tempo fa"
function parseTwitterDate(tdate) {
    var system_date = new Date(Date.parse(tdate));
    var user_date = new Date();
    if (K.ie) {
        system_date = Date.parse(tdate.replace(/( \+)/, ' UTC$1'))
    }
    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 1) {return "proprio adesso";}
    if (diff < 20) {return diff + " secondi fa";}
    if (diff < 40) {return "30 secondi fa";}
    if (diff < 60) {return "meno di un minuto fa";}
    if (diff <= 90) {return "1 minuto fa";}
    if (diff <= 3540) {return Math.round(diff / 60) + " secondi fa";}
    if (diff <= 5400) {return "1 ora fa";}
    if (diff <= 86400) {return Math.round(diff / 3600) + " ore fa";}
    if (diff <= 129600) {return "1 giorno fa";}
    if (diff < 604800) {return Math.round(diff / 86400) + " giorni fa";}
    if (diff <= 777600) {return "1 settimana fa";}
    return "on " + system_date;
}

// from http://widgets.twimg.com/j/1/widget.js
var K = function () {
    var a = navigator.userAgent;
    return {
        ie: a.match(/MSIE\s([^;]*)/)
    }
}();
// ----------------------------------------------------------------------------------------------------------------





//Funzione per inviare al server il tweet selezionato e riceverne l'analisi 
async function inviaTweetSelezionato(tweetSelezionato) {

    //console.log("Hai selezionato il tweet: " + tweetSelezionato)

    //Send selected tweet to the server
    const data = { tweet_selected: tweetSelezionato };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    //Response
    const response = await fetch('/tweets', options);
    const classificazioneRicevuta = await response.json();
    //console.log("Il tweets: " + classificazioneRicevuta.tweetAnalizzato + " è stato giudicato come: " + classificazioneRicevuta.risultato);

    tweetAnalizzato = classificazioneRicevuta.tweet;
    categoriaRicevuta = classificazioneRicevuta.risultato;

    //Addestramento semplice
    var testoTweet_Semplice = document.createElement('p');
    testoTweet_Semplice.className = 'text-s'
    testoTweet_Semplice.textContent = tweetAnalizzato;
    var card_semplice = document.createElement('div');
    card_semplice.className = 'card card-body card-addestramento-semplice';

    //Addestramento guidato
    var testoTweet_Guidato = document.createElement('p');
    testoTweet_Guidato.className = 'text-g'
    testoTweet_Guidato.textContent = `Il seguente tweet: ${tweetAnalizzato} è stato associato alla categoria `;

    const badgeCat_guidato = document.createElement('span');
    badgeCat_guidato.className = 'badge bg-secondary';
    badgeCat_guidato.textContent = categoriaRicevuta;

    var card_guidato = document.createElement('div');
    card_guidato.className = 'card card-body card-addestramento-guidato';

    //Addestramento automatico
    var testoTweet_automatico = document.createElement('p');
    testoTweet_automatico.className = 'text-a'
    testoTweet_automatico.textContent = `Il seguente tweet: ${tweetAnalizzato} è stato associato alla categoria `;

    const badgeCat_automatico = document.createElement('span');
    badgeCat_automatico.className = 'badge bg-secondary';
    badgeCat_automatico.textContent = categoriaRicevuta;

    var card_automatico = document.createElement('div');
    card_automatico.className = 'card card-body card-addestramento-automatico';

    if (document.getElementsByClassName('text-s')[0] != null) {
        document.getElementsByClassName('text-s')[0].remove();
        document.getElementsByClassName('card-addestramento-semplice')[0].remove();
        document.getElementsByClassName('text-g')[0].remove();
        document.getElementsByClassName('card-addestramento-guidato')[0].remove();
        document.getElementsByClassName('text-a')[0].remove();
        document.getElementsByClassName('card-addestramento-automatico')[0].remove();
    }
    //Addestramento semplice
    document.getElementById('addestramento-semplice').insertBefore(card_semplice, document.getElementById('form-label-s'));
    document.getElementsByClassName('card-addestramento-semplice')[0].appendChild(testoTweet_Semplice);
    
    //Addestramento guidato
    document.getElementById('addestramento-guidato').insertBefore(card_guidato, document.getElementById('progress-g'));
    document.getElementsByClassName('card-addestramento-guidato')[0].appendChild(testoTweet_Guidato);
    testoTweet_Guidato.append(badgeCat_guidato);

    //Addestramento automatico
    document.getElementById('addestramento-automatico').insertBefore(card_automatico, document.getElementById('progress-a'));
    document.getElementsByClassName('card-addestramento-automatico')[0].appendChild(testoTweet_automatico);
    testoTweet_automatico.append(badgeCat_automatico);

}// --------------------------------------- chiusura funzione inviaTweetSelezionato --------------------------------------- 


/* Addesetramento semplice */
// L'utente può scegliere tra le categorie già esistenti e assegnare una di queste al tweet selezionato
// oppure
// Può creare una nuova categoria e assegnarla al tweet selezionato 

let categoriaScelta = null;

function categoriaSemplice(){
    categoriaScelta = "";
    var catS = document.querySelector('.form-control').value;
    // console.log(catS);


    //Non è stato selezionato un tweet ne scritta una categoria
    if(tweetSelezionato === null && catS === "") {
        //Non è stato selezionato un trend
        if(trendSelezionato === null){
            document.getElementById('modal-addestramento').textContent = `Forse devi prima scegliere un trend, altrimenti non potrai leggere nessun tweets...`
            $('#sempliceModal').modal('show');
        } else {
            document.getElementById('modal-addestramento').textContent = `Devi selezionare un tweet e scrivere una categoria, altrimenti Bluetrends non imparerà mai nulla! :)`
            $('#sempliceModal').modal('show');
        }
    }
    //è stato selezionato un tweet ma non è stata scritta una categoria
    if(tweetSelezionato != null && catS === ''){
        document.getElementById('modal-addestramento').textContent = `Devi scrivere una categoria, solo il tweet non serve a Bluetrends! :)`
        $('#sempliceModal').modal('show');
    }
    //no è stato selezionato un tweet ma è stata scritta una categoria
    if(tweetSelezionato === null && catS != ''){
        document.getElementById('modal-addestramento').textContent = `Devi slezionare un tweet, la sola categoria non serve a Bluetrends! :)`
        $('#sempliceModal').modal('show');
    }

    const domanda = document.createElement('span');
    domanda.textContent = ' ?';

    if(tweetSelezionato != null && catS != ''){
        const badgeCat_s = document.createElement('span');
        badgeCat_s.className = 'badge bg-secondary';
        badgeCat_s.textContent = catS;

        document.getElementById('modal-addestramento').textContent = `Vuoi assegnare il tweet: ${tweetSelezionato} alla categoria `
        document.getElementById('modal-addestramento').appendChild(badgeCat_s)
        document.getElementById('modal-addestramento').appendChild(domanda)

        $('#sempliceModal').modal('show');
    }

    categoriaScelta = catS;
    
}

function insegnaCategoria(){
    //Salva quello che c'è scritto nel form
    //var categoriaScelta = document.querySelector('.form-control').value;
    
    document.querySelector('.form-control').value = "";


    //Se il form non è vuoto invia la categoria scelta al server    
    if(categoriaScelta != "" && tweetSelezionato != null){ 
        inviaCategoriaSemplice(categoriaScelta, tweetAnalizzato);
    } 

    
}

//Funzione per inviare la categoria scelta dall'utente al server
async function inviaCategoriaSemplice(categoriaScelta, tweetAnalizzato) {
    
    const data = {categoriaScelta, tweetAnalizzato};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    //Response
    const response = await fetch('/categorysemplice', options);
    const rispostaInsegnamento = await response.json();
    //console.log(rispostaInsegnamento);    
}


/* Addestramento guidato */
//Viene proposta un categoria all'utente, che può confermarla
// Oppure
// Scegliere una categoria tra quelle proposte (senza aggiungerle)





function selezionaCategoria(){
    categoriaScelta = document.getElementById('form-g').value;
}

function categoriaGuidato(){
    const badgeCat_g = document.createElement('span');
    badgeCat_g.className = 'badge bg-secondary';

    const domanda = document.createElement('span');
    domanda.textContent = ' ?';

    //Non è stato selezionato un tweet
    if(tweetSelezionato === null) {
        document.getElementById('modal-addestramento-guidato').textContent = `Devi selezionare prima un tweet!`;
        $('#guidatoModal').modal('show'); 
        //Non è stato selezionato un trend
        if(trendSelezionato === null){
            document.getElementById('modal-addestramento-guidato').textContent = `Devi selezionare prima un trend, altrimenti non potrai leggere nessun tweets...`
            $('#guidatoModal').modal('show'); 
        }
    }
    
    if (categoriaScelta === null && tweetSelezionato != null){
        badgeCat_g.textContent = categoriaRicevuta;


        document.getElementById('modal-addestramento-guidato').textContent = `Vuoi assegnare il tweet: ${tweetSelezionato} alla categoria `
        document.getElementById('modal-addestramento-guidato').appendChild(badgeCat_g);
        document.getElementById('modal-addestramento-guidato').appendChild(domanda);
  
        $('#guidatoModal').modal('show'); 
    } 


    if(categoriaScelta != null && tweetSelezionato != null){ 
       
       if(categoriaScelta === "null"){
            badgeCat_g.textContent = categoriaRicevuta;
       } else {
            badgeCat_g.textContent = categoriaScelta;
       }
        

        document.getElementById('modal-addestramento-guidato').textContent = `Vuoi assegnare il tweet: ${tweetSelezionato} alla categoria `
        document.getElementById('modal-addestramento-guidato').appendChild(badgeCat_g);
        document.getElementById('modal-addestramento-guidato').appendChild(domanda);

        $('#guidatoModal').modal('show'); 
    }
}

async function inviaCategoriaGuidato(){

    $('#form-g option').prop('selected', function() {
        return this.defaultSelected;
    });

    if (categoriaScelta == null){
        categoriaScelta = categoriaRicevuta;
        //console.log("Hai confermato il tweet " + tweetAnalizzato + " come " + categoriaRicevuta); 
        document.getElementById('modal-addestramento-guidato').textContent = `Hai assegnato il tweet: ${tweetSelezionato} alla categoria ${categoriaRicevuta}`
        
    }
    else{ 
        //console.log("Hai cambiato il tweet " + tweetAnalizzato + " come " + categoriaScelta);
        document.getElementById('modal-addestramento-guidato').textContent = `Hai assegnato il tweet: ${tweetSelezionato} alla categoria ${categoriaScelta}` 
    }   

    
    //Conferma al server la categoria ricevuta -> invia al server il tweet e la categoria 
    //che verranno utilizzati per imparare
    const data = {categoriaScelta, tweetAnalizzato};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    //Response
    const response = await fetch('/categoryguidato', options);
    const rispostaInsegnamento = await response.json();
    //console.log(rispostaInsegnamento);    

}