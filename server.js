let http = require('http')

let static = require('node-static')

let WebSocket = new require('ws')

piecesdata = require('./public/pieces.json')

http.createServer(accept).listen(8080)

let file = new static.Server('./public')

function accept(req, res){

    file.serve(req, res)

}

let clients = {}
let cur=0
let WebSocketServer = new WebSocket.Server({port:8081})
gamestarted=false;
let pieces=[]
spectcount=0;
whitemissing=false
blackmissing=false
thisturn="no"
function send_everyone(message) {
    for (let id in clients) {
            clients[id].send(message)
    }
}

function find_spect() {
    for (let id in clients) {
        if (clients[id].status=='spect') {
            return id
        }
    }
}

function create_piece(name, x, y, affinity) {
    let piece = {
        'piece': name,
        'absciss': x,
        'ordinate': y,
        'affinity': affinity
   }
    return piece
}

function gamestart() {
    pieces[1]=create_piece('lance', 0, 0, 'white')
    pieces[2]=create_piece('knight', 1, 0, 'white')
    pieces[3]=create_piece('silver', 2, 0, 'white')
    pieces[4]=create_piece('gold', 3, 0, 'white')
    pieces[5]=create_piece('king', 4, 0, 'white')
    pieces[6]=create_piece('gold', 5, 0, 'white')
    pieces[7]=create_piece('silver', 6, 0, 'white')
    pieces[8]=create_piece('knight', 7, 0, 'white')
    pieces[9]=create_piece('lance', 8, 0, 'white')
    pieces[10]=create_piece('bishop', 1, 1, 'white')
    pieces[11]=create_piece('rook', 7, 1, 'white')
    for (let i=12; i<21; i+=1) {
        pieces[i]=create_piece('pawn', i-12, 2, 'white')
    }
    pieces[21]=create_piece('lance', 0, 8, 'black')
    pieces[22]=create_piece('knight', 1, 8, 'black')
    pieces[23]=create_piece('silver', 2, 8, 'black')
    pieces[24]=create_piece('gold', 3, 8, 'black')
    pieces[25]=create_piece('king', 4, 8, 'black')
    pieces[26]=create_piece('gold', 5, 8, 'black')
    pieces[27]=create_piece('silver', 6, 8, 'black')
    pieces[28]=create_piece('knight', 7, 8, 'black')
    pieces[29]=create_piece('lance', 8, 8, 'black')
    pieces[30]=create_piece('bishop', 7, 7, 'black')
    pieces[31]=create_piece('rook', 1, 7, 'black')
    for (let i=32; i<41; i+=1) {
        pieces[i]=create_piece('pawn', i-32, 6, 'black')
    }
    pieces = pieces.filter(function(x) {
        return x !== undefined && x !== null; 
    });
    gamestarted=true
    thisturn="white"
    send_everyone(JSON.stringify(pieces))
}

WebSocketServer.on('connection', function(ws) {
    let id = cur
    
    clients[id]=ws
    if (id==0) {
        clients[id].status='white'
        clients[id].send('white')
        if (gamestarted){ 
            clients[id].send('gamestart')
            clients[id].send(JSON.stringify(pieces))
        }
        whitemissing=false
    }
    else if (id==1) {
        clients[id].status='black'
        clients[id].send('black')
        
        if (!blackmissing) {
            send_everyone('gamestart')
            gamestart()
        }
        else {
            clients[id].send('gamestart')
            clients[id].send(JSON.stringify(pieces))
        }
        blackmissing=false
    }
    else {
        clients[id].status='spect'
        clients[id].send('spect')
        if (gamestarted){
            clients[id].send('gamestart')
            clients[id].send(JSON.stringify(pieces))
        }
        spectcount+=1
    }
    cur+=1
    
    clients[id].send(JSON.stringify(piecesdata))


ws.on('message', function(message) {
    if (message=="surr") {
        if (clients[id].status!="spect") {
            if (clients[id].status=="white") {
                send_everyone('blackwon')
            }
            else {
                send_everyone('whitewon')
            }
            gamestart()
        }
    }
    else {
        //console.log(message)
        let turn=JSON.parse(message)
        console.log(turn)
        //console.log(thisturn)
        if (turn.status==thisturn) {
            for (i in pieces) {
                if ((pieces[i].absciss==turn.x2)&&(pieces[i].ordinate)==turn.y2) {
                    pieces[i].absciss="hand"
                    pieces[i].ordinate="hand"
                    pieces[i].affinity=(pieces[i].affinity=='white' ? 'black' : 'white')
                    console.log(pieces[i].piece)
                    if (pieces[i].piece.charAt(pieces[i].piece.length-1)=='p' && pieces[i].piece!='bishop') {
                        pieces[i].piece=pieces[i].piece.slice(0,  pieces[i].piece.length-1)
                        console.log(pieces[i].piece)
                    }
                    console.log(pieces[i])
                }
            }
            if (turn.x1!="hand") {
                for (i in pieces) {
                    if ((pieces[i].absciss==turn.x1)&&(pieces[i].ordinate)==turn.y1) {
                        pieces[i].absciss=turn.x2
                        pieces[i].ordinate=turn.y2
                    }
                }
            }
            else {
                //if (thisturn=="white") {
                    for (let i in pieces) {
                        if ((pieces[i].absciss==turn.x1)&&(pieces[i].piece==turn.piece.substring(6)) && (turn.piece.substring(0, 5)==thisturn)) {
                            pieces[i].absciss=turn.x2
                            pieces[i].ordinate=turn.y2
                        }
                    }
                //}
            }
            send_everyone(JSON.stringify(pieces))
            if (thisturn=="white") thisturn="black"
            else thisturn="white"
        }
        else if (turn.status=="promote") {
            for (i in pieces) {
                if (pieces[i].absciss==turn.x && pieces[i].ordinate==turn.y) {
                    console.log(piecesdata[pieces[i].piece].promote)
                    pieces[i].piece=piecesdata[pieces[i].piece].promote
                    console.log(pieces[i].piece)
                }
            }
            send_everyone(JSON.stringify(pieces))
        }
    }
})

ws.on('close', function() {
    if (clients[id].status=='white') {
        let stop=false
        console.log('minusone')
        //send everyone a message that white has left and appoint the first spectator as the white
        delete clients[id]
        send_everyone('whiteleft')
        if (spectcount==0) {
            cur=0
            whitemissing=true
        }
        else{
            n=find_spect();
            clients[n].send('white')
            clients[n].status='white'
        }
    }
    else if (clients[id].status=='black') {
        console.log('minusone')
        //send everyone a message that black has left and appoint the first spectator as black
        delete clients[id]
        send_everyone('blackleft')
        if (spectcount==0) {
            cur=1
            blackmissing=true
        }
        else{
            n=find_spect();
            clients[n].send('black')
            clients[n].status='black'
        }
    }
    else {
        console.log('minusone')
        //send everyone a message that player stopped spectating
        delete clients[id]
        send_everyone('spectleft')
        spectcount-=1
    }
    
    })

})

