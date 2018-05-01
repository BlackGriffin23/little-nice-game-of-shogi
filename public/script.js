"use strict";

let socket = new WebSocket('ws://localhost:8081')

let piecesdata = {}

//getJSON()

chatfield.innerHTML+="<div class='alert alert-success' role='alert'>Добро пожаловать на мой уютный сервер для сёги. Узнать побольше о сёги можно, нажав клавишу h. Чтобы увидеть список известных проблем и контакты, нажмите p.</div>"

let status=""
let started=false
let fromhand=false
let phand=""

socket.onopen = function() {
    console.log("here we go!")
}

socket.onmessage = function(mess) {
    //console.log(mess.data)

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
    else if (mess.data=="whitewon") {
        chatfield.innerHTML+="<div class='alert alert-primary' role='alert'>Данная игра была выиграна игроком за белых! Новая игра сейчас начнётся... </div>"
    }
    else if (mess.data=="blackwon") {
        chatfield.innerHTML+="<div class='alert alert-primary' role='alert'>Данная игра была выиграна игроком за чёрных! Новая игра сейчас начнётся... </div>"
    }
    else if (mess.data=="gamestart") {
        chatfield.innerHTML+="<div class='alert alert-warning' role='alert'>Игра началась!</div>"
        let field = document.createElement("table")
        for (let i=0; i<9; i+=1) {
            let stri = document.createElement("tr")
            for (let j=0; j<9; j+=1) {
                let point = document.createElement("td")
                point.setAttribute("abs", j)
                point.setAttribute("ord", 8-i)
                point.setAttribute("occupation", "no")
                let d = document.createElement("div")
                point.appendChild(d)
                stri.appendChild(point)
            }
            field.appendChild(stri)
        }
        document.body.insertBefore(field, document.body.children[0])
        for (let i=0; i<9; i+=1) {
            for (let j=0; j<9; j+=1) {
                let point=$('td[abs="'+j.toString()+'"][ord="'+i.toString()+'"]').get(0)
                point.addEventListener("click", function(){choosefield(point.getAttribute("abs"), point.getAttribute("ord"), point.getAttribute("occupation"))})
            }
        }
        let bhand=document.createElement("div")
        bhand.id="bhand"
        let whand=document.createElement("div")
        whand.id="whand"
        let surr=document.createElement("button")
        surr.innerHTML="Сдаться?.."
        bhand.classList.add("up", "hand")
        surr.classList.add("up")
        whand.classList.add("up", "hand")
        surr.addEventListener("click", function(){socket.send("surr")})
        document.body.insertBefore(bhand, document.body.children[0])
        document.body.insertBefore(surr, document.body.children[1])
        document.body.insertBefore(whand, document.body.children[2])
    }
    else if (typeof(JSON.parse(mess.data)["king"])!=='undefined') {
        piecesdata=JSON.parse(mess.data)
    }
    else {
        let pieces = JSON.parse(mess.data)
        //console.log(pieces)
        if (started) {
            let everything=$("td")
            //console.log(everything.get(0).getElementsByTagName("div")[0].classList)
            for (let i in everything) {
                //console.log(everything.get(i).getElementsByTagName("div")[0])
                if (typeof everything.get(i).classList!=='undefined') {
                    everything.get(i).getElementsByTagName("div")[0].classList.remove("wk", "wkn", "wp", "wl", "wr", "wb", "wg", "ws", "bk", "bkn", "bp", "br", "bb", "bl", "bg", "bs", "wpp", "wpkn", "wpl", "wpr", "wpb", "wps", "bpp", "bpkn", "bpl", "bpr", "bpb", "bps")
                }
                if (typeof everything.get(i).setAttribute!="undefined") {
                    everything.get(i).setAttribute("occupation", "no")
                }
            }
            let hands=[]
            hands[0]=$("div.hand").get(0)
            hands[1]=$("div.hand").get(1)
            for (let i in hands) {
                if (hands[i].children.length) {
                    for (let j in hands[i].children) {
                        if (typeof hands[i].children[j] == "object") {
                            hands[i].removeChild(hands[i].children[j])
                        }
                    }
                }
            }
        }
        for (let piece in pieces) {
            //console.log(toString(pieces[piece].absciss))
            if (pieces[piece].absciss!="hand") {
                let find='td[abs="'+pieces[piece].absciss.toString()+'"][ord="'+pieces[piece].ordinate.toString()+'"]'
                //console.log(pieces[piece].affinity)
                let cur=$(find).get(0)
                //console.log(cur)
                let n=cur.getElementsByTagName("div")[0]
                //console.log(n)
                n.classList.add(((pieces[piece].affinity=='white') ? 'w' : 'b')+((pieces[piece].piece.charAt(pieces[piece].piece.length-1)=='p' && pieces[piece].piece!='bishop') ? 'p' : '')+(pieces[piece].piece=='knight' ? 'kn' : pieces[piece].piece.charAt(0)))
                //console.log((pieces[piece].affinity=='white' ? "white " : "black ") + pieces[piece].piece)
                cur.setAttribute("occupation", (pieces[piece].affinity=='white' ? "white " : "black ") + pieces[piece].piece)
                //console.log(cur)
            }
            else {
                let p = document.createElement("div")
                console.log(pieces[piece].piece, pieces[piece].piece.length)
                p.classList.add(((pieces[piece].affinity=='white') ? 'w' : 'b')+(pieces[piece].piece=='knight' ? 'kn' : pieces[piece].piece.charAt(0)))
                let type=(pieces[piece].affinity=='white' ? "white " : "black ") + pieces[piece].piece
                p.setAttribute("type", type)
                p.addEventListener("click", function() {choosehand(type)})
                let hands=[]
                hands[0]=$("div.hand").get(0)
                hands[1]=$("div.hand").get(1)
                let hneed = hands[(pieces[piece].affinity=='white' ? 1 : 0)]
                hneed.appendChild(p)
            }
        }
        if (!started) started=true
        else {
            for (let i=6; i<9; i++) {
                for (let j=0; j<9; j++){
                    let n=$("td[abs="+String(j)+"][ord="+String(((status=="black")*8)+i*(1-(2*(status=="black"))))+"]")
                    if (typeof(n.get(0))!=='undefined') {
                        //console.log(n.get(0).getAttribute("occupation"))
                        if (typeof(n.get(0).getAttribute("occupation"))!=='undefined'){
                            if (n.get(0).getAttribute("occupation").substr(0,5)==status) {
                                if (n.get(0).getAttribute('occupation').charAt(n.get(0).getAttribute('occupation').length-1)!='p' || n.get(0).getAttribute('occupation').substr(6)=='bishop'){
                                    if (piecesdata[(n.get(0).getAttribute('occupation').substr(6))].promote!='none') {
                                        if (confirm("Вы хотите перевернуть фигуру " + n.get(0).getAttribute('occupation').substr(6) + " на поле " + n.get(0).getAttribute('abs') + " " + n.get(0).getAttribute('ord') + '?')) {
                                            let prom={
                                                "status": "promote",
                                                "x": j, 
                                                "y": ((status=="black")*8)+i*(1-(2*(status=="black")))
                                            }
                                            socket.send(JSON.stringify(prom))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}



function choosehand(piece) {
     for (let i in $("td")) {
        if (typeof $("td").get(i).classList!=='undefined'){
            if (!($("td").get(i).classList.contains("selected"))) {
                //if (($("td").get(i).getAttribute("occupation")!="no") && ($("td").get(i).getAttribute("occupation")[0]!=status[0])) $("td").get(i).classList.add("attack")
                if (($("td").get(i).getAttribute("occupation")=="no")) $("td").get(i).classList.add("available")
            }
        }
        //$("td").get(i).classList.add("available")
    }
    fromhand=true
    phand=piece
}

document.addEventListener("keydown", function(e){
    if (e.keyCode==72) {
        location.href="./help.html"
    }
    if (e.keyCode==80) {
            location.href="./problems.html"
        }
})

function clearfield() {
    for (let i=0; i<9; i+=1) {
        for (let j=0; j<9; j+=1) {
            $('td[abs="'+j.toString()+'"][ord="'+i.toString()+'"]').get(0).classList.remove("attack", "available", "selected")
        }
    }
}

function choosefield(abs, ord, occ){
    //console.log('td[abs="'+abs+'"][ord="'+ord+'"]')
    //console.log(occ!="no")
    //console.log(($('td[abs="'+abs+'"][ord="'+ord+'"]').get(0).classList.contains("available")) || ($('td[abs="'+abs+'"][ord="'+ord+'"]').get(0).classList.contains("attack")))
    //console.log(typeof($("td.selected").get(0)) == "undefined")
    ord=parseInt(ord)
    abs=parseInt(abs)
    if (occ!="no") {
        //console.log("occupied")
        if (typeof($("td.selected").get(0)) == "undefined") {
            //console.log("working?!")
            if (occ.substr(0, 5)==status) {
                 $('td[abs="'+abs+'"][ord="'+ord+'"]').get(0).classList.add("selected")
                //console.log("yep")
                //for testing - on honest word
                //for (let i in $("td")) {
                //    if (typeof $("td").get(i).classList!=='undefined'){
                //        if (!($("td").get(i).classList.contains("selected"))) {
                //            if (($("td").get(i).getAttribute("occupation")!="no") && ($("td").get(i).getAttribute("occupation")[0]!=status[0])) $("td").get(i).classList.add("attack")
                //            else if ($("td").get(i).getAttribute("occupation")[0]!=status[0]) $("td").get(i).classList.add("available")
                //        }
                //    }
                //$("td").get(i).classList.add("available")
                //}
                
                let moves
                if (piecesdata[occ.substr(6)].move=='n//a') moves='n//a'
                else {
                    moves=[]
                    for (let i in piecesdata[occ.substr(6)].move) {
                        moves[i]=piecesdata[occ.substr(6)].move[i]
                    }
                }
                if (moves!='n//a'){
                    if (status==("black")) {
                        for (let j=0, z=4; j<4; j++, z++) {
                            let temp=moves[j]
                            moves[j]=moves[z]
                            moves[z]=temp
                        }
                    }
                }
                console.log(moves)
                if (moves=='n//a') {
                    if ((piecesdata[occ.substr(6)]).isknight==true) {
                        let x1=(abs+1), y=(ord+2-(4*(status=="black")))
                        let x2=(abs-1)
                        if (typeof(x1)=='number') {
                            console.log(isNaN(x1))
                            console.log(isNaN(x2))
                            console.log(isNaN(y))
                        }
                        let f1=$("td[abs="+x1+"]"+"[ord="+y+"]").get(0)
                        let f2=$("td[abs="+x2+"]"+"[ord="+y+"]").get(0)
                        console.log(f1, f2)
                        if (f1.hasAttribute("occupation")) {
                            if ((f1.getAttribute("occupation")!="no") && (f1.getAttribute("occupation")[0]!=status[0])) f1.classList.add("attack")
                            else if (f1.getAttribute("occupation")[0]!=status[0]) f1.classList.add("available")
                        }
                        if (f2.hasAttribute("occupation")) {
                            if ((f2.getAttribute("occupation")!="no") && (f2.getAttribute("occupation")[0]!=status[0])) f2.classList.add("attack")
                            else if (f2.getAttribute("occupation")[0]!=status[0]) f2.classList.add("available")
                        }
                    }
                    // else ignore
                }
                else {
                    let flag=false
                    for (let i=ord+1, m=0; (i<9) && (m<moves[0]) && (!flag); i++, m++) {
                        console.log(1)
                        let f=$("td[abs="+abs+"]"+"[ord="+i+"]").get(0)
                        console.log(f)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                            
                                else {
                                    if (f.getAttribute("occupation")[0]!=status[0]) {
                                        f.classList.add("attack")
                                    }
                                    flag=true
                                }
                            }
                        }
                    }
                    flag=false;
                    for (let i=ord+1, j=abs+1, m=0; (i<9) && (m<moves[1]) && (j<9) && (!flag); i++, j++, m++) {
                        console.log(2)
                        let f=$("td[abs="+j+"]"+"[ord="+i+"]").get(0)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                            
                                else {
                                    if (f.getAttribute("occupation")[0]!=status[0]) {
                                        f.classList.add("attack")
                                    }
                                    flag=true
                                }
                            }
                        }
                    }
                    flag=false;
                    for (let i=abs+1, m=0; (i<9) && (m<moves[2]) && (!flag); i++, m++) {
                        console.log(3)
                        let f=$("td[abs="+i+"]"+"[ord="+ord+"]").get(0)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                                else {
                                    if (f.getAttribute("occupation")[0]!=status[0]) {
                                        f.classList.add("attack")
                                    }
                                    flag=true
                                }
                            }
                        }
                        console.log(flag)
                    }
                    flag=false;
                    for (let i=ord-1, j=abs+1, m=0; (i>=0) && (m<moves[3]) && (j<8) && (!flag); i--, j++, m++) {
                        console.log(4)
                        let f=$("td[abs="+j+"]"+"[ord="+i+"]").get(0)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                            }
                            else {
                                if (f.getAttribute("occupation")[0]!=status[0]) {
                                    f.classList.add("attack")
                                }
                                flag=true
                            }
                        }
                    }
                    flag=false;
                    for (let i=ord-1, m=0; (i>=0) && (m<moves[4]) && (!flag); i--, m++) {
                        console.log(5)
                        let f=$("td[abs="+abs+"]"+"[ord="+i+"]").get(0)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                            
                                else {
                                    if (f.getAttribute("occupation")[0]!=status[0]) {
                                        f.classList.add("attack")
                                    }
                                    flag=true
                                }
                            }
                        }
                    }
                    flag=false;
                    for (let i=ord-1, j=abs-1, m=0; (i>=0) && (m<moves[5]) && (j>=0) && (!flag); i--, j--, m++) {
                        console.log(6)
                        let f=$("td[abs="+j+"]"+"[ord="+i+"]").get(0)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                            
                                else {
                                    if (f.getAttribute("occupation")[0]!=status[0]) {
                                        f.classList.add("attack")
                                    }
                                    flag=true
                                }
                            }
                        }
                    }
                    flag=false;
                    for (let i=abs-1, m=0; (i>=0) && (m<moves[6]) && (!flag); i--, m++) {
                        console.log(7)
                        let f=$("td[abs="+i+"]"+"[ord="+ord+"]").get(0)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                            
                                else {
                                    if (f.getAttribute("occupation")[0]!=status[0]) {
                                        f.classList.add("attack")
                                    }
                                    flag=true
                                }
                            }
                        }
                    }
                    flag=false;
                    for (let i=ord+1, j=abs-1, m=0; (i<9) && (m<moves[7]) && (j>=0) && (!flag); i--, j--, m++) {
                        console.log(8)
                        let f=$("td[abs="+j+"]"+"[ord="+i+"]").get(0)
                        if (typeof(f)!='undefined'){
                            if (f.hasAttribute("occupation")) {
                                if (f.getAttribute("occupation")=="no") {
                                    f.classList.add("available")
                                }
                            
                                else {
                                    if (f.getAttribute("occupation")[0]!=status[0]) {
                                        f.classList.add("attack")
                                    }
                                    flag=true
                                }
                            }
                        }
                    }
                }
            }
        }
        
        
        else if (($('td[abs="'+abs+'"][ord="'+ord+'"]').get(0).classList.contains("available")) || ($('td[abs="'+abs+'"][ord="'+ord+'"]').get(0).classList.contains("attack"))) {
            //console.log("yay!")
            if (!fromhand) {
                let turnstartx=parseInt($("td.selected").get(0).getAttribute("abs"))
                let turnstarty=parseInt($("td.selected").get(0).getAttribute("ord"))
                    
                let turn = {
                    "status": status,
                    "x1": turnstartx,
                    "y1": turnstarty,
                    "x2": parseInt(abs),
                    "y2": parseInt(ord)
                }
                //console.log(turn)
                socket.send(JSON.stringify(turn))
                clearfield()
            }
            else {
                let turnstartx="hand"
                let turnstarty="hand"
                
                let turn = {
                    "status": status,
                    "x1": turnstartx,
                    "y1": turnstarty,
                    "x2": parseInt(abs),
                    "y2": parseInt(ord),
                    "piece": phand
                }
                //console.log(turn)
                socket.send(JSON.stringify(turn))
                clearfield()
                fromhand=false
                phand=""
            }
        }
        else {
           clearfield()
        }
    }
    
    //else {
    //    clearfield()
    //}
    else if (($('td[abs="'+abs+'"][ord="'+ord+'"]').get(0).classList.contains("available")) || ($('td[abs="'+abs+'"][ord="'+ord+'"]').get(0).classList.contains("attack"))) {
        //console.log("yay!")
        if (!fromhand) {
                let turnstartx=parseInt($("td.selected").get(0).getAttribute("abs"))
                let turnstarty=parseInt($("td.selected").get(0).getAttribute("ord"))
                    
                let turn = {
                    "status": status,
                    "x1": turnstartx,
                    "y1": turnstarty,
                    "x2": parseInt(abs),
                    "y2": parseInt(ord)
                }
                //console.log(turn)
                socket.send(JSON.stringify(turn))
                clearfield()
            }
            else {
                let turnstartx="hand"
                let turnstarty="hand"
                
                let turn = {
                    "status": status,
                    "x1": turnstartx,
                    "y1": turnstarty,
                    "x2": parseInt(abs),
                    "y2": parseInt(ord),
                    "piece": phand
                }
                //console.log(turn)
                socket.send(JSON.stringify(turn))
                clearfield()
                fromhand=false
                phand=""
            }
    }
    else {
        clearfield()
    }
}