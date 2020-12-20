
// Il client riceve le categorie direttamente
getVocabolario();


// Funzione per ricere i trends
async function getVocabolario() {
    const response = await fetch ('/vocabolario');
    const data = await response.json();
    //console.log(data);

    //console.log("Ho ricevuto le categorie esistenti dal server!")
   

    // Il client riceve anche le categorie che il classificatore conosce già
    var i = 1;
    for (item of data.categorie){
                  
            // Aggiunge le categorie conosciute nella pagina web
            //console.log(item);

            // Crea elemento <div class="col">
            const col_categoria = document.createElement('div');
            col_categoria.className = 'col gy-2';
            document.getElementById('row-categorie').appendChild(col_categoria);

            // Crea elemento <div class="accordion" id="accordionExample">
            const accordion = document.createElement('div');
            accordion.className = 'accordion';
            accordion.id = 'accordionExample'+i;
            col_categoria.append(accordion);

            // Crea elemento <div class="accordion-item">
            const accordion_item = document.createElement('div');
            accordion_item.className = 'accordion-item';
            accordion.append(accordion_item);

            // Crea elemento <h2 class="accordion-header" id="headingOne">
            const accordion_header = document.createElement('h2');
            accordion_header.className = 'accordion-header';
            accordion_header.id = 'headingOne';
            accordion_item.append(accordion_header);

            // Crea elemento <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">Accordion Item #1</button>
            const accordion_button = document.createElement('button');
            accordion_button.className = 'accordion-button btn-light btn-vocabolario'
            accordion_button.setAttribute("type", "button");
            accordion_button.setAttribute("data-bs-toggle", "collapse");
            accordion_button.setAttribute("data-bs-target", `#collapseOne${i}`);
            accordion_button.setAttribute("aria-expanded", "false");
            accordion_button.setAttribute("aria-controls", `collapseOne${i}`);
            

            accordion_button.addEventListener("click", myScript);
            function myScript(){

              
                style = window.getComputedStyle(accordion_button),
                bord = style.getPropertyValue('border-bottom-left-radius');

                console.log(bord)

                if(bord=="16px"){
                    accordion_button.style.setProperty("border-bottom-left-radius", "0", "important");
                    accordion_button.style.setProperty("border-bottom-right-radius", "0", "important");
                } else {
                    accordion_button.style.setProperty("border-bottom-left-radius", "16px", "important");
                    accordion_button.style.setProperty("border-bottom-right-radius", "16px", "important");
                }
               
                    
            }

            accordion_button.textContent = `${item}`;
            accordion_header.append(accordion_button);

            // Crea elemento <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
            const accordion_collapse = document.createElement('div');
            accordion_collapse.className = 'accordion-collapse collapse accordion-vocabolario';
            accordion_collapse.id = `collapseOne${i}`;
            accordion_collapse.setAttribute("aria-labelledby", "headingOne");
            accordion_collapse.setAttribute("data-bs-parent",  `#accordionExample${i}`);
            accordion_item.append(accordion_collapse);

            // Crea elemento <div class="accordion-body">
            const accordion_body = document.createElement('div');
            accordion_body.className = 'accordion-body accordion-body-vocabolario';
            accordion_body.id = `accordion-body${i}`;
            accordion_collapse.append(accordion_body);

            // --- 

            // Crea elemento <ul class="list-group">
            const list_group = document.createElement('ul');
            list_group.className = 'list-group';
            list_group.id = `gruppo${i}`

            document.getElementById(`accordion-body${i}`).appendChild(list_group);

            var categoria = item;

            for (item of data.vocabolario[categoria]){
                //console.log(item)
                // Crea elemento <li class="list-group-item">
                const list_group_item = document.createElement('li');
                list_group_item.className = 'list-group-item item-vocabolario';
                list_group_item.textContent = `${item.parola}`

                document.getElementById(`gruppo${i}`).appendChild(list_group_item);
            }
        i++
            
    }// chiusura for categorie 
   
}// --------------------------------------- chiusura funzione riceviTrends --------------------------------------- 


/*
getVocabolario()

async function getVocabolario() {
    const response = await fetch ('/vocabolario');
    const data = await response.json();
    console.log(data);

}
*/