"use strict";

let socket = new WebSocket('ws://localhost:8081')

chatfield.innerHTML+="<div class='alert alert-success' role='alert'>Добро пожаловать на мой уютный сервер для сёги. Узнать побольше о сёги можно, нажав клавишу h.</div>"

let status=""

socket.onopen = function() {
    console.log("here we go!")
}

socket.onmessage = function(mess) {
    console.log(mess.data)

    if (mess.data=="white") {
        chatfield.innerHTML+="<div class='alert alert-primary' role='alert'>Вы теперь игрок за белых.</div>"
        status='white'
    }
    else if (mess.data=="black") {
        chatfield.innerHTML+="<div class='alert alert-primary' role='alert'>Вы теперь игрок за чёрных.</div>"
        status='black'
    }
    else if (mess.data=="spect") {
        chatfield.innerHTML+="<div class='alert alert-secondary' role='alert'>Вы сейчас - зритель.</div>"
        status='spect'
    }
    else if (mess.data=="whiteleft") {
        chatfield.innerHTML+="<div class='alert alert-warning' role='alert'>Белый игрок покинул игру! Новым белым игроком станет один из зрителей. </div>"
    }
    else if (mess.data=="blackleft") {
        chatfield.innerHTML+="<div class='alert alert-warning' role='alert'>Чёрный игрок покинул игру! Новым чёрным игроком станет один из зрителей. </div>"
    }
    else if (mess.data=="spectleft") {
        chatfield.innerHTML+="<div class='alert alert-secondary' role='alert'>Один из зрителей покинул игру.</div>"
    }
    else if (mess.data=="gamestart") {
        chatfield.innerHTML+="<div class='alert alert-warning' role='alert'>Игра началась!</div>"
        let field = document.createElement("table");
        for (let i=0; i<9; i+=1) {
            let stri = document.createElement("tr")
            for (let j=0; j<9; j+=1) {
                let point = document.createElement("td")
                point.setAttribute("abs", j)
                point.setAttribute("ord", i)
                point.setAttribute("occupation", "no")
                stri.appendChild(point)
            }
            field.appendChild(stri)
        }
        document.body.insertBefore(field, document.body.children[0])
        
    }
    else {
        let pieces = JSON.parse(mess.data)
        console.log(pieces)
        for (let piece in pieces) {
            //console.log(toString(pieces[piece].absciss))
            let find='td[abs="'+pieces[piece].absciss.toString()+'"][ord="'+pieces[piece].ordinate.toString()+'"]'
            console.log(pieces[piece].affinity)
            let cur=$(find)
            console.log(cur)
            cur.innerHTML=((pieces[piece].affinity=="white") ? "white " : "black ")+pieces[piece].piece
            
        }
    }
}



document.addEventListener("keydown", function(e){
    if (e.keyCode==72) {
        location.href="./help.html"
    }
})

